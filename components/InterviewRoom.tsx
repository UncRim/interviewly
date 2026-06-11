
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { getInterviewerInstruction } from '../constants';
import { decodeBase64, encodeBase64, decodeAudioData, extractJobTitle } from '../services/geminiService';
import { Message } from '../types';
import { Mic, MicOff, Clock, Pause, Square, User } from './Hicons';

interface InterviewRoomProps {
  onFinish: (transcript: string, jobTitle: string, audioUrl?: string) => void;
  jobDescription: string;
  durationMinutes?: number;
}

const InterviewRoom: React.FC<InterviewRoomProps> = ({ onFinish, jobDescription, durationMinutes = 15 }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [statusText, setStatusText] = useState("Establishing secure line...");
  const [isMuted, setIsMuted] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [showTranscript, setShowTranscript] = useState(false);
  const [displayJobTitle, setDisplayJobTitle] = useState("Loading role...");
  
  // Refs to handle mutable state inside audio callbacks (prevent stale closures)
  const isMutedRef = useRef(false);
  const isActiveRef = useRef(false);
  
  const audioContextInputRef = useRef<AudioContext | null>(null);
  const audioContextOutputRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const transcriptBufferRef = useRef({ input: '', output: '' });
  const scrollRef = useRef<HTMLDivElement>(null);
  const retryCountRef = useRef(0);
  const timerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Sync refs with state
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const stopAllAudio = useCallback(() => {
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, showTranscript]);

  const handleFinish = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const fullTranscriptText = transcript.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
    
    if (sessionRef.current) {
        sessionRef.current.close();
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        onFinish(fullTranscriptText, displayJobTitle, audioUrl);
      };
      mediaRecorderRef.current.stop();
    } else {
      onFinish(fullTranscriptText, displayJobTitle, undefined);
    }
  }, [transcript, onFinish, displayJobTitle]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nudgeInterviewer = useCallback(() => {
    if (sessionRef.current && isActiveRef.current) {
      sessionRef.current.sendRealtimeInput({
        text: "[SYSTEM: The candidate is waiting. Please respond or move to the next phase.]"
      });
    }
  }, []);

  const startSession = useCallback(async () => {
    setConnectionError(null);
    setStatusText("Initializing AI recruiter...");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      try {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        mediaRecorder.start(1000);
      } catch (err) {
        console.error("MediaRecorder init error:", err);
      }

      if (audioContextInputRef.current) audioContextInputRef.current.close();
      if (audioContextOutputRef.current) audioContextOutputRef.current.close();
      
      // Standardize AudioContext creation
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextInputRef.current = new AudioCtx({ sampleRate: 16000 });
      audioContextOutputRef.current = new AudioCtx({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: getInterviewerInstruction(jobDescription),
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: async () => {
            // Ensure AudioContext is running (crucial for browsers like Chrome/Safari)
            if (audioContextInputRef.current?.state === 'suspended') {
              await audioContextInputRef.current.resume();
            }

            setIsActive(true);
            isActiveRef.current = true;
            setConnectionError(null);
            setStatusText("Recruiter is asking a question...");
            retryCountRef.current = 0;
            
            mediaSourceRef.current = audioContextInputRef.current!.createMediaStreamSource(stream);
            scriptProcessorRef.current = audioContextInputRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (e) => {
              // Critical: Use refs here to check current state in high-frequency loop
              if (isMutedRef.current || !isActiveRef.current) return;

              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmData = encodeBase64(new Uint8Array(int16.buffer));
              
              // Rely on sessionPromise resolving to send input safely
              sessionPromise.then(session => {
                try {
                  session.sendRealtimeInput({ 
                    media: { data: pcmData, mimeType: 'audio/pcm;rate=16000' } 
                  });
                } catch (err) {
                  // Catch transient errors during socket transitions
                }
              }).catch(() => {});
            };

            mediaSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(audioContextInputRef.current!.destination);

            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
              setTimeLeft(prev => {
                if (prev <= 0) {
                  clearInterval(timerRef.current!);
                  handleFinish();
                  return 0;
                }
                if (prev === 600) sessionRef.current?.sendRealtimeInput({ text: "[SYSTEM: 10m left.]" });
                if (prev === 300) sessionRef.current?.sendRealtimeInput({ text: "[SYSTEM: 5m left.]" });
                return prev - 1;
              });
            }, 1000);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              transcriptBufferRef.current.input += message.serverContent.inputTranscription.text;
              setStatusText("Your turn to speak...");
            }
            if (message.serverContent?.outputTranscription) {
              transcriptBufferRef.current.output += message.serverContent.outputTranscription.text;
              setStatusText("Recruiter is asking a question...");
            }
            
            if (message.serverContent?.turnComplete) {
              const newMessages: Message[] = [];
              if (transcriptBufferRef.current.input) { 
                newMessages.push({ role: 'candidate', text: transcriptBufferRef.current.input }); 
                transcriptBufferRef.current.input = ''; 
              }
              if (transcriptBufferRef.current.output) { 
                newMessages.push({ role: 'interviewer', text: transcriptBufferRef.current.output }); 
                transcriptBufferRef.current.output = ''; 
              }
              if (newMessages.length > 0) setTranscript(prev => [...prev, ...newMessages]);
            }

            const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioBase64 && audioContextOutputRef.current) {
              const ctx = audioContextOutputRef.current;
              if (ctx.state === 'suspended') await ctx.resume();
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              try {
                const audioBuffer = await decodeAudioData(decodeBase64(audioBase64), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                source.onended = () => sourcesRef.current.delete(source);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
              } catch (err) {
                console.error("Playback error:", err);
              }
            }
            if (message.serverContent?.interrupted) stopAllAudio();
          },
          onclose: (e) => {
            setIsActive(false);
            isActiveRef.current = false;
            if (!e.wasClean && retryCountRef.current < 1) {
              retryCountRef.current++;
              setTimeout(startSession, 1000);
            }
          },
          onerror: (e) => {
            setConnectionError("Temporary connection issue. Please retry.");
            setIsActive(false);
            isActiveRef.current = false;
          },
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("StartSession error:", err);
      setConnectionError("Please enable microphone access and refresh.");
    }
  }, [handleFinish, stopAllAudio, jobDescription]);

  useEffect(() => {
    const fetchTitle = async () => {
      const title = await extractJobTitle(jobDescription);
      setDisplayJobTitle(title);
    };
    fetchTitle();
    startSession();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextInputRef.current) audioContextInputRef.current.close();
      if (audioContextOutputRef.current) audioContextOutputRef.current.close();
      isActiveRef.current = false;
    };
  }, []);

  const isUserTurn = statusText === "Your turn to speak...";

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
      
      {/* Navbar */}
      <nav className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transform rotate-3">
            <Mic className="w-5 h-5 text-dark" />
          </div>
          <span className="text-2xl font-serif font-bold tracking-tight">Interviewly</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#" className="hover:text-primary transition-colors">Simulator</a>
          <a href="#" className="hover:text-primary transition-colors">Resources</a>
          <button className="flex items-center gap-2 bg-primary text-dark px-5 py-2.5 rounded-full font-bold hover:bg-[#b8ce2b] transition-all shadow-sm">
            <User className="w-4 h-4" /> Join Pro Waitlist
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center p-4 w-full relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-3">Interview in progress...</h2>
          <p className="text-2xl text-white font-medium">{displayJobTitle}</p>
        </div>

        <div className={`bg-card rounded-[2rem] shadow-2xl border border-border p-8 flex transition-all duration-500 ${showTranscript ? 'w-full max-w-5xl gap-8' : 'w-full max-w-2xl flex-col'}`}>
          
          {/* Left Side (or full width if transcript closed) */}
          <div className={`flex flex-col relative ${showTranscript ? 'w-1/2 border-r border-border pr-8' : 'w-full'}`}>
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-16">
              <div className="flex items-center space-x-3">
                <div className={`w-3.5 h-3.5 rounded-full ${isActive ? 'bg-primary' : 'bg-gray-500'}`}></div>
                <span className="text-lg font-medium text-white">
                  {isActive ? 'Live Session' : 'Connecting...'}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-white text-dark rounded-full font-bold text-sm">
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)} min
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              {/* Circular Audio Visualizer */}
              <div className="relative flex items-center justify-center mb-12 h-64 w-64">
                {/* Outer Ring */}
                <div className={`absolute w-64 h-64 rounded-full bg-[#3f4a1b] transition-opacity duration-700 ${isActive ? 'opacity-50' : 'opacity-20'}`}></div>
                {/* Middle Ring */}
                <div className={`absolute w-48 h-48 rounded-full bg-[#6b8022] transition-opacity duration-700 ${isActive ? 'opacity-60' : 'opacity-20'}`}></div>
                {/* Inner Circle */}
                <div className={`relative w-32 h-32 rounded-full flex items-center justify-center z-10 transition-colors duration-700 ${isActive ? 'bg-primary' : 'bg-gray-700'}`}>
                  {isUserTurn ? (
                    <Mic className="w-10 h-10 text-dark" />
                  ) : (
                    <div className="flex items-center gap-1.5">
                      {[3, 5, 8, 5, 4, 8, 5, 3].map((h, i) => (
                        <div key={i} className={`w-1.5 bg-dark rounded-full ${isActive ? 'animate-pulse' : ''}`} style={{ height: `${h * 4}px`, animationDelay: `${i * 100}ms` }}></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center px-4 mb-12">
                {connectionError ? (
                  <div className="flex flex-col items-center">
                    <span className="text-secondary font-bold mb-4">{connectionError}</span>
                    <button onClick={startSession} className="px-6 py-2 bg-primary text-dark rounded-full text-sm font-bold shadow-lg hover:bg-[#b8ce2b] transition-colors">Retry Connection</button>
                  </div>
                ) : (
                  <p className="text-gray-400 font-medium text-lg">{statusText}</p>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-auto mb-8">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                disabled={!isActive}
                className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${isMuted ? 'bg-darker text-gray-400 border border-border' : 'bg-white text-dark hover:bg-gray-100'} ${!isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Pause className="w-5 h-5 fill-current" />}
                {isMuted ? 'Resume Session' : 'Pause Session'}
              </button>
              <button 
                onClick={handleFinish}
                className="flex-1 py-4 bg-secondary hover:bg-rose-600 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center"><Square className="w-2.5 h-2.5 fill-current" /></div>
                End Session
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm font-medium text-gray-400">
                Recruiter Silent? <button onClick={nudgeInterviewer} disabled={!isActive} className="text-white hover:underline disabled:opacity-50">Click anywhere to nudge it.</button>
              </div>
              {!showTranscript && (
                <button onClick={() => setShowTranscript(true)} className="text-primary font-semibold hover:underline text-sm">View Transcript</button>
              )}
            </div>
          </div>

          {/* Right Side (Transcript) */}
          {showTranscript && (
            <div className="w-1/2 flex flex-col h-[600px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Live Transcript</h3>
                <button 
                  onClick={() => setShowTranscript(false)}
                  className="w-14 h-7 bg-primary rounded-full relative transition-colors flex items-center px-1"
                >
                  <div className="absolute right-1 w-5 h-5 bg-dark rounded-full"></div>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scrollbar" ref={scrollRef}>
                {transcript.length === 0 ? (
                  <div className="text-gray-500 font-medium text-center mt-10">Transcript will appear here...</div>
                ) : (
                  transcript.map((msg, idx) => (
                    <div key={idx} className={msg.role === 'interviewer' ? "bg-primary/10 border border-primary rounded-xl p-5" : "p-5"}>
                      <h4 className={`font-serif font-bold text-xl mb-2 ${msg.role === 'interviewer' ? 'text-primary' : 'text-white'}`}>
                        {msg.role === 'interviewer' ? 'Recruiter' : 'You (Sarah)'}
                      </h4>
                      <p className="text-gray-300 text-lg leading-relaxed">
                        {msg.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center text-sm text-gray-500 border-t border-border relative z-10">
        <div>© 2026 Interviewly</div>
        <div>Built for job seeker who take it seriously.</div>
      </footer>
    </div>
  );
};

export default InterviewRoom;

