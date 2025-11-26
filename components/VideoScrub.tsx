'use client';

import { useEffect, useRef, useState } from 'react';

export default function VideoScrub() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      console.log('VideoScrub: Video element found');
      
      const setVideoDuration = () => {
        if (!isNaN(video.duration)) {
          console.log('VideoScrub: Duration set', video.duration);
          setDuration(video.duration);
        }
      };

      if (video.readyState >= 1) {
        console.log('VideoScrub: Video already loaded');
        setVideoDuration();
      } else {
        console.log('VideoScrub: Waiting for metadata');
        video.onloadedmetadata = setVideoDuration;
      }
    }
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      if (!containerRef.current || !videoRef.current || duration === 0) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // コンテナの高さ
      const containerHeight = rect.height;
      
      // スクロール計算: コンテナが画面に入ってから出るまで全体を使う
      // rect.top = windowHeight (画面下端) -> progress = 0
      // rect.bottom = 0 (画面上端) -> progress = 1
      // スクロール距離 = containerHeight + windowHeight
      
      const totalScrollDistance = containerHeight + windowHeight;
      const scrolled = windowHeight - rect.top;
      
      if (scrolled >= 0 && totalScrollDistance > 0) {
         let progress = scrolled / totalScrollDistance;
         
         // Stickyセクションなので、視覚的には「止まっている」間に動画が進むように感じるのが自然
         // しかし、Stickyの期間だけを使うと開始・終了が唐突に感じる場合がある
         // ここでは、少し余裕を持たせて、Sticky期間を中心に動画が進むように調整する
         
         // 0.0 ~ 1.0 の範囲に制限
         progress = Math.max(0, Math.min(1, progress));
         
         if (videoRef.current) {
           videoRef.current.currentTime = progress * duration;
         }
      }
    };

    const loop = () => {
      handleScroll();
      animationFrameId = requestAnimationFrame(loop);
    };
    
    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [duration]);

  return (
    <section
      ref={containerRef}
      className="relative w-full"
      style={{ height: '400vh' }} // 十分なスクロール領域を確保
    >
      <div className="sticky top-0 w-full h-screen flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute top-10 left-10 z-10">
           <h2 className="text-4xl md:text-6xl font-bold text-white opacity-90 drop-shadow-lg">
             Deep Dive
           </h2>
           <p className="text-xl text-gray-300 mt-2">内部構造の解析</p>
        </div>
        
        <video
          ref={videoRef}
          src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          style={{
            filter: 'grayscale(80%) contrast(1.2) brightness(0.8)', // トーン調整
          }}
        />
      </div>
    </section>
  );
}



