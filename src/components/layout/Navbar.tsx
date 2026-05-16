import { Calendar, User, LogOut, PlusCircle, LayoutDashboard, ShieldCheck, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { Button } from '../ui/Button';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <Calendar size={22} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent hidden sm:block">
              Mis Eventos
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          {isAuthenticated ? (
            <>
              {user?.role === 'admin' && (
                <Link to="/admin/users">
                  <Button variant="ghost" size="sm" className="flex gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-500">
                    <ShieldCheck size={18} />
                    <span className="hidden lg:inline">Usuarios</span>
                  </Button>
                </Link>
              )}

              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="flex gap-2 text-slate-600 dark:text-slate-300">
                  <LayoutDashboard size={18} />
                  <span className="hidden sm:inline">Mis Eventos</span>
                </Button>
              </Link>

              {(user?.role === 'admin' || user?.role === 'organizer') && (
                <Link to="/events/create">
                  <Button variant="ghost" size="sm" className="hidden md:flex gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-500">
                    <PlusCircle size={18} />
                    Crear Evento
                  </Button>
                </Link>
              )}

              <div className="hidden h-6 w-px bg-slate-200 dark:bg-slate-800 md:block" />

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden text-right md:block">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{user?.full_name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-500 font-bold">{user?.role}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  <User size={20} />
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/10">
                  <LogOut size={20} />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-1 sm:gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="shadow-none">Registrarse</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
