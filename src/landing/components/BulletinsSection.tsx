import { Calendar, Newspaper } from 'lucide-react';
import { useBulletins } from '../hooks/useBulletins';
import { format } from 'date-fns';

export function BulletinsSection() {
  const { bulletins, loading, error } = useBulletins(6);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <section id="bulletins" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Informasi Terbaru</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3">Pengumuman</h2>
          <div className="w-16 h-1 bg-emerald-500 mx-auto mt-4 rounded-full" />
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
            Ikuti perkembangan terbaru seputar kegiatan dan informasi penting sekolah.
          </p>
        </div>

        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6 animate-pulse h-48" />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">Gagal memuat pengumuman. Silakan coba lagi nanti.</p>
          </div>
        )}

        {!loading && !error && bulletins.length === 0 && (
          <div className="text-center py-12">
            <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Belum ada pengumuman saat ini.</p>
          </div>
        )}

        {!loading && !error && bulletins.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bulletins.map((bulletin) => (
              <article
                key={bulletin.id}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium mb-3">
                  <span className="px-2 py-1 bg-emerald-100 rounded-md uppercase tracking-wide">
                    {bulletin.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                  {bulletin.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {bulletin.content}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(bulletin.createdAt)}</span>
                  </div>
                  {bulletin.author && (
                    <span className="text-xs text-slate-400">{bulletin.author.name}</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
