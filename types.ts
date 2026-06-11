
export interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
}

export interface Message {
  role: 'interviewer' | 'candidate';
  text: string;
}

export interface InterviewFeedback {
  score: number;
  overallSummary: string;
  strengths: string[];
  areasForImprovement: string[];
  detailedAnalysis: {
    skill: string;
    comment: string;
    rating: number;
  }[];
}

export interface SavedInterview {
  id: string;
  date: string;
  jobTitle: string;
  feedback: InterviewFeedback;
  transcript?: string;
  audioUrl?: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  INTERVIEWING = 'INTERVIEWING',
  ANALYZING = 'ANALYZING',
  FEEDBACK = 'FEEDBACK',
  WAITLIST = 'WAITLIST'
}
