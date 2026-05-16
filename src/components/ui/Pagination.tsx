import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

/**
 * Componente de Paginación Premium
 * Maneja la navegación entre páginas con un diseño limpio y moderno.
 */
export const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  isLoading = false 
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-12 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1 || isLoading}
        onClick={() => onPageChange(currentPage - 1)}
        className="h-10 w-10 rounded-xl border-slate-200 dark:border-slate-800 p-0 text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
      >
        <ChevronLeft size={20} />
      </Button>

      <div className="flex items-center px-6 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">
          Página
        </span>
        <span className="mx-2 text-sm font-bold text-blue-600 dark:text-blue-400">
          {currentPage}
        </span>
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">
          de {totalPages}
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages || isLoading}
        onClick={() => onPageChange(currentPage + 1)}
        className="h-10 w-10 rounded-xl border-slate-200 dark:border-slate-800 p-0 text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
      >
        <ChevronRight size={20} />
      </Button>
    </div>
  );
};
