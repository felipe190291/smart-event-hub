import { Calendar, MapPin, Users, Image as ImageIcon, Settings, Edit2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../types';
import { Button } from './ui/Button';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../api/client';
import { useState } from 'react';
import { sileo } from 'sileo';

import { formatEventDates } from '../utils/dateUtils';
import { handleApiError } from '../utils/error-handler';

interface EventCardProps {
  event: Event;
  onUpdate?: () => void;
}

export const EventCard = ({ event, onUpdate }: EventCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);


  const canManage = user?.role?.toLowerCase() === 'admin' || user?.id === event.organizer_id;

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await apiClient.patch(`/events/${event.id}`, { status: newStatus });
      sileo.success({ title: `Evento marcado como ${newStatus}` });
      if (onUpdate) onUpdate();
    } catch (error) {
      handleApiError(error, 'Error al actualizar el estado');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="group relative flex flex-col rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 transition-all hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-900/60 hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-none overflow-hidden"
    >

      {canManage && (
        <div className="absolute right-4 top-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            variant="secondary"
            className="h-10 w-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-lg p-0"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/events/${event.id}/edit`);
            }}
          >
            <Edit2 size={16} className="text-blue-600" />
          </Button>

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <select
              value={event.status?.toLowerCase()}
              disabled={isUpdating}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="h-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-lg px-4 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 border-none appearance-none cursor-pointer hover:bg-white transition-colors pr-8"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <Settings size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            {isUpdating && <Loader2 size={12} className="absolute -left-5 top-1/2 -translate-y-1/2 animate-spin text-blue-500" />}
          </div>
        </div>
      )}

      <div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-t-[2.5rem] bg-slate-200 dark:bg-slate-800">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              onError={(e) => { 
                e.currentTarget.onerror = null; 
                e.currentTarget.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop'; 
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon size={48} className="text-slate-400 dark:text-slate-700" />
            </div>
          )}

          {/* Badge de estado (solo si no se está editando) */}
          <div className={`absolute left-6 top-6 rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg ${event.status?.toLowerCase() === 'published' ? 'bg-emerald-600/90 text-white' :
            event.status?.toLowerCase() === 'cancelled' ? 'bg-red-600/90 text-white' :
              'bg-amber-500/90 text-white'
            }`}>
            {event.status}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-8 lg:p-10">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
            {event.title}
          </h3>
          <p className="mt-4 line-clamp-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed opacity-80">
            {event.description}
          </p>

          <div className="mt-auto pt-8 space-y-5">
            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Calendar size={14} />
                </div>
                <span>{formatEventDates(event.start_date, event.end_date)}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <MapPin size={14} />
                </div>
                <span className="truncate">{event.location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <Users size={16} className="text-slate-400" />
                <span>{event.attendee_count} / {event.capacity}</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-xl px-6 font-bold bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all duration-300"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                Ver Más
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
