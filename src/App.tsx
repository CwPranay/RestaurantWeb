import React, { useState, useEffect, useRef } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { CinematicExperience } from './components/CinematicExperience';
import { MenuDrawer } from './components/MenuDrawer';
import { ReservationModal } from './components/ReservationModal';

const TOTAL_FRAMES = 240;
const CRITICAL_INITIAL_FRAMES = 12;

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

      if (loadedCount >= CRITICAL_INITIAL_FRAMES) {
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
      // 1. Immediately request the first 16 frames so canvas renders instantly
      const initialBatch: Promise<HTMLImageElement>[] = [];
      for (let i = 1; i <= CRITICAL_INITIAL_FRAMES; i++) {
        initialBatch.push(loadSingleFrame(i));
      }
      await Promise.all(initialBatch);
      if (isCancelled) return;
      setImages([...loadedImagesRef.current]);

      // 2. High-speed parallel pool for all remaining frames (concurrency: 24)
      const queue = Array.from(
        { length: TOTAL_FRAMES - CRITICAL_INITIAL_FRAMES },
        (_, i) => i + CRITICAL_INITIAL_FRAMES + 1
      );
      const concurrency = 24;

      const worker = async () => {
        while (queue.length > 0 && !isCancelled) {
          const nextIndex = queue.shift();
          if (nextIndex !== undefined) {
            await loadSingleFrame(nextIndex);
          }
        }
      };

      const workers = Array.from({ length: concurrency }, () => worker());

      // Periodically update the state array so CinematicExperience gets fresh frames smoothly
      const syncTimer = setInterval(() => {
        if (isCancelled) {
          clearInterval(syncTimer);
          return;
        }
        setImages([...loadedImagesRef.current]);
      }, 200);

      await Promise.all(workers);
      clearInterval(syncTimer);
      if (!isCancelled) {
        setImages([...loadedImagesRef.current]);
      }
    };

    loadAllFramesConcurrently();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#1C120F] text-[#F4EBDD] selection:bg-[#C76A27] selection:text-white font-sans">
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
