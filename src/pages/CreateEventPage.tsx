import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, Image as ImageIcon, AlignLeft, Type, ArrowLeft, Save, Loader2, UserCircle, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { apiClient } from '../api/client';
import { sileo } from 'sileo';
import { useAuthStore } from '../store/authStore';
import { handleApiError } from '../utils/error-handler';
import { Event, EventStatus } from '../types';

interface Organizer {
  id: number;
  full_name: string;
  email: string;
}

export const CreateEventPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const isAdmin = user?.role === 'admin';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    capacity: 50,
    status: 'draft',
    image_url: '',
    organizer_id: '' as string | number
  });

  useEffect(() => {
    // Fetch organizers if admin
    if (isAdmin && !isEditMode) {
      const fetchOrganizers = async () => {
        try {
          const res = await apiClient.get('/users?role=organizer&size=100');
          setOrganizers(res.data.users);
        } catch (error) {
          console.error('Error fetching organizers:', error);
        }
      };
      fetchOrganizers();
    }
  }, [isAdmin, isEditMode]);

  useEffect(() => {
    if (isEditMode) {
      const fetchEvent = async () => {
        try {
          const res = await apiClient.get(`/events/${id}`);
          const event = res.data;
          // Format dates for datetime-local input (YYYY-MM-DDTHH:MM)
          const formatDate = (dateStr: string) => {
            const date = new Date(dateStr);
            return date.toISOString().slice(0, 16);
          };

          setFormData({
            title: event.title,
            description: event.description,
            location: event.location,
            start_date: formatDate(event.start_date),
            end_date: formatDate(event.end_date),
            capacity: event.capacity,
            status: event.status,
            image_url: event.image_url || '',
            organizer_id: event.organizer_id
          });
        } catch (error) {
          handleApiError(error, 'Error al cargar el evento');
          navigate('/dashboard');
        } finally {
          setIsFetching(false);
        }
      };
      fetchEvent();
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' || name === 'organizer_id' ? (value ? parseInt(value) : '') : value
    }));
  };

  const [isAiGenerated, setIsAiGenerated] = useState(false);

  const handleGenerateImage = async () => {
    if (!formData.title || !formData.description) {
      sileo.error({ title: 'Completa el título y descripción para generar una imagen' });
      return;
    }

    setIsGeneratingImage(true);
    try {
      const prompt = `Un póster profesional, minimalista y cinematográfico para un evento llamado "${formData.title}". Descripción del evento: ${formData.description}. Estilo de alta gama, iluminación ambiental, 4k.`;

      const res = await apiClient.post('/ai/generate-image', { prompt });
      setFormData(prev => ({ ...prev, image_url: res.data.url }));
      setIsAiGenerated(res.data.is_generated);

      if (res.data.is_generated) {
        sileo.success({
          fill: 'black',
          title: '¡Imagen de IA creada!',
          description: 'Google Imagen ha diseñado un póster único para tu evento.'
        });
      } else {
        sileo.info({
          fill: 'black',
          title: 'Usando imagen de muestra',
          description: 'No pudimos conectar con la IA de Google (revisa tu API Key), así que pusimos una imagen de calidad por ti.'
        });
      }
    } catch (error) {
      handleApiError(error, 'Error al generar la imagen');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      sileo.error({ title: 'La fecha de fin debe ser posterior a la de inicio' });
      return;
    }

    setIsLoading(true);
    try {
      const payload: Partial<Event> = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        start_date: formData.start_date.includes(':') && formData.start_date.split(':').length === 2
          ? `${formData.start_date}:00`
          : formData.start_date,
        end_date: formData.end_date.includes(':') && formData.end_date.split(':').length === 2
          ? `${formData.end_date}:00`
          : formData.end_date,
        capacity: formData.capacity,
        status: formData.status as EventStatus,
      };

      if (isAdmin && formData.organizer_id) {
        payload.organizer_id = Number(formData.organizer_id);
      }

      if (formData.image_url.trim()) {
        payload.image_url = formData.image_url;
      }

      if (isEditMode) {
        await apiClient.patch(`/events/${id}`, payload);
        sileo.success({ title: '¡Evento actualizado!' });
      } else {
        await apiClient.post('/events', payload);
        sileo.success({ title: '¡Evento creado con éxito!' });
      }
      navigate(isEditMode ? `/events/${id}` : '/dashboard');
    } catch (error) {
      handleApiError(error, 'Error al procesar el evento');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft size={18} />
        Volver
      </Button>

      <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 shadow-xl dark:shadow-2xl backdrop-blur-sm md:p-12 transition-colors">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {isEditMode ? 'Editar Evento' : 'Crear Nuevo Evento'}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {isEditMode ? 'Actualiza la información de tu evento.' : 'Completa la información para publicar tu evento en la plataforma.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Admin Organizer Selection */}
          {isAdmin && !isEditMode && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <UserCircle size={16} />
                Organizador del Evento
              </label>
              <select
                name="organizer_id"
                value={formData.organizer_id}
                onChange={handleChange}
                required
                className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 ring-offset-background transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              >
                <option value="">Selecciona un organizador...</option>
                {organizers.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.full_name} ({org.email})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">Como administrador, debes asignar este evento a un organizador responsable.</p>
            </div>
          )}

          {/* General Info Section */}
          <div className="space-y-6">
            <div className="relative">
              <Type className="absolute left-4 bottom-3 text-slate-400 dark:text-slate-500 pointer-events-none" size={18} />
              <Input
                label="Título del Evento"
                name="title"
                placeholder="Ej: Conferencia Tech 2024"
                className="pl-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                required
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <AlignLeft size={16} />
                Descripción
              </label>
              <textarea
                name="description"
                rows={4}
                required
                placeholder="Describe de qué trata el evento..."
                className="flex w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 ring-offset-background transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative">
              <MapPin className="absolute left-4 bottom-3 text-slate-400 dark:text-slate-500 pointer-events-none" size={18} />
              <Input
                label="Ubicación"
                name="location"
                placeholder="Ciudad o Link de reunión"
                className="pl-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                required
                value={formData.location}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <Users className="absolute left-4 bottom-3 text-slate-400 dark:text-slate-500 pointer-events-none" size={18} />
              <Input
                label="Capacidad Máxima"
                name="capacity"
                type="number"
                placeholder="100"
                className="pl-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                required
                value={formData.capacity}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Estado del Evento</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 ring-offset-background transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              >
                <option value="draft">Borrador (Draft)</option>
                <option value="published">Publicado (Published)</option>
              </select>
            </div>
          </div>

          {/* Dates Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative">
              <Calendar className="absolute left-4 bottom-3 text-slate-400 dark:text-slate-500 pointer-events-none" size={18} />
              <Input
                label="Fecha de Inicio"
                name="start_date"
                type="datetime-local"
                className="pl-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                required
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-4 bottom-3 text-slate-400 dark:text-slate-500 pointer-events-none" size={18} />
              <Input
                label="Fecha de Fin"
                name="end_date"
                type="datetime-local"
                className="pl-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                required
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Multimedia Section */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="relative flex-1">
                <ImageIcon className="absolute left-4 bottom-3 text-slate-400 dark:text-slate-500 pointer-events-none" size={18} />
                <Input
                  label="URL de Imagen"
                  name="image_url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="pl-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  value={formData.image_url}
                  onChange={handleChange}
                />
              </div>
              <Button
                type="button"
                onClick={handleGenerateImage}
                isLoading={isGeneratingImage}
                className="h-11 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-indigo-500/20 px-6"
              >
                {!isGeneratingImage && <Sparkles size={16} />}
                {isGeneratingImage ? 'Pintando...' : '✨ Generar con IA'}
              </Button>
            </div>

            {formData.image_url && (
              <div className="relative aspect-[16/7] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group shadow-2xl shadow-blue-500/5 min-h-[200px] flex items-center justify-center">
                {/* Cargador mientras la imagen se descarga */}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900 z-0">
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>

                <img
                  key={formData.image_url}
                  src={formData.image_url}
                  alt="Vista previa del póster"
                  className="relative z-10 h-full w-full object-cover transition-all duration-700 opacity-0 data-[loaded=true]:opacity-100"
                  onLoad={(e) => (e.currentTarget.dataset.loaded = "true")}
                  onError={(e) => {
                    const fallback = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000";
                    e.currentTarget.src = fallback;
                    setFormData(prev => ({ ...prev, image_url: fallback }));
                    setIsAiGenerated(false);
                  }}
                />
                
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent pointer-events-none" />
                
                {/* Badge Dinámico */}
                <div className={`absolute bottom-6 left-6 z-30 flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest backdrop-blur-xl px-4 py-2 rounded-full border shadow-xl transition-all duration-500 ${
                  isAiGenerated 
                    ? 'bg-blue-500/40 border-blue-400/50 shadow-blue-500/20' 
                    : 'bg-slate-800/60 border-slate-700/50'
                }`}>
                  {isAiGenerated ? (
                    <>
                      <Sparkles size={14} className="text-blue-300 animate-pulse" />
                      <span className="drop-shadow-sm text-blue-50">Póster Generado por IA</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={14} className="text-slate-400" />
                      <span className="text-slate-200">Imagen de Muestra</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full h-12 gap-2 shadow-lg shadow-blue-500/20" isLoading={isLoading}>
              <Save size={18} />
              {isEditMode ? 'Actualizar Evento' : 'Guardar y Publicar Evento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
