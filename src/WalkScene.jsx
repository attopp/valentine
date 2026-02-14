import { useState, useEffect, useMemo, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { PenguinIcon, HeartIcon } from './Icons';

/*
  Timeline:
  0.6s  – SVG penguins walk in from sides (front view)
  3.0s  – They kiss (heart appears between them)
  5.8s  – Crossfade to silhouette couple walking diagonally (~20°)
          Loops right → left, leaving footprints
*/

/* ── Silhouette couple (side view, walking right) ── */
function SilhouetteCouple() {
  return (
    <svg viewBox="0 0 115 80" width="125" height="87" style={{ overflow: 'visible' }}>
      {/* ═══ Male penguin (left, slightly taller) ═══ */}
      <path d="
        M30,14
        C24,14 19,19 19,26
        C17,30 15,36 15,44
        C15,54 19,63 25,67
        L35,67
        C41,63 45,54 45,44
        C45,36 43,30 41,26
        C41,19 36,14 30,14 Z
      " fill="#1a1a2e" />
      <ellipse cx="30" cy="46" rx="7" ry="14" fill="#22223a" />
      <polygon points="41,22 48,24 41,27" fill="#d4912e" />
      <circle cx="38" cy="20" r="1.4" fill="#fff" opacity="0.5" />
      <circle cx="38" cy="20" r="0.6" fill="#111" />
      {/* Outer flipper */}
      <path d="M16,32 Q10,42 14,55" stroke="#141428" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M18,60 Q14,64 12,62" stroke="#141428" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="24" cy="69" rx="6" ry="2.2" fill="#d4912e" />
      <ellipse cx="36" cy="69" rx="6" ry="2.2" fill="#d4912e" />

      {/* ═══ Female penguin (right, slightly shorter) ═══ */}
      <path d="
        M78,18
        C73,18 68,22 68,28
        C66,32 64,37 64,44
        C64,53 68,61 73,65
        L83,65
        C88,61 92,53 92,44
        C92,37 90,32 88,28
        C88,22 83,18 78,18 Z
      " fill="#1a1a2e" />
      <ellipse cx="78" cy="46" rx="6.5" ry="13" fill="#22223a" />
      <polygon points="88,24 94,26 88,29" fill="#d4912e" />
      <circle cx="85" cy="23" r="1.3" fill="#fff" opacity="0.5" />
      <circle cx="85" cy="23" r="0.5" fill="#111" />
      <line x1="84" y1="21" x2="83" y2="19.5" stroke="#1a1a2e" strokeWidth="0.7" />
      <line x1="85.5" y1="21" x2="86" y2="19.5" stroke="#1a1a2e" strokeWidth="0.7" />
      {/* Outer flipper */}
      <path d="M91,34 Q97,44 93,55" stroke="#141428" strokeWidth="4" fill="none" strokeLinecap="round" />
      <g transform="translate(85,16)">
        <circle r="2" fill="#c0392b" />
        <ellipse cx="-3.5" cy="-1.2" rx="3.2" ry="2" fill="#e74c3c" transform="rotate(-12)" />
        <ellipse cx="3.5" cy="-1.2" rx="3.2" ry="2" fill="#e74c3c" transform="rotate(12)" />
      </g>
      <path d="M66,58 Q62,62 60,60" stroke="#141428" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="72" cy="67" rx="5.5" ry="2" fill="#d4912e" />
      <ellipse cx="83" cy="67" rx="5.5" ry="2" fill="#d4912e" />

      {/* ═══ Held flippers — two curved shapes meeting naturally ═══ */}
      <path d="M44,34 Q49,29 54,32 L53,37 Q49,35 44,39Z" fill="#1a1a2e" />
      <path d="M64,36 Q59,31 55,32 L55,37 Q59,35 64,41Z" fill="#1a1a2e" />

      {/* ═══ Floating heart above (SVG path, no emoji) ═══ */}
      <Motion.g
        animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <g transform="translate(48, -4) scale(0.5)">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#e74c3c" />
        </g>
      </Motion.g>
    </svg>
  );
}

/* ── Footprints trailing behind the couple ── */
function Footprints({ prints }) {
  return (
    <div className="footprints-layer">
      {prints.map((p) => (
        (() => {
          const isLeft = p.id % 2 === 0;
          const rotation = isLeft ? -18 : 18;
          return (
        <Motion.div
          key={p.id}
          className="footprint"
          style={{
            left: `${p.x}%`,
            bottom: `${p.bottom}%`,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.6, scale: 1, rotate: rotation }}
          transition={{ duration: 0.3 }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <g transform={isLeft ? undefined : 'translate(18 0) scale(-1 1)'}>
              <ellipse cx="9" cy="11.2" rx="4.9" ry="3.4" fill="#5c6872" opacity="0.8" />
              <circle cx="6.2" cy="7.2" r="1.15" fill="#4f5a62" opacity="0.85" />
              <circle cx="9" cy="6.5" r="1.25" fill="#4f5a62" opacity="0.88" />
              <circle cx="11.8" cy="7.2" r="1.15" fill="#4f5a62" opacity="0.85" />
              <ellipse cx="9" cy="13.3" rx="3.6" ry="2.1" fill="#4a545c" opacity="0.25" />
            </g>
          </svg>
        </Motion.div>
          );
        })()
      ))}
    </div>
  );
}

/* ── Backdrop: Antarctic landscape (nihilist penguin style) ── */
function Backdrop() {
  const stars = useMemo(() => {
    const count = 110;
    const out = [];

    for (let i = 0; i < count; i += 1) {
      const x = Math.random() * 800;
      // Bias stars toward the top of the sky for a more realistic night gradient.
      const y = Math.pow(Math.random(), 1.85) * 190;
      const bright = Math.random() < 0.12;
      const r = bright ? 0.9 + Math.random() * 1.25 : 0.35 + Math.random() * 0.65;
      const baseOpacity = bright ? 0.55 + Math.random() * 0.35 : 0.16 + Math.random() * 0.34;
      const dur = (bright ? 2.6 : 4.2) + Math.random() * 6.5;
      const delay = Math.random() * 6;
      const tintRoll = Math.random();
      const fill = tintRoll < 0.14 ? '#cfe9ff' : tintRoll < 0.28 ? '#ffe7b8' : '#ffffff';

      out.push({
        id: i,
        x,
        y,
        r,
        baseOpacity,
        dur,
        delay,
        bright,
        fill,
      });
    }

    return out;
  }, []);

  return (
    <svg className="backdrop-svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#080618" />
          <stop offset="15%" stopColor="#141235" />
          <stop offset="35%" stopColor="#3a1f45" />
          <stop offset="50%" stopColor="#7a3350" />
          <stop offset="62%" stopColor="#c4513a" stopOpacity="0.85" />
          <stop offset="75%" stopColor="#d4852c" stopOpacity="0.6" />
          <stop offset="88%" stopColor="#f0d080" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#fff5e0" stopOpacity="0.25" />
        </linearGradient>
        <radialGradient id="sunGlow" cx="50%" cy="58%" r="24%">
          <stop offset="0%" stopColor="#ffeaa7" stopOpacity="0.85" />
          <stop offset="25%" stopColor="#f5c842" stopOpacity="0.45" />
          <stop offset="55%" stopColor="#e67e22" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#c0392b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#445f78" />
          <stop offset="100%" stopColor="#212d39" />
        </linearGradient>
        <linearGradient id="mMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#354b61" />
          <stop offset="100%" stopColor="#1c2833" />
        </linearGradient>
        <linearGradient id="mNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2f4356" />
          <stop offset="100%" stopColor="#121a22" />
        </linearGradient>
        <linearGradient id="ridgeLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#dfecf6" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#f7fbff" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#dfecf6" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="snowG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dce5ec" />
          <stop offset="100%" stopColor="#becbd5" />
        </linearGradient>
        <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c4a070" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#c4a070" stopOpacity="0" />
        </linearGradient>
        <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Sky */}
      <rect width="800" height="500" fill="url(#sky)" />
      <rect width="800" height="500" fill="url(#sunGlow)" />

      {/* Setting sun at horizon */}
      <circle cx="400" cy="290" r="38" fill="#ffeaa7" opacity="0.4" />
      <circle cx="400" cy="290" r="26" fill="#fdd870" opacity="0.55" />
      <circle cx="400" cy="290" r="15" fill="#fff8e7" opacity="0.6" />

      {/* Star field */}
      {stars.map((s) => (
        <circle
          key={s.id}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill={s.fill}
          opacity={s.baseOpacity}
          filter={s.bright ? 'url(#starGlow)' : undefined}
        >
          <animate
            attributeName="opacity"
            values={`${Math.max(0.04, s.baseOpacity * 0.35)};${s.baseOpacity};${Math.max(0.04, s.baseOpacity * 0.5)}`}
            dur={`${s.dur}s`}
            begin={`${s.delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}

      {/* Wispy high clouds */}
      <ellipse cx="150" cy="90" rx="70" ry="6" fill="#ffffff" opacity="0.04" />
      <ellipse cx="480" cy="70" rx="90" ry="8" fill="#ffffff" opacity="0.035" />
      <ellipse cx="700" cy="110" rx="55" ry="5" fill="#ffffff" opacity="0.03" />

      {/* Mountains: layered for extra depth */}
      <path
        d="M0,308 L62,256 L122,283 L186,222 L246,259 L308,206 L366,242 L432,194 L502,239 L566,206 L636,245 L704,216 L764,250 L800,236 L800,500 L0,500Z"
        fill="url(#mFar)"
        opacity="0.48"
      />
      <path
        d="M-18,338 L76,268 L146,304 L232,236 L312,284 L396,223 L472,268 L558,229 L642,276 L724,238 L818,284 L818,500 L-18,500Z"
        fill="url(#mMid)"
        opacity="0.68"
      />
      <path
        d="M-40,372 L76,282 L164,332 L260,244 L350,305 L440,232 L536,293 L630,248 L722,306 L830,264 L830,500 L-40,500Z"
        fill="url(#mNear)"
      />
      <path
        d="M-40,500 L-40,372 L76,282 L164,332 L260,244 L350,305 L440,232 L536,293 L630,248 L722,306 L830,264 L830,500Z"
        fill="#0f171f"
        opacity="0.2"
      />
      <path
        d="M76,282 L164,332 L260,244 L350,305 L440,232 L536,293 L630,248 L722,306"
        fill="none"
        stroke="url(#ridgeLine)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />

      {/* Snow caps */}
      <Motion.g
        animate={{ opacity: [0.35, 0.5, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path d="M244,265 Q258,248 272,265" fill="none" stroke="#e7f0f7" strokeWidth="1.6" strokeLinecap="round" opacity="0.65" />
        <path d="M424,257 Q440,242 456,257" fill="none" stroke="#e9f2f8" strokeWidth="1.7" strokeLinecap="round" opacity="0.68" />
        <path d="M64,299 Q76,286 88,299" fill="none" stroke="#e1ebf3" strokeWidth="1.4" strokeLinecap="round" opacity="0.58" />
        <path d="M618,267 Q630,252 642,267" fill="none" stroke="#e7f0f7" strokeWidth="1.6" strokeLinecap="round" opacity="0.62" />
        <path d="M176,238 Q186,227 196,238" fill="none" stroke="#dce7ef" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        <path d="M422,211 Q432,199 442,211" fill="none" stroke="#dde8f0" strokeWidth="1.1" strokeLinecap="round" opacity="0.46" />
      </Motion.g>

      {/* Horizon haze */}
      <rect x="0" y="280" width="800" height="60" fill="url(#haze)" />

      {/* Vast Antarctic snow plain */}
      <path d="M0,340 Q100,330 200,338 Q350,348 500,335 Q650,345 800,332 L800,500 L0,500Z" fill="url(#snowG)" />
      <path d="M0,358 Q150,350 300,358 Q450,366 600,356 Q720,363 800,353 L800,500 L0,500Z" fill="#d0dae2" opacity="0.55" />
      <path d="M0,380 Q200,373 400,382 Q600,390 800,378 L800,500 L0,500Z" fill="#c0cdd6" opacity="0.4" />
      <path d="M0,410 Q250,404 500,412 Q700,418 800,408 L800,500 L0,500Z" fill="#b5c2cc" opacity="0.3" />

      {/* Wind-swept snow streaks */}
      <line x1="40" y1="378" x2="130" y2="376" stroke="#d8e4ec" strokeWidth="0.8" opacity="0.3" />
      <line x1="280" y1="392" x2="380" y2="390" stroke="#d8e4ec" strokeWidth="0.7" opacity="0.25" />
      <line x1="520" y1="370" x2="600" y2="368" stroke="#d8e4ec" strokeWidth="0.9" opacity="0.3" />
      <line x1="650" y1="400" x2="740" y2="398" stroke="#d8e4ec" strokeWidth="0.7" opacity="0.2" />
      <line x1="100" y1="410" x2="200" y2="408" stroke="#d8e4ec" strokeWidth="0.6" opacity="0.2" />

      {/* Small ice ridges */}
      <path d="M180,372 L184,362 L188,372Z" fill="#c5d5e0" opacity="0.35" />
      <path d="M600,365 L604,354 L608,365Z" fill="#c5d5e0" opacity="0.3" />
      <path d="M420,380 L423,372 L426,380Z" fill="#c5d5e0" opacity="0.25" />

      {/* Distant penguin silhouettes */}
      <g opacity="0.3">
        <ellipse cx="545" cy="346" rx="1.8" ry="3.5" fill="#1a1a2e" />
        <ellipse cx="555" cy="347" rx="1.5" ry="3" fill="#1a1a2e" />
        <ellipse cx="563" cy="346" rx="1.8" ry="3.5" fill="#1a1a2e" />
      </g>
      <g opacity="0.2">
        <ellipse cx="150" cy="352" rx="1.3" ry="2.5" fill="#1a1a2e" />
        <ellipse cx="160" cy="353" rx="1.5" ry="2.8" fill="#1a1a2e" />
      </g>

      {/* Subtle snow drifts */}
      <ellipse cx="150" cy="400" rx="90" ry="6" fill="white" opacity="0.1" />
      <ellipse cx="450" cy="420" rx="70" ry="5" fill="white" opacity="0.08" />
      <ellipse cx="680" cy="395" rx="80" ry="5" fill="white" opacity="0.09" />
      <ellipse cx="50"  cy="440" rx="55" ry="4" fill="white" opacity="0.07" />
      <ellipse cx="350" cy="455" rx="100" ry="6" fill="white" opacity="0.06" />
    </svg>
  );
}

/* ── Heavy snowfall ── */
function HeavySnow() {
  const flakes = useMemo(() =>
    Array.from({ length: 70 }, (_, i) => ({
      id: i,
      left: (i / 70) * 100 + (Math.sin(i) * 2),
      size: i % 5 === 0 ? Math.random() * 4 + 3 : Math.random() * 2.5 + 1.5,
      dur: i % 5 === 0 ? Math.random() * 4 + 5 : Math.random() * 5 + 7,
      delay: (i * 0.17) % 8,
      sway: Math.sin(i * 0.5) * 20,
      opacity: i % 5 === 0 ? Math.random() * 0.4 + 0.3 : Math.random() * 0.3 + 0.1,
    })),
    []
  );

  return (
    <div className="walk-snow">
      {flakes.map(f => (
        <span key={f.id} className="snowflake" style={{
          left: `${f.left}%`, width: f.size, height: f.size,
          opacity: f.opacity,
          animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s`,
          '--sway': `${f.sway}px`,
        }} />
      ))}
    </div>
  );
}

function SparkleBurst() {
  const sparkles = useMemo(
    () => Array.from({ length: 9 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 9 + (Math.random() * 0.35 - 0.175);
      const dist = 18 + Math.random() * 16;
      return {
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 6,
        size: 8 + Math.random() * 6,
        delay: (i % 3) * 0.03,
        rot: (Math.random() * 80 - 40),
      };
    }),
    []
  );

  return (
    <span className="sparkle-burst" aria-hidden="true">
      {sparkles.map((s) => (
        <Motion.span
          key={s.id}
          className="sparkle"
          style={{
            left: '50%',
            top: '50%',
            width: `${s.size}px`,
            height: `${s.size}px`,
            marginLeft: `${-s.size / 2}px`,
            marginTop: `${-s.size / 2}px`,
          }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0, rotate: 0 }}
          animate={{ x: s.x, y: s.y, opacity: [0, 1, 0], scale: [0, 1, 0.25], rotate: [0, s.rot] }}
          transition={{ duration: 1.05, delay: s.delay, ease: 'easeOut' }}
        >
          <svg viewBox="0 0 20 20" width="100%" height="100%">
            <path
              d="M10 0 L12.2 7.8 L20 10 L12.2 12.2 L10 20 L7.8 12.2 L0 10 L7.8 7.8 Z"
              fill="#ffeaa7"
              opacity="0.9"
            />
          </svg>
        </Motion.span>
      ))}
    </span>
  );
}

export default function WalkScene({ spotify }) {
  const [stage, setStage] = useState(0);
  const [footprints, setFootprints] = useState([]);
  const [showCouple, setShowCouple] = useState(false);
  const activeStep = stage >= 3 ? 3 : stage >= 2 ? 2 : 1;

  const coupleRef = useRef(null);
  const lastFootprintX = useRef(-999);
  const footprintId = useRef(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setStage(1), 600),
      setTimeout(() => setStage(2), 3000),
      setTimeout(() => setStage(3), 5800),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage >= 3) setShowCouple(true);
  }, [stage]);

  // Continuous walk loop
  useEffect(() => {
    if (!showCouple) return;

    let x = -8;
    const BASE_BOTTOM = 18;
    const RISE_RATE = 0.04;
    const SPEED = 2.5;
    const LOOP_AT = 88;
    let lastTime = performance.now();
    let fadeIn = 0;
    let raf;

    const tick = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      x += dt * SPEED;
      if (fadeIn < 1) fadeIn = Math.min(fadeIn + dt / 1.5, 1);

      if (x > LOOP_AT) {
        x = -8;
        setFootprints([]);
        lastFootprintX.current = -999;
      }

      const visibleX = Math.max(0, x);
      const bottom = BASE_BOTTOM + visibleX * RISE_RATE;
      const scale = 1 - visibleX * 0.001;

      if (coupleRef.current) {
        coupleRef.current.style.left = `${x}%`;
        coupleRef.current.style.bottom = `${bottom}%`;
        coupleRef.current.style.transform = `scale(${scale})`;
        coupleRef.current.style.opacity = fadeIn;
      }

      if (x - lastFootprintX.current > 3.5 && x > 0 && x < LOOP_AT - 3) {
        lastFootprintX.current = x;
        const id = footprintId.current++;
        setFootprints(prev => {
          const side = id % 2 === 0 ? -0.55 : 0.55;
          const next = [...prev, {
            id,
            x: x - 1.5 + side,
            bottom: bottom - 1.2 + (id % 2 === 0 ? 0.3 : -0.3),
          }];
          return next.length > 28 ? next.slice(-28) : next;
        });
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [showCouple]);

  return (
    <div className="walk-scene">
      <Backdrop />
      <HeavySnow />

      <Motion.div
        className="walk-stepper"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        aria-hidden="true"
      >
        <span className={`walk-step ${activeStep >= 1 ? 'is-on' : ''} ${activeStep === 1 ? 'is-active' : ''}`} />
        <span className={`walk-step ${activeStep >= 2 ? 'is-on' : ''} ${activeStep === 2 ? 'is-active' : ''}`} />
        <span className={`walk-step ${activeStep >= 3 ? 'is-on' : ''} ${activeStep === 3 ? 'is-active' : ''}`} />
        <span className="walk-step-count">{activeStep}/3</span>
      </Motion.div>

      {/* ── Front-view SVG penguins: walk in + kiss ── */}
      <AnimatePresence>
        {stage >= 1 && stage < 3 && (
          <Motion.div
            className="emoji-penguins"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
          >
            <Motion.div className="emoji-penguin"
              initial={{ x: -250, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.6, type: 'spring', bounce: 0.3 }}
            >
              <PenguinIcon />
            </Motion.div>

            <AnimatePresence>
              {stage >= 2 && (
                <Motion.span className="kiss-emoji"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: [0, 1.5, 1.1] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7 }}
                >
                  <HeartIcon color="#e74c3c" size={44} />
                  <SparkleBurst />
                </Motion.span>
              )}
            </AnimatePresence>

            <Motion.div className="emoji-penguin"
              initial={{ x: 250, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.6, type: 'spring', bounce: 0.3 }}
            >
              <PenguinIcon female />
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ── Footprints ── */}
      <Footprints prints={footprints} />

      {/* ── Silhouette couple walking diagonally ── */}
      {showCouple && (
        <div
          ref={coupleRef}
          className="silhouette-container"
          style={{ left: '-8%', bottom: '18%', opacity: 0 }}
        >
          <Motion.div
            animate={{ rotate: [-2, 2], y: [0, -3, 0] }}
            transition={{ duration: 0.55, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          >
            <SilhouetteCouple />
          </Motion.div>
        </div>
      )}

      {/* ── Text ── */}
      <div className="walk-text">
        <Motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1.2 }}
        >
          <HeartIcon className="walk-heart-icon" color="#e74c3c" size={64} />
        </Motion.h1>
        <Motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 1.2 }}
        >
          Ty a já na cestě za dobrodružstvím<br />
          Love u
        </Motion.p>
      </div>

      <Motion.div
        className="spotify-embed-wrap"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.8, duration: 1.1 }}
      >
        <div className="spotify-card">
          <div className="spotify-track-head">
            {spotify?.track?.image ? (
              <img
                className="spotify-track-art"
                src={spotify.track.image}
                alt={`${spotify.track.name || 'Track'} cover`}
              />
            ) : (
              <div className="spotify-track-art spotify-track-art--fallback" />
            )}
            <div className="spotify-track-meta">
              <p className="spotify-track-name">{spotify?.track?.name || 'Nice To Each Other'}</p>
              <p className="spotify-track-artist">{spotify?.track?.artist || 'Olivia Dean'}</p>
            </div>
          </div>

          <p className="spotify-status">{spotify?.message || 'Připoj Spotify pro spuštění hudby.'}</p>
          {spotify?.showLogin && spotify?.authHint && (
            <p className="spotify-hint">{spotify.authHint}</p>
          )}

          {spotify?.showLogin && (
            <button
              type="button"
              className="spotify-action-btn"
              onClick={spotify.onLogin}
            >
              Připojit Spotify
            </button>
          )}

          {spotify?.needsTap && (
            <button
              type="button"
              className="spotify-action-btn"
              onClick={spotify.onTapStart}
            >
              Klepni pro spuštění hudby
            </button>
          )}

          {spotify?.showOpenSpotify && (
            <button
              type="button"
              className="spotify-action-btn"
              onClick={spotify.onOpenSpotify}
            >
              Otevřít Spotify
            </button>
          )}

          {spotify?.canStop && (
            <button
              type="button"
              className="spotify-action-btn spotify-stop-btn"
              onClick={spotify.onStop}
            >
              Zastavit hudbu
            </button>
          )}
        </div>
      </Motion.div>
    </div>
  );
}
