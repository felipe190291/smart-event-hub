import { useState, useEffect } from 'react';
import { X, Clock, User, AlignLeft, Save, PlusCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Session } from '../types';
import { handleApiError } from '../utils/error-handler';
import { apiClient } from '../api/client';
import { sileo } from 'sileo';

interface AddSessionModalProps {
  eventId: number;
  isOpen: boolean;
  session?: Session | null; // Para modo edición
  onClose: () => void;
  onSuccess: () => void;
}

export const AddSessionModal = ({ eventId, isOpen, session, onClose, onSuccess }: AddSessionModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!session;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    speaker_name: '',
    start_time: '',
    end_time: ''
  });

  // Cargar datos si es modo edición
  useEffect(() => {
    if (session && isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: session.title,
        description: session.description,
        speaker_name: session.speaker_name,
        start_time: session.start_time.substring(0, 16), // Formato para input datetime-local
        end_time: session.end_time.substring(0, 16)
      });
    } else if (!session && isOpen) {
      setFormData({
        title: '',
        description: '',
        speaker_name: '',
        start_time: '',
        end_time: ''
      });
    }
  }, [session, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(formData.end_time) <= new Date(formData.start_time)) {
      sileo.error({ title: 'La hora de fin debe ser posterior a la de inicio' });
      return;
    }

    setIsLoading(true);
    try {
      if (isEditMode) {
        await apiClient.put(`/sessions/${session.id}`, formData);
        sileo.success({ title: 'Sesión actualizada con éxito' });
      } else {
        await apiClient.post(`/events/${eventId}/sessions`, formData);
        sileo.success({ title: 'Sesión creada con éxito' });
      }
      onSuccess();
      onClose();
      onSuccess();
      onClose();
    } catch (error) {
      handleApiError(error, 'Error al procesar la sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 z-[10] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20">
              {isEditMode ? <Save size={24} /> : <PlusCircle size={24} />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{isEditMode ? 'Editar Sesión' : 'Añadir Sesión'}</h2>
              <p className="text-slate-500 text-sm">{isEditMode ? 'Ajusta los detalles de la charla' : 'Completa la agenda de tu evento'}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-800 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Input
                label="Título de la Sesión"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Ej: Introducción a la IA"
                className="bg-slate-800 border-slate-700 text-white h-12"
              />
            </div>

            <div className="md:col-span-2">
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-slate-500">Descripción</label>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-4 text-slate-500" size={18} />
                  <textarea
                    name="description"
                    required
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-11 p-3 text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="¿De qué trata esta sesión?"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="relative">
                <User className="absolute left-4 top-11 -translate-y-1/2 text-slate-500" size={18} />
                <Input
                  label="Nombre del Expositor"
                  name="speaker_name"
                  required
                  value={formData.speaker_name}
                  onChange={handleChange}
                  placeholder="Nombre del conferencista"
                  className="pl-11 bg-slate-800 border-slate-700 text-white h-12"
                />
              </div>
            </div>

            <div className="relative">
              <Clock className="absolute left-4 top-11 -translate-y-1/2 text-slate-500" size={18} />
              <Input
                label="Hora de Inicio"
                name="start_time"
                type="datetime-local"
                required
                value={formData.start_time}
                onChange={handleChange}
                className="pl-11 bg-slate-800 border-slate-700 text-white h-12"
              />
            </div>

            <div className="relative">
              <Clock className="absolute left-4 top-11 -translate-y-1/2 text-slate-500" size={18} />
              <Input
                label="Hora de Fin"
                name="end_time"
                type="datetime-local"
                required
                value={formData.end_time}
                onChange={handleChange}
                className="pl-11 bg-slate-800 border-slate-700 text-white h-12"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 h-12 text-slate-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-2 h-12 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 font-bold"
              isLoading={isLoading}
            >
              {isEditMode ? 'Guardar Cambios' : 'Añadir a la Agenda'}
              <Save size={18} className="ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
