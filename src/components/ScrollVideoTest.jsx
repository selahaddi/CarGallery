import React, { useEffect, useRef, useState } from 'react';
import './ScrollVideoTest.css';

export default function ScrollVideoTest() {
  const canvasRef = useRef(null);
  const profileImgRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const stickyContainerRef = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  
  const frameCount = 277; // 1-147 + 171-300 (total 147 + 130 = 277)
  const imagesRef = useRef([]);
  const currentFrameIndexRef = useRef(0);

  useEffect(() => {
    // Generate image paths exactly as in the original script
    const imagePaths = [];
    for (let i = 1; i <= 147; i++) {
        imagePaths.push(`/Kareler/ezgif-frame-${i.toString().padStart(3, '0')}.jpg`);
    }
    for (let i = 171; i <= 300; i++) {
        imagePaths.push(`/Kareler/ezgif-frame-${i.toString().padStart(3, '0')}.jpg`);
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Resize handler
    const resizeCanvas = () => {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        renderFrame(currentFrameIndexRef.current);
    };

    window.addEventListener('resize', resizeCanvas);

    // Preload images
    let loadedCount = 0;
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = imagePaths[i];
        img.onload = () => {
            loadedCount++;
            setImagesLoaded(loadedCount);
            if (i === 0) {
                resizeCanvas(); 
            }
        };
        imagesRef.current.push(img);
    }

    // Render Frame Function
    const renderFrame = (index) => {
        if (!imagesRef.current[index] || !imagesRef.current[index].complete || !canvas) return;
        
        const img = imagesRef.current[index];
        context.clearRect(0, 0, canvas.width, canvas.height);
        
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
        
        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    // Scroll Handler
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

    return () => {
        window.removeEventListener('resize', resizeCanvas);
        window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="scroll-test-wrapper">
        {/* Loading Indicator */}
        {imagesLoaded < frameCount && (
            <div className="fixed top-24 right-4 z-[100] flex gap-2 pointer-events-none">
                <div className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/20 font-medium text-sm">
                    Yükleniyor... %{Math.round((imagesLoaded/frameCount)*100)}
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
