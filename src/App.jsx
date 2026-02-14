import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { PenguinIcon, HeartIcon } from './Icons';
import FloatingHearts from './FloatingHearts';
import Snow from './Snow';
import WalkScene from './WalkScene';
import './App.css';

const NO_TEXTS = [
  'No', 'Nope!', 'Catch me!', 'Too slow!',
  'Try again!', 'Hehe', 'Never!', "Can't touch this!",
  'Just say YES!',
];

const BURST_COLORS = ['#e74c3c', '#ff6b81', '#c0392b', '#e84393', '#fd79a8'];

function HeartBurst() {
  const hearts = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 40;
      const dist = 100 + Math.random() * 350;
      return {
        id: i,
        color: BURST_COLORS[i % 5],
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
      };
    }), []
  );

  return hearts.map(h => (
    <Motion.span
      key={h.id}
      className="burst-heart"
      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      animate={{ opacity: 0, x: h.x, y: h.y, scale: 0 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
    >
      <HeartIcon color={h.color} />
    </Motion.span>
  ));
}

function AskScene({ onYes }) {
  const [dodgeCount, setDodgeCount] = useState(0);
  const [noStyle, setNoStyle] = useState({});
  const [yesScale, setYesScale] = useState(1);

  const dodge = useCallback(() => {
    setDodgeCount(prev => {
      const next = prev + 1;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const m = 30;
      setNoStyle({
        position: 'fixed',
        left: Math.random() * (vw - 140 - m * 2) + m,
        top: Math.random() * (vh - 50 - m * 2) + m,
        zIndex: 999,
        transform: `scale(${Math.max(0.4, 1 - next * 0.06)})`,
      });
      setYesScale(s => Math.min(s + 0.1, 2));
      return next;
    });
  }, []);

  return (
    <Motion.div
      className="scene ask-scene"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.4 } }}
      transition={{ duration: 0.8 }}
    >
      <Motion.div
        className="ask-penguin"
        animate={{ rotate: [0, -4, 4, -4, 0], y: [0, -5, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <PenguinIcon />
      </Motion.div>

      <Motion.span
        className="ask-heart"
        animate={{ scale: [1, 1.2, 1], y: [0, -6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <HeartIcon color="#e74c3c" />
      </Motion.span>

      <h1>Will you be my Valentine?</h1>

      <div className="buttons">
        <Motion.button
          className="btn btn-yes"
          onClick={onYes}
          animate={{ scale: yesScale }}
          whileHover={{ scale: yesScale * 1.08 }}
          whileTap={{ scale: yesScale * 0.95 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          Yes!
        </Motion.button>

        <Motion.button
          className="btn btn-no"
          style={noStyle}
          onMouseEnter={dodge}
          onTouchStart={(e) => { e.preventDefault(); dodge(); }}
          onClick={(e) => { e.preventDefault(); dodge(); }}
        >
          {NO_TEXTS[Math.min(dodgeCount, NO_TEXTS.length - 1)]}
        </Motion.button>
      </div>
    </Motion.div>
  );
}

export default function App() {
  const [said, setSaid] = useState(false);
  const [burst, setBurst] = useState(false);
  const switchTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
      }
    };
  }, []);

  const handleYes = () => {
    setBurst(true);
    switchTimeoutRef.current = setTimeout(() => setSaid(true), 700);
  };

  return (
    <>
      {!said && (
        <>
          <div className="ask-bg" />
          <FloatingHearts />
          <Snow count={30} />
        </>
      )}

      {burst && <HeartBurst />}

      <AnimatePresence mode="wait">
        {!said ? (
          <AskScene key="ask" onYes={handleYes} />
        ) : (
          <Motion.div
            key="yes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            style={{ position: 'fixed', inset: 0 }}
          >
            <WalkScene />
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
