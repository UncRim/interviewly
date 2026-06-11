import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  FileText,
  TrendingUp,
  Award,
  Calendar,
  Briefcase,
  Clock,
  Play,
  Trash2,
  Home
} from './Hicons';
import { SavedInterview } from '../types';

interface DashboardProps {
  history: SavedInterview[];
  onStartNew: () => void;
  onViewReport: (interview: SavedInterview) => void;
  onDeleteHistoryItem: (id: string) => void;
  onNavigateToLanding: () => void;
  onJoinWaitlist: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ history, onStartNew, onViewReport, onDeleteHistoryItem, onNavigateToLanding, onJoinWaitlist }) => {
  const totalInterviews = history.length;
  const avgScore = history.length > 0 
    ? Math.round(history.reduce((acc, curr) => acc + curr.feedback.overallScore, 0) / history.length)
    : 0;
  
  return (
    <div className="flex h-screen bg-dark font-sans text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transform rotate-3">
            <div className="w-4 h-4 border-2 border-dark rounded-sm"></div>
          </div>
          <span className="text-xl font-serif font-bold text-white tracking-tight">Interviewly</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <button onClick={onNavigateToLanding} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-darker hover:text-white rounded-xl font-medium transition-colors w-full text-left">
            <Home className="w-5 h-5" />
            Home
          </button>
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-primary text-dark rounded-xl font-bold">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-darker hover:text-white rounded-xl font-medium transition-colors">
            <Users className="w-5 h-5" />
            Interviews
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-darker hover:text-white rounded-xl font-medium transition-colors">
            <Settings className="w-5 h-5" />
            Settings
          </a>
        </nav>

        <div className="p-4">
          <div className="bg-darker rounded-2xl p-4 mb-4 border border-border">
            <h4 className="font-bold text-white mb-1">Upgrade to Pro</h4>
            <p className="text-sm text-gray-400 mb-3">Get unlimited interviews and advanced analytics.</p>
            <button onClick={onJoinWaitlist} className="w-full py-2 bg-card border border-border rounded-lg text-sm font-bold text-white hover:bg-gray-800 transition-colors">
              Upgrade Now
            </button>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-3">
            <img src="https://i.pravatar.cc/150?img=47" alt="Sarah Jenkins" className="w-10 h-10 rounded-full border border-border" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Sarah Jenkins</p>
              <p className="text-xs text-gray-400 truncate">sarah@example.com</p>
            </div>
            <button className="text-gray-500 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 relative">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-serif font-bold text-white mb-2">Welcome back, Sarah 👋</h1>
              <p className="text-gray-400">Here's a summary of your recent interview performance.</p>
            </div>
            <button 
              onClick={onStartNew}
              className="bg-primary hover:bg-[#b8ce2b] text-dark px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              New Interview
            </button>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Total Interviews</p>
                <p className="text-2xl font-bold text-white">{totalInterviews}</p>
              </div>
            </div>
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-green-900/20 rounded-xl flex items-center justify-center text-green-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Avg. Score</p>
                <p className="text-2xl font-bold text-white">{avgScore}%</p>
              </div>
            </div>
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Improvement</p>
                <p className="text-2xl font-bold text-white">+5%</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Interviews */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif font-bold text-white">Recent Interviews</h2>
                <button className="text-sm font-medium text-primary hover:underline">View All</button>
              </div>
              
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                {history.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-darker rounded-full flex items-center justify-center mb-4">
                      <Briefcase className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No interviews yet</h3>
                    <p className="text-gray-400 mb-6 max-w-sm">Start your first mock interview to get personalized feedback and track your progress.</p>
                    <button 
                      onClick={onStartNew}
                      className="bg-darker border border-border hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold transition-colors"
                    >
                      Start Practice
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {history.slice(0, 5).map((interview) => (
                      <div key={interview.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-darker transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                            <Briefcase className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white">{interview.jobTitle || 'General Interview'}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(interview.date).toLocaleDateString()}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="text-green-400 font-medium bg-green-900/20 px-2 py-0.5 rounded-md">Score: {interview.feedback.overallScore}/100</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="text-gray-400 font-medium bg-darker px-2 py-0.5 rounded-md">Completed</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button 
                            onClick={() => onViewReport(interview)}
                            className="px-5 py-2.5 text-sm font-bold text-dark bg-primary hover:bg-[#b8ce2b] rounded-xl transition-colors"
                          >
                            View Report
                          </button>
                          <button 
                            onClick={() => onDeleteHistoryItem(interview.id)}
                            className="p-2.5 text-secondary bg-secondary/10 hover:bg-secondary/20 rounded-xl transition-colors"
                            title="Delete Interview"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Interviews */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif font-bold text-white">Upcoming Interviews</h2>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Senior React Developer', company: 'TechCorp Inc.', date: 'Oct 26, 2023', time: '10:00 AM' },
                  { title: 'Frontend Engineer', company: 'Innovate LLC', date: 'Oct 28, 2023', time: '2:00 PM' }
                ].map((item, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/50 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-white">{item.title}</h3>
                        <p className="text-sm text-gray-400">{item.company}</p>
                      </div>
                      <div className="w-10 h-10 bg-darker rounded-xl flex items-center justify-center text-gray-500">
                        <Calendar className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium text-gray-400 mb-4">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {item.date}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {item.time}</span>
                    </div>
                    <button 
                      onClick={onStartNew}
                      className="w-full py-2.5 bg-darker hover:bg-primary text-white hover:text-dark rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Start Practice
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
