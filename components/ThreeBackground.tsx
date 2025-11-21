'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  
  const count = 2000;
  // useStateの初期化関数を使用して一度だけ乱数を生成する
  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;     // x
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20; // z
    }
    return arr;
  });

  useFrame((state) => {
    if (ref.current) {
      // 時間経過による回転
      ref.current.rotation.x = state.clock.getElapsedTime() * 0.05;
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.03;

      // スクロールによる視点/回転の変化
      // window.scrollY を取得して回転に加算
      const scrollY = window.scrollY;
      ref.current.rotation.y += scrollY * 0.0005;
      ref.current.position.z = scrollY * 0.001;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#88ccff"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

export default function ThreeBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        background: '#050510', // ベースのダーク背景
      }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ParticleField />
      </Canvas>
    </div>
  );
}
