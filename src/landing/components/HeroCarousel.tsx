import { useState, useEffect } from 'react';
import { Star, Award, Users } from 'lucide-react';

const SLIDES = [
  {
    badge: { icon: Star, text: 'Tahun Ajaran 2025/2026 Dibuka' },
    title: 'Membentuk Generasi',
    titleAccent: 'Islami & Berprestasi',
    description: 'SDIT Bustanul Huda hadir untuk mencetak generasi penerus bangsa yang berakhlak mulia, cerdas, dan siap menghadapi tantangan global.',
    ctaPrimary: { text: 'Daftar Sekarang', href: '#contact', icon: 'paper-plane' },
    ctaSecondary: { text: 'Kenali Kami', href: '#about', icon: 'play-circle' },
    visual: 'circle',
    circleValue: '٢٥',
    circleLabel: 'Tahun Berdiri',
  },
  {
    badge: { icon: Award, text: 'Akreditasi A — Unggul' },
    title: 'Pendidikan Terbaik',
    titleAccent: 'Untuk Masa Depanmu',
    description: 'Kurikulum terintegrasi antara ilmu pengetahuan modern dan nilai-nilai keislaman yang kuat, didukung tenaga pendidik berpengalaman.',
    ctaPrimary: { text: 'Lihat Program', href: '#programs', icon: 'book-open' },
    ctaSecondary: { text: 'Lihat Galeri', href: '#gallery', icon: 'images' },
    visual: 'stats',
    stats: [
      { value: '98%', label: 'Kelulusan' },
      { value: '150+', label: 'Prestasi' },
      { value: '40+', label: 'Pengajar' },
      { value: '2K+', label: 'Alumni' },
    ],
  },
  {
    badge: { icon: Users, text: 'Komunitas Islami yang Hangat' },
    title: 'Bergabung Bersama',
    titleAccent: 'Keluarga Bustanul Huda',
    description: 'Lingkungan belajar yang kondusif, penuh semangat kebersamaan, dan berlandaskan nilai-nilai Islam rahmatan lil \'alamin.',
    ctaPrimary: { text: 'Hubungi Kami', href: '#contact', icon: 'phone' },
    ctaSecondary: { text: 'Selengkapnya', href: '#about', icon: 'info-circle' },
    visual: 'quote',
    quote: '"Tuntutlah ilmu, sesungguhnya menuntut ilmu adalah pendekatan diri kepada Allah."',
    quoteSource: '— Hadits Riwayat Ibnu Abdil Barr',
  },
];

const ICON_PATHS: Record<string, string> = {
  'paper-plane': 'M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z',
  'play-circle': 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z',
  'book-open': 'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z',
  'images': 'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 15l-5-5L5 21',
  'phone': 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z',
  'info-circle': 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 16a1 1 0 100-2 1 1 0 000 2zM12 12V8',
};

function IconPath({ name, className }: { name: string; className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICON_PATHS[name] || ''} />
    </svg>
  );
}

function scrollTo(href: string) {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive((prev) => (prev + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[active];

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-emerald-900">
      {/* Geometric background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-emerald-400 blur-3xl" />
        <div className="absolute bottom-32 left-8 w-80 h-80 rounded-full bg-teal-400 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-32">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left: Text */}
          <div className="flex-1">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full text-sm font-semibold bg-amber-100/20 text-amber-300 border border-amber-400/30">
              <Star className="w-3 h-3" />
              {slide.badge.text}
            </div>

            {/* Title */}
            <h1 className="font-bold text-white mb-5 leading-tight" style={{ fontSize: '3.2rem' }}>
              {slide.title}<br />
              <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                {slide.titleAccent}
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg text-white/80 mb-8 max-w-lg">{slide.description}</p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => scrollTo(slide.ctaPrimary.href)}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <IconPath name={slide.ctaPrimary.icon} className="w-4 h-4" />
                {slide.ctaPrimary.text}
              </button>
              <button
                onClick={() => scrollTo(slide.ctaSecondary.href)}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/10 text-white font-semibold text-sm border border-white/30 hover:bg-white/20 hover:-translate-y-0.5 transition-all backdrop-blur-sm"
              >
                <IconPath name={slide.ctaSecondary.icon} className="w-4 h-4" />
                {slide.ctaSecondary.text}
              </button>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="flex-shrink-0 hidden lg:block">
            {slide.visual === 'circle' && (
              <div className="w-72 h-72 rounded-full flex items-center justify-center bg-white/5 border border-amber-400/20 animate-bounce-slow">
                <div className="w-56 h-56 rounded-full flex items-center justify-center bg-amber-400/10 border border-amber-400/20">
                  <div className="text-center">
                    <div className="font-bold text-6xl text-amber-300" style={{ fontFamily: 'Georgia, serif' }}>
                      {slide.circleValue}
                    </div>
                    <div className="text-white/60 text-sm mt-1">{slide.circleLabel}</div>
                    <div className="mt-3">
                      <Star className="w-10 h-10 text-amber-300 mx-auto opacity-80" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {slide.visual === 'stats' && (
              <div className="grid grid-cols-2 gap-4">
                {slide.stats?.map((stat) => (
                  <div key={stat.label} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center">
                    <div className="text-3xl font-bold text-amber-300">{stat.value}</div>
                    <div className="text-white/60 text-xs mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {slide.visual === 'quote' && (
              <div className="w-72 text-center">
                <div className="text-9xl text-white/10 select-none" style={{ fontFamily: 'Georgia, serif' }}>"</div>
                <p className="text-white/90 text-lg italic -mt-6 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                  {slide.quote}
                </p>
                <div className="mt-4 text-sm text-amber-300">{slide.quoteSource}</div>
              </div>
            )}
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex gap-3 mt-10 justify-center lg:justify-start">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === active ? 'w-8 bg-amber-400' : 'w-2 bg-white/30'}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12">
          <path d="M0 60 Q360 0 720 30 Q1080 60 1440 20 L1440 60 Z" fill="#faf6ee" />
        </svg>
      </div>
    </section>
  );
}
