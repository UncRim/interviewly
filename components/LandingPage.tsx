import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import { 
  Mic, 
  User, 
  Play,
  ArrowRight,
} from './Hicons';

interface LandingPageProps {
  jobDescription: string;
  setJobDescription: (val: string) => void;
  onStart: () => void;
  onGoToDashboard?: () => void;
  onJoinWaitlist: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ jobDescription, setJobDescription, onStart, onGoToDashboard, onJoinWaitlist }) => {
  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white selection:bg-primary selection:text-dark font-sans relative overflow-hidden">
      {/* Background Grid */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.025] blur-[10px]"
        style={{
          backgroundImage: `linear-gradient(to right, #d9d9d9 1px, transparent 1px), linear-gradient(to bottom, #d9d9d9 1px, transparent 1px)`,
          backgroundSize: `16.666vw 16.666vw`
        }}
      />

      {/* Navbar */}
      <header className="w-full border-b border-[#f4f4f4]/10 shadow-[0_4px_30px_rgba(200,240,74,0.05)] relative z-10 bg-[#1E1E1E]/80 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto px-[60px] py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Mic className="w-5 h-5 text-dark" />
            </div>
            <span className="text-2xl font-serif font-bold tracking-tight">Interviewly</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#" className="hover:text-primary transition-colors">Simulator</a>
            <a href="#" className="hover:text-primary transition-colors">Resources</a>
            {onGoToDashboard && (
              <button onClick={onGoToDashboard} className="hover:text-primary transition-colors font-semibold">
                Dashboard
              </button>
            )}
            <button onClick={onJoinWaitlist} className="flex items-center gap-2 bg-primary text-dark px-5 py-2.5 rounded-md font-semibold hover:bg-[#b8ce2b] transition-all shadow-sm">
              <User className="w-4 h-4" /> Join Pro Waitlist
            </button>
          </div>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-[60px] py-12 lg:py-20 relative flex flex-col items-center text-center z-10">
        
        {/* Top Badges */}
        <AnimatedPill />

        {/* Hero Content */}
        <h1 className="text-5xl md:text-7xl font-serif font-bold leading-[1.1] tracking-tight mb-6">
          Prepare for <span className="text-primary italic">any role.</span><br />
          <span className="text-white">Stop memorizing.</span><br />
          Start speaking.
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl leading-relaxed mb-12">
          Paste any job description to instantly generate a realistic, 15-minute audio mock interview. Build your verbal muscle memory in a zero-stakes environment.
        </p>

        {/* Input Card */}
        <div className="bg-[#252525] rounded-3xl border border-[#333] p-6 shadow-2xl w-full max-w-3xl text-left">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-200">Job description</h3>
            <span className="text-xs font-mono text-gray-500">{jobDescription.length}/3000 characters</span>
          </div>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value.slice(0, 3000))}
            placeholder="Paste your target Job Description below. Practice out loud in a 15-minute AI audio sprint, and get instant feedback"
            className="w-full h-40 bg-[#1E1E1E] border border-[#333] rounded-2xl p-4 focus:ring-1 focus:ring-primary focus:border-primary resize-none text-gray-200 placeholder-gray-500 transition-all"
          />
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <img src="https://i.pravatar.cc/100?img=1" alt="User" className="w-8 h-8 rounded-full border-2 border-[#252525]" />
                <img src="https://i.pravatar.cc/100?img=2" alt="User" className="w-8 h-8 rounded-full border-2 border-[#252525]" />
                <img src="https://i.pravatar.cc/100?img=3" alt="User" className="w-8 h-8 rounded-full border-2 border-[#252525]" />
                <img src="https://i.pravatar.cc/100?img=4" alt="User" className="w-8 h-8 rounded-full border-2 border-[#252525]" />
              </div>
              <span className="text-xs font-medium text-gray-500">Used by 300+ seekers today.</span>
            </div>
            <button 
              onClick={onStart}
              disabled={!jobDescription.trim()}
              className="w-full sm:w-auto bg-[#FF4F64] hover:bg-rose-600 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5 fill-current" /> Start Interview
            </button>
          </div>
        </div>

        {/* Ticker */}
        <div className="self-stretch relative left-1/2 -translate-x-1/2 w-screen max-w-[100vw] overflow-hidden mt-16 border-y border-[#333] py-4 text-sm font-medium text-gray-400">
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 25s linear infinite;
            }
          `}</style>
          <div className="flex w-max animate-marquee whitespace-nowrap">
            {[0, 1].map((track) => (
              <div key={track} className="flex shrink-0 gap-8 pr-8" aria-hidden={track === 1 ? true : undefined}>
                {[
                  "Hidden Competency Extraction",
                  "Filler word detection",
                  "STAR Method scoring",
                  "Unlimited Practices",
                  "Pacing Analysis",
                  "15 minute audio sprints",
                ].map((feature, i) => (
                  <div key={`${track}-${i}`} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div> {feature}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Value Props */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mt-24 w-full text-left"
        >
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#333] text-primary text-xs font-bold uppercase tracking-wider mb-8">
            WHY IT WORKS
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#252525] border border-[#333] rounded-2xl p-8 group hover:border-[#C8F04A]/30 transition-all duration-500">
              <h4 className="font-serif font-bold text-3xl mb-1 text-white group-hover:text-[#C8F04A]/50 transition-colors duration-500">15 <span className="text-primary group-hover:text-[#C8F04A]/50 transition-colors duration-500">Min</span></h4>
              <p className="text-xs font-bold tracking-wider text-gray-400 mb-4 uppercase">AUDIO SPRINT</p>
              <p className="text-gray-400 leading-relaxed text-sm">Paste the job description and instantly extracts the core technical skills and behavioral traits the hiring manager is looking for.</p>
            </div>
            <div className="bg-[#252525] border border-[#333] rounded-2xl p-8 group hover:border-[#C8F04A]/30 transition-all duration-500">
              <h4 className="font-serif font-bold text-3xl mb-1 text-white group-hover:text-[#C8F04A]/50 transition-colors duration-500">Infinity <span className="text-primary group-hover:text-[#C8F04A]/50 transition-colors duration-500">Practices</span></h4>
              <p className="text-xs font-bold tracking-wider text-gray-400 mb-4 uppercase">PRACTICE OUT LOUD</p>
              <p className="text-gray-400 leading-relaxed text-sm">Step up to the mic. Engage in a fast-paced, two-way audio interview tailored exactly to the role you want.</p>
            </div>
            <div className="bg-[#252525] border border-[#333] rounded-2xl p-8 group hover:border-[#C8F04A]/30 transition-all duration-500">
              <h4 className="font-serif font-bold text-3xl mb-1 text-white group-hover:text-[#C8F04A]/50 transition-colors duration-500">0 <span className="text-primary group-hover:text-[#C8F04A]/50 transition-colors duration-500">Stakes</span></h4>
              <p className="text-xs font-bold tracking-wider text-gray-400 mb-4 uppercase">FAILURE IS FREE</p>
              <p className="text-gray-400 leading-relaxed text-sm">Get a detailed breakdown of your performance, pacing issues, and where to improve your STAR method delivery</p>
            </div>
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mt-24 w-full text-left"
        >
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#333] text-primary text-xs font-bold uppercase tracking-wider mb-8">
            THE PROCESS
          </div>
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white max-w-md leading-tight">
              From Job Description to <span className="text-primary italic">Interview Ready</span>
            </h2>
            <div className="text-lg text-gray-400 max-w-md">
              <WordReveal text="A simple, high-impact feedback loop designed to make you sound confidence." />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#252525] border border-[#333] rounded-2xl p-8 group hover:border-[#C8F04A]/30 transition-all duration-500">
              <div className="font-serif text-6xl text-gray-600 mb-6 opacity-50 group-hover:text-[#C8F04A]/50 group-hover:opacity-30 transition-colors duration-500">01</div>
              <h4 className="font-bold text-xl mb-3 text-white group-hover:text-[#C8F04A]/50 transition-colors duration-500">Feed the AI</h4>
              <p className="text-gray-400 leading-relaxed text-sm">Paste the job description and instantly extracts the core technical skills and behavioral traits the hiring manager is looking for.</p>
            </div>
            <div className="bg-[#252525] border border-[#333] rounded-2xl p-8 group hover:border-[#C8F04A]/30 transition-all duration-500">
              <div className="font-serif text-6xl text-gray-600 mb-6 opacity-50 group-hover:text-[#C8F04A]/50 group-hover:opacity-30 transition-colors duration-500">02</div>
              <h4 className="font-bold text-xl mb-3 text-white group-hover:text-[#C8F04A]/50 transition-colors duration-500">Take the hot seat</h4>
              <p className="text-gray-400 leading-relaxed text-sm">Step up to the mic. Engage in a fast-paced, two-way audio interview tailored exactly to the role you want.</p>
            </div>
            <div className="bg-[#252525] border border-[#333] rounded-2xl p-8 group hover:border-[#C8F04A]/30 transition-all duration-500">
              <div className="font-serif text-6xl text-gray-600 mb-6 opacity-50 group-hover:text-[#C8F04A]/50 group-hover:opacity-30 transition-colors duration-500">03</div>
              <h4 className="font-bold text-xl mb-3 text-white group-hover:text-[#C8F04A]/50 transition-colors duration-500">Review the tape</h4>
              <p className="text-gray-400 leading-relaxed text-sm">Get a detailed breakdown of your performance, pacing issues, and where to improve your STAR method delivery</p>
            </div>
          </div>
        </motion.div>

        {/* Live Simulation Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mt-24 w-full text-left"
        >
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#333] text-primary text-xs font-bold uppercase tracking-wider mb-8">
            LIVE INTERVIEW SIMULATION
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-12">
            Think on your feet,<br/><span className="text-primary italic">Every time.</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex gap-4 group cursor-default">
                <div className="text-2xl font-serif text-gray-500 group-hover:text-[#C8F04A]/50 transition-colors duration-500">01</div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-[#C8F04A]/50 transition-colors duration-500">Dynamic AI that actually listens</h4>
                  <p className="text-gray-400 text-sm">The interviewer responds to your specific words — not a predetermined script. Every session is different.</p>
                </div>
              </div>
              <div className="w-full h-px bg-[#333]"></div>
              <div className="flex gap-4 group cursor-default">
                <div className="text-2xl font-serif text-gray-500 group-hover:text-[#C8F04A]/50 transition-colors duration-500">02</div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-[#C8F04A]/50 transition-colors duration-500">STAR Method scoring</h4>
                  <p className="text-gray-400 text-sm">Scored strictly against the hidden competencies inside the job description. No generic rubrics.</p>
                </div>
              </div>
              <div className="w-full h-px bg-[#333]"></div>
              <div className="flex gap-4 group cursor-default">
                <div className="text-2xl font-serif text-gray-500 group-hover:text-[#C8F04A]/50 transition-colors duration-500">03</div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-[#C8F04A]/50 transition-colors duration-500">Safe place to fail, then fix</h4>
                  <p className="text-gray-400 text-sm">Stumble and try again. Confidence comes from reps, not notes.</p>
                </div>
              </div>
              <div className="w-full h-px bg-[#333]"></div>
              <div className="flex gap-4 group cursor-default">
                <div className="text-2xl font-serif text-gray-500 group-hover:text-[#C8F04A]/50 transition-colors duration-500">04</div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-[#C8F04A]/50 transition-colors duration-500">Instant post-session debrief</h4>
                  <p className="text-gray-400 text-sm">Full breakdown the moment you finish. Know exactly what to fix before your next rep.</p>
                </div>
              </div>
            </div>
            
            {/* Mockup UI */}
            <div className="bg-[#252525] border border-[#333] rounded-3xl p-6 shadow-2xl relative group hover:border-[#C8F04A]/30 transition-all duration-500">
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider mb-6 bg-primary/5">
                <div className="w-2 h-2 rounded-full bg-primary"></div> <AnimatedTimer initialTime={7 * 60 + 42} direction="down" prefix="Live - " suffix=" Remaining" />
              </div>
              
              <p className="text-lg font-serif text-white mb-6 min-h-[56px]">
                "<TypewriterText text="Tell me about a time you had to align stakeholders on a product decision they initially disagreed with." speed={40} delay={500} />"
              </p>
              
              <div className="bg-[#1E1E1E] border border-[#333] rounded-2xl p-5 mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-4">You are speaking</p>
                <div className="flex items-center gap-1 mb-6 h-8">
                  {[...Array(40)].map((_, i) => (
                    <div key={i} className="w-1 bg-primary rounded-full" style={{ height: `${Math.max(20, Math.random() * 100)}%`, opacity: Math.random() * 0.5 + 0.5 }}></div>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#FF4F64] flex items-center justify-center">
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-mono text-gray-400"><AnimatedTimer initialTime={5 * 60 + 10} direction="up" /></span>
                  <div className="flex-1 h-1.5 bg-[#333] rounded-full overflow-hidden relative">
                    <motion.div 
                      initial={{ width: "0%" }}
                      whileInView={{ width: "33%" }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 2.5, ease: "easeOut" }}
                      className="absolute left-0 top-0 h-full bg-white rounded-full"
                    ></motion.div>
                  </div>
                  <span className="text-sm font-mono text-primary">15:00</span>
                </div>
              </div>
              
              <div className="bg-[#1E1E1E] border border-[#333] rounded-2xl p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-4">Real time transcript</p>
                <p className="text-sm text-gray-400 leading-relaxed mb-6 min-h-[100px]">
                  "<TranscriptReveal 
                    delay={5000}
                    speed={30}
                    segments={[
                      { text: "Um, yeah", type: "filler", description: "Inappropriate words" },
                      { text: ", so I've been a front-end developer for about three years now. I mostly work with ", type: "normal" },
                      { text: "React", type: "tool", description: "Appropriate tool" },
                      { text: " and, ", type: "normal" },
                      { text: "like", type: "filler", description: "Filler words / inappropriate words" },
                      { text: ", ", type: "normal" },
                      { text: "Tailwind CSS", type: "tool", description: "Relatable tools to the role being applied for" },
                      { text: " to build interfaces. I really enjoy creating web apps that are, ", type: "normal" },
                      { text: "you know", type: "filler", description: "Filler inappropriate word" },
                      { text: ", accessible and load fast for the user.", type: "normal" }
                    ]}
                  />"
                </p>
                <div className="flex justify-between items-end border-t border-[#333] pt-4">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Star method score</span>
                  <span className="text-4xl font-serif font-bold text-primary">85/100</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="w-full bg-[#252525] border border-[#333] rounded-3xl p-12 md:p-20 text-center mt-32 mb-12 group hover:border-[#C8F04A]/30 transition-all duration-500 flex flex-col items-center"
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 group-hover:text-[#C8F04A]/50 transition-colors duration-500 text-center">
            Your next interview<br/>doesn't have to be<br/>a <span className="text-primary italic group-hover:text-[#C8F04A]/50 transition-colors duration-500">rough draft.</span>
          </h2>
          <div className="text-lg text-gray-400 mb-10 max-w-xl mx-auto text-center">
            <WordReveal justify="center" text="Stop staring at your screen and start practicing your pitch." />
          </div>
          <button 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="bg-[#FF4F64] hover:bg-rose-600 text-white px-8 py-3.5 rounded-xl font-bold inline-flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-5 h-5 fill-current" /> Start Interview Session
          </button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-[60px] border-t border-[#333] flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 max-w-7xl mx-auto relative z-10">
        <p>© 2026 Interviewly</p>
        <p>Built for job seeker who take it seriously.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

const AnimatedPill = () => {
  const states = [
    { text: "Listening", icon: <Mic className="w-3 h-3" /> },
    { text: "Speaking", icon: <div className="w-3 h-3 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div></div> },
    { text: "Analyzing", icon: <div className="w-3 h-3 border border-primary rounded-full border-t-transparent animate-spin"></div> }
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBlurring, setIsBlurring] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const cycle = async () => {
      while (isMounted) {
        // Wait for typing and reading
        await new Promise(r => setTimeout(r, 2500));
        if (!isMounted) break;
        // Start blurring
        setIsBlurring(true);
        await new Promise(r => setTimeout(r, 500));
        if (!isMounted) break;
        // Switch to next
        setIsBlurring(false);
        setCurrentIndex((prev) => (prev + 1) % states.length);
      }
    };
    
    cycle();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="flex items-center justify-center mb-10 h-8">
      <motion.div 
        layout
        className="px-4 py-1.5 rounded-full border border-primary/30 text-primary text-xs font-bold uppercase tracking-wider flex items-center bg-primary/5 overflow-hidden"
      >
        <div className="w-4 flex justify-center shrink-0">
          {states[currentIndex].icon}
        </div>
        <motion.div
          animate={{ 
            filter: isBlurring ? "blur(4px)" : "blur(0px)",
            opacity: isBlurring ? 0 : 1,
            width: isBlurring ? 0 : "auto",
            marginLeft: isBlurring ? 0 : 8
          }}
          transition={{ duration: isBlurring ? 0.4 : 0 }}
          className="overflow-hidden whitespace-nowrap"
        >
          <TypewriterText text={states[currentIndex].text} key={currentIndex} />
        </motion.div>
      </motion.div>
    </div>
  );
};

const WordReveal = ({ text, className = "", justify = "flex-start" }: { text: string, className?: string, justify?: string }) => {
  const words = text.split(" ");
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      style={{ overflow: "hidden", display: "flex", flexWrap: "wrap", justifyContent: justify }}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={className}
    >
      {words.map((word, index) => (
        <motion.span variants={child} style={{ marginRight: "0.25em" }} key={index}>
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

const AnimatedTimer = ({ initialTime, direction = "up", prefix = "", suffix = "" }: { initialTime: number, direction?: "up" | "down", prefix?: string, suffix?: string }) => {
  const [time, setTime] = useState(initialTime);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      const interval = setInterval(() => {
        setTime(prev => direction === "up" ? prev + 1 : Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isInView, direction]);

  const mins = Math.floor(time / 60);
  const secs = time % 60;
  // If prefix is "Live - ", we don't pad minutes to 2 digits if it's < 10, but let's just pad it.
  const formattedMins = mins < 10 && prefix.includes("Live") ? mins.toString() : mins.toString().padStart(2, '0');
  const formatted = `${formattedMins}:${secs.toString().padStart(2, '0')}`;

  return <span ref={ref}>{prefix}{formatted}{suffix}</span>;
};

const TypewriterText: React.FC<{ text: string, speed?: number, delay?: number }> = ({ text, speed = 100, delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    setDisplayedText("");
    let i = 0;
    let interval: NodeJS.Timeout;
    
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
        }
      }, speed);
    }, delay);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, isInView, speed, delay]);

  return <span ref={ref}>{displayedText}<span className="animate-pulse inline-block w-[2px] h-[1em] bg-primary ml-[1px] align-middle"></span></span>;
};

type TranscriptSegment = {
  text: string;
  type: 'normal' | 'filler' | 'tool';
  description?: string;
};

const TranscriptReveal: React.FC<{ segments: TranscriptSegment[], speed?: number, delay?: number }> = ({ segments, speed = 30, delay = 0 }) => {
  const [charIndex, setCharIndex] = useState(0);
  const [hoveredWordKey, setHoveredWordKey] = useState<string | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const totalChars = segments.reduce((acc, seg) => acc + seg.text.length, 0);

  useEffect(() => {
    if (!isInView) return;
    let interval: NodeJS.Timeout;
    
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setCharIndex(prev => {
          if (prev < totalChars) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, speed);
    }, delay);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [totalChars, speed, delay, isInView]);

  let charsRendered = 0;

  const renderWordTooltip = (
    word: string,
    styleClass: string,
    tooltipClass: string,
    tooltipArrowClass: string,
    description: string | undefined,
    wordKey: string
  ) => (
    <span
      className="relative inline-block cursor-help mx-[1px]"
      onMouseEnter={() => setHoveredWordKey(wordKey)}
      onMouseLeave={() => setHoveredWordKey((prev) => (prev === wordKey ? null : prev))}
    >
      <span className={styleClass}>{word}</span>
      {description && hoveredWordKey === wordKey ? (
        <span className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[220px] text-xs px-3 py-2 rounded-lg border backdrop-blur-md pointer-events-none z-50 shadow-xl text-center ${tooltipClass}`}>
          {description}
          <span className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent mt-[1px] ${tooltipArrowClass}`}></span>
        </span>
      ) : null}
    </span>
  );

  return (
    <span ref={ref} className="leading-relaxed relative">
      {segments.map((seg, idx) => {
        const segLen = seg.text.length;
        const startIdx = charsRendered;
        const endIdx = charsRendered + segLen;
        charsRendered += segLen;

        if (charIndex <= startIdx) return null;

        const visibleText = seg.text.slice(0, Math.max(0, charIndex - startIdx));
        const isComplete = charIndex >= endIdx;

        if (seg.type === 'filler' || seg.type === 'tool') {
          const styleClass =
            seg.type === 'filler'
              ? "bg-red-900/30 text-red-400 px-1 rounded border border-red-900/50"
              : "text-primary bg-primary/10 px-1 rounded border border-primary/20";
          const tooltipClass =
            seg.type === 'filler'
              ? "bg-red-950/95 text-red-100 border-red-400/80"
              : "bg-primary/25 text-primary border-primary/80";
          const tooltipArrowClass =
            seg.type === 'filler' ? "border-t-red-400/80" : "border-t-primary/80";
          const tokens = visibleText.split(/(\s+)/);
          return (
            <span key={idx}>
              {tokens.map((token, tokenIdx) => {
                if (!token) return null;
                if (/^\s+$/.test(token)) return <span key={tokenIdx}>{token}</span>;
                const showTooltip = isComplete && !!seg.description;
                const wordKey = `${idx}-${tokenIdx}`;
                return (
                  <React.Fragment key={tokenIdx}>
                    {renderWordTooltip(
                      token,
                      styleClass,
                      tooltipClass,
                      tooltipArrowClass,
                      showTooltip ? seg.description : undefined,
                      wordKey
                    )}
                  </React.Fragment>
                );
              })}
            </span>
          );
        }
        return <span key={idx}>{visibleText}</span>;
      })}
      {charIndex < totalChars && <span className="animate-pulse inline-block w-[2px] h-[1em] bg-gray-400 ml-[1px] align-middle"></span>}
    </span>
  );
};
