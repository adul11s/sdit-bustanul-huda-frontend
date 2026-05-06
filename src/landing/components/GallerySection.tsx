import { useScrollReveal } from '../hooks/useScrollReveal';
import { GALLERY_IMAGES } from '../data/school-data';

export function GallerySection() {
  useScrollReveal();

  return (
    <section id="gallery" className="py-24 px-6 bg-amber-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14 reveal">
          <SectionLabel>Galeri Sekolah</SectionLabel>
          <h2 className="font-bold text-emerald-900 mb-3" style={{ fontSize: '2.25rem', fontFamily: 'Georgia, serif' }}>
            Momen Berharga Kami
          </h2>
          <OrnamentDivider />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {GALLERY_IMAGES.map((img, i) => (
            <div
              key={i}
              className={`reveal ${img.span} relative overflow-hidden rounded-2xl cursor-pointer group`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                <span className="text-white font-semibold text-sm">{img.alt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
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
