import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, ArrowRight, Briefcase } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { apiClient } from '../api/client';
import { handleApiError } from '../utils/error-handler';
import { sileo } from 'sileo';

export const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Detectar si el registro es para un rol específico (ej: organizer)
  const searchParams = new URLSearchParams(location.search);
  const requestedRole = searchParams.get('role') || 'attendee';
  const isOrganizerFlow = requestedRole === 'organizer';

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      sileo.error({ title: 'La contraseña debe tener al menos 6 caracteres', });
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/register', {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: requestedRole // Enviamos el rol detectado
      });
      sileo.success({
        fill: "black",
        title: isOrganizerFlow ? '¡Cuenta de Organizador creada!' : '¡Cuenta creada con éxito!',
        description: isOrganizerFlow ? 'Ahora puedes empezar a crear tus propios eventos.' : 'Ya puedes inscribirte a eventos.'

      });
      navigate('/login');
    } catch (error) {
      handleApiError(error, 'Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="mx-auto mt-8 max-w-md w-full px-4 pb-12">
      <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 shadow-xl dark:shadow-2xl backdrop-blur-sm md:p-12 transition-colors">
        <div className="mb-8 text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-xl transition-colors duration-500 ${isOrganizerFlow ? 'bg-blue-600 shadow-blue-500/20' : 'bg-emerald-600 shadow-emerald-500/20'
            }`}>
            {isOrganizerFlow ? <Briefcase size={32} /> : <UserPlus size={32} />}
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            {isOrganizerFlow ? 'Registro de Organizador' : 'Crear Cuenta'}
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {isOrganizerFlow ? 'Empieza a crear y gestionar tus propios eventos' : 'Únete a la comunidad de Mis Eventos'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-11 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <Input
                label="Nombre Completo"
                name="full_name"
                placeholder={isOrganizerFlow ? "Nombre o Empresa" : "Juan Pérez"}
                className="pl-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                required
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-11 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <Input
                label="Correo Electrónico"
                name="email"
                placeholder="tu@correo.com"
                className="pl-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                required
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-11 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <Input
                label="Contraseña"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                className="pl-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="secondary"
            className={`w-full h-12 shadow-lg transition-all duration-500 ${isOrganizerFlow ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
              }`}
            isLoading={isLoading}
          >
            {isOrganizerFlow ? 'Afiliarse como Organizador' : 'Crear Cuenta'}
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};
