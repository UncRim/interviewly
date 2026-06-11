import React, { useState } from 'react';
import { Mic, User, Lock } from './Hicons';

interface WaitlistPageProps {
  onBack: () => void;
}

const WaitlistPage: React.FC<WaitlistPageProps> = ({ onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      onBack();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-dark font-sans text-white flex flex-col relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
      
      {/* Navbar */}
      <nav className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onBack}>
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transform rotate-3">
            <Mic className="w-5 h-5 text-dark" />
          </div>
          <span className="text-2xl font-serif font-bold text-white tracking-tight">Interviewly</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <button onClick={onBack} className="hover:text-primary transition-colors">Simulator</button>
          <a href="#" className="hover:text-primary transition-colors">Resources</a>
          <button className="flex items-center gap-2 bg-primary text-dark px-5 py-2.5 rounded-full font-bold hover:bg-[#b8ce2b] transition-all shadow-sm">
            <User className="w-4 h-4" /> Join Pro Waitlist
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="bg-card rounded-[2rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl border border-border">
          {isSubmitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-white mb-4">You're on the list!</h2>
              <p className="text-gray-400">We'll notify you as soon as Interviewly Pro is ready.</p>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 bg-secondary text-white px-4 py-1.5 rounded-full text-sm font-bold mb-6">
                <User className="w-4 h-4" /> 371 Spots Left
              </div>
              
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">
                Master the Interview. Land the Offer.
              </h1>
              
              <p className="text-lg text-gray-300 mb-8 font-medium">
                You have seen what the MVP can do. Interviewly Pro takes the training wheels off. Join the exclusive early-access list
              </p>

              <div className="mb-8">
                <h3 className="text-xl font-serif font-bold text-white mb-4">The Feature Checklist:</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-gray-400 font-medium">
                    <span className="mt-2 w-1.5 h-1.5 bg-gray-500 rounded-full shrink-0"></span>
                    <span>Infinite Session Memory: Track your performance trends and filler-word reduction over time.</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-400 font-medium">
                    <span className="mt-2 w-1.5 h-1.5 bg-gray-500 rounded-full shrink-0"></span>
                    <span>Custom Recruiter Personas: Switch from "Friendly HR" to "Aggressive Technical Lead."</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-400 font-medium">
                    <span className="mt-2 w-1.5 h-1.5 bg-gray-500 rounded-full shrink-0"></span>
                    <span>Niche Tech Scenarios: Practice specific coding whiteboard rounds and system design constraints.</span>
                  </li>
                </ul>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Fullname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-darker border border-border rounded-xl p-4 focus:ring-2 focus:ring-primary text-white font-medium outline-none placeholder:text-gray-500"
                />
                <input
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-darker border border-border rounded-xl p-4 focus:ring-2 focus:ring-primary text-white font-medium outline-none placeholder:text-gray-500"
                />
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-[#b8ce2b] text-dark px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-2"
                >
                  <Lock className="w-5 h-5 fill-current" /> Secure Spot
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm font-bold text-gray-500 relative z-10">
        © 2026 Interviewly
      </footer>
    </div>
  );
};

export default WaitlistPage;
