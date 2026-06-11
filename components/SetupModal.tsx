import React from 'react';
import { X, Play } from './Hicons';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobDescription: string;
  setJobDescription: (val: string) => void;
  onStart: () => void;
}

const SetupModal: React.FC<SetupModalProps> = ({ isOpen, onClose, jobDescription, setJobDescription, onStart }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
      <div className="bg-card rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-border">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-2xl font-serif font-bold text-white">New Interview</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-darker hover:bg-dark flex items-center justify-center text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8">
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-300 mb-2">Job Description</label>
            <p className="text-sm text-gray-400 mb-4">Paste the job description below. Our AI will analyze it to generate relevant questions and evaluate your performance.</p>
            <div className="relative">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value.slice(0, 3000))}
                placeholder="e.g. We are looking for a Senior React Developer with 5+ years of experience..."
                className="w-full h-64 bg-darker border border-border rounded-2xl p-5 focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-white text-base placeholder:text-gray-500 outline-none"
              />
              <div className="absolute bottom-4 right-4 text-xs font-medium text-gray-500">
                {jobDescription.length}/3000
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:bg-darker hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onStart}
              disabled={!jobDescription.trim()}
              className="bg-primary hover:bg-[#b8ce2b] text-dark px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupModal;
