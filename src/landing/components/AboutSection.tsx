import { CheckCircle2 } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { SCHOOL_NAME } from '../data/school-data';

const FEATURES = [
  'Kurikulum Merdeka',
  'Tahfidz Al-Qur\'an',
  'Lab Komputer Modern',
  'Ekstrakurikuler Beragam',
  'Beasiswa Prestasi',
  'Kantin Halal',
];

const ABOUT_TEXT = {
  primary: 'SDIT Bustanul Huda berdiri sejak tahun 1999, hadir sebagai lembaga pendidikan yang memadukan kurikulum nasional dengan pendidikan agama Islam secara komprehensif.',
  secondary: 'Kami berkomitmen melahirkan generasi yang cerdas, beriman, dan berkarakter.',
};

export function AboutSection() {
  useScrollReveal();

  return (
    <section id="about" className="py-24 px-6 bg-amber-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image collage */}
          <div className="reveal relative">
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&q=80"
                alt="Sekolah"
                className="rounded-2xl w-full h-56 object-cover col-span-2 shadow-lg"
              />
              <img
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&q=80"
                alt="Siswa"
                className="rounded-2xl w-full h-44 object-cover shadow-md"
              />
              <img
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&q=80"
                alt="Perpustakaan"
                className="rounded-2xl w-full h-44 object-cover shadow-md"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-5 -right-4 p-4 rounded-2xl shadow-xl z-10 bg-emerald-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-400">
                  <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-white font-bold text-sm">Akreditasi A</div>
                  <div className="text-xs text-amber-300">BAN-S/M 2024</div>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="reveal">
            <span className="text-amber-600 font-bold text-sm uppercase tracking-wider">Tentang Kami</span>
            <h2 className="font-bold mt-2 mb-4 leading-tight text-emerald-900" style={{ fontSize: '2.25rem', fontFamily: 'Georgia, serif' }}>
              Sekolah Berkualitas<br />Berlandaskan Nilai Islam
            </h2>
            <OrnamentDivider />
            <p className="mb-4 leading-relaxed text-gray-600">{ABOUT_TEXT.primary}</p>
            <p className="mb-8 leading-relaxed text-gray-600">{ABOUT_TEXT.secondary}</p>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-sm font-medium text-gray-700">{f}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => document.querySelector('#programs')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Lihat Program Kami
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function OrnamentDivider() {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
      <svg className="w-5 h-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
      </svg>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
    </div>
  );
}
