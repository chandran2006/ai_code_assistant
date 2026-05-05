import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─────────────────────────────────────────
   3D SCENE COMPONENTS
───────────────────────────────────────── */

/** Infinite neon grid floor that scrolls toward the camera */
function NeonGrid() {
  const ref = useRef();
  useFrame(({ clock }) => {
    ref.current.material.uniforms.uTime.value = clock.getElapsedTime();
  });

  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vec2 uv = vUv * 40.0;
        uv.y -= uTime * 3.0;
        vec2 grid = abs(fract(uv - 0.5) - 0.5) / fwidth(uv);
        float line = min(grid.x, grid.y);
        float g = 1.0 - min(line, 1.0);
        float fade = 1.0 - vUv.y;
        float pulse = 0.6 + 0.4 * sin(uTime * 1.5);
        vec3 col = mix(vec3(0.0,0.5,1.0), vec3(0.5,0.0,1.0), vUv.x) * g * fade * pulse;
        gl_FragColor = vec4(col, g * fade * 0.7);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), []);

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.2, 0]} material={mat}>
      <planeGeometry args={[60, 60, 1, 1]} />
    </mesh>
  );
}

/** DNA double-helix built from glowing spheres */
function DNAHelix() {
  const groupRef = useRef();
  const count = 28;

  const nodes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 4;
      const y = (i / count) * 6 - 3;
      arr.push({
        // strand A
        ax: Math.cos(t) * 1.1,
        ay: y,
        az: Math.sin(t) * 1.1,
        // strand B (offset by PI)
        bx: Math.cos(t + Math.PI) * 1.1,
        by: y,
        bz: Math.sin(t + Math.PI) * 1.1,
        t,
        colorA: new THREE.Color().setHSL((i / count) * 0.4 + 0.55, 1, 0.65),
        colorB: new THREE.Color().setHSL((i / count) * 0.4 + 0.75, 1, 0.65),
      });
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.35;
    groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.18;
  });

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <group key={i}>
          {/* Strand A node */}
          <mesh position={[n.ax, n.ay, n.az]}>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshStandardMaterial color={n.colorA} emissive={n.colorA} emissiveIntensity={1.8} />
          </mesh>
          {/* Strand B node */}
          <mesh position={[n.bx, n.by, n.bz]}>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshStandardMaterial color={n.colorB} emissive={n.colorB} emissiveIntensity={1.8} />
          </mesh>
          {/* Connector rung every 2 nodes */}
          {i % 2 === 0 && (() => {
            const start = new THREE.Vector3(n.ax, n.ay, n.az);
            const end   = new THREE.Vector3(n.bx, n.by, n.bz);
            const mid   = start.clone().lerp(end, 0.5);
            const dir   = end.clone().sub(start);
            const len   = dir.length();
            const quat  = new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 1, 0),
              dir.clone().normalize()
            );
            return (
              <mesh position={mid} quaternion={quat}>
                <cylinderGeometry args={[0.018, 0.018, len, 6]} />
                <meshStandardMaterial color="#ffffff" emissive="#aaaaff" emissiveIntensity={0.6} transparent opacity={0.45} />
              </mesh>
            );
          })()}
        </group>
      ))}
    </group>
  );
}

/** Floating code-fragment particles (colorful, fast) */
function CodeParticles() {
  const ref = useRef();
  const count = 220;

  const { positions, colors, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);
    const speeds    = new Float32Array(count);
    const palette   = [
      new THREE.Color('#00d4ff'),
      new THREE.Color('#a78bfa'),
      new THREE.Color('#4ade80'),
      new THREE.Color('#f472b6'),
      new THREE.Color('#fbbf24'),
      new THREE.Color('#f87171'),
    ];
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      speeds[i] = 0.4 + Math.random() * 1.2;
    }
    return { positions, colors, speeds };
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
    g.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  useFrame((_, delta) => {
    const pos = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= speeds[i] * delta * 0.9;
      if (pos[i * 3 + 1] < -7) {
        pos[i * 3 + 1] = 7;
        pos[i * 3]     = (Math.random() - 0.5) * 22;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      }
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points geometry={geo}>
      <pointsMaterial vertexColors size={0.055} transparent opacity={0.85} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/** Outer glowing energy rings */
function EnergyRings() {
  const rings = [
    { r: 2.2, speed: 0.6,  color: '#00d4ff', tilt: [Math.PI/3, 0, 0.3] },
    { r: 2.8, speed: -0.4, color: '#a78bfa', tilt: [Math.PI/5, 0, 1.1] },
    { r: 3.4, speed: 0.25, color: '#f472b6', tilt: [Math.PI/4, 0, 0.6] },
    { r: 3.9, speed: -0.18,color: '#4ade80', tilt: [Math.PI/2.5, 0, 0.2] },
  ];
  return (
    <>
      {rings.map((ring, i) => <SpinRing key={i} {...ring} />)}
    </>
  );
}

function SpinRing({ r, speed, color, tilt }) {
  const ref = useRef();
  useFrame(({ clock }) => { ref.current.rotation.z = clock.getElapsedTime() * speed; });
  return (
    <mesh ref={ref} rotation={tilt}>
      <torusGeometry args={[r, 0.012, 8, 120]} />
      <meshBasicMaterial color={color} transparent opacity={0.35} />
    </mesh>
  );
}

/** Mouse-reactive camera rig */
function CameraRig({ mouse }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.current[0] * 1.8 - camera.position.x) * 0.04;
    camera.position.y += (mouse.current[1] * 0.9 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/** Ambient volumetric fog plane */
function FogPlane() {
  const ref = useRef();
  useFrame(({ clock }) => {
    ref.current.material.opacity = 0.18 + Math.sin(clock.getElapsedTime() * 0.4) * 0.06;
  });
  return (
    <mesh ref={ref} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[30, 30]} />
      <meshBasicMaterial color="#0a0a1a" transparent opacity={0.18} depthWrite={false} />
    </mesh>
  );
}

function Scene({ mouse }) {
  return (
    <>
      <fog attach="fog" args={['#0d0d0f', 8, 28]} />
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 3, 0]}  intensity={4}   color="#00d4ff" />
      <pointLight position={[-4, 0, 2]} intensity={2.5} color="#a78bfa" />
      <pointLight position={[4, -1, -2]}intensity={2}   color="#f472b6" />
      <NeonGrid />
      <DNAHelix />
      <CodeParticles />
      <EnergyRings />
      <FogPlane />
      <CameraRig mouse={mouse} />
    </>
  );
}

/* ─────────────────────────────────────────
   GLITCH TEXT HOOK
───────────────────────────────────────── */
const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#@$%&~`|';
function useGlitchText(target, interval = 3500) {
  const [text, setText] = useState(target);
  useEffect(() => {
    let frame, iteration = 0;
    const run = () => {
      frame = requestAnimationFrame(() => {
        setText(
          target.split('').map((char, i) => {
            if (char === ' ') return ' ';
            if (i < iteration) return target[i];
            return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          }).join('')
        );
        if (iteration < target.length) { iteration += 0.5; run(); }
        else setText(target);
      });
    };
    const timer = setInterval(() => { iteration = 0; run(); }, interval);
    return () => { clearInterval(timer); cancelAnimationFrame(frame); };
  }, [target, interval]);
  return text;
}

/* ─────────────────────────────────────────
   FEATURE CARDS
───────────────────────────────────────── */
const FEATURES = [
  { icon: '🐛', label: 'Bug Detection',      desc: 'Line-level bug identification' },
  { icon: '🔧', label: 'Auto-Fix',            desc: 'Complete corrected code output' },
  { icon: '🔀', label: 'Compare View',        desc: 'Side-by-side original vs fixed' },
  { icon: '💡', label: 'Explanation',         desc: 'ELI5 or developer-level clarity' },
  { icon: '⚡', label: 'Optimization',        desc: 'Algorithmic & style improvements' },
  { icon: '🧪', label: 'Test Cases',          desc: 'Ready-to-run test examples' },
  { icon: '📊', label: 'Quality Score',       desc: 'Animated 0–100 gauge' },
  { icon: '⏱️', label: 'Time Complexity',     desc: 'Best / Avg / Worst case analysis' },
  { icon: '🗂️', label: 'Space Complexity',    desc: 'Memory usage breakdown' },
  { icon: '📋', label: 'Complexity Compare',  desc: 'Original vs optimized table' },
  { icon: '🌍', label: 'Real-World Impact',   desc: 'Performance at n=10⁵, 10⁶' },
  { icon: '🎓', label: 'Interview Mode',      desc: 'Step-by-step interview coaching' },
  { icon: '🔥', label: 'Roast Mode',          desc: 'Savage AI developer roasts 😈' },
  { icon: '🏅', label: 'Dev Badges',          desc: 'Earn badges for your code style' },
];

const LANGS = ['C', 'JavaScript', 'Python', 'Java', 'TypeScript', 'C++', 'Go', 'Rust'];

/* ─────────────────────────────────────────
   LANDING PAGE
───────────────────────────────────────── */
export default function LandingPage() {
  const navigate  = useNavigate();
  const mouse     = useRef([0, 0]);
  const glitchH1  = useGlitchText('AI Code', 4000);
  const glitchH2  = useGlitchText('Assistant Pro+', 5500);
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleMouseMove = (e) => {
    mouse.current = [
      (e.clientX / window.innerWidth  - 0.5) * 2,
      -(e.clientY / window.innerHeight - 0.5) * 2,
    ];
  };

  return (
    <div style={s.root} onMouseMove={handleMouseMove}>

      {/* ── 3D Canvas ── */}
      <div style={s.canvas}>
        <Canvas
          camera={{ position: [0, 0.5, 7], fov: 52 }}
          dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)}
          gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
        >
          <Scene mouse={mouse} />
        </Canvas>
      </div>

      {/* ── Scanline overlay ── */}
      <div style={s.scanlines} />

      {/* ── Vignette + gradient overlay ── */}
      <div style={s.overlay} />

      {/* ── Hero ── */}
      <div style={s.hero}>
        {/* Top pill badge */}
        <div style={s.pill}>
          <span style={s.pillDot} />
          Powered by Groq · Llama 3 70B · Built by Chandran
        </div>

        {/* Glitch title */}
        <h1 style={s.title}>
          <span style={s.titleLine1}>{glitchH1}</span>
          <br />
          <span style={s.titleAccent}>{glitchH2}</span>
        </h1>

        {/* Subtitle */}
        <p style={s.subtitle}>
          Drop your code. Get bugs, fixes, complexity analysis,<br />
          interview coaching &amp; savage roasts — in seconds.
        </p>

        {/* Language chips */}
        <div style={s.langs}>
          {LANGS.map((l) => (
            <span key={l} style={s.langChip}>{l}</span>
          ))}
        </div>

        {/* CTA */}
        <button
          style={s.cta}
          onClick={() => navigate('/app')}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.06) translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 0 50px rgba(0,212,255,0.7), 0 0 100px rgba(167,139,250,0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = s.cta.boxShadow;
          }}
        >
          <span style={s.ctaText}>Start Analyzing</span>
          <span style={s.ctaArrow}>→</span>
        </button>

        {/* Scroll hint */}
        <div style={s.scrollHint}>
          <div style={s.scrollDot} />
          <span>scroll to explore features</span>
        </div>
      </div>

      {/* ── Feature grid ── */}
      <div style={s.featuresSection}>
        <div style={s.featuresLabel}>// FEATURES</div>
        <div style={s.features}>
          {FEATURES.map((f, i) => (
            <div
              key={f.label}
              style={{
                ...s.card,
                ...(hoveredCard === i ? s.cardHover : {}),
              }}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <span style={s.cardIcon}>{f.icon}</span>
              <span style={s.cardLabel}>{f.label}</span>
              <span style={s.cardDesc}>{f.desc}</span>
              {hoveredCard === i && <div style={s.cardGlow} />}
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={s.footer}>
        <span style={s.footerText}>AI Code Assistant Pro+ · Built with ❤️ by Chandran</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   STYLES
───────────────────────────────────────── */
const s = {
  root: {
    position: 'relative',
    minHeight: '100vh',
    background: '#0d0d0f',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden',
    cursor: 'default',
  },

  canvas: {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
  },

  /* CRT scanlines */
  scanlines: {
    position: 'fixed',
    inset: 0,
    zIndex: 1,
    pointerEvents: 'none',
    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 2,
    pointerEvents: 'none',
    background: [
      'radial-gradient(ellipse 80% 60% at 50% 35%, rgba(13,13,15,0.1) 0%, rgba(13,13,15,0.75) 70%)',
      'radial-gradient(ellipse 100% 40% at 50% 100%, rgba(13,13,15,0.95) 0%, transparent 100%)',
    ].join(', '),
  },

  hero: {
    position: 'relative',
    zIndex: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    paddingTop: '12vh',
    gap: 22,
    animation: 'fadeIn 1s ease forwards',
  },

  pill: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#00d4ff',
    background: 'rgba(0,212,255,0.08)',
    border: '1px solid rgba(0,212,255,0.22)',
    borderRadius: 999,
    padding: '6px 18px',
    backdropFilter: 'blur(8px)',
  },

  pillDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#4ade80',
    boxShadow: '0 0 8px #4ade80',
    animation: 'pulse-glow 1.5s ease infinite',
    display: 'inline-block',
  },

  title: {
    fontSize: 'clamp(2.6rem, 7vw, 5.8rem)',
    fontWeight: 900,
    lineHeight: 1.05,
    letterSpacing: '-0.03em',
    margin: 0,
  },

  titleLine1: {
    color: '#e8e8f0',
    fontFamily: "'JetBrains Mono', monospace",
    textShadow: '0 0 40px rgba(0,212,255,0.25)',
  },

  titleAccent: {
    fontFamily: "'JetBrains Mono', monospace",
    background: 'linear-gradient(135deg, #00d4ff 0%, #a78bfa 50%, #f472b6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    filter: 'drop-shadow(0 0 30px rgba(167,139,250,0.5))',
  },

  subtitle: {
    fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
    color: '#8888aa',
    lineHeight: 1.75,
    maxWidth: 500,
    fontFamily: "'Space Grotesk', sans-serif",
  },

  langs: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    maxWidth: 520,
  },

  langChip: {
    fontSize: '0.72rem',
    fontFamily: "'JetBrains Mono', monospace",
    color: '#6666aa',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6,
    padding: '3px 11px',
    transition: 'all 0.2s',
  },

  cta: {
    marginTop: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '15px 44px',
    fontSize: '1rem',
    fontWeight: 800,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#0d0d0f',
    background: 'linear-gradient(135deg, #00d4ff 0%, #a78bfa 60%, #f472b6 100%)',
    border: 'none',
    borderRadius: 999,
    cursor: 'pointer',
    boxShadow: '0 0 30px rgba(0,212,255,0.45), 0 0 60px rgba(167,139,250,0.2)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    fontFamily: "'Space Grotesk', sans-serif",
  },

  ctaText: { letterSpacing: '0.08em' },
  ctaArrow: { fontSize: '1.2rem', fontWeight: 400 },

  scrollHint: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.68rem',
    color: '#44445a',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginTop: 8,
    animation: 'fadeIn 2s ease 1s both',
  },

  scrollDot: {
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: '#44445a',
    animation: 'pulse-glow 2s ease infinite',
  },

  featuresSection: {
    position: 'relative',
    zIndex: 3,
    width: '90%',
    maxWidth: 960,
    margin: '80px auto 40px',
  },

  featuresLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.72rem',
    color: '#00d4ff',
    letterSpacing: '0.12em',
    marginBottom: 20,
    opacity: 0.7,
  },

  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
    gap: 12,
  },

  card: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '18px 16px',
    background: 'rgba(16,16,26,0.8)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    backdropFilter: 'blur(16px)',
    transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
    cursor: 'default',
    overflow: 'hidden',
  },

  cardHover: {
    border: '1px solid rgba(0,212,255,0.35)',
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: '0 8px 32px rgba(0,212,255,0.12)',
  },

  cardGlow: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
    borderRadius: 14,
  },

  cardIcon:  { fontSize: '1.5rem' },
  cardLabel: { fontSize: '0.86rem', fontWeight: 700, color: '#e0e0f0', letterSpacing: '-0.01em' },
  cardDesc:  { fontSize: '0.73rem', color: '#7070a0', lineHeight: 1.5 },

  footer: {
    position: 'relative',
    zIndex: 3,
    padding: '24px 0 32px',
    textAlign: 'center',
  },

  footerText: {
    fontSize: '0.72rem',
    color: '#33334a',
    letterSpacing: '0.06em',
    fontFamily: "'JetBrains Mono', monospace",
  },
};
