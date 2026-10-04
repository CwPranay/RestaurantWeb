import React, { useEffect, useState } from 'react';
import { BrandLogo } from './BrandLogo';

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

  useEffect(() => {
    if (isReady || progress >= 30) {
      const timer = setTimeout(() => {
        setFadeExit(true);
        setTimeout(onEnter, 400);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  const handleImmediateEnter = () => {
    setFadeExit(true);
    setTimeout(onEnter, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 md:p-14 bg-[#1C120F] transition-opacity duration-500 ease-in-out ${
        fadeExit ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
    >
      <div className="pt-2">
        <span className="text-[10px] tracking-[0.3em] uppercase text-[#C6A36B]/70 font-sans">
          Namaste Kalyan • Global Kitchen & Bar
        </span>
      </div>

      <div className="flex flex-col items-center text-center">
        <BrandLogo variant="full" className="scale-110 mb-4" />
        <p className="font-display italic text-[#F4EBDD]/60 text-sm mt-2 tracking-wider">
          A little more than dining.
        </p>
      </div>

      <div className="w-full max-w-xs flex flex-col items-center gap-2 pb-6">
        <div className="flex items-center justify-between w-full text-[10px] font-mono tracking-widest text-[#F4EBDD]/60">
          <span className="uppercase text-[#C6A36B]">Preparing Experience</span>
          <span>{Math.round(progress)}%</span>
        </div>

        <div className="w-full h-[1px] bg-[#2B1B15] relative overflow-hidden">
          <div
            className="absolute left-0 top-0 bottom-0 bg-[#C76A27] transition-all duration-150"
            style={{ width: `${Math.max(progress, 15)}%` }}
          />
        </div>

        {isReady && (
          <button
            onClick={handleImmediateEnter}
            className="mt-3 px-4 py-1.5 border border-[#C6A36B]/60 text-[10px] uppercase font-mono tracking-widest text-[#F4EBDD] hover:bg-[#C6A36B] hover:text-[#18100D] transition-colors cursor-pointer"
          >
            Enter Experience
          </button>
        )}
      </div>
    </div>
  );
};
