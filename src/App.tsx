import React, { useState, useEffect, useRef } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { CinematicExperience } from './components/CinematicExperience';
import { MenuDrawer } from './components/MenuDrawer';
import { ReservationModal } from './components/ReservationModal';

const TOTAL_FRAMES = 240;
const INITIAL_BURST_FRAMES = 24;
const READINESS_THRESHOLD = 96; // Priority entrance + all stride frames across entire timeline

export default function App() {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [hasEntered, setHasEntered] = useState<boolean>(false);

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isReservationOpen, setIsReservationOpen] = useState<boolean>(false);

  const loadedImagesRef = useRef<HTMLImageElement[]>(new Array(TOTAL_FRAMES));

  useEffect(() => {
    let isCancelled = false;
    let loadedCount = 0;

    const updateProgress = () => {
      if (isCancelled) return;
      const pct = (loadedCount / TOTAL_FRAMES) * 100;
      setLoadingProgress(pct);

      if (loadedCount >= READINESS_THRESHOLD || loadedCount >= TOTAL_FRAMES) {
        setIsReady(true);
      }
    };

    const loadSingleFrame = (index: number): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new Image();
        const frameNum = String(index).padStart(3, '0');
        img.src = `/frames/frame-${frameNum}.webp`;

        img.onload = () => {
          loadedImagesRef.current[index - 1] = img;
          loadedCount++;
          updateProgress();
          resolve(img);
        };

        img.onerror = () => {
          loadedCount++;
          updateProgress();
          resolve(img);
        };
      });
    };

    const loadAllFramesConcurrently = async () => {
      // 1. Immediately request the first 24 frames so initial scroll is buttery smooth
      const initialBatch: Promise<HTMLImageElement>[] = [];
      for (let i = 1; i <= INITIAL_BURST_FRAMES; i++) {
        initialBatch.push(loadSingleFrame(i));
      }
      await Promise.all(initialBatch);
      if (isCancelled) return;
      setImages([...loadedImagesRef.current]);

      // 2. Stride distribution: load every 3rd frame across entire 240-frame timeline
      // This guarantees 100% spatial coverage so no section of the site is ever blank or distant from a loaded frame
      const strideSet = new Set<number>();
      const strideQueue: number[] = [];
      for (let i = INITIAL_BURST_FRAMES + 3; i <= TOTAL_FRAMES; i += 3) {
        strideQueue.push(i);
        strideSet.add(i);
      }

      // 3. Intermediate fill queue for the remaining frames
      const fillQueue: number[] = [];
      for (let i = INITIAL_BURST_FRAMES + 1; i <= TOTAL_FRAMES; i++) {
        if (!strideSet.has(i)) {
          fillQueue.push(i);
        }
      }

      const fullQueue = [...strideQueue, ...fillQueue];
      const concurrency = 20;

      const worker = async () => {
        while (fullQueue.length > 0 && !isCancelled) {
          const nextIndex = fullQueue.shift();
          if (nextIndex !== undefined) {
            await loadSingleFrame(nextIndex);
          }
        }
      };

      const workers = Array.from({ length: concurrency }, () => worker());

      // Periodically update the state array so CinematicExperience receives newly completed frames
      const syncTimer = setInterval(() => {
        if (isCancelled) {
          clearInterval(syncTimer);
          return;
        }
        setImages([...loadedImagesRef.current]);
      }, 150);

      await Promise.all(workers);
      clearInterval(syncTimer);
      if (!isCancelled) {
        setImages([...loadedImagesRef.current]);
        setIsReady(true);
      }
    };

    loadAllFramesConcurrently();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[#1C120F] text-[#F4EBDD] selection:bg-[#C76A27] selection:text-white font-sans">
      {/* Loading Screen */}
      {!hasEntered && (
        <LoadingScreen
          progress={loadingProgress}
          isReady={isReady}
          onEnter={() => setHasEntered(true)}
        />
      )}

      {/* Main Full-Screen Cinematic Sequence */}
      <main id="main-content">
        <CinematicExperience
          images={images}
          totalFrames={TOTAL_FRAMES}
          onOpenReservation={() => setIsReservationOpen(true)}
          onOpenMenu={() => setIsMenuOpen(true)}
        />
      </main>

      {/* Slide-over Menu Drawer */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onReserve={() => setIsReservationOpen(true)}
      />

      {/* Reservation Dialog */}
      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
      />
    </div>
  );
}
