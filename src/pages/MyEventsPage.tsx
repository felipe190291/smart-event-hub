import { useEffect, useState, useCallback } from 'react';
import { Calendar, Plus, Search, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { apiClient } from '../api/client';
import { Event } from '../types';
import { useAuthStore } from '../store/authStore';
import { handleApiError } from '../utils/error-handler';
import { EventCard } from '../components/EventCard';
import { EventCardSkeleton } from '../components/skeletons/EventCardSkeleton';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { Pagination } from '../components/ui/Pagination';

export const MyEventsPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debouncedSearch = useDebounce(search, 500);

  const fetchMyEvents = useCallback(async () => {
    if (!user) return;
    await Promise.resolve(); // Evitar advertencia de cascading render
    setIsLoading(true);
    try {
      const response = await apiClient.get('/events', {
        params: {
          organizer_id: user.id,
          query: debouncedSearch || undefined,
          page,
          size: 6
        }
      });
      setEvents(response.data.events);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      handleApiError(error, 'Error al cargar tus eventos');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMyEvents();
  }, [fetchMyEvents]);

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">Mis Eventos</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Gestiona y supervisa los eventos que has creado.</p>
        </div>
        <Button
          onClick={() => navigate('/events/create')}
          className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 gap-2 font-bold"
        >
          <Plus size={20} />
          Crear Nuevo Evento
        </Button>
      </div>

      <div className="relative max-w-lg">
        {isLoading ? (
          <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={20} />
        ) : (
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        )}
        <Input
          className="pl-12 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-sm"
          placeholder="Buscar en mis eventos..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="min-h-[40vh]">
        {isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : events.length > 0 ? (
          <>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} onUpdate={fetchMyEvents} />
              ))}
            </div>

            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
              isLoading={isLoading} 
            />
          </>
        ) : !isLoading && (
          <div className="flex h-80 flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
            <Calendar size={64} className="mb-6 text-slate-200 dark:text-slate-800" />
            <p className="text-xl font-bold text-slate-900 dark:text-white">Aún no has creado eventos</p>
            <p className="mt-2 text-slate-500">¡Empieza ahora y crea tu primera experiencia!</p>
            <Button

              className="mt-4 text-blue-600 font-bold"
              onClick={() => navigate('/events/create')}
            >
              Crear mi primer evento
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
