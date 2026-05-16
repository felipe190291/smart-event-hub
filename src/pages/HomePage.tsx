import { useEffect, useState, useCallback } from 'react';
import { Calendar, Search } from 'lucide-react'
import { Input } from '../components/ui/Input';
import { apiClient } from '../api/client';
import { Event } from '../types';
import { handleApiError } from '../utils/error-handler';
import { EventCard } from '../components/EventCard';
import { EventCardSkeleton } from '../components/skeletons/EventCardSkeleton';
import { useDebounce } from '../hooks/useDebounce';
import { Pagination } from '../components/ui/Pagination';



export const HomePage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debouncedSearch = useDebounce(search, 500);

  const fetchEvents = useCallback(async () => {
    await Promise.resolve(); // Evitar advertencia de cascading render
    setIsLoading(true);
    try {
      const response = await apiClient.get('/events', {
        params: {
          query: debouncedSearch || undefined,
          page,
          limit: 6
        }
      });
      setEvents(response.data.events);
      const totalPagesServer = response.data.pages;
      const totalItems = response.data.total || response.data.events.length;
      setTotalPages(totalPagesServer || Math.ceil(totalItems / 6) || 1);
    } catch (error) {
      handleApiError(error, 'Error al cargar eventos');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="space-y-12 pb-20">
      {/* Search & Filters */}
      <section className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-lg">
          <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isLoading ? 'text-blue-500' : 'text-slate-400'}`} size={22} />
          <Input
            className="pl-14 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-lg rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all text-lg"
            placeholder="¿Qué evento estás buscando?"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </section>

      {/* Events Grid */}
      <section className="min-h-[60vh]">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Explorar Eventos</h2>
          {!isLoading && (
            <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest animate-in fade-in">
              {events.length} Resultados
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : events.length > 0 ? (
          <>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {events.map((event) => (
                <EventCard key={event.id} event={event} onUpdate={fetchEvents} />
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              isLoading={isLoading}
            />
          </>
        ) : (
          <div className="flex h-80 flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/10 animate-in zoom-in-95 duration-500">
            <Calendar size={64} className="mb-6 opacity-10" />
            <p className="text-2xl font-bold">No se encontraron eventos</p>
            <p className="mt-2 text-slate-500/60 font-medium">Intenta ajustar los filtros o la búsqueda</p>
          </div>
        )}
      </section>
    </div>
  );
};
