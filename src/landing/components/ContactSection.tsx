import { useState } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useInquiry } from '../hooks/useInquiry';
import { CONTACT } from '../data/school-data';

const ICON_PATHS = {
  'location-dot': 'M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8zM12 13a3 3 0 100-6 3 3 0 000 6z',
  'phone': 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z',
  'envelope': 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6',
  'clock': 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
};

const INFO_ITEMS = [
  { icon: 'location-dot', label: 'Alamat', value: CONTACT.address },
  { icon: 'phone', label: 'Telepon & WhatsApp', value: CONTACT.phone },
  { icon: 'envelope', label: 'Email', value: CONTACT.email },
  { icon: 'clock', label: 'Jam Operasional', value: CONTACT.hours.weekdays },
];

export function ContactSection() {
  useScrollReveal();
  const { submitInquiry, loading, success, error, reset } = useInquiry();
  const [form, setForm] = useState({
    parentName: '',
    studentName: '',
    phone: '',
    email: '',
    gradeInterest: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitInquiry(form);
    setForm({ parentName: '', studentName: '', phone: '', email: '', gradeInterest: '', message: '' });
  };

  if (success) {
    return (
      <section id="contact" className="py-24 px-6 bg-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 reveal">
            <SectionLabel>Hubungi Kami</SectionLabel>
            <h2 className="font-bold text-emerald-900 mb-3" style={{ fontSize: '2.25rem', fontFamily: 'Georgia, serif' }}>Siap Bergabung?</h2>
            <OrnamentDivider />
          </div>
          <div className="max-w-xl mx-auto px-4">
            <div className="p-10 rounded-2xl bg-white shadow-lg border border-amber-200 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
                </svg>
              </div>
              <h4 className="font-bold text-emerald-800 text-xl mb-2">Pendaftaran Terkirim!</h4>
              <p className="text-sm text-gray-600 mb-6">Jazakallahu khayran! Tim kami akan menghubungi Anda segera.</p>
              <button onClick={reset} className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors">
                Kirim Lagi
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <section id="contact" className="py-24 px-6 bg-amber-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14 reveal">
          <SectionLabel>Hubungi Kami</SectionLabel>
          <h2 className="font-bold text-emerald-900 mb-3" style={{ fontSize: '2.25rem', fontFamily: 'Georgia, serif' }}>Siap Bergabung?</h2>
          <OrnamentDivider />
          <p className="text-gray-600">Kami siap membantu Anda. Jangan ragu untuk menghubungi kami.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact Info */}
          <div className="lg:col-span-2 reveal space-y-4">
            {INFO_ITEMS.map((item) => (
              <div key={item.label} className="p-5 rounded-2xl bg-white shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-emerald-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d={ICON_PATHS[item.icon as keyof typeof ICON_PATHS] || ''} />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold mb-1 text-emerald-900">{item.label}</div>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form — connected to DB */}
          <div className="lg:col-span-3 reveal">
            <div className="p-8 rounded-2xl bg-white shadow-lg border border-amber-200">
              <h3 className="font-bold text-emerald-900 mb-6" style={{ fontSize: '1.5rem', fontFamily: 'Georgia, serif' }}>Kirim Pesan</h3>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <InputField label="Nama Orang Tua *" name="parentName" placeholder="Nama lengkap" value={form.parentName} onChange={handleChange} required />
                  <InputField label="Nama Siswa *" name="studentName" placeholder="Nama lengkap siswa" value={form.studentName} onChange={handleChange} required />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <InputField label="No. WhatsApp *" name="phone" type="tel" placeholder="+62 812 xxxx xxxx" value={form.phone} onChange={handleChange} required />
                  <InputField label="Email" name="email" type="email" placeholder="email@contoh.com" value={form.email} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-1.5">Keperluan *</label>
                  <select
                    name="gradeInterest"
                    required
                    value={form.gradeInterest}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm bg-white appearance-none"
                  >
                    <option value="">Pilih keperluan Anda</option>
                    <option>Informasi PPDB</option>
                    <option>Informasi Beasiswa</option>
                    <option>Tur Sekolah</option>
                    <option>Kerjasama / Mitra</option>
                    <option>Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-emerald-900 mb-1.5">Pesan</label>
                  <textarea
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tulis pesan atau pertanyaan Anda..."
                    className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-white font-bold text-base shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                      </svg>
                      Kirim Pesan
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InputField({ label, name, type = 'text', placeholder, value, onChange, required }: {
  label: string; name: string; type?: string; placeholder: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-emerald-900 mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
      />
    </div>
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
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
      </svg>
      <div className="h-px w-20 bg-gradient-to-l from-transparent to-amber-400" />
    </div>
  );
}
