'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const MAX_RIPPLES = 16;

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uRes;
  uniform float uTheme;      // 0 = dark, 1 = light
  uniform vec4 uRipples[${MAX_RIPPLES}]; // xy: 中心(アスペクト補正済), z: 発生時刻, w: 強さ

  // マウス波紋: 減衰しながら広がるリング
  float rippleHeight(vec2 p) {
    float h = 0.0;
    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      vec4 r = uRipples[i];
      if (r.w <= 0.0) continue;
      float age = uTime - r.z;
      if (age < 0.0 || age > 3.0) continue;
      float d = length(p - r.xy);
      float ring = d - age * 0.32;
      h += sin(ring * 55.0)
         * exp(-abs(ring) * 20.0)
         * exp(-age * 1.7)
         * exp(-d * 2.2)
         * r.w;
    }
    return h * 0.035;
  }

  // 複数方向の正弦波を重ねたうねり
  float swellHeight(vec2 p) {
    float t = uTime;
    float h = 0.0;
    h += sin(dot(p, normalize(vec2( 1.0,  0.55))) * 5.5  + t * 0.75) * 0.060;
    h += sin(dot(p, normalize(vec2(-0.7,  1.00))) * 9.0  + t * 1.10) * 0.034;
    h += sin(dot(p, normalize(vec2( 0.3, -1.00))) * 14.0 + t * 1.60) * 0.018;
    h += sin(dot(p, normalize(vec2(-1.0, -0.35))) * 23.0 + t * 2.10) * 0.009;
    return h;
  }

  float height(vec2 p) {
    return swellHeight(p) + rippleHeight(p);
  }

  // 水中コースティクス(古典的な反復干渉パターン)
  float caustics(vec2 uv, float t) {
    vec2 p = mod(uv * 6.28318, 6.28318) - 250.0;
    vec2 i = p;
    float c = 1.0;
    float inten = 0.005;
    for (int n = 0; n < 4; n++) {
      float tt = t * (1.0 - (3.5 / float(n + 1)));
      i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
      c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
    }
    c /= 4.0;
    c = 1.17 - pow(c, 1.4);
    return pow(abs(c), 8.0);
  }

  void main() {
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 p = vec2(vUv.x * aspect, vUv.y);

    // 有限差分で法線を推定
    float eps = 0.004;
    float hC = height(p);
    float hX = height(p + vec2(eps, 0.0));
    float hY = height(p + vec2(0.0, eps));
    vec3 n = normalize(vec3((hC - hX) / eps, (hC - hY) / eps, 1.0));

    // テーマ別パレット
    vec3 deepDark    = vec3(0.010, 0.030, 0.075);
    vec3 shallowDark = vec3(0.030, 0.135, 0.205);
    vec3 deepLight    = vec3(0.560, 0.780, 0.840);
    vec3 shallowLight = vec3(0.820, 0.930, 0.950);
    vec3 deep    = mix(deepDark, deepLight, uTheme);
    vec3 shallow = mix(shallowDark, shallowLight, uTheme);

    // 上方が浅く見えるグラデーション + 法線による揺らぎ
    float depthMix = smoothstep(0.0, 1.0, vUv.y * 0.85 + n.x * 0.35 + hC * 2.0);
    vec3 col = mix(deep, shallow, depthMix);

    // フェイク空反射(フレネル)
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    float fresnel = pow(1.0 - clamp(dot(n, viewDir), 0.0, 1.0), 2.2);
    vec3 skyDark  = vec3(0.35, 0.75, 0.80);
    vec3 skyLight = vec3(1.00, 1.00, 1.00);
    col += mix(skyDark, skyLight, uTheme) * fresnel * 2.4;

    // スペキュラハイライト
    vec3 lightDir = normalize(vec3(-0.35, 0.65, 0.55));
    float spec = pow(max(dot(reflect(-lightDir, n), viewDir), 0.0), 72.0);
    col += vec3(0.9, 1.0, 1.0) * spec * mix(0.55, 0.85, uTheme);

    // コースティクス(法線で屈折させて揺らす)
    float ca = caustics(p * 1.4 + n.xy * 0.45, uTime * 0.55);
    vec3 causticTintDark  = vec3(0.30, 0.85, 0.80);
    vec3 causticTintLight = vec3(0.65, 0.95, 0.95);
    col += mix(causticTintDark, causticTintLight, uTheme) * ca * mix(0.30, 0.40, uTheme);

    // 波紋そのものの発光リング
    float rippleGlow = rippleHeight(p) * 18.0;
    col += mix(vec3(0.35, 0.90, 0.85), vec3(0.10, 0.55, 0.60), uTheme) * max(rippleGlow, 0.0);

    // 中央を落ち着かせてヒーローテキストの可読性を確保 / ビネット
    float centerFade = 1.0 - smoothstep(0.25, 0.95, distance(vUv, vec2(0.5, 0.45)));
    col = mix(col, mix(vec3(0.004, 0.012, 0.035), vec3(0.88, 0.95, 0.97), uTheme), centerFade * 0.45);
    float vignette = 1.0 - smoothstep(0.45, 1.25, distance(vUv, vec2(0.5)));
    col *= mix(0.55, 1.0, vignette);

    // わずかなディザでバンディングを軽減
    float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) / 255.0;
    col += dither;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * ヒーロー背景のインタラクティブ水面。
 * - ポインター移動/クリックで波紋が広がる
 * - data-theme の変化に追従してパレットをスムーズに遷移
 * - 画面外・非表示タブでは描画を停止
 */
export default function WaterCanvas({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    } catch {
      return; // WebGL 非対応環境では CSS グラデーションのフォールバックのみ表示
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const ripples = Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector4(0, 0, 0, 0));
    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uTheme: { value: document.documentElement.dataset.theme === 'light' ? 1 : 0 },
      uRipples: { value: ripples },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w, h);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // --- 波紋の登録(リングバッファ) ---
    let rippleIndex = 0;
    let lastX = -1;
    let lastY = -1;
    const clock = new THREE.Clock();

    const addRipple = (clientX: number, clientY: number, strength: number) => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = (clientX - rect.left) / rect.width;
      const y = 1 - (clientY - rect.top) / rect.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      const aspect = rect.width / rect.height;
      ripples[rippleIndex].set(x * aspect, y, clock.getElapsedTime(), strength);
      rippleIndex = (rippleIndex + 1) % MAX_RIPPLES;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (reducedMotion) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (dx * dx + dy * dy < 48 * 48) return; // 一定距離ごとに間引く
      lastX = e.clientX;
      lastY = e.clientY;
      addRipple(e.clientX, e.clientY, 0.45);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (reducedMotion) return;
      addRipple(e.clientX, e.clientY, 1.3);
    };

    container.addEventListener('pointermove', onPointerMove, { passive: true });
    container.addEventListener('pointerdown', onPointerDown, { passive: true });

    // --- テーマ変化に追従 ---
    let themeTarget = uniforms.uTheme.value;
    const themeObserver = new MutationObserver(() => {
      themeTarget = document.documentElement.dataset.theme === 'light' ? 1 : 0;
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // --- 描画ループ(画面外/非表示タブでは停止) ---
    let rafId = 0;
    let visible = true;
    let running = false;

    let lastTime = 0;
    const renderFrame = () => {
      const elapsed = clock.getElapsedTime();
      const dt = Math.min(elapsed - lastTime, 0.1);
      lastTime = elapsed;
      uniforms.uTime.value = elapsed * (reducedMotion ? 0.25 : 1);
      // フレームレートに依存しない時間ベースの補間
      uniforms.uTheme.value += (themeTarget - uniforms.uTheme.value) * (1 - Math.exp(-dt * 5));
      renderer.render(scene, camera);
    };

    const loop = () => {
      if (!running) return;
      renderFrame();
      rafId = requestAnimationFrame(loop);
    };

    const setRunning = (next: boolean) => {
      if (next === running) return;
      running = next;
      if (running) {
        clock.start();
        rafId = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(rafId);
      }
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        setRunning(visible && !document.hidden);
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(container);

    const onVisibility = () => setRunning(visible && !document.hidden);
    document.addEventListener('visibilitychange', onVisibility);

    renderFrame(); // 初期フレーム

    return () => {
      setRunning(false);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerdown', onPointerDown);
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden="true"
      // WebGL 初期化前・非対応環境用のフォールバック
      style={{
        background:
          'linear-gradient(180deg, var(--surface-3) 0%, var(--surface-1) 60%, var(--surface-2) 100%)',
      }}
    />
  );
}
