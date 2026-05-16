import { Loader2 } from 'lucide-react';

export const LoadingFallback = () => (
  <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
    <div className="relative">
      <div className="h-20 w-20 rounded-full border-4 border-blue-500/10 dark:border-blue-500/5" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-500" />
      </div>
      <div className="absolute inset-0 h-20 w-20 animate-pulse rounded-full bg-blue-500/5 blur-xl" />
    </div>
  </div>
);
