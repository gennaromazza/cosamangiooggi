// Logo "Che cucino oggi?": la casseruola con il vapore a forma di punto interrogativo.
export default function Logo({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} role="img" aria-label="Che cucino oggi?">
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E0561A" />
          <stop offset="1" stopColor="#A8360B" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#logo-bg)" />
      <g transform="translate(0 -18)">
        <path
          d="M206 168 C206 118 250 92 288 108 C324 124 322 170 284 196 C266 208 258 218 258 236"
          fill="none"
          stroke="#FBF7F0"
          strokeWidth="28"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="258" cy="268" r="17" fill="#FBF7F0" />
      </g>
      <rect x="96" y="338" width="52" height="26" rx="13" fill="#F5E3CC" />
      <rect x="364" y="338" width="52" height="26" rx="13" fill="#F5E3CC" />
      <path d="M132 318 H380 V374 a64 64 0 0 1 -64 64 H196 a64 64 0 0 1 -64 -64 Z" fill="#FBF7F0" />
      <rect x="116" y="298" width="280" height="30" rx="15" fill="#F5E3CC" />
      <rect x="236" y="286" width="40" height="16" rx="8" fill="#F5E3CC" />
    </svg>
  );
}
