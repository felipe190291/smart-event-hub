import { useState, useEffect } from 'react';

/**
 * Hook para retrasar la actualización de un valor.
 * Útil para evitar múltiples llamadas a una API durante búsquedas.
 * 
 * @param value El valor a debouncear
 * @param delay Tiempo de espera en milisegundos (default 500ms)
 * @returns El valor actualizado después del delay
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Establecer un temporizador para actualizar el valor después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el temporizador si el valor cambia antes de que pase el tiempo
    // o si el componente se desmonta
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
