import { useScrollReveal } from '../hooks/useScrollReveal';
import { PROGRAMS } from '../data/school-data';

const ICON_PATHS: Record<string, string> = {
  'book-quran': 'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z',
  'flask': 'M9 3h6M10 9V3M14 9V3M7 21h10M10.5 9l-7 11a2 2 0 002 2h14a2 2 0 002-2l-7-11',
  'language': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  'palette': 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.14-.77-.38-1.06-.24-.29-.38-.67-.38-1.06 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.5-4.5-10-10-10zM8.5 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15.5 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  'running': 'M13 4a1 1 0 100-2 1 1 0 000 2zM7 14l4-1 4 1-4 1-4-1zM5.5 21a2 2 0 100-4 2 2 0 000 4zM18.5 21a2 2 0 100-4 2 2 0 000 4zM2 12l4 1 4-1-4-1-4 1z',
  'graduation-cap': 'M2 10l10-5 10 5-10 5-10-5zM12 10v10M12 10L7 7l5-3 5 3-5 3',
};

const COLOR_MAP: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700',
  teal: 'bg-teal-100 text-teal-700',
  gold: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
};

const FEATURED_BG = 'bg-gradient-to-r from-emerald-800 to-teal-800';

export function ProgramsSection() {
  useScrollReveal();

  return (
    <section id="programs" className="py-24 px-6 bg-amber-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14 reveal">
          <SectionLabel>Program Unggulan</SectionLabel>
          <h2 className="font-bold text-emerald-900 mb-3" style={{ fontSize: '2.25rem', fontFamily: 'Georgia, serif' }}>
            Apa yang Kami Tawarkan?
          </h2>
          <OrnamentDivider />
          <p className="max-w-2xl mx-auto text-gray-600">
            Program pendidikan kami dirancang untuk mengembangkan potensi siswa secara holistik — akademik, spiritual, dan karakter.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
          {PROGRAMS.map((program) => (
            <ProgramCard key={program.title} program={program} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProgramCard({ program }: { program: typeof PROGRAMS[0] }) {
  const colorClass = COLOR_MAP[program.color] || COLOR_MAP.emerald;

  if (program.featured) {
    return (
      <div className="reveal rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-800 to-teal-800 p-8">
        <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={ICON_PATHS[program.icon] || ''} />
          </svg>
        </div>
        <h3 className="font-bold text-lg mb-2 text-white">{program.title}</h3>
        <p className="text-white/80 text-sm leading-relaxed mb-4">{program.description}</p>
        <button
          onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
          className="inline-flex items-center gap-2 text-sm font-semibold text-amber-300 hover:text-amber-200 transition-colors"
        >
          Daftar Beasiswa
          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    );
  }

  return (
    <div className="reveal bg-white rounded-2xl border border-amber-200 p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group cursor-pointer">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${colorClass}`}>
        <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d={ICON_PATHS[program.icon] || ''} />
        </svg>
      </div>
      <h3 className="font-bold text-lg mb-2 text-emerald-900 group-hover:text-emerald-700 transition-colors">{program.title}</h3>
      <p className="text-sm leading-relaxed text-gray-600 mb-4">{program.description}</p>
      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 group-hover:gap-3 transition-all">
        Pelajari lebih lanjut
        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-3">
      <div className="h-0.5 w-7 bg-amber-500" />
      <span className="text-amber-600 font-bold text-sm uppercase tracking-wider">{children}</span>
      <div className="h-0.5 w-7 bg-amber-500" />
    </div>
  );
}

function OrnamentDivider() {
  return (
    <div className="flex items-center justify-center gap-4 my-5">
      <div className="h-px w-20 bg-gradient-to-r from-transparent to-amber-400" />
      <svg className="w-5 h-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
      </svg>
      <div className="h-px w-20 bg-gradient-to-l from-transparent to-amber-400" />
    </div>
  );
}
