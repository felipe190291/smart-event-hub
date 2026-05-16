import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { handleApiError } from '../utils/error-handler';
import { sileo } from 'sileo';

export const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { access_token, refresh_token } = response.data;

      // Get user profile after login
      const userResponse = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      setAuth(userResponse.data, access_token, refresh_token);
      sileo.success({ title: '¡Bienvenido de nuevo!' });
      navigate('/');
    } catch (error) {
      handleApiError(error, 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-12 max-w-md w-full">
      <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 shadow-xl dark:shadow-2xl backdrop-blur-sm md:p-12 transition-colors">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20">
            <LogIn size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Iniciar Sesión</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Accede a tu cuenta de Mis Eventos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-11 -translate-y-1/2 text-slate-500" size={18} />
              <Input
                label="Correo Electrónico"
                placeholder="tu@correo.com"
                className="pl-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-11 -translate-y-1/2 text-slate-500" size={18} />
              <Input
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                className="pl-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 shadow-lg shadow-blue-500/20" isLoading={isLoading}>
            Entrar
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </form>

        <div className="mt-10 border-t border-slate-100 dark:border-slate-800 pt-8">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Regístrate aquí
            </Link>
          </p>
          
          <div className="mt-6">
            <Link to="/register?role=organizer">
              <Button 
                variant="outline" 
                className="w-full border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 h-12 rounded-2xl gap-3 text-xs font-black uppercase tracking-widest"
              >
                ¿Quieres organizar eventos?
                <span className="bg-blue-600 text-white px-2 py-1 rounded-lg text-[10px]">Afíliate</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
