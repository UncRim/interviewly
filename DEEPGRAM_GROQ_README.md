# Interviewly – Deepgram STT/TTS + Groq LLM Setup

## New File Structure

```
app/api/
  deepgram-token/route.ts   ← Mints a short-lived Deepgram browser token
  recruiter-response/route.ts  ← Groq LLM streamed via SSE
  tts/route.ts              ← Deepgram Aura TTS proxy

hooks/
  useDeepgramSTT.ts   ← Browser WebSocket → Deepgram Nova-2 STT
  useGroqSSE.ts       ← SSE consumer + Web Audio sentence-level TTS queue

components/
  SimulatorView.tsx   ← Full wired UI (Deepgram + Groq + Deepgram)
```

---

## 1. Install SDKs

```bash
npm install @deepgram/sdk groq-sdk
```

---

## 2. Environment variables (.env.local)

```env
# Deepgram — https://console.deepgram.com
DEEPGRAM_API_KEY=your_deepgram_api_key_here
DEEPGRAM_PROJECT_ID=your_deepgram_project_id_here

# Groq — https://console.groq.com/keys
GROQ_API_KEY=gsk_your_groq_key_here
```

---

## 3. How to find your Deepgram Project ID

1. Log in at https://console.deepgram.com
2. Click the project name dropdown (top-left)
3. Go to Settings → Project ID
4. Copy the UUID and paste it as `DEEPGRAM_PROJECT_ID`

> The Project ID is needed to create temporary keys via the Management API.
> If you don't want to use temporary keys (simpler for local dev), you can
> skip the token route and hardcode the key in `useDeepgramSTT.ts` directly
> — but NEVER ship that to production.

---

## 4. Full data flow

```
User speaks
    │
    ▼
useDeepgramSTT
  MediaRecorder (250ms chunks, audio/webm;codecs=opus)
    │
    │  [fetch /api/deepgram-token → short-lived key]
    │
    ▼
  WebSocket → wss://api.deepgram.com/v1/listen
  (Nova-2, smart_format, utterance_end_ms=1200)
    │
    ├── interim_results → liveTranscript (shown in italic bubble)
    └── speech_final    → onFinalTranscript(text)
                              │
                              ▼
                        addMessage() → user bubble in transcript
                        sendUserTurn(text, jobDescription)
                              │
                              ▼
                        POST /api/recruiter-response
                          groq.chat.completions.create({ stream: true })
                              │
                        SSE: data: {"type":"delta","text":"..."}
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
              upsertMessage()      pendingTTSBuffer
              (streaming cursor)        │
                                   [sentence boundary?]
                                        │
                                        ▼
                                  POST /api/tts
                                  Deepgram Aura TTS
                                  (audio/mpeg binary)
                                        │
                                        ▼
                                  decodeAudioData()
                                  AudioContext.createBufferSource()
                                  source.start(nextScheduledTime)
                                        │
                                  [sentence 2 queues behind sentence 1]
                                  [gapless playback]
                                        │
                                  source.onended → isListening
```

---

## 5. Sentence-level TTS batching explained

The key to low-latency audio is NOT waiting for the full LLM response.
Here's the timeline for a typical recruiter response:

```
t=0ms    First Groq token arrives        → append to transcript
t=180ms  "Can you tell me about your"    → buffering...
t=340ms  "experience with React?"        → sentence boundary detected!
         → POST /api/tts ("Can you tell me about your experience with React?")
t=520ms  TTS audio arrives (first sentence)
         → AudioContext schedules playback NOW
t=600ms  User hears first sentence start playing  ← only 600ms latency!
t=650ms  "Specifically, how have"        → buffering second sentence...
t=820ms  "you handled performance?"      → second TTS request fires
t=1050ms Second audio decoded + queued  → will play seamlessly after first
```

Without sentence batching, the user would wait until ~t=820ms for ANY audio.

---

## 6. Deepgram model choices

**STT (useDeepgramSTT.ts):**
- `nova-2` — best accuracy, recommended ✓
- `nova` — slightly faster, slightly less accurate
- `base` — fastest, lowest accuracy

**TTS (api/tts/route.ts — change `VOICE` constant):**
- `aura-asteria-en` — clear female voice ✓
- `aura-luna-en` — softer female
- `aura-zeus-en` — male
- `aura-orpheus-en` — deeper male

**LLM (api/recruiter-response/route.ts — change `model` field):**
- `llama3-8b-8192` — fastest Groq model, ~300 tokens/sec ✓
- `llama3-70b-8192` — smarter but ~3x slower
- `mixtral-8x7b-32768` — good balance, larger context window

---

## 7. Wiring SimulatorView into your app

```tsx
// app/simulator/page.tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import SimulatorView from "@/components/SimulatorView";

export default function SimulatorPage() {
  const router = useRouter();
  const params = useSearchParams();
  const jobDescription = params.get("jd") ?? "";

  return (
    <SimulatorView
      jobDescription={jobDescription}
      onEnd={(transcript) => {
        // Store transcript in sessionStorage, then navigate to debrief
        sessionStorage.setItem("transcript", JSON.stringify(transcript));
        router.push("/debrief");
      }}
    />
  );
}
```

On your landing page, navigate to the simulator after form submit:
```tsx
router.push(`/simulator?jd=${encodeURIComponent(jobDescription)}`);
```
