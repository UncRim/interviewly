import React, { useState, useEffect } from 'react';
import { AppStatus, InterviewFeedback, SavedInterview } from './types';
import InterviewRoom from './components/InterviewRoom';
import FeedbackReport from './components/FeedbackReport';
import Dashboard from './components/Dashboard';
import SetupModal from './components/SetupModal';
import LandingPage from './components/LandingPage';
import WaitlistPage from './components/WaitlistPage';
import { analyzeInterview } from './services/geminiService';
import { Briefcase } from './components/Hicons';

const App: React.FC = () => {
  const [appStatus, setAppStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [history, setHistory] = useState<SavedInterview[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<InterviewFeedback | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [forceLandingPage, setForceLandingPage] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('interviewly_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveToHistory = (feedback: InterviewFeedback, transcript: string, jobTitle: string, audioUrl?: string) => {
    const newInterview: SavedInterview = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      jobTitle: jobTitle,
      feedback,
      transcript,
      audioUrl
    };
    const updated = [newInterview, ...history];
    setHistory(updated);
    localStorage.setItem('interviewly_history', JSON.stringify(updated));
  };

  const handleStart = () => {
    if (!jobDescription.trim()) {
      alert("Please enter a job description.");
      return;
    }
    setIsSetupModalOpen(false);
    setAppStatus(AppStatus.INTERVIEWING);
  };

  const handleFinishInterview = async (transcript: string, jobTitle: string, audioUrl?: string) => {
    setAppStatus(AppStatus.ANALYZING);
    setIsAnalyzing(true);
    setCurrentTranscript(transcript);
    setCurrentAudioUrl(audioUrl);
    try {
      const feedback = await analyzeInterview(transcript, jobDescription);
      setCurrentFeedback(feedback);
      saveToHistory(feedback, transcript, jobTitle, audioUrl);
      setAppStatus(AppStatus.FEEDBACK);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze interview. Please try again.");
      setAppStatus(AppStatus.IDLE);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRestart = () => {
    setAppStatus(AppStatus.IDLE);
    setCurrentFeedback(null);
    setCurrentTranscript('');
    setCurrentAudioUrl(undefined);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('interviewly_history', JSON.stringify(updated));
  };

  const loadHistoryItem = (item: SavedInterview) => {
    setCurrentFeedback(item.feedback);
    setCurrentTranscript(item.transcript || '');
    setCurrentAudioUrl(item.audioUrl);
    setAppStatus(AppStatus.FEEDBACK);
  };

  return (
    <div className="min-h-screen bg-dark text-white font-sans selection:bg-primary/20">
      {appStatus === AppStatus.IDLE && (
        (history.length === 0 || forceLandingPage) ? (
          <LandingPage 
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            onStart={() => {
              setForceLandingPage(false);
              handleStart();
            }}
            onGoToDashboard={history.length > 0 ? () => setForceLandingPage(false) : undefined}
            onJoinWaitlist={() => setAppStatus(AppStatus.WAITLIST)}
          />
        ) : (
          <>
            <Dashboard 
              history={history} 
              onStartNew={() => setIsSetupModalOpen(true)} 
              onViewReport={loadHistoryItem} 
              onDeleteHistoryItem={handleDeleteHistoryItem}
              onNavigateToLanding={() => setForceLandingPage(true)}
              onJoinWaitlist={() => setAppStatus(AppStatus.WAITLIST)}
            />
            <SetupModal 
              isOpen={isSetupModalOpen} 
              onClose={() => setIsSetupModalOpen(false)} 
              jobDescription={jobDescription} 
              setJobDescription={setJobDescription} 
              onStart={handleStart} 
            />
          </>
        )
      )}

      {appStatus === AppStatus.WAITLIST && (
        <WaitlistPage onBack={() => setAppStatus(AppStatus.IDLE)} />
      )}

      {appStatus === AppStatus.INTERVIEWING && (
        <InterviewRoom 
          jobDescription={jobDescription} 
          onFinish={handleFinishInterview} 
        />
      )}

      {appStatus === AppStatus.ANALYZING && (
        <div className="min-h-screen flex flex-col items-center justify-center bg-dark p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
          <div className="w-24 h-24 relative mb-8 z-10">
            <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <h2 className="text-3xl font-serif font-bold text-white mb-4 z-10">Analyzing Performance</h2>
          <p className="text-gray-400 font-medium text-center max-w-md z-10">
            Our AI is reviewing your responses, evaluating your skills against the job description, and generating personalized feedback...
          </p>
        </div>
      )}

      {appStatus === AppStatus.FEEDBACK && currentFeedback && (
        <FeedbackReport 
          feedback={currentFeedback} 
          transcript={currentTranscript}
          audioUrl={currentAudioUrl}
          onRestart={handleRestart} 
        />
      )}
    </div>
  );
};

export default App;
