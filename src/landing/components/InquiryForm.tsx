import type { FormEvent, ChangeEvent } from 'react';
import { useState } from 'react';
import { Send, CheckCircle, Loader2, Phone, Mail, User, BookOpen, MessageSquare } from 'lucide-react';
import { useInquiry } from '../hooks/useInquiry';

const GRADE_OPTIONS = [
  'TK A',
  'TK B',
  'Kelas 1',
  'Kelas 2',
  'Kelas 3',
  'Kelas 4',
  'Kelas 5',
  'Kelas 6',
  'Kelas 7 (SMP)',
  'Kelas 8 (SMP)',
  'Kelas 9 (SMP)',
];

export function InquiryForm() {
  const { submitInquiry, loading, success, error, reset } = useInquiry();
  const [form, setForm] = useState({
    parentName: '',
    studentName: '',
    phone: '',
    email: '',
    gradeInterest: '',
    message: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await submitInquiry(form);
    setForm({ parentName: '', studentName: '', phone: '', email: '', gradeInterest: '', message: '' });
  };

  if (success) {
    return (
      <section id="inquiry" className="py-24 bg-emerald-50">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-10 shadow-sm border border-emerald-100">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Pendaftaran Terkirim!</h3>
            <p className="text-slate-600 mb-6">
              Terima kasih atas minat Anda. Tim kami akan menghubungi Anda dalam waktu 1-2 hari kerja.
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
            >
              Kirim Lagi
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="inquiry" className="py-24 bg-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Info */}
          <div>
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wider">Pendaftaran</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-6">Daftar Sekarang</h2>
            <div className="w-16 h-1 bg-emerald-500 rounded-full mb-6" />
            <p className="text-slate-600 leading-relaxed mb-8">
              Isi formulir di samping untuk mendaftarkan putra/putri Anda di Nurul Islam. Tim admissions kami akan segera menghubungi Anda untuk proses selanjutnya.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Telepon / WhatsApp</p>
                  <p className="font-semibold text-slate-900">+62 812-3456-7890</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-semibold text-slate-900">info@nurulislam.sch.id</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nama Orang Tua <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="parentName"
                      required
                      value={form.parentName}
                      onChange={handleChange}
                      placeholder="Nama lengkap"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nama Siswa <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="studentName"
                      required
                      value={form.studentName}
                      onChange={handleChange}
                      placeholder="Nama lengkap siswa"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="0812-3456-7890"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="email@contoh.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Kelas yang Diminati <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    name="gradeInterest"
                    required
                    value={form.gradeInterest}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm bg-white appearance-none"
                  >
                    <option value="">Pilih kelas</option>
                    {GRADE_OPTIONS.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Pesan / Pertanyaan</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tulis pesan atau pertanyaan Anda..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm resize-none"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Kirim Pendaftaran
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
