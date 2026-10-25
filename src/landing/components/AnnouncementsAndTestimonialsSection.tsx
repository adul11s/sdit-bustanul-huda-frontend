import { useState, useEffect } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useBulletins } from '../hooks/useBulletins';
import { format } from 'date-fns';

const ANNOUNCEMENT_BADGE_COLORS: Record<string, string> = {
  gold: 'bg-amber-100 text-amber-700',
  green: 'bg-emerald-100 text-emerald-700',
  blue: 'bg-blue-100 text-blue-700',
  red: 'bg-red-100 text-red-700',
};

const ANNOUNCEMENT_ICON_COLORS: Record<string, string> = {
  gold: '#c9973a',
  emerald: '#1a5c38',
  blue: '#3b82f6',
};

const ICON_PATHS: Record<string, string> = {
  bullhorn: 'M22 12h-4l-3 9L9 3l-3 9H2',
  trophy: 'M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 22V12M14 22V12M8 6h8M8 3h8v3H8z',
  'calendar-check': 'M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18',
};

function getCategoryColor(category: string): string {
  const c = category.toLowerCase();
  if (c.includes('ppdb') || c.includes('penerimaan') || c.includes('pendaftaran')) return 'gold';
  if (c.includes('prestasi') || c.includes('juara')) return 'green';
  if (c.includes('acara') || c.includes('kegiatan')) return 'blue';
  return 'gold';
}

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function AnnouncementsAndTestimonialsSection() {
  useScrollReveal();
  const { bulletins, loading, error } = useBulletins(6);
  const [testiCurrent, setTestiCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTestiCurrent((prev) => (prev + 1) % 3), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 px-6 bg-amber-100">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14">
        {/* Announcements — LIVE from API */}
        <div className="reveal">
          <SectionLabel>Pengumuman</SectionLabel>
          <h2 className="font-bold text-emerald-900 mb-8" style={{ fontSize: '2rem', fontFamily: 'Georgia, serif' }}>
            Berita & Info Terkini
          </h2>

          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-28" />
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-500 text-sm">{error}</div>
          )}

          {!loading && !error && bulletins.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">Belum ada pengumuman saat ini.</div>
          )}

          {!loading && !error && bulletins.length > 0 && (
            <div className="space-y-4">
              {bulletins.map((b) => {
                const color = getCategoryColor(b.category);
                const iconColor = ANNOUNCEMENT_ICON_COLORS[color] || ANNOUNCEMENT_ICON_COLORS.gold;
                return (
                  <div key={b.id} className="flex gap-4 p-5 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow group">
                    <div
                      className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center"
                      style={{ background: `${iconColor}18` }}
                    >
                      <svg className="w-6 h-6" style={{ color: iconColor }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d={ICON_PATHS.bullhorn} />
                      </svg>
                    </div>
                    <div>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${ANNOUNCEMENT_BADGE_COLORS[color]}`}>
                        {b.category}
                      </div>
                      <h4 className="font-semibold mb-1 text-emerald-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {b.title}
                      </h4>
                      <p className="text-sm text-gray-500 line-clamp-2">{b.content}</p>
                      {b.eventDate && (
                        <p className="text-xs text-gray-400 mt-1">{formatDate(b.eventDate)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Testimonials — still static */}
        <div className="reveal">
          <SectionLabel>Testimoni</SectionLabel>
          <h2 className="font-bold text-emerald-900 mb-8" style={{ fontSize: '2rem', fontFamily: 'Georgia, serif' }}>
            Kata Mereka Tentang Kami
          </h2>
          <TestimonialCarousel
                current={testiCurrent}
                onPrev={() => setTestiCurrent((p) => (p - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                onNext={() => setTestiCurrent((p) => (p + 1) % TESTIMONIALS.length)}
                onDot={setTestiCurrent}
              />
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    quote: 'Bustanul Huda bukan hanya sekolah, tapi rumah kedua. Anak saya tumbuh menjadi pribadi yang mandiri, berakhlak, dan berprestasi. Alhamdulillah pilihan terbaik!',
    name: 'Ibu Sari Dewi',
    role: 'Orang Tua Siswa Kelas XII',
    avatar: 'https://i.pravatar.cc/60?img=47',
  },
  {
    quote: 'Program tahfidz di sini luar biasa. Dalam 3 tahun anak saya hafal 7 juz sekaligus meraih nilai UN terbaik se-kota. Guru-gurunya sangat berdedikasi!',
    name: 'Bapak Rudi Hermawan',
    role: 'Orang Tua Alumni 2023',
    avatar: 'https://i.pravatar.cc/60?img=32',
  },
  {
    quote: 'Saya diterima di UI jurusan Teknik Informatika. Bekal ilmu dari Bustanul Huda — baik akademik maupun akhlaknya — sangat membantu perjalanan saya.',
    name: 'Ahmad Fauzi',
    role: 'Alumni 2024 — Mahasiswa UI',
    avatar: 'https://i.pravatar.cc/60?img=55',
  },
];

function TestimonialCarousel({ current, onPrev, onNext, onDot }: { current: number; onPrev: () => void; onNext: () => void; onDot: (i: number) => void }) {
  const t = TESTIMONIALS[current];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-800 p-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="tStars" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30 0 L33 22 L55 20 L37 33 L44 55 L30 42 L16 55 L23 33 L5 20 L27 22 Z" fill="#c9973a" fillOpacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tStars)" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="text-5xl text-amber-300/40 mb-4" style={{ fontFamily: 'Georgia, serif' }}>"</div>
        <p className="text-white/90 leading-relaxed mb-6 text-lg italic" style={{ fontFamily: 'Georgia, serif' }}>
          {t.quote}
        </p>
        <div className="flex items-center gap-4 mb-8">
          <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border-2 border-white/30" />
          <div>
            <div className="text-white font-bold">{t.name}</div>
            <div className="text-amber-300 text-sm">{t.role}</div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={onPrev}
              className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button
              onClick={onNext}
              className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
          <div className="flex gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => onDot(i)}
                className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="h-0.5 w-7 bg-amber-500" />
      <span className="text-amber-600 font-bold text-sm uppercase tracking-wider">{children}</span>
    </div>
  );
}
