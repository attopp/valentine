import { useMemo } from 'react';
import { HeartIcon } from './Icons';

const COLORS = ['#e74c3c', '#ff6b81', '#fd79a8', '#e84393', '#c0392b'];

export default function FloatingHearts({ count = 12 }) {
  const hearts = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: (i / count) * 100 + Math.random() * 6,
      size: Math.random() * 18 + 14,
      duration: Math.random() * 8 + 10,
      delay: Math.random() * 10,
      color: COLORS[i % COLORS.length],
      opacity: Math.random() * 0.15 + 0.05,
    })),
    [count]
  );

  return (
    <div className="floating-hearts">
      {hearts.map(h => (
        <span
          key={h.id}
          className="floating-heart"
          style={{
            left: `${h.left}%`,
            opacity: h.opacity,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
          }}
        >
          <HeartIcon size={h.size} color={h.color} />
        </span>
      ))}
    </div>
  );
}
