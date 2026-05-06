import { useScrollReveal } from '../hooks/useScrollReveal';
import { FOOTER_LINKS, SCHOOL_NAME } from '../data/school-data';

const SOCIAL = [
  { icon: 'facebook', href: '#', label: 'Facebook' },
  { icon: 'instagram', href: '#', label: 'Instagram' },
  { icon: 'youtube', href: '#', label: 'YouTube' },
  { icon: 'whatsapp', href: '#', label: 'WhatsApp' },
];

const SOCIAL_PATHS: Record<string, string> = {
  'facebook': 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z',
  'instagram': 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17 5v-.5S17 2 16 2H8S7 2 7 2.5V5S7 8 8 8h8a2 2 0 012 2v-.5S19 8 19 5V5z',
  'youtube': 'M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.33 29 29 0 00-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z',
  'whatsapp': 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z',
};

export function FooterSection() {
  useScrollReveal();

  return (
    <footer className="pt-16 pb-8 px-6 bg-emerald-900 relative overflow-hidden">
      <StarPattern />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" viewBox="0 0 40 40" fill="currentColor">
                  <ellipse cx="20" cy="22" rx="14" ry="10"/>
                  <rect x="6" y="22" width="28" height="8" rx="1"/>
                  <path d="M20 12 Q20 6 20 6 C20 6 14 12 14 17 Q17 14 20 13 Q23 14 26 17 C26 12 20 6 20 6Z"/>
                  <rect x="19" y="3" width="2" height="6" rx="1"/>
                </svg>
              </div>
              <div>
                <div className="font-bold text-white text-xl" style={{ fontFamily: 'Georgia, serif' }}>SDIT Bustanul Huda</div>
                <div className="text-xs text-amber-300">Sekolah Unggulan Berkarakter Islami</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/60 mb-6">
              Membentuk generasi penerus bangsa yang beriman, berilmu, dan berakhlak mulia sejak 1999.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              {SOCIAL.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <svg className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d={SOCIAL_PATHS[s.icon]} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-5">Tautan Cepat</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href}
                    onClick={(e) => { e.preventDefault(); document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="text-white/65 text-sm hover:text-amber-300 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact mini */}
          <div>
            <h4 className="text-white font-bold mb-5">Kontak</h4>
            <ul className="space-y-3">
              {[
                { icon: 'location-dot', text: 'Jl. Pendidikan Islam No. 17, Depok, Jawa Barat' },
                { icon: 'phone', text: '(021) 7890-1234' },
                { icon: 'envelope', text: 'info@alnusantara.sch.id' },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-2 text-sm text-white/65">
                  <svg className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={item.icon === 'location-dot' ? 'M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8zM12 13a3 3 0 100-6 3 3 0 000 6z' : item.icon === 'phone' ? 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z' : 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6'} />
                  </svg>
                  {item.text}
                </li>
              ))}
            </ul>

            {/* Bismillah ornament */}
            <div className="mt-6 p-4 rounded-xl bg-amber-400/10 border border-amber-400/20">
              <p className="text-center text-amber-300 text-base" style={{ fontFamily: 'Georgia, serif' }}>
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
              </p>
              <p className="text-xs text-center mt-1 text-white/40">Bismillahirrahmanirrahim</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
            <p>© 2025 SDIT Bustanul Huda. Hak cipta dilindungi undang-undang.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function StarPattern() {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.08 }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="footerStars" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <polygon points="40,4 52,14 52,34 40,44 28,34 28,14" fill="none" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#footerStars)"/>
      </svg>
    </div>
  );
}
