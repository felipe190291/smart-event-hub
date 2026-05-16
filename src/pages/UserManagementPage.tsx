import { useEffect, useState, useCallback } from 'react';
import { Shield, Loader2, Search, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { User } from '../types';
import { handleApiError } from '../utils/error-handler';
import { sileo } from 'sileo';
import { useDebounce } from '../hooks/useDebounce';

import { Pagination } from '../components/ui/Pagination';

export const UserManagementPage = () => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search, 500);

  const fetchUsers = useCallback(async () => {
    await Promise.resolve(); // Evitar advertencia de cascading render
    setIsLoading(true);
    try {
      const response = await apiClient.get('/users', {
        params: {
          query: debouncedSearch || undefined,
          role: role || undefined,
          page,
          size: 10
        }
      });

      if (response.data && response.data.users) {
        setUsers(response.data.users);
        setTotalPages(response.data.pages || 1);
      } else if (Array.isArray(response.data)) {
        setUsers(response.data);
        setTotalPages(1);
      }
    } catch (error) {
      handleApiError(error, 'No tienes permisos de administrador');
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, role]);

  const updateRole = async (userId: number, newRole: string) => {
    setUpdatingId(userId);
    try {
      await apiClient.patch(`/users/${userId}/role`, { role: newRole });
      sileo.success({ title: 'Rol actualizado con éxito' });
      fetchUsers();
    } catch (error) {
      handleApiError(error, 'Error al actualizar el rol');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = (userId: number, userName: string) => {
    sileo.action({
      title: "¿Eliminar usuario?",
      fill: 'black',
      description: `¿Estás seguro de que deseas eliminar a "${userName}"? Esta acción es irreversible y eliminará todos sus datos asociados.`,
      button: {
        title: "Eliminar Usuario",
        onClick: async () => {
          setUpdatingId(userId);
          try {
            await apiClient.delete(`/users/${userId}`);
            sileo.success({ title: 'Usuario eliminado correctamente' });
            fetchUsers();
          } catch (error) {
            handleApiError(error, 'Error al eliminar el usuario');
          } finally {
            setUpdatingId(null);
          }
        },
      },
    });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  const displayUsers = users;

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-4">
          <Shield className="text-blue-600 dark:text-blue-500" size={36} />
          Administración de Usuarios
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Gestiona los permisos y roles de la plataforma.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <Input
            className="pl-11 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset page on search
            }}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Filtrar por:</span>
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 text-sm font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer min-w-[150px]"
          >
            <option value="">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="organizer">Organizadores</option>
            <option value="attendee">Asistentes</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-xl backdrop-blur-sm transition-colors">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Usuario</th>
              <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Email</th>
              <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400">Rol Actual</th>
              <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-500" />
                </td>
              </tr>
            ) : displayUsers.map((user) => (
              <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-blue-500/5 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                      {user.full_name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{user.full_name}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-slate-500 dark:text-slate-400 text-sm font-mono">{user.email}</td>
                <td className="px-8 py-6">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${user.role.toLowerCase() === 'admin' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400' :
                    user.role.toLowerCase() === 'organizer' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2 items-center">
                    <div className="relative">
                      <select
                        value={user.role.toLowerCase()}
                        disabled={updatingId === user.id || currentUser?.id === user.id}
                        onChange={(e) => updateRole(user.id, e.target.value)}
                        className="h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors outline-none appearance-none pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="admin">Administrador</option>
                        <option value="organizer">Organizador</option>
                        <option value="attendee">Asistente</option>
                      </select>
                      <Shield size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {currentUser?.id !== user.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full h-8 w-8 p-0"
                        onClick={() => handleDelete(user.id, user.full_name)}
                        disabled={updatingId === user.id}
                        title="Eliminar Usuario"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}

                    {updatingId === user.id && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isLoading && displayUsers.length === 0 && (
          <div className="py-20 text-center text-slate-500">
            No se encontraron usuarios.
          </div>
        )}
      </div>

      <Pagination 
        currentPage={page} 
        totalPages={totalPages} 
        onPageChange={setPage} 
        isLoading={isLoading} 
      />
    </div>
  );
};
