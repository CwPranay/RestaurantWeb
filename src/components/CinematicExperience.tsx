import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ChevronDown, ArrowRight, ArrowUpRight, Utensils, Sparkles, MapPin, Phone, Star, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface CinematicExperienceProps {
  images: HTMLImageElement[];
  totalFrames: number;
  onOpenReservation: () => void;
  onOpenMenu: () => void;
}

const NAV_SECTIONS = [
  { id: 'portal', label: 'The Portal', progress: 0.24 },
  { id: 'story', label: 'Story', progress: 0.45 },
  { id: 'space', label: 'The Space', progress: 0.64 },
  { id: 'cuisine', label: 'Cuisine', progress: 0.82 },
];

export const CinematicExperience: React.FC<CinematicExperienceProps> = ({
  images,
  totalFrames,
  onOpenReservation,
  onOpenMenu,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentFrameRef = useRef<number>(1);
  const targetFrameRef = useRef<number>(1);
  const imagesRef = useRef<HTMLImageElement[]>(images);
  imagesRef.current = images;

  const [uiProgress, setUiProgress] = useState<number>(0);
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);

  // Dynamic Navigation Active Section Tracking & Moving Underline
  const navItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [hoveredNavId, setHoveredNavId] = useState<string | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const activeSectionId = useMemo(() => {
    if (uiProgress >= 0.16 && uiProgress < 0.38) return 'portal';
    if (uiProgress >= 0.38 && uiProgress < 0.58) return 'story';
    if (uiProgress >= 0.58 && uiProgress < 0.77) return 'space';
    if (uiProgress >= 0.77) return 'cuisine';
    return null;
  }, [uiProgress]);

  const currentTargetId = hoveredNavId || activeSectionId;

  useEffect(() => {
    const updateIndicator = () => {
      if (currentTargetId && navItemRefs.current[currentTargetId]) {
        const el = navItemRefs.current[currentTargetId];
        if (el) {
          setIndicatorStyle({
            left: el.offsetLeft,
            width: el.offsetWidth,
            opacity: 1,
          });
          return;
        }
      }
      setIndicatorStyle((prev) => ({
        ...prev,
        opacity: 0,
      }));
    };

    updateIndicator();
    const raf = requestAnimationFrame(updateIndicator);
    window.addEventListener('resize', updateIndicator);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [currentTargetId]);

  const lastRenderedImgRef = useRef<HTMLImageElement | null>(null);

  // Fast, high-quality canvas frame draw with bulletproof fallbacks
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgs = imagesRef.current;
    const idx = Math.min(Math.max(Math.round(frameIndex), 1), totalFrames);
    let img = imgs[idx - 1];

    // Fallback: If target frame is not ready, pick the closest adjacent loaded frame within +/- 6 frames
    if (!img || !img.complete || img.naturalWidth === 0) {
      let closestImg: HTMLImageElement | null = null;
      for (let d = 1; d <= 6; d++) {
        const prevIdx = idx - 1 - d;
        if (prevIdx >= 0 && imgs[prevIdx]?.complete && imgs[prevIdx].naturalWidth > 0) {
          closestImg = imgs[prevIdx];
          break;
        }
        const nextIdx = idx - 1 + d;
        if (nextIdx < totalFrames && imgs[nextIdx]?.complete && imgs[nextIdx].naturalWidth > 0) {
          closestImg = imgs[nextIdx];
          break;
        }
      }

      if (closestImg) {
        img = closestImg;
      } else if (lastRenderedImgRef.current) {
        // Retain the existing frame already on canvas! NEVER jump back to distant frame 1!
        return;
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    lastRenderedImgRef.current = img;

    const cw = canvas.width;
    const ch = canvas.height;
    if (cw === 0 || ch === 0) return;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const canvasAspect = cw / ch;
    const imageAspect = iw / ih;

    let sx = 0,
      sy = 0,
      sw = iw,
      sh = ih;

    if (canvasAspect > imageAspect) {
      sh = iw / canvasAspect;
      sy = (ih - sh) / 2;
    } else {
      sw = ih * canvasAspect;
      sx = (iw - sw) / 2;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
  }, [totalFrames]);

  // Continuous 60fps lerp loop ensuring fluid camera motion
  useEffect(() => {
    let animId: number;
    let lastRenderedFrame = -1;

    const tick = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(diff) > 0.005) {
        currentFrameRef.current += diff * 0.28;
      } else {
        currentFrameRef.current = targetFrameRef.current;
      }

      const frameToDraw = Math.round(currentFrameRef.current);
      if (frameToDraw !== lastRenderedFrame) {
        drawFrame(frameToDraw);
        lastRenderedFrame = frameToDraw;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [drawFrame]);

  // Window resize handler
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }

    drawFrame(Math.round(currentFrameRef.current));
  }, [drawFrame]);

  // Robust universal scroll and wheel listener
  useEffect(() => {
    const handleScrollOrWheel = () => {
      const doc = document.documentElement;
      const body = document.body;
      const scrollable = Math.max(
        doc.scrollHeight - window.innerHeight,
        body.scrollHeight - window.innerHeight,
        1
      );

      const scrollTop = Math.max(
        window.pageYOffset || 0,
        doc.scrollTop || 0,
        body.scrollTop || 0,
        0
      );

      const p = Math.min(Math.max(scrollTop / scrollable, 0), 1);
      const target = 1 + p * (totalFrames - 1);
      targetFrameRef.current = target;
      setUiProgress(p);
    };

    window.addEventListener('scroll', handleScrollOrWheel, { passive: true });
    window.addEventListener('resize', handleResize);
    window.addEventListener('wheel', handleScrollOrWheel, { passive: true });

    handleResize();
    handleScrollOrWheel();

    return () => {
      window.removeEventListener('scroll', handleScrollOrWheel);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleScrollOrWheel);
    };
  }, [totalFrames, handleResize]);

  // Initial draw and continuous frame redraw when new frames arrive
  const hasInitializedCanvasRef = useRef(false);
  useEffect(() => {
    if (images.length > 0) {
      if (!hasInitializedCanvasRef.current) {
        hasInitializedCanvasRef.current = true;
        handleResize();
      }
      // Redraw current active frame, NEVER reset to frame 1!
      drawFrame(Math.round(currentFrameRef.current));
    }
  }, [images, handleResize, drawFrame]);

  // Organic luxury fade & slide styling — subtle distance (14px) and zero-box borderless typography
  const getFadeStyle = (start: number, peakStart: number, peakEnd: number, end: number) => {
    let opacity = 0;
    let translateY = 14;

    if (uiProgress >= start && uiProgress <= end) {
      if (uiProgress >= peakStart && uiProgress <= peakEnd) {
        opacity = 1;
        translateY = 0;
      } else if (uiProgress < peakStart) {
        const factor = (uiProgress - start) / (peakStart - start);
        opacity = factor;
        translateY = (1 - factor) * 14;
      } else {
        const factor = (end - uiProgress) / (end - peakEnd);
        opacity = factor;
        translateY = (1 - factor) * -14;
      }
    }

    return {
      opacity,
      transform: `translate3d(0, ${translateY}px, 0)`,
      visibility: opacity > 0.01 ? ('visible' as const) : ('hidden' as const),
      pointerEvents: 'none' as const,
    };
  };

  // Harmonized checkpoints along the 240-frame continuous scroll track
  const stage1Style = getFadeStyle(0, 0, 0.14, 0.18);
  const stage2Style = getFadeStyle(0.19, 0.24, 0.35, 0.39);
  const stage3Style = getFadeStyle(0.40, 0.45, 0.54, 0.58);
  const stage4Style = getFadeStyle(0.59, 0.64, 0.73, 0.77);
  const stage5Style = getFadeStyle(0.78, 0.82, 0.89, 0.92);
  const stage6Style = getFadeStyle(0.93, 0.96, 1.0, 1.0);

  const scrollToProgress = (p: number) => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: p * scrollable,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative w-full">
      {/* FIXED CANVAS VIEWPORT — Responsive 60fps canvas with 100dvh cover */}
      <div className="fixed inset-0 w-full h-[100dvh] pointer-events-none z-0 transform-gpu overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block will-change-transform" />
      </div>

      {/* TOP FLOATING NAVIGATION */}
      <header className="fixed top-0 left-0 right-0 z-40 py-2 sm:py-3.5 px-3 sm:px-6 md:px-8 lg:px-12 flex items-center justify-between bg-gradient-to-b from-[#120B09]/95 via-[#120B09]/75 to-transparent border-b border-[#C6A36B]/15 backdrop-blur-[2px]">
        {/* Subtle continuous scroll progress hairline along the header */}
        <div
          className="absolute bottom-0 left-0 h-[1.5px] bg-gradient-to-r from-[#C6A36B] via-[#C76A27] to-[#C6A36B] pointer-events-none transition-all duration-75"
          style={{ width: `${uiProgress * 100}%`, opacity: uiProgress > 0.01 ? 0.85 : 0 }}
        />

        <button
          onClick={() => scrollToProgress(0)}
          className="cursor-pointer text-left transition-transform hover:scale-[1.02] flex items-center shrink-0"
        >
          <BrandLogo variant="minimal" />
        </button>

        <nav className="flex items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 text-[10px] lg:text-[11px] font-sans font-medium tracking-[0.16em] sm:tracking-[0.22em] uppercase text-[#F4EBDD]/85 shrink-0">
          {/* Dynamic Scroll Section Links with Smooth Moving Underline Indicator */}
          <div className="relative hidden md:flex items-center gap-4 lg:gap-8 py-1">
            {NAV_SECTIONS.map((section) => {
              const isActive = activeSectionId === section.id;
              return (
                <button
                  key={section.id}
                  ref={(el) => {
                    navItemRefs.current[section.id] = el;
                  }}
                  onClick={() => scrollToProgress(section.progress)}
                  onMouseEnter={() => setHoveredNavId(section.id)}
                  onMouseLeave={() => setHoveredNavId(null)}
                  className={`relative py-1 cursor-pointer transition-all duration-300 tracking-[0.25em] ${
                    isActive
                      ? 'text-[#C6A36B] font-semibold drop-shadow-[0_0_8px_rgba(198,163,107,0.5)]'
                      : 'text-[#F4EBDD]/80 hover:text-white'
                  }`}
                >
                  {section.label}
                </button>
              );
            })}

            {/* Dynamic Moving Underline */}
            <span
              className="absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r from-[#C6A36B] via-[#F4EBDD] to-[#C6A36B] rounded-full pointer-events-none transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_10px_rgba(198,163,107,0.7)]"
              style={{
                transform: `translateX(${indicatorStyle.left}px)`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity,
              }}
            />
          </div>

          <button
            onClick={onOpenMenu}
            className="hover:text-[#C6A36B] transition-colors cursor-pointer underline underline-offset-4 decoration-[#C76A27]/70 hover:decoration-[#C6A36B] text-[10px] sm:text-[11px] px-1.5 py-1 whitespace-nowrap shrink-0"
          >
            Menu
          </button>
          <button
            onClick={onOpenReservation}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 border border-[#C6A36B]/60 hover:border-[#F4EBDD] bg-[#18100D]/80 hover:bg-[#F4EBDD] hover:text-[#18100D] text-[#F4EBDD] transition-all tracking-[0.14em] sm:tracking-[0.22em] text-[9px] sm:text-[10px] cursor-pointer shadow-sm whitespace-nowrap shrink-0"
          >
            Reserve Table
          </button>
        </nav>
      </header>

      {/* STAGE 1: CINEMATIC OPENING (Centered & Balanced) */}
      <div
        className="fixed inset-0 w-full h-[100dvh] z-20 flex flex-col justify-between items-center px-4 sm:px-8 pt-18 sm:pt-28 pb-6 sm:pb-12 transition-all duration-700 ease-out transform-gpu pointer-events-none"
        style={stage1Style}
      >
        {/* Natural atmospheric lighting scrim */}
        <div className="absolute inset-0 cinematic-grad-opening pointer-events-none -z-10" />

        <div className="text-[9.5px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.35em] uppercase text-[#C6A36B] font-mono font-light drop-shadow-md text-center max-w-full px-2 flex items-center justify-center gap-2">
          <span>Khadakpada • Kalyan (West)</span>
          <span className="text-[#C6A36B]/40">•</span>
          <span className="inline-flex items-center gap-1 text-[#F4EBDD]/90"><Star className="w-3 h-3 text-[#C6A36B] fill-[#C6A36B]" /> 4.4 (954 Reviews)</span>
        </div>

        <div className="flex flex-col items-center text-center my-auto max-w-xl w-full px-3 sm:px-6 pointer-events-auto">
          <BrandLogo variant="full" className="scale-90 sm:scale-115 md:scale-130 mb-2.5 sm:mb-5 drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] max-w-full" />

          <h1 className="font-luxury text-[clamp(1.75rem,6vw,3.5rem)] text-[#F4EBDD] tracking-[0.06em] sm:tracking-[0.16em] uppercase font-light drop-shadow-[0_4px_24px_rgba(18,11,9,0.98)] leading-[1.15] max-w-full">
            A little more <br className="sm:hidden" />
            than dining.
          </h1>

          <p className="font-sans text-[13px] sm:text-sm md:text-base text-[#F4EBDD]/90 font-light mt-2.5 sm:mt-5 max-w-md sm:max-w-lg mx-auto tracking-normal sm:tracking-widest leading-relaxed drop-shadow-[0_2px_12px_rgba(18,11,9,0.95)]">
            An immersive botanical sanctuary where global culinary artistry meets warm architectural illumination.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-5 sm:mt-9 max-w-full">
            <button
              onClick={() => scrollToProgress(0.24)}
              className="text-[11px] sm:text-xs font-sans uppercase tracking-[0.16em] sm:tracking-[0.25em] text-[#F4EBDD] hover:text-[#C6A36B] transition-colors flex items-center gap-1.5 cursor-pointer pb-1 border-b border-[#C6A36B]/60 hover:border-[#C6A36B] drop-shadow-md whitespace-nowrap"
            >
              <span>Begin Experience</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C6A36B]" />
            </button>
            <span className="text-[#C6A36B]/40 hidden sm:inline">•</span>
            <button
              onClick={onOpenMenu}
              className="text-[11px] sm:text-xs font-sans uppercase tracking-[0.16em] sm:tracking-[0.25em] text-[#F4EBDD]/85 hover:text-white transition-colors cursor-pointer pb-1 border-b border-transparent hover:border-[#F4EBDD] drop-shadow-md whitespace-nowrap"
            >
              Explore Offerings
            </button>
          </div>
        </div>

        {/* Minimalist Scroll Cue */}
        <div className="flex flex-col items-center gap-1 sm:gap-2 drop-shadow-lg">
          <span className="text-[9px] font-sans tracking-[0.25em] uppercase text-[#F4EBDD]/70 font-light">
            Scroll Down To Enter
          </span>
          <div className="w-[1px] h-5 sm:h-7 bg-gradient-to-b from-[#C6A36B] to-transparent animate-pulse" />
        </div>
      </div>

      {/* STAGE 2: THE BLUE PORTAL (Left-Aligned Architectural Story) */}
      <div
        className="fixed inset-0 w-full h-[100dvh] z-20 flex items-center px-6 sm:px-12 md:px-20 lg:px-32 transition-all duration-700 ease-out transform-gpu pointer-events-none"
        style={stage2Style}
      >
        {/* Natural atmospheric lighting scrim */}
        <div className="absolute inset-0 cinematic-grad-left pointer-events-none -z-10" />

        <div className="max-w-xl text-left pointer-events-auto">
          <div className="flex items-center gap-2.5 sm:gap-3 text-[10px] sm:text-xs font-mono text-[#9EB2FF] tracking-[0.35em] uppercase font-medium drop-shadow-md">
            <span className="w-6 sm:w-8 h-[1px] bg-[#3557E8]" />
            <span>I. The Blue Portal</span>
          </div>

          <h2 className="font-luxury text-[clamp(2.1rem,7.5vw,4.5rem)] text-[#F4EBDD] font-normal leading-[1.08] tracking-wide mt-2.5 sm:mt-3 drop-shadow-[0_4px_24px_rgba(18,11,9,0.98)]">
            A Luminous <br />
            <span className="italic font-serif text-[#9EB2FF]">Threshold.</span>
          </h2>

          <p className="text-[14px] sm:text-[15px] text-[#F4EBDD]/90 font-sans font-light leading-relaxed max-w-lg mt-3 sm:mt-4 drop-shadow-[0_2px_12px_rgba(18,11,9,0.95)]">
            Framed in dark walnut arches and trailing Boston ferns, our signature azure archway of bubbling textured glass marks the transition between the bustling city outside and the tranquility of our dining room.
          </p>

          <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-2.5 sm:gap-3 text-[10px] sm:text-[11px] font-mono tracking-widest text-[#C6A36B] drop-shadow-md">
            <span>COBALT WATER GLASS</span>
            <span className="text-[#C6A36B]/40">•</span>
            <span>TIMBER JOINERY</span>
          </div>

          <div className="mt-5 sm:mt-6">
            <button
              onClick={() => scrollToProgress(0.45)}
              className="text-xs font-sans uppercase tracking-[0.25em] text-[#F4EBDD] hover:text-[#C6A36B] transition-colors flex items-center gap-2 cursor-pointer pb-1 border-b border-[#3557E8]/80 hover:border-[#C6A36B] drop-shadow-md"
            >
              <span>Journey Further Inside</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C6A36B]" />
            </button>
          </div>
        </div>
      </div>

      {/* STAGE 3: OUR STORY / THE PHILOSOPHY (Responsive Art Directed Editorial) */}
      <div
        className="fixed inset-0 w-full h-[100dvh] z-20 flex items-center justify-start md:justify-end px-6 sm:px-12 md:px-20 lg:px-32 transition-all duration-700 ease-out transform-gpu pointer-events-none"
        style={stage3Style}
      >
        {/* Natural atmospheric lighting scrim */}
        <div className="absolute inset-0 cinematic-grad-right pointer-events-none -z-10" />

        <div className="max-w-xl text-left md:text-right md:ml-auto pointer-events-auto">
          <div className="flex items-center justify-start md:justify-end gap-2.5 sm:gap-3 text-[10px] sm:text-xs font-mono text-[#C6A36B] tracking-[0.35em] sm:tracking-[0.4em] uppercase font-medium drop-shadow-md">
            <span className="w-6 sm:w-8 h-[1px] bg-[#C6A36B] md:hidden" />
            <span>II. The Philosophy</span>
            <span className="hidden md:inline-block w-8 h-[1px] bg-[#C6A36B]" />
          </div>

          <h2 className="font-luxury text-[clamp(2.1rem,7.5vw,4.5rem)] text-[#F4EBDD] font-normal leading-[1.08] tracking-wide mt-2.5 sm:mt-3 drop-shadow-[0_4px_24px_rgba(18,11,9,0.98)]">
            Where Every <br className="hidden sm:inline" />
            Gathering <br />
            <span className="italic text-[#C6A36B] font-serif">Becomes a Story.</span>
          </h2>

          <p className="text-[14px] sm:text-[15px] text-[#F4EBDD]/90 font-sans font-light leading-relaxed max-w-lg md:ml-auto mt-3 sm:mt-4 drop-shadow-[0_2px_12px_rgba(18,11,9,0.95)]">
            Discover a space where global flavours, warm hospitality, and thoughtful ambience come together. Natural walnut timber slats, acoustic archways, and warm filament globes are composed to create quiet intimacy within a grand hall.
          </p>

          <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-start md:justify-end gap-2.5 sm:gap-3 text-[10px] sm:text-[11px] font-mono tracking-widest text-[#F4EBDD]/90 drop-shadow-md">
            <span>WALNUT JOINERY</span>
            <span className="text-[#C6A36B]/50">•</span>
            <span>TUNGSTEN ILLUMINATION</span>
            <span className="text-[#C6A36B]/50">•</span>
            <span>BOTANICAL SANCTUARY</span>
          </div>
        </div>
      </div>

      {/* STAGE 4: VELVET LOUNGE & MIXOLOGY (Asymmetrical Editorial) */}
      <div
        className="fixed inset-0 w-full h-[100dvh] z-20 flex items-center px-6 sm:px-12 md:px-20 lg:px-32 transition-all duration-700 ease-out transform-gpu pointer-events-none"
        style={stage4Style}
      >
        {/* Natural atmospheric lighting scrim */}
        <div className="absolute inset-0 cinematic-grad-left pointer-events-none -z-10" />

        <div className="max-w-xl text-left pointer-events-auto">
          <div className="flex items-center gap-2.5 sm:gap-3 text-[10px] sm:text-xs font-mono text-emerald-400 tracking-[0.35em] sm:tracking-[0.4em] uppercase font-medium drop-shadow-md">
            <span className="w-6 sm:w-8 h-[1px] bg-emerald-400" />
            <span>III. The Sanctuary & Lounge</span>
          </div>

          <h2 className="font-luxury text-[clamp(2.1rem,7.5vw,4.5rem)] text-[#F4EBDD] font-normal leading-[1.08] tracking-wide mt-2.5 sm:mt-3 drop-shadow-[0_4px_24px_rgba(18,11,9,0.98)]">
            Cascading Greenery <br />
            <span className="italic text-[#C76A27] font-serif">& Velvet Comfort.</span>
          </h2>

          <p className="text-[14px] sm:text-[15px] text-[#F4EBDD]/90 font-sans font-light leading-relaxed max-w-lg mt-3 sm:mt-4 drop-shadow-[0_2px_12px_rgba(18,11,9,0.95)]">
            Overhead Boston ferns filter golden Edison light across custom walnut partitions. Tailored burnt-orange velvet armchairs and emerald banquettes pair with our mixology program featuring house-infused botanical spirits.
          </p>

          {/* Signature Drinks — Pure Editorial Typography */}
          <div className="mt-4 sm:mt-5 space-y-1 drop-shadow-md">
            <span className="text-[10px] font-mono tracking-[0.3em] sm:tracking-[0.35em] uppercase text-[#C76A27] block">
              Mixology & Spirits Program
            </span>
            <p className="font-serif italic text-[14px] sm:text-base text-[#F4EBDD] leading-snug">
              Smoked Kokum Sour • Saffron Botanical Gin • Hibiscus Blossom Spritz
            </p>
          </div>

          <div className="mt-5 sm:mt-6">
            <button
              onClick={onOpenReservation}
              className="text-xs font-sans uppercase tracking-[0.25em] text-[#F4EBDD] hover:text-[#C76A27] transition-colors flex items-center gap-2 cursor-pointer pb-1 border-b border-[#C76A27] hover:border-white drop-shadow-md"
            >
              <span>Reserve Table In This Zone</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C76A27]" />
            </button>
          </div>
        </div>
      </div>

      {/* STAGE 5: CULINARY SHOWCASE (Responsive Editorial & Typographic Menu Curation) */}
      <div
        className="fixed inset-0 w-full h-[100dvh] z-20 flex items-center justify-start md:justify-end px-6 sm:px-12 md:px-20 lg:px-32 transition-all duration-700 ease-out transform-gpu pointer-events-none"
        style={stage5Style}
      >
        {/* Natural atmospheric lighting scrim */}
        <div className="absolute inset-0 cinematic-grad-right pointer-events-none -z-10" />

        <div className="max-w-xl text-left md:text-right md:ml-auto pointer-events-auto">
          <div className="flex items-center justify-start md:justify-end gap-2.5 sm:gap-3 text-[10px] sm:text-xs font-mono text-[#C76A27] tracking-[0.35em] sm:tracking-[0.4em] uppercase font-medium drop-shadow-md">
            <span className="w-6 sm:w-8 h-[1px] bg-[#C76A27] md:hidden" />
            <span>IV. The Global Kitchen</span>
            <span className="hidden md:inline-block w-8 h-[1px] bg-[#C76A27]" />
          </div>

          <h2 className="font-luxury text-[clamp(2.1rem,7.5vw,4.5rem)] text-[#F4EBDD] font-normal leading-[1.08] tracking-wide mt-2.5 sm:mt-3 drop-shadow-[0_4px_24px_rgba(18,11,9,0.98)]">
            Crafted for <br />
            <span className="italic text-[#C6A36B] font-serif">the Palate.</span>
          </h2>

          <p className="text-[14px] sm:text-[15px] text-[#F4EBDD]/90 font-sans font-light leading-relaxed max-w-lg md:ml-auto mt-3 sm:mt-4 drop-shadow-[0_2px_12px_rgba(18,11,9,0.95)]">
            Wood-fired Neapolitan crusts fermented 48 hours, 24-hour slow-cooked heritage Indian curries, and handcrafted small plates prepared daily with pristine ingredients.
          </p>

          {/* Borderless Editorial Dish Showcase */}
          <div className="mt-5 grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-3 sm:gap-y-3.5 text-left md:text-right drop-shadow-md">
            <div>
              <span className="block font-serif text-[#F4EBDD] text-[13px] sm:text-base">Wild Truffle & Burrata</span>
              <span className="block text-[10px] sm:text-[11px] font-mono text-[#C6A36B] mt-0.5">Wood-Fired Neapolitan • ₹645</span>
            </div>
            <div>
              <span className="block font-serif text-[#F4EBDD] text-[13px] sm:text-base">24-Hr Dal Bukhara</span>
              <span className="block text-[10px] sm:text-[11px] font-mono text-[#C6A36B] mt-0.5">Slow-Cooked Heritage • ₹495</span>
            </div>
            <div>
              <span className="block font-serif text-[#F4EBDD] text-[13px] sm:text-base">Truffle Edamame</span>
              <span className="block text-[10px] sm:text-[11px] font-mono text-[#C6A36B] mt-0.5">Artisanal Dim Sum • ₹445</span>
            </div>
            <div>
              <span className="block font-serif text-[#F4EBDD] text-[13px] sm:text-base">Awadhi Nalli Gosht</span>
              <span className="block text-[10px] sm:text-[11px] font-mono text-[#C6A36B] mt-0.5">Dum-Cooked Shank • ₹745</span>
            </div>
          </div>

          <div className="mt-6 sm:mt-7 flex items-center justify-start md:justify-end gap-4">
            <button
              onClick={onOpenMenu}
              className="text-xs font-sans uppercase tracking-[0.25em] text-white hover:text-[#C6A36B] transition-colors flex items-center gap-2 cursor-pointer pb-1 border-b border-[#C6A36B] hover:border-white drop-shadow-md"
            >
              <span>Explore Full 40-Dish Menu</span>
              <ArrowRight className="w-4 h-4 text-[#C6A36B]" />
            </button>
          </div>
        </div>
      </div>

      {/* STAGE 6: GRAND ARRIVAL & EDITORIAL HOSPITALITY CONCLUSION */}
      <div
        className="fixed inset-0 w-full h-[100dvh] z-20 flex flex-col justify-end transition-all duration-700 ease-out transform-gpu pointer-events-none"
        style={stage6Style}
      >
        {/* Full overlay with balanced opacity across the entire frame so background photography remains visible with maximum text clarity */}
        <div className="absolute inset-0 bg-[#120B09]/60 pointer-events-none -z-10" />

        {/* Upward atmospheric gradient scrim for rich text contrast */}
        <div className="absolute inset-0 cinematic-grad-arrival pointer-events-none -z-10" />

        <div className="w-full pt-16 sm:pt-24 md:pt-32 pb-6 sm:pb-10 md:pb-12 px-6 sm:px-12 md:px-16 lg:px-24 overflow-y-auto sm:overflow-visible max-h-[92vh] sm:max-h-none relative z-10">
          <div className="max-w-6xl mx-auto w-full space-y-6 sm:space-y-8 pointer-events-auto">
            {/* Grand Arrival Headline & Editorial Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 sm:pb-8 border-b border-[#C6A36B]/20">
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-mono tracking-[0.25em] sm:tracking-[0.35em] text-[#C6A36B] uppercase drop-shadow-md">
                  <span>Welcome to Namaste Kalyan</span>
                  <span className="text-[#C6A36B]/40">•</span>
                  <span className="inline-flex items-center gap-1 text-[#F4EBDD]/90 font-normal">
                    <Star className="w-3 h-3 text-[#C6A36B] fill-[#C6A36B]" />
                    <span>4.4 (954 Google Reviews)</span>
                  </span>
                </div>
                <h2 className="font-luxury text-[clamp(2.3rem,6.8vw,4.8rem)] text-[#F4EBDD] font-normal leading-[1.05] tracking-wide drop-shadow-[0_4px_28px_rgba(18,11,9,0.98)]">
                  Your Table Awaits.
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm md:text-base text-[#F4EBDD]/80 drop-shadow-md font-serif italic">
                  <span>Global Kitchen & Bar</span>
                  <span className="text-[#C6A36B]/50">·</span>
                  <span>RockMount Residency, Khadakpada, Kalyan (West)</span>
                  <span className="text-[#C6A36B]/50 hidden sm:inline">·</span>
                  <span className="font-sans not-italic text-[11px] sm:text-xs text-[#C6A36B] tracking-wider hidden sm:inline">नमस्ते कल्याण</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 md:pt-0">
                <button
                  onClick={onOpenMenu}
                  className="text-xs sm:text-sm font-sans uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#F4EBDD] hover:text-[#C6A36B] pb-1 border-b border-[#C6A36B]/50 hover:border-[#C6A36B] transition-all cursor-pointer drop-shadow-md"
                >
                  View Menu
                </button>

                <button
                  onClick={onOpenReservation}
                  className="px-6 sm:px-8 py-2.5 sm:py-3.5 bg-[#C6A36B] hover:bg-[#F4EBDD] text-[#120B09] font-sans font-medium text-xs sm:text-sm uppercase tracking-[0.22em] transition-all duration-300 cursor-pointer shadow-[0_4px_20px_rgba(198,163,107,0.25)] hover:shadow-[0_6px_25px_rgba(244,235,221,0.35)] whitespace-nowrap"
                >
                  Reserve a Table
                </button>
              </div>
            </div>

            {/* Information Area — Three Distinct Editorial Groups */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-14 pt-1 text-xs font-sans">
              {/* Group 1: Visit Us */}
              <div className="space-y-1.5">
                <h3 className="text-[10px] sm:text-[11px] font-mono tracking-[0.3em] sm:tracking-[0.35em] uppercase text-[#C6A36B] mb-2 font-medium drop-shadow-sm flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C6A36B]" />
                  <span>Visit Us</span>
                </h3>
                <p className="text-[#F4EBDD] font-light text-xs sm:text-sm leading-relaxed">
                  RockMount Residency, 4th Floor
                </p>
                <p className="text-[#F4EBDD]/90 font-light text-xs sm:text-sm leading-relaxed">
                  Khadakpada Circle, Kalyan (West), MH 421301
                </p>
                <p className="text-[#F4EBDD]/60 font-light text-[11px] sm:text-xs">
                  Landmark: Gokul Nagari NX, Gandhar Nagar
                </p>
                <p className="text-[#C6A36B] font-light text-[11px] sm:text-xs pt-0.5">
                  Complimentary Valet Attendants
                </p>
                <button
                  onClick={() => setIsMapModalOpen(true)}
                  className="text-[#C6A36B] hover:text-[#F4EBDD] transition-colors text-[11px] sm:text-xs inline-flex items-center gap-1 pt-1.5 underline underline-offset-4 cursor-pointer"
                >
                  <span>View Embedded Google Map</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              {/* Group 2: Hours of Hospitality */}
              <div className="space-y-1.5">
                <h3 className="text-[10px] sm:text-[11px] font-mono tracking-[0.3em] sm:tracking-[0.35em] uppercase text-[#C6A36B] mb-2 font-medium drop-shadow-sm">
                  Hours of Hospitality
                </h3>
                <p className="text-[#F4EBDD] font-light text-xs sm:text-sm leading-relaxed">
                  Lunch: 12:00 PM – 04:00 PM
                </p>
                <p className="text-[#F4EBDD] font-light text-xs sm:text-sm leading-relaxed">
                  Dinner: 07:00 PM – 12:00 AM (Midnight)
                </p>
                <p className="text-[#F4EBDD]/60 font-light text-[11px] sm:text-xs pt-0.5">
                  Open 7 Days a Week
                </p>
                <p className="text-[#C6A36B] font-mono text-[10px] tracking-wider pt-0.5">
                  Dine-in · Kerbside Pickup · Delivery
                </p>
              </div>

              {/* Group 3: Direct Host Contact */}
              <div className="space-y-1.5">
                <h3 className="text-[10px] sm:text-[11px] font-mono tracking-[0.3em] sm:tracking-[0.35em] uppercase text-[#C6A36B] mb-2 font-medium drop-shadow-sm flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#C6A36B]" />
                  <span>Direct Host Contact</span>
                </h3>
                <a
                  href="tel:+919371519999"
                  className="text-[#F4EBDD] hover:text-[#C6A36B] transition-colors block font-light text-xs sm:text-sm"
                >
                  +91 93715 19999 (Reception Desk)
                </a>
                <a
                  href="https://maps.app.goo.gl/UqDjUJk4U7ZSRtvE9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C6A36B] hover:text-[#F4EBDD] transition-colors text-[11px] sm:text-xs inline-flex items-center gap-1.5 pt-1 border-b border-[#C6A36B]/40 hover:border-[#F4EBDD]"
                >
                  <span>Navigate via Google Maps App</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <span className="text-[#F4EBDD]/50 text-[10.5px] font-mono block pt-0.5">
                  Plus Code: 743P+9P Kalyan, Maharashtra
                </span>
              </div>
            </div>

            {/* Final Closing Signature */}
            <div className="pt-6 sm:pt-8 border-t border-[#C6A36B]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 text-[10px] font-mono tracking-[0.25em] uppercase text-[#F4EBDD]/50">
              <span className="font-luxury text-sm tracking-[0.35em] text-[#C6A36B] font-light">
                NAMASTE KALYAN
              </span>
              <span className="text-[9.5px] sm:text-[10px] text-[#F4EBDD]/40">
                © 2026 NAMASTE KALYAN. ALL RIGHTS RESERVED.
              </span>
              <span className="text-[9.5px] sm:text-[10px] tracking-[0.3em] text-[#C6A36B]/70">
                A CINEMATIC DINING EXPERIENCE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Google Maps Embed Modal */}
      {isMapModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 pointer-events-auto"
          onClick={() => setIsMapModalOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl bg-[#1C120F] border border-[#C6A36B]/30 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#C6A36B]/20 bg-[#120B09]">
              <div>
                <span className="text-[10px] font-mono tracking-[0.25em] text-[#C6A36B] uppercase block">
                  Location & Directions
                </span>
                <h3 className="font-serif text-base sm:text-lg text-[#F4EBDD]">
                  Namaste Kalyan - Global Kitchen & Bar
                </h3>
                <p className="text-[11px] sm:text-xs text-[#F4EBDD]/70 font-light mt-0.5">
                  RockMount Residency, 4th, Khadakpada Cir, Kalyan, Maharashtra 421301
                </p>
              </div>
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="p-2 rounded-full hover:bg-[#2B1B15] text-[#F4EBDD]/70 hover:text-white transition-colors cursor-pointer"
                aria-label="Close Map"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full aspect-[4/3] sm:aspect-[16/9] max-h-[60vh] bg-black">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3761.7607293171027!2d73.13420077512463!3d19.253415846379117!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be797a947c4d521%3A0xa1460c122cb5b178!2sNamaste%20Kalyan%20-%20Global%20Kitchen%20%26%20Bar!5e1!3m2!1sen!2sin!4v1791098611257!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Namaste Kalyan - Google Maps"
              />
            </div>

            <div className="p-3.5 sm:p-4 bg-[#120B09] flex flex-wrap items-center justify-between gap-3 border-t border-[#C6A36B]/20 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-[#F4EBDD]/80 font-mono text-[11px]">
                  Plus Code: 743P+9P Kalyan
                </span>
                <span className="text-[#C6A36B]/50">•</span>
                <a
                  href="tel:+919371519999"
                  className="text-[#C6A36B] hover:text-white font-mono text-[11px]"
                >
                  +91 93715 19999
                </a>
              </div>
              <a
                href="https://maps.app.goo.gl/UqDjUJk4U7ZSRtvE9"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#C6A36B] hover:bg-white text-[#120B09] font-sans font-medium text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
              >
                <span>Open in Google Maps App</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CONTINUOUS SCROLL TRACK (550vh) — Every turn of the scroll wheel immediately advances the camera */}
      <div className="relative w-full h-[550vh] pointer-events-none" />
    </div>
  );
};
