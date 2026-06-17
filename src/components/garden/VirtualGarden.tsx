interface VirtualGardenProps {
  level: 1 | 2 | 3 | 4 | 5;
  wilting?: boolean;
}

const LEVEL_LABELS: Record<number, string> = {
  1: 'Dormant Seed',
  2: 'Green Sprout',
  3: 'Leafy Sapling',
  4: 'Young Tree',
  5: 'Blossoming Eco-Tree',
};

export default function VirtualGarden({ level, wilting }: VirtualGardenProps) {
  const wiltClass = wilting ? 'opacity-70 hue-rotate-[30deg] saturate-50' : '';
  const description = `${LEVEL_LABELS[level]}${wilting ? ' (wilting)' : ''}. Phase ${level} of 5.`;

  return (
    <div className={`relative w-full h-64 flex items-end justify-center ${wiltClass}`} role="img" aria-label={description}>
      <svg viewBox="0 0 400 260" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#e0f2fe" /><stop offset="100%" stopColor="#fefce8" /></linearGradient>
          <linearGradient id="dirt" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#92400e" /><stop offset="100%" stopColor="#78350f" /></linearGradient>
          <linearGradient id="grass" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#22c55e" /><stop offset="100%" stopColor="#16a34a" /></linearGradient>
        </defs>
        <rect x="0" y="0" width="400" height="260" fill="url(#sky)" />
        <circle cx="340" cy="40" r="25" fill="#fbbf24" opacity="0.9" />
        <circle cx="340" cy="40" r="18" fill="#fde68a" />
        <rect x="0" y="200" width="400" height="60" fill="url(#dirt)" rx="4" />

        {level === 5 && (
          <g>
            <ellipse cx="200" cy="198" rx="120" ry="12" fill="url(#grass)" />
            {[50,80,120,150,180,220,250,280,320,350].map(x => (
              <line key={x} x1={x} y1="200" x2={x-2} y2="188" stroke="#22c55e" strokeWidth="2" />
            ))}
          </g>
        )}

        {level === 1 && (<g><ellipse cx="200" cy="205" rx="30" ry="4" fill="#6b4c2a" /><ellipse cx="200" cy="203" rx="8" ry="5" fill="#78350f" stroke="#5c2d0a" strokeWidth="1" /></g>)}

        {level === 2 && (
          <g>
            <line x1="200" y1="200" x2="200" y2="180" stroke="#16a34a" strokeWidth="3" strokeLinecap="round"><animate attributeName="y2" from="200" to="180" dur="0.8s" fill="freeze" /></line>
            <ellipse cx="194" cy="183" rx="8" ry="4" fill="#22c55e" transform="rotate(-30 194 183)"><animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.6s" fill="freeze" /></ellipse>
            <ellipse cx="206" cy="183" rx="8" ry="4" fill="#22c55e" transform="rotate(30 206 183)"><animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.6s" fill="freeze" /></ellipse>
          </g>
        )}

        {level === 3 && (
          <g>
            <line x1="200" y1="200" x2="200" y2="140" stroke="#15803d" strokeWidth="5" strokeLinecap="round" />
            <line x1="200" y1="165" x2="180" y2="150" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
            <line x1="200" y1="155" x2="220" y2="140" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="175" cy="142" rx="15" ry="12" fill="#22c55e" />
            <ellipse cx="225" cy="132" rx="15" ry="12" fill="#22c55e" />
            <ellipse cx="200" cy="125" rx="18" ry="14" fill="#16a34a" />
            <ellipse cx="190" cy="135" rx="12" ry="10" fill="#4ade80" opacity="0.7" />
          </g>
        )}

        {level === 4 && (
          <g>
            <rect x="193" y="150" width="14" height="50" rx="3" fill="#92400e" />
            <rect x="195" y="150" width="10" height="50" rx="2" fill="#a3621a" />
            <line x1="200" y1="165" x2="165" y2="135" stroke="#92400e" strokeWidth="5" strokeLinecap="round" />
            <line x1="200" y1="155" x2="240" y2="120" stroke="#92400e" strokeWidth="5" strokeLinecap="round" />
            <line x1="200" y1="145" x2="180" y2="100" stroke="#a3621a" strokeWidth="3" strokeLinecap="round" />
            <line x1="200" y1="140" x2="225" y2="95" stroke="#a3621a" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="160" cy="125" rx="22" ry="18" fill="#22c55e" />
            <ellipse cx="245" cy="110" rx="22" ry="18" fill="#22c55e" />
            <ellipse cx="175" cy="90" rx="20" ry="16" fill="#16a34a" />
            <ellipse cx="230" cy="85" rx="20" ry="16" fill="#16a34a" />
            <ellipse cx="200" cy="80" rx="28" ry="22" fill="#15803d" />
            <ellipse cx="190" cy="100" rx="15" ry="12" fill="#4ade80" opacity="0.6" />
            <ellipse cx="215" cy="95" rx="15" ry="12" fill="#4ade80" opacity="0.6" />
          </g>
        )}

        {level === 5 && (
          <g>
            <rect x="191" y="130" width="18" height="70" rx="4" fill="#78350f" />
            <rect x="194" y="130" width="12" height="70" rx="3" fill="#92400e" />
            <line x1="200" y1="155" x2="155" y2="115" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
            <line x1="200" y1="140" x2="250" y2="95" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
            <line x1="200" y1="130" x2="170" y2="80" stroke="#92400e" strokeWidth="4" strokeLinecap="round" />
            <line x1="200" y1="125" x2="235" y2="75" stroke="#92400e" strokeWidth="4" strokeLinecap="round" />
            <line x1="155" y1="115" x2="130" y2="95" stroke="#a3621a" strokeWidth="3" strokeLinecap="round" />
            <line x1="250" y1="95" x2="275" y2="75" stroke="#a3621a" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="125" cy="85" rx="25" ry="20" fill="#22c55e" />
            <ellipse cx="280" cy="65" rx="25" ry="20" fill="#22c55e" />
            <ellipse cx="155" cy="70" rx="28" ry="22" fill="#16a34a" />
            <ellipse cx="250" cy="60" rx="28" ry="22" fill="#16a34a" />
            <ellipse cx="200" cy="55" rx="35" ry="28" fill="#15803d" />
            <ellipse cx="185" cy="80" rx="20" ry="16" fill="#4ade80" opacity="0.5" />
            <ellipse cx="220" cy="75" rx="20" ry="16" fill="#4ade80" opacity="0.5" />
            <circle cx="140" cy="65" r="4" fill="#fb7185" opacity="0.9"><animate attributeName="r" values="4;5;4" dur="2s" repeatCount="indefinite" /></circle>
            <circle cx="260" cy="55" r="4" fill="#fb923c" opacity="0.9"><animate attributeName="r" values="4;5;4" dur="2.5s" repeatCount="indefinite" /></circle>
            <circle cx="200" cy="40" r="4" fill="#f472b6" opacity="0.9"><animate attributeName="r" values="4;5;4" dur="1.8s" repeatCount="indefinite" /></circle>
            <circle cx="170" cy="50" r="3" fill="#fbbf24" opacity="0.8"><animate attributeName="r" values="3;4;3" dur="2.2s" repeatCount="indefinite" /></circle>
            <circle cx="230" cy="45" r="3" fill="#fbbf24" opacity="0.8"><animate attributeName="r" values="3;4;3" dur="2.1s" repeatCount="indefinite" /></circle>
            <circle cx="150" cy="80" r="3" fill="#fb7185" opacity="0.7"><animate attributeName="r" values="3;4;3" dur="2.3s" repeatCount="indefinite" /></circle>
            <circle cx="260" cy="75" r="3" fill="#fb7185" opacity="0.7"><animate attributeName="r" values="3;4;3" dur="1.9s" repeatCount="indefinite" /></circle>
            <g transform="translate(120, 50) scale(0.5)">
              <ellipse cx="0" cy="0" rx="6" ry="3" fill="#c084fc" opacity="0.7"><animate attributeName="rx" values="6;4;6" dur="0.4s" repeatCount="indefinite" /></ellipse>
              <ellipse cx="0" cy="-2" rx="4" ry="2" fill="#e879f9" opacity="0.7"><animate attributeName="rx" values="4;2;4" dur="0.4s" repeatCount="indefinite" /></ellipse>
              <animateTransform attributeName="transform" type="translate" values="0,0; 10,-5; 20,0; 10,5; 0,0" dur="4s" repeatCount="indefinite" />
            </g>
          </g>
        )}

        {level >= 3 && (
          <g opacity="0.15">
            <ellipse cx="60" cy="225" rx="4" ry="6" fill="#333" /><ellipse cx="72" cy="220" rx="4" ry="6" fill="#333" />
            <ellipse cx="330" cy="230" rx="4" ry="6" fill="#333" /><ellipse cx="345" cy="225" rx="4" ry="6" fill="#333" />
          </g>
        )}
      </svg>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-semibold text-gray-700 border border-emerald-100" aria-hidden="true">
        Phase {level} of 5 — {LEVEL_LABELS[level]}
      </div>
    </div>
  );
}
