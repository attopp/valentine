import { useMemo } from 'react';

export default function Snow({ count = 45 }) {
  const flakes = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: (i / count) * 100 + Math.random() * 5,
      size: Math.random() * 3 + 2,
      duration: Math.random() * 6 + 7,
      delay: Math.random() * 8,
      sway: Math.random() * 30 - 15,
      opacity: Math.random() * 0.4 + 0.2,
    })),
    [count]
  );

  return (
    <div className="snow">
      {flakes.map(f => (
        <span
          key={f.id}
          className="snowflake"
          style={{
            left: `${f.left}%`,
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
            '--sway': `${f.sway}px`,
          }}
        />
      ))}
    </div>
  );
}
