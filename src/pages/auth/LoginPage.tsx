import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { toast } from 'sonner';
import { GraduationCap, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../lib/auth-context';
import type { LoginCredentials } from '../../interfaces/auth.types';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Form submit, calling login...');

    try {
      const credentials: LoginCredentials = { email, password };
      await login(credentials);
      console.log('Login complete, navigating...');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login catch:', error);
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      {/* Left Side - Emerald Gradient */}
      <div className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white relative overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/15 p-3 rounded-2xl backdrop-blur-sm border border-white/20">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Bustanul Huda</h1>
          </div>
          <p className="text-xl text-emerald-100 max-w-lg leading-relaxed">
            Sistem Manajemen Sekolah Modern untuk Lembaga Pendidikan Islam Terdepan.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">500+</div>
              <div className="text-xs text-emerald-200">Siswa Aktif</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold">50+</div>
              <div className="text-xs text-emerald-200">Guru & Staff</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold">15+</div>
              <div className="text-xs text-emerald-200">Tahun Berdiri</div>
            </div>
          </div>
        </motion.div>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-8 relative">
        <Link
          to="/"
          className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="w-full max-w-md">
          <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-md">
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center mb-2">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Masuk ke Sistem</CardTitle>
              <CardDescription className="text-slate-500">Masukkan kredensial Anda untuk mengakses akun</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">Email</Label>
                  <Input id="email" type="email" placeholder="nama@sekolah.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-100" disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">Password</Label>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-100" disabled={isLoading} />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full h-12 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 transition-all rounded-xl shadow-lg shadow-emerald-200" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Masuk'}
                </Button>
                <p className="text-sm text-center text-slate-500">
                  Belum punya akun? Hubungi administrator.
                </p>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}