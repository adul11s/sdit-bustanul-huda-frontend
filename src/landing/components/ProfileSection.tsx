import { Target, Eye, BookOpen } from 'lucide-react';
import { SCHOOL_DESCRIPTION, VISION, MISSION } from '../data/school-data';

export function ProfileSection() {
  return (
    <section id="profile" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Tentang Kami</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3">Profil Sekolah</h2>
          <div className="w-16 h-1 bg-emerald-500 mx-auto mt-4 rounded-full" />
        </div>

        {/* About */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-lg text-slate-600 leading-relaxed">{SCHOOL_DESCRIPTION}</p>
        </div>

        {/* Vision & Mission Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Vision */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mb-6">
              <Eye className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Visi</h3>
            <p className="text-slate-600 leading-relaxed">{VISION}</p>
          </div>

          {/* Mission */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mb-6">
              <Target className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">Misi</h3>
            <ul className="space-y-3">
              {MISSION.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-600">
                  <BookOpen className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="leading-relaxed text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
