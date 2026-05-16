import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowLeft, Clock, User as UserIcon, CheckCircle2, Loader2, PlusCircle, Image as ImageIcon, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { apiClient } from '../api/client';
import { Event, Session } from '../types';
import { useAuthStore } from '../store/authStore';
import { sileo } from 'sileo';
import { AddSessionModal } from '../components/AddSessionModal';
import { handleApiError } from '../utils/error-handler';

import { formatEventDates } from '../utils/dateUtils';

export const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [event, setEvent] = useState<Event | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  const fetchData = useCallback(async () => {
    await Promise.resolve(); // Mover a microtarea para evitar advertencia de cascading render sincrónico
    setIsLoading(true);
    try {
      const [eventRes, sessionsRes] = await Promise.all([
        apiClient.get(`/events/${id}`),
        apiClient.get(`/events/${id}/sessions`)
      ]);
      setEvent(eventRes.data);
      setSessions(sessionsRes.data);

      if (isAuthenticated) {
        const myEventsRes = await apiClient.get('/users/me/events');
        const registered = myEventsRes.data.some((e: Event) => e.id === parseInt(id!));
        setIsUserRegistered(registered);
      }
    } catch (error) {
      handleApiError(error, 'Error al cargar el evento');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  }, [id, isAuthenticated, navigate]);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      await apiClient.patch(`/events/${id}`, { status: newStatus });
      sileo.success({ title: `Evento marcado como ${newStatus}` });
      fetchData(); // Recargar datos frescos
    } catch (error) {
      handleApiError(error, 'Error al actualizar el estado');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddSessionSuccess = () => {
    fetchData();
    setEditingSession(null);
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setIsModalOpen(true);
  };

  const handleDeleteSession = async (sessionId: number) => {
    sileo.action({
      title: '¿Eliminar sesión?',
      description: 'Esta acción no se puede deshacer y la sesión se borrará permanentemente de la agenda.',

      fill: "black",
      button: {
        title: 'Eliminar Sesión',
        onClick: async () => {
          try {
            await apiClient.delete(`/sessions/${sessionId}`);
            sileo.success({ title: 'Sesión eliminada' });
            fetchData();
          } catch (error) {
            handleApiError(error, 'Error al eliminar la sesión');
          }
        }
      }
    });
  };


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleRegistration = async () => {
    if (!isAuthenticated) {
      sileo.error({ title: 'Debes iniciar sesión para inscribirte' });
      navigate('/login');
      return;
    }

    setIsRegistering(true);
    try {
      if (isUserRegistered) {
        await apiClient.delete(`/events/${id}/unregister`);
        sileo.success({ title: 'Inscripción cancelada' });
        setIsUserRegistered(false);
      } else {
        await apiClient.post(`/events/${id}/register`);
        sileo.success({ title: '¡Inscripción exitosa!' });
        setIsUserRegistered(true);
      }
      const eventRes = await apiClient.get(`/events/${id}`);
      setEvent(eventRes.data);
    } catch (error) {
      handleApiError(error, 'Error en la inscripción');
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!event) return null;

  // Permisos: Admin o el creador del evento
  const canManage = user?.role?.toLowerCase() === 'admin' || user?.id === event.organizer_id;

  return (
    <div className="mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <AddSessionModal
        eventId={event.id}
        isOpen={isModalOpen}
        session={editingSession}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSession(null);
        }}
        onSuccess={handleAddSessionSuccess}
      />

      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft size={18} />
        Volver
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl">
            <div className="aspect-video relative bg-slate-100 dark:bg-slate-800">
              {event.image_url ? (
                <img 
                  src={event.image_url} 
                  alt={event.title} 
                  className="h-full w-full object-cover" 
                  onError={(e) => { 
                    e.currentTarget.onerror = null; 
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop'; 
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon size={64} className="text-slate-300 dark:text-slate-700" />
                </div>
              )}
              <div className="absolute top-6 right-6 flex items-center gap-3">
                {canManage && (
                  <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl border border-white/20">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-4 text-[10px] uppercase tracking-widest font-black hover:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      onClick={() => navigate(`/events/${id}/edit`)}
                    >
                      Editar Detalles
                    </Button>
                    <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />
                    <div className="relative">
                      <select
                        value={event.status?.toLowerCase()}
                        disabled={isUpdatingStatus}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="h-9 bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 pr-8 pl-3 cursor-pointer focus:ring-0 appearance-none"
                      >
                        <option value="draft">Borrador</option>
                        <option value="published">Publicado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                      <Clock size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                )}
                {!canManage && (
                  <span className={`rounded-full px-5 py-2 text-[10px] font-black text-white backdrop-blur-md shadow-lg uppercase tracking-widest ${event.status?.toLowerCase() === 'published' ? 'bg-emerald-600/90 shadow-emerald-500/20' :
                    event.status?.toLowerCase() === 'cancelled' ? 'bg-red-600/90 shadow-red-500/20' :
                      'bg-amber-500/90 shadow-amber-500/20'
                    }`}>
                    {event.status}
                  </span>
                )}
                {isUpdatingStatus && <Loader2 size={16} className="animate-spin text-white drop-shadow-md" />}
              </div>
            </div>

            <div className="p-8 md:p-12">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                {event.title}
              </h1>

              <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700/50">
                  <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
                  <span>{formatEventDates(event.start_date, event.end_date)}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700/50">
                  <MapPin size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="max-w-[150px] truncate">{event.location}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700/50">
                  <Users size={18} className="text-purple-600 dark:text-purple-400" />
                  <span>{event.attendee_count} / {event.capacity} asistentes</span>
                </div>
              </div>

              <div className="mt-12">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Acerca de este evento</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap text-lg">
                  {event.description}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Clock className="text-blue-600 dark:text-blue-500" />
                Agenda del Evento
              </h2>
              {canManage && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
                  onClick={() => setIsModalOpen(true)}
                >
                  <PlusCircle size={18} />
                  Añadir Sesión
                </Button>
              )}
            </div>

            {sessions.length > 0 ? (
              <div className="space-y-6">
                {sessions.map((session) => (
                  <div key={session.id} className="group relative flex gap-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 transition-all hover:border-blue-500/30 hover:shadow-xl dark:hover:shadow-none">
                    <div className="flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800 pr-6 min-w-[80px]">
                      <span className="text-sm font-black text-blue-600 dark:text-blue-500 uppercase tracking-tighter">
                        {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </span>
                      <div className="my-2 h-8 w-px bg-slate-100 dark:bg-slate-800" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Inicio</span>
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {session.title}
                        </h3>

                        {(user?.role === 'admin' || user?.id === event.organizer_id) && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSession(session)}
                              className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSession(session.id)}
                              className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{session.description}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1">
                          <UserIcon size={14} className="text-slate-400 dark:text-slate-500" />
                          <span className="font-medium text-slate-700 dark:text-slate-300">{session.speaker_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 py-20">
                <Clock size={48} className="mb-4 text-slate-200 dark:text-slate-800" />
                <p className="text-lg font-medium text-slate-400">Aún no hay sesiones programadas</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="sticky top-24 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-8 backdrop-blur-xl shadow-xl dark:shadow-2xl transition-colors">
            <div className="mb-6">
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Registro</p>
              <div className="mt-3 flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full animate-pulse ${event.attendee_count >= event.capacity ? 'bg-red-500' : 'bg-emerald-500'}`} />
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  {event.attendee_count >= event.capacity ? 'Agotado' : 'Disponible'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Total lugares</span>
                <span className="text-slate-900 dark:text-white font-bold">{event.capacity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Inscritos</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{event.attendee_count}</span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2 border border-slate-200 dark:border-slate-700/50">
                <div
                  className="bg-gradient-to-r from-blue-600 to-blue-400 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  style={{ width: `${Math.min((event.attendee_count / event.capacity) * 100, 100)}%` }}
                />
              </div>
            </div>

            <Button
              className={`mt-8 w-full h-14 text-lg gap-2 shadow-xl ${isUserRegistered
                ? 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-500/20'
                : 'shadow-blue-500/20'
                }`}
              variant={isUserRegistered ? 'outline' : 'primary'}
              isLoading={isRegistering}
              onClick={handleRegistration}
              disabled={!isUserRegistered && event.attendee_count >= event.capacity}
            >
              {isUserRegistered ? (
                <>Cancelar Registro</>
              ) : event.attendee_count >= event.capacity ? (
                <>Sin Lugares</>
              ) : (
                <>Inscribirme Gratis</>
              )}
            </Button>

            {isUserRegistered && (
              <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 py-3 px-4 border border-emerald-200 dark:border-emerald-500/20">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-500" />
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
                  Confirmado
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
