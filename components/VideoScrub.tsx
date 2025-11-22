'use client';

import { useEffect, useRef, useState } from 'react';

export default function VideoScrub() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // メタデータ読み込み完了時にdurationを設定
      video.onloadedmetadata = () => {
        if (!isNaN(video.duration)) {
          setDuration(video.duration);
        }
      };
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
      
      // 動画を開始するタイミングを早める: コンテナの上端が画面の下端に到達した時点から開始
      // オフセットを追加して、より早いタイミングで動画が始まるようにする
      const startOffset = windowHeight * 0.5; // 画面の半分下から開始（調整可能）
      const startPoint = windowHeight + startOffset; // コンテナの上端がこの位置に来たら動画開始
      
      // スクロール可能な距離を拡張（開始が早くなる分、終了も早くなる）
      const scrollableDistance = containerHeight - windowHeight + startOffset;
      
      // 現在のスクロール位置（コンテナの上端が画面上端からどれくらい上にあるか）
      const scrolled = startPoint - rect.top;
      
      if (scrollableDistance > 0 && scrolled >= 0) {
        // 進行度 (0.0 〜 1.0)
        let progress = scrolled / scrollableDistance;
        progress = Math.max(0, Math.min(1, progress));
        
        // 動画の位置を更新
        if (videoRef.current) {
          videoRef.current.currentTime = progress * duration;
        }
      } else if (scrolled < 0 && videoRef.current) {
        // 開始前は0秒に設定
        videoRef.current.currentTime = 0;
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
          preload="metadata"
          className="w-full h-full object-cover"
          style={{
            filter: 'grayscale(80%) contrast(1.2) brightness(0.8)', // トーン調整
          }}
        />
      </div>
    </section>
  );
}



