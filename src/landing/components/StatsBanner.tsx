import { STATS } from '../data/school-data';

export function StatsBanner() {
  return (
    <div className="py-16 px-6 bg-emerald-800 relative overflow-hidden">
      <StarPattern />
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center relative z-10">
        {STATS.map((stat) => (
          <div key={stat.label} className="reveal">
            <div className="font-bold mb-2 text-amber-300" style={{ fontSize: '3rem', fontFamily: 'Georgia, serif' }}>
              {stat.value}
            </div>
            <div className="text-white/70 text-sm font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StarPattern() {
  return (
    <div className="absolute inset-0 opacity-30">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="stars" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M30 0 L33 22 L55 20 L37 33 L44 55 L30 42 L16 55 L23 33 L5 20 L27 22 Z" fill="#c9973a" fillOpacity="0.15"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#stars)"/>
      </svg>
    </div>
  );
}
