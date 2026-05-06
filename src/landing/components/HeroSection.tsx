import { ArrowRight, Phone, BookOpen } from 'lucide-react';
import { SCHOOL_NAME, SCHOOL_TAGLINE } from '../data/school-data';

export function HeroSection() {
  const handleScroll = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800" />
      
      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-emerald-300 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm mb-8 backdrop-blur-sm">
          <BookOpen className="w-4 h-4" />
          <span>Penerimaan Siswa Baru Tahun Ajaran 2026/2027 Telah Dibuka</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
          {SCHOOL_NAME}
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl text-emerald-100 mb-10 max-w-2xl mx-auto font-light">
          {SCHOOL_TAGLINE}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => handleScroll('#inquiry')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-emerald-800 font-semibold text-lg hover:bg-emerald-50 transition-colors shadow-lg"
          >
            Daftar Sekarang
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => handleScroll('#profile')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 text-white font-semibold text-lg hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm"
          >
            <Phone className="w-5 h-5" />
            Hubungi Kami
          </button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          {[
            { value: '15+', label: 'Tahun Berdiri' },
            { value: '500+', label: 'Siswa Aktif' },
            { value: '50+', label: 'Guru & Staff' },
            { value: '100%', label: 'Lulus Ujian' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-emerald-200 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
          <div className="w-1.5 h-2.5 rounded-full bg-white/60" />
        </div>
      </div>
    </section>
  );
}
