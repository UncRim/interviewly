import React, { useState, useRef } from 'react';
import { InterviewFeedback } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Mail, ArrowRight, Play, Pause, Quote, CheckCircle2, AlertCircle, ChevronRight } from './Hicons';

interface FeedbackReportProps {
  feedback: InterviewFeedback;
  transcript?: string;
  audioUrl?: string;
  onRestart: () => void;
}

const FeedbackReport: React.FC<FeedbackReportProps> = ({ feedback, transcript = '', audioUrl, onRestart }) => {
  const [showModal, setShowModal] = useState(true);
  const [email, setEmail] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatAudioTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-primary';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-900/20';
    if (score >= 60) return 'bg-primary/20';
    return 'bg-red-900/20';
  };

  const chartData = feedback.detailedAnalysis.map(item => ({
    subject: item.skill,
    A: item.rating,
    fullMark: 100,
  }));

  const handleSkip = () => setShowModal(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
  };

  const parseTranscript = (text: string) => {
    const lines = text.split('\n');
    const qaPairs: { q: string; a: string }[] = [];
    let currentQ = '';
    let currentA = '';
    let isCandidate = false;

    for (const line of lines) {
      if (line.startsWith('INTERVIEWER:')) {
        if (currentQ && currentA) {
          qaPairs.push({ q: currentQ.trim(), a: currentA.trim() });
          currentQ = '';
          currentA = '';
        }
        currentQ += line.replace('INTERVIEWER:', '').trim() + ' ';
        isCandidate = false;
      } else if (line.startsWith('CANDIDATE:')) {
        currentA += line.replace('CANDIDATE:', '').trim() + ' ';
        isCandidate = true;
      } else {
        if (isCandidate) {
          currentA += line.trim() + ' ';
        } else {
          currentQ += line.trim() + ' ';
        }
      }
    }
    if (currentQ || currentA) {
      qaPairs.push({ q: currentQ.trim(), a: currentA.trim() });
    }
    return qaPairs;
  };

  const qaPairs = parseTranscript(transcript);

  return (
    <div className="relative min-h-screen bg-dark text-white p-4 md:p-8 font-sans">
      {/* PLG Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card rounded-[2rem] p-10 max-w-md w-full shadow-2xl border border-border flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 text-primary">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-white mb-3 tracking-tight">Don't lose your feedback</h2>
            <p className="text-gray-400 font-medium mb-8">
              Enter your email to save this detailed analysis and track your progress over time.
            </p>
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <input 
                type="email" 
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-darker border border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-white placeholder:text-gray-500"
              />
              <button 
                type="submit"
                className="w-full py-4 bg-primary text-dark rounded-2xl font-bold text-lg hover:bg-[#b8ce2b] transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                View Results <ArrowRight className="w-5 h-5" />
              </button>
            </form>
            <button 
              onClick={handleSkip}
              className="mt-6 text-sm font-bold text-gray-500 hover:text-gray-300 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard */}
      <div className={`max-w-[1400px] mx-auto transition-all duration-500 ${showModal ? 'blur-md scale-[0.98] opacity-50 pointer-events-none' : ''}`}>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary mb-2">Interview Analysis</h1>
            <p className="text-gray-400 font-medium">AI-generated performance analysis based on the job description.</p>
          </div>
          <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-[#3f4a1b] border border-[#6b8022] shadow-sm">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-primary leading-none">{feedback.score}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary mt-1">Mastery</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Overview */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Skill Metrics */}
            <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-serif font-bold text-white">Skill Metrics</h3>
                <button className="text-sm font-bold text-primary hover:underline">View Transcript</button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Candidate</p>
                    <p className="font-semibold text-white">Alex Doe</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Role</p>
                    <p className="font-semibold text-white">Candidate</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Organization</p>
                    <p className="font-semibold text-white">Tech Corp</p>
                  </div>
                </div>
                
                <div className="w-full sm:w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                      <PolarGrid stroke="#333" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Score" dataKey="A" stroke="#D4ED31" strokeWidth={2} fill="#D4ED31" fillOpacity={0.2} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#333', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#D4ED31' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recruiter's Verdict */}
            <div className="bg-primary rounded-3xl p-8 shadow-sm text-dark relative overflow-hidden">
              <div className="absolute top-4 right-4 opacity-20">
                <Quote className="w-16 h-16" />
              </div>
              <h3 className="text-sm font-bold text-dark/70 uppercase tracking-wider mb-4">Recruiter's Verdict</h3>
              <p className="text-lg font-medium leading-relaxed italic relative z-10">
                "{feedback.overallSummary}"
              </p>
            </div>

            {/* Key Strengths */}
            <div className="bg-green-900/10 rounded-3xl p-6 shadow-sm border border-green-900/30">
              <h3 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Key Strengths
              </h3>
              <ul className="space-y-3">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="flex items-start text-green-100 font-medium text-sm">
                    <span className="text-green-500 mr-2 mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Improvements */}
            <div className="bg-red-900/10 rounded-3xl p-6 shadow-sm border border-red-900/30">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Key Improvements
              </h3>
              <ul className="space-y-3">
                {feedback.areasForImprovement.map((a, i) => (
                  <li key={i} className="flex items-start text-red-100 font-medium text-sm">
                    <span className="text-red-500 mr-2 mt-0.5">•</span> {a}
                  </li>
                ))}
              </ul>
            </div>

            <button 
              onClick={onRestart}
              className="w-full py-4 bg-primary text-dark rounded-2xl font-bold text-lg hover:bg-[#b8ce2b] transition-colors shadow-lg shadow-primary/20"
            >
              Start Next Practice
            </button>
          </div>

          {/* Right Column: Detailed Feedback & Transcript */}
          <div className="lg:col-span-7 bg-card rounded-3xl shadow-sm border border-border p-6 md:p-8 flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
            <h2 className="text-2xl font-serif font-bold text-white mb-6">Detailed Feedback & Transcript</h2>
            
            {/* Audio Player */}
            <div className="bg-darker rounded-2xl p-4 flex items-center gap-4 mb-8 border border-border">
              <button 
                onClick={togglePlay}
                disabled={!audioUrl}
                className="w-12 h-12 bg-primary text-dark rounded-full flex items-center justify-center hover:bg-[#b8ce2b] transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
              </button>
              <div className="flex-1">
                <div 
                  className="h-2 bg-dark rounded-full overflow-hidden cursor-pointer relative"
                  onClick={(e) => {
                    if (audioRef.current && duration) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pos = (e.clientX - rect.left) / rect.width;
                      audioRef.current.currentTime = pos * duration;
                    }
                  }}
                >
                  <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-400 tabular-nums">
                {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
              </span>
              {audioUrl && (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              )}
            </div>

            {/* Q&A List */}
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-8">
              {qaPairs.length > 0 ? qaPairs.map((qa, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="space-y-3">
                    <p className="font-bold text-white text-lg leading-relaxed">
                      {qa.q}
                    </p>
                    <div className="bg-darker rounded-2xl p-5 text-gray-300 leading-relaxed text-base border border-border">
                      {qa.a || <span className="italic text-gray-500">No response recorded.</span>}
                    </div>
                  </div>
                  
                  {/* Mock Insight for each Q&A based on detailed analysis if available */}
                  {feedback.detailedAnalysis[idx % feedback.detailedAnalysis.length] && (
                    <div className="bg-[#2a3318] rounded-2xl p-5 border border-[#3f4a1b]">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">Insight</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#3f4a1b] text-primary">
                          {feedback.detailedAnalysis[idx % feedback.detailedAnalysis.length].rating} Score
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 font-medium">
                        {feedback.detailedAnalysis[idx % feedback.detailedAnalysis.length].comment}
                      </p>
                    </div>
                  )}
                </div>
              )) : (
                <div className="h-full flex items-center justify-center text-gray-500 font-medium">
                  No transcript available for this session.
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-border">
              <button className="w-full py-4 bg-darker text-white rounded-2xl font-bold text-sm hover:bg-dark transition-colors border border-border flex items-center justify-center gap-2">
                Practice Weak Areas <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackReport;
