'use client';

/**
 * セクション境界の流体的な波。2 枚の波が異なる速度で漂い、
 * fill には次セクションの背景色(CSS 変数)を渡す。
 */
export default function WaveDivider({
  fill = 'var(--surface-1)',
  flip = false,
  className = '',
}: {
  fill?: string;
  flip?: boolean;
  className?: string;
}) {
  const wavePath =
    'M0,64 C120,90 240,100 360,84 C480,68 600,28 720,24 C840,20 960,52 1080,68 C1200,84 1320,80 1440,60 L1440,120 L0,120 Z';
  const wavePath2 =
    'M0,80 C140,56 260,40 400,52 C540,64 640,96 780,92 C920,88 1040,48 1180,44 C1300,41 1380,58 1440,72 L1440,120 L0,120 Z';

  return (
    <div
      aria-hidden="true"
      className={`relative h-16 sm:h-24 overflow-hidden ${flip ? 'rotate-180' : ''} ${className}`}
    >
      {/* 奥の波(半透明・逆方向にドリフト) */}
      <div className="wave-drift-slow absolute bottom-0 left-0 h-full w-[200%] flex">
        {[0, 1].map((i) => (
          <svg
            key={i}
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="h-full w-1/2 shrink-0"
            style={{ opacity: 0.45 }}
          >
            <path d={wavePath2} fill={fill} />
          </svg>
        ))}
      </div>
      {/* 手前の波 */}
      <div className="wave-drift absolute bottom-0 left-0 h-full w-[200%] flex">
        {[0, 1].map((i) => (
          <svg
            key={i}
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="h-full w-1/2 shrink-0"
          >
            <path d={wavePath} fill={fill} />
          </svg>
        ))}
      </div>
    </div>
  );
}
