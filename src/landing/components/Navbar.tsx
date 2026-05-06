import type { MouseEvent } from 'react';
import { useState, useEffect } from 'react';
import { Menu, X, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Beranda', href: '#home' },
  { label: 'Tentang', href: '#about' },
  { label: 'Program', href: '#programs' },
  { label: 'Galeri', href: '#gallery' },
  { label: 'Kontak', href: '#contact' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('#home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = NAV_LINKS.map((l) => l.href.replace('#', ''));
      let current = '#home';
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          current = `#${id}`;
        }
      });
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => handleClick(e, '#home')}
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 40 40" className="w-6 h-6" fill="white">
                <ellipse cx="20" cy="22" rx="14" ry="10" />
                <rect x="6" y="22" width="28" height="8" rx="1" />
                <path d="M20 12 Q20 6 20 6 C20 6 14 12 14 17 Q17 14 20 13 Q23 14 26 17 C26 12 20 6 20 6Z" />
                <rect x="19" y="3" width="2" height="6" rx="1" />
              </svg>
            </div>
            <div>
              <div className={`font-bold text-base leading-tight ${isScrolled ? 'text-emerald-900' : 'text-white'}`} style={{ fontFamily: 'Georgia, serif' }}>
                Bustanul Huda
              </div>
              <div className={`text-xs leading-none ${isScrolled ? 'text-amber-600' : 'text-amber-300'}`}>
                SMA Islam Unggulan
              </div>
            </div>
          </a>

          {/* Desktop Nav — centered links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleClick(e, link.href)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? isScrolled ? 'text-emerald-700 bg-emerald-50' : 'text-amber-300 bg-white/10'
                      : isScrolled
                        ? 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500" />
                  )}
                </a>
              );
            })}
          </div>

          {/* Login CTA */}
          <div className="hidden md:block">
            <Link
              to="/login"
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isScrolled
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md'
                  : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm border border-white/20'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Masuk
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-md"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-slate-800' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-slate-800' : 'text-white'}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleClick(e, link.href)}
                  className={`block px-4 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                    isActive
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-base font-semibold"
            >
              <LogIn className="w-4 h-4" />
              Masuk
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
