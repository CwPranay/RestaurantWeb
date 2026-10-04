import React, { useEffect, useState, useMemo } from 'react';

interface LoadingScreenProps {
  progress: number;
  isReady: boolean;
  onEnter: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  isReady,
  onEnter,
}) => {
  const [fadeExit, setFadeExit] = useState(false);

  // Seamless auto-entry once threshold is reached
  useEffect(() => {
    if ((isReady && progress >= 40) || progress >= 95) {
      const timer = setTimeout(() => {
        setFadeExit(true);
        setTimeout(onEnter, 650);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isReady, progress, onEnter]);

  const handleImmediateEnter = () => {
    setFadeExit(true);
    setTimeout(onEnter, 300);
  };

  // Curated hospitality narrative based on loading stage
  const narrative = useMemo(() => {
    if (progress >= 90) return 'Your table is prepared.';
    if (progress >= 60) return 'Setting the velvet lounge & botanical tables...';
    if (progress >= 30) return 'Curating the culinary journey & cocktail bar...';
    return 'Awakening the architectural sanctuary...';
  }, [progress]);

  const roundedProgress = Math.min(100, Math.max(0, Math.round(progress)));
  const circumference = 2 * Math.PI * 24; // r = 24 -> ~150.796
  const strokeOffset = circumference - (circumference * roundedProgress) / 100;

  return (
    <aside
      aria-label="Loading Namaste Kalyan"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 md:p-14 bg-[#0E0907] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
        fadeExit
          ? 'opacity-0 scale-[1.03] blur-[2px] pointer-events-none'
          : 'opacity-100 scale-100 blur-0 pointer-events-auto'
      }`}
      style={{
        backgroundImage: `radial-gradient(ellipse at 50% 48%, rgba(198, 163, 107, 0.10) 0%, rgba(28, 18, 15, 0.45) 50%, #0E0907 85%)`,
      }}
    >
      {/* Editorial Hairline Border Frame with Corner Flourishes */}
      <div className="absolute inset-4 sm:inset-6 md:inset-8 border border-[#C6A36B]/15 pointer-events-none" />
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 w-3 h-3 border-t border-l border-[#C6A36B]/50 pointer-events-none" />
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 w-3 h-3 border-t border-r border-[#C6A36B]/50 pointer-events-none" />
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 w-3 h-3 border-b border-l border-[#C6A36B]/50 pointer-events-none" />
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 w-3 h-3 border-b border-r border-[#C6A36B]/50 pointer-events-none" />

      {/* Top Architectural Header */}
      <div className="pt-2 sm:pt-4 z-10 flex items-center gap-3">
        <div className="w-4 sm:w-6 h-[1px] bg-[#C6A36B]/40" />
        <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.35em] uppercase text-[#C6A36B]/80 font-light">
          Namaste Kalyan • Khadakpada
        </span>
        <div className="w-4 sm:w-6 h-[1px] bg-[#C6A36B]/40" />
      </div>

      {/* Centerpiece Prologue */}
      <div className="flex flex-col items-center text-center max-w-md px-4 z-10 my-auto">
        {/* Brand Crest */}
        <div className="relative mb-5 sm:mb-6">
          <div className="absolute inset-0 bg-[#C6A36B]/10 rounded-full blur-2xl transform scale-125 pointer-events-none" />
          <img
            src="/images/logo.webp"
            alt="Namaste Kalyan"
            className="w-40 sm:w-56 md:w-64 max-w-full h-auto object-contain drop-shadow-[0_4px_30px_rgba(198,163,107,0.2)]"
          />
        </div>

        {/* Sensory Title & Epigraph */}
        <h1 className="font-luxury text-2xl sm:text-3xl md:text-4xl text-[#F4EBDD] font-light tracking-[0.08em] mb-2 drop-shadow-sm">
          A World Beyond Dining
        </h1>
        <p className="font-serif italic text-xs sm:text-sm text-[#F4EBDD]/65 font-light leading-relaxed max-w-xs sm:max-w-sm">
          Where architectural elegance, live flame culinary artistry, and botanical tranquility converge.
        </p>
      </div>

      {/* Bespoke Radial Progress Meter & Narrative */}
      <div className="w-full max-w-sm flex flex-col items-center text-center z-10 pb-4 sm:pb-6">
        {/* Fine Circular Arc Counter */}
        <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 mb-3">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 56 56">
            {/* Background track */}
            <circle
              cx="28"
              cy="28"
              r="24"
              stroke="#C6A36B"
              strokeOpacity="0.15"
              strokeWidth="1"
              fill="none"
            />
            {/* Progress Arc */}
            <circle
              cx="28"
              cy="28"
              r="24"
              stroke="#C6A36B"
              strokeWidth="1.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-300 ease-out"
            />
          </svg>

          {/* Minimalist Centered Percentage */}
          <span className="absolute font-mono text-[10.5px] sm:text-xs text-[#F4EBDD]/90 tracking-wider font-light">
            {roundedProgress}%
          </span>
        </div>

        {/* Dynamic Sensory Narrative */}
        <p className="font-serif italic text-xs text-[#C6A36B] tracking-wide min-h-[1.5rem] transition-all duration-300">
          {narrative}
        </p>

        {/* Fast-Entry Action for repeat visitors */}
        {isReady && (
          <button
            onClick={handleImmediateEnter}
            className="mt-3 group inline-flex items-center gap-2 text-[10px] uppercase font-sans tracking-[0.25em] text-[#F4EBDD]/80 hover:text-white transition-colors cursor-pointer"
          >
            <span className="border-b border-[#C6A36B]/60 group-hover:border-white pb-0.5 transition-colors">
              Step Inside
            </span>
            <span className="text-[#C6A36B] group-hover:text-white transform group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
        )}
      </div>
    </aside>
  );
};
