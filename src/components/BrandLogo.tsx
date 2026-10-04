import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'minimal';
  glow?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  className = '',
}) => {
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <img
          src="/images/logo.webp"
          alt="Namaste Kalyan"
          className="h-12 sm:h-14 md:h-16 w-auto object-contain filter drop-shadow-md transition-transform duration-300 hover:scale-[1.03]"
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      {/* Official Provided Namaste Kalyan Logo Graphic */}
      <img
        src="/images/logo.webp"
        alt="Namaste Kalyan"
        className="w-64 sm:w-80 md:w-96 max-w-full h-auto object-contain drop-shadow-lg"
      />

      {/* Elegant Subtitle */}
      {variant === 'full' && (
        <div className="flex items-center gap-3 mt-4">
          <div className="w-6 h-[1px] bg-[#C6A36B]/60" />
          <span className="font-sans text-[11px] md:text-xs font-semibold tracking-[0.35em] text-[#C6A36B] uppercase">
            Global Kitchen & Bar
          </span>
          <div className="w-6 h-[1px] bg-[#C6A36B]/60" />
        </div>
      )}
    </div>
  );
};
