import React, { useEffect, useRef, useState, useCallback } from 'react';
import './ScrollVideoTest.css';

// --- Configuration ---
const INITIAL_BATCH_SIZE = 30;  // İlk yüklenecek frame sayısı (anında görünür)
const BACKGROUND_BATCH_SIZE = 10; // Arka planda her seferde yüklenecek frame sayısı
const BACKGROUND_BATCH_DELAY = 50; // Batch'ler arası bekleme (ms) — tarayıcıyı bloke etmemek için

export default function ScrollVideoTest() {
  const canvasRef = useRef(null);
  const profileImgRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const stickyContainerRef = useRef(null);
  const [loadProgress, setLoadProgress] = useState(0); // 0-100 arası yüzde
  const [initialReady, setInitialReady] = useState(false); // İlk batch yüklendi mi?

  const frameCount = 277; // 1-147 + 171-300 (total 147 + 130 = 277)
  const imagesRef = useRef([]); // Image nesneleri
  const loadedSetRef = useRef(new Set()); // Yüklenmiş frame index'leri
  const currentFrameIndexRef = useRef(0);
  const contextRef = useRef(null);
  const imagePathsRef = useRef([]);
  const cleanupRef = useRef(false); // Cleanup flag

  // Generate image paths (aynı sıra korunuyor)
  const getImagePaths = useCallback(() => {
    if (imagePathsRef.current.length > 0) return imagePathsRef.current;
    const paths = [];
    for (let i = 1; i <= 147; i++) {
      paths.push(`/Kareler/ezgif-frame-${i.toString().padStart(3, '0')}.jpg`);
    }
    for (let i = 171; i <= 300; i++) {
      paths.push(`/Kareler/ezgif-frame-${i.toString().padStart(3, '0')}.jpg`);
    }
    imagePathsRef.current = paths;
    return paths;
  }, []);

  // Tek bir frame'i yükle — Promise döner
  const loadSingleImage = useCallback((index, paths) => {
    return new Promise((resolve) => {
      if (cleanupRef.current) { resolve(false); return; }
      // Zaten yüklüyse atla
      if (imagesRef.current[index]?.complete && imagesRef.current[index]?.naturalWidth > 0) {
        loadedSetRef.current.add(index);
        resolve(true);
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (cleanupRef.current) { resolve(false); return; }
        imagesRef.current[index] = img;
        loadedSetRef.current.add(index);
        resolve(true);
      };
      img.onerror = () => {
        resolve(false);
      };
      img.src = paths[index];
      imagesRef.current[index] = img;
    });
  }, []);

  // Bir grup frame'i paralel yükle
  const loadBatch = useCallback(async (indices, paths) => {
    const promises = indices.map((idx) => loadSingleImage(idx, paths));
    await Promise.all(promises);
    if (!cleanupRef.current) {
      setLoadProgress(Math.round((loadedSetRef.current.size / frameCount) * 100));
    }
  }, [loadSingleImage, frameCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;
    contextRef.current = context;
    cleanupRef.current = false;

    // Initialize images array
    imagesRef.current = new Array(frameCount).fill(null);
    loadedSetRef.current.clear();

    const paths = getImagePaths();

    // --- Render Frame (fallback ile) ---
    const renderFrame = (index) => {
      if (!canvas || !contextRef.current) return;

      // Eğer istenen frame yüklüyse direkt çiz
      let img = imagesRef.current[index];
      if (img?.complete && img?.naturalWidth > 0) {
        drawImage(img);
        return;
      }

      // Yüklü değilse en yakın yüklenmiş frame'i bul (fallback)
      let closest = null;
      let minDist = Infinity;
      for (const loadedIdx of loadedSetRef.current) {
        const dist = Math.abs(loadedIdx - index);
        if (dist < minDist) {
          minDist = dist;
          closest = loadedIdx;
        }
      }

      if (closest !== null) {
        const fallbackImg = imagesRef.current[closest];
        if (fallbackImg?.complete && fallbackImg?.naturalWidth > 0) {
          drawImage(fallbackImg);
        }
      }
    };

    const drawImage = (img) => {
      const ctx = contextRef.current;
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;

      let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

      if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    // --- Resize handler ---
    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderFrame(currentFrameIndexRef.current);
    };

    window.addEventListener('resize', resizeCanvas);

    // --- Scroll Handler ---
    const handleScroll = () => {
      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) return;

      const rect = scrollContainer.getBoundingClientRect();
      const maxScroll = rect.height - window.innerHeight;
      let scrolled = -rect.top;

      let scrollFraction = scrolled / maxScroll;

      if (scrollFraction < 0) scrollFraction = 0;
      if (scrollFraction > 1) scrollFraction = 1;

      const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(scrollFraction * frameCount)
      );

      if (frameIndex !== currentFrameIndexRef.current) {
        currentFrameIndexRef.current = frameIndex;

        if (profileImgRef.current) {
          if (currentFrameIndexRef.current <= 63) {
            const opacity = 1 - (currentFrameIndexRef.current / 63);
            profileImgRef.current.style.opacity = opacity;
          } else {
            profileImgRef.current.style.opacity = 0;
          }
        }

        requestAnimationFrame(() => renderFrame(currentFrameIndexRef.current));
      }

      // Videoyu ve siyah arka planı son %10'luk scroll kısmında yavaşça soldur
      if (stickyContainerRef.current) {
        if (scrollFraction > 0.9) {
          const opacity = 1 - ((scrollFraction - 0.9) * 10);
          stickyContainerRef.current.style.opacity = Math.max(0, opacity);
        } else {
          stickyContainerRef.current.style.opacity = 1;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // =============================================
    // PROGRESSIVE LOADING STRATEGY
    // =============================================
    const startProgressiveLoading = async () => {
      // PHASE 1: İlk batch (ilk 30 frame) — öncelikli ve paralel
      const initialIndices = [];
      for (let i = 0; i < Math.min(INITIAL_BATCH_SIZE, frameCount); i++) {
        initialIndices.push(i);
      }

      await loadBatch(initialIndices, paths);

      if (cleanupRef.current) return;

      // İlk frame yüklendiyse canvas'ı boyutlandır ve ilk kareyi çiz
      resizeCanvas();
      setInitialReady(true);

      // PHASE 2: Geri kalan frame'leri arka planda küçük batch'ler halinde yükle
      const remainingIndices = [];
      for (let i = INITIAL_BATCH_SIZE; i < frameCount; i++) {
        if (!loadedSetRef.current.has(i)) {
          remainingIndices.push(i);
        }
      }

      // Küçük batch'ler halinde yükle — tarayıcı bloke olmasın
      for (let batchStart = 0; batchStart < remainingIndices.length; batchStart += BACKGROUND_BATCH_SIZE) {
        if (cleanupRef.current) return;

        const batchIndices = remainingIndices.slice(batchStart, batchStart + BACKGROUND_BATCH_SIZE);
        await loadBatch(batchIndices, paths);

        // Tarayıcıya nefes aldır
        if (batchStart + BACKGROUND_BATCH_SIZE < remainingIndices.length) {
          await new Promise((resolve) => {
            if (typeof requestIdleCallback !== 'undefined') {
              requestIdleCallback(() => resolve(), { timeout: BACKGROUND_BATCH_DELAY + 100 });
            } else {
              setTimeout(resolve, BACKGROUND_BATCH_DELAY);
            }
          });
        }
      }
    };

    startProgressiveLoading();

    // --- Cleanup ---
    return () => {
      cleanupRef.current = true;
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', handleScroll);
      // Cleanup: release image references to prevent memory leak
      imagesRef.current.forEach((img) => {
        if (img) {
          img.onload = null;
          img.onerror = null;
          img.src = '';
        }
      });
      imagesRef.current = [];
      loadedSetRef.current.clear();
      contextRef.current = null;
    };
  }, [getImagePaths, loadBatch, frameCount]);

  return (
    <div className="scroll-test-wrapper">
        {/* Loading Indicator — yalnızca ilk batch yüklenene kadar belirgin göster */}
        {loadProgress < 100 && (
            <div className="fixed top-24 right-4 z-[100] flex gap-2 pointer-events-none">
                <div className={`text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/20 font-medium text-sm transition-all duration-500 ${
                  initialReady ? 'bg-black/30' : 'bg-black/60'
                }`}>
                    {!initialReady 
                      ? `Yükleniyor... %${loadProgress}`
                      : `%${loadProgress}`
                    }
                </div>
            </div>
        )}

        <div className="scroll-container" ref={scrollContainerRef}>
            <div className="sticky-container" ref={stickyContainerRef}>
                <canvas id="video-canvas" ref={canvasRef}></canvas>
                <img id="profile-img" ref={profileImgRef} src="/PROFİ.png" alt="Profil" />
            </div>
        </div>
    </div>
  );
}
