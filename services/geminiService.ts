
import { GoogleGenAI, Type } from "@google/genai";
import { getAnalysisInstruction } from "../constants";
import { InterviewFeedback } from "../types";

export const extractJobTitle = async (jobDescription: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract the exact job title from the following job description. Return ONLY the job title, nothing else. If you cannot find a clear job title, return "General Interview".\n\nJob Description:\n${jobDescription}`,
    });
    return response.text?.trim() || "General Interview";
  } catch (error) {
    console.error("Failed to extract job title:", error);
    return "General Interview";
  }
};

export const analyzeInterview = async (transcript: string, jobDescription: string): Promise<InterviewFeedback> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze this interview transcript based on the following job description.\n\nJD: ${jobDescription}\n\nTranscript:\n${transcript}`,
    config: {
      systemInstruction: getAnalysisInstruction(jobDescription),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          overallSummary: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
          detailedAnalysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                comment: { type: Type.STRING },
                rating: { type: Type.NUMBER }
              },
              required: ["skill", "comment", "rating"]
            }
          }
        },
        required: ["score", "overallSummary", "strengths", "areasForImprovement", "detailedAnalysis"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate analysis");
  return JSON.parse(text);
};

export const decodeBase64 = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const encodeBase64 = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
