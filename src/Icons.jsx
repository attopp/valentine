/* Shared SVG icon components — no emojis, all vector */

export function HeartIcon({ size = 24, color = '#e74c3c', style, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={style}
      className={className}
      fill={color}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export function PenguinIcon({ size = 80, female = false, style, className }) {
  return (
    <svg
      viewBox="0 0 36 36"
      width={size}
      height={size}
      style={style}
      className={className}
    >
      {/* Source: https://github.com/twitter/twemoji/blob/master/assets/svg/1f427.svg (CC-BY 4.0), adapted */}
      <path
        fill="#FFAC33"
        d="M28.068 31.355c-2.229 0-8.468.785-10.068 1.832-1.601-1.047-7.84-1.832-10.069-1.832-2.564 0-1.161 1.039-1.161 2.322C6.77 34.96 5.367 36 7.931 36c2.229 0 8.468-.785 10.069-1.832C19.601 35.215 25.84 36 28.068 36c2.565 0 1.161-1.04 1.161-2.322 0-1.283 1.405-2.323-1.161-2.323z"
      />
      <path
        fill="#292F33"
        d="M31.73 15.866c-1.25-2.499-3.152-4.995-4.942-6.723C24.337 3.711 20.759 0 18 0s-6.337 3.71-8.788 9.143c-1.791 1.729-3.693 4.224-4.943 6.724-2.438 4.876-3.116 11.426-2.078 11.944.873.437 2.324-1.552 4.208-5.082C6.667 33.604 13.446 33.678 18 33.678c4.553 0 11.333-.073 11.601-10.947 1.884 3.528 3.335 5.517 4.207 5.08 1.038-.519.361-7.069-2.078-11.945z"
      />
      <path
        fill="#F5F8FA"
        d="M21.675 6.943c-.85.607-2.172 1.186-3.675 1.186s-2.825-.578-3.675-1.185c-3.302 2.137-5.615 7.06-5.615 12.798 0 7.695 4.159 13.936 9.29 13.936 5.132 0 9.291-6.24 9.291-13.936 0-5.738-2.313-10.662-5.616-12.799z"
      />
      <path
        fill="#FFAC33"
        d="M28.452 6h-5.808C18.797 6 18 5.22 18 4.257c0-.962-.364-1.742 3.483-1.742C27.291 2.516 29.613 6 28.452 6z"
      />
      <path
        fill="#F5F8FA"
        d="M16.839 3.483c0 .642-.52 1.162-1.161 1.162-.642 0-1.161-.521-1.161-1.162 0-.641.52-1.161 1.161-1.161s1.161.52 1.161 1.161z"
      />

      {/* Female extras: bow + eyelashes */}
      {female && (
        <>
          <g transform="translate(25.5, 2.8)">
            <circle r="1.4" fill="#c0392b" />
            <ellipse cx="-2.3" cy="-0.8" rx="2.4" ry="1.5" fill="#e74c3c" transform="rotate(-12)" />
            <ellipse cx="2.3" cy="-0.8" rx="2.4" ry="1.5" fill="#e74c3c" transform="rotate(12)" />
          </g>
          <line x1="14.6" y1="2.5" x2="13.7" y2="1.7" stroke="#222" strokeWidth="0.33" strokeLinecap="round" />
          <line x1="15.5" y1="2.3" x2="15.2" y2="1.3" stroke="#222" strokeWidth="0.33" strokeLinecap="round" />
          <line x1="17.7" y1="2.3" x2="17.9" y2="1.3" stroke="#222" strokeWidth="0.33" strokeLinecap="round" />
          <line x1="18.6" y1="2.5" x2="19.5" y2="1.7" stroke="#222" strokeWidth="0.33" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
