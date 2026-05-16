export const EventCardSkeleton = () => (
  <div className="flex flex-col rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 overflow-hidden animate-pulse shadow-sm">
    <div className="aspect-[16/10] bg-slate-200/60 dark:bg-slate-800/60" />
    <div className="p-8 lg:p-10 space-y-6">
      <div className="space-y-3">
        <div className="h-7 w-3/4 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl" />
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/40 rounded-lg" />
      </div>
      <div className="pt-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-200/60 dark:bg-slate-800/60" />
          <div className="h-4 w-1/2 bg-slate-200/60 dark:bg-slate-800/60 rounded-lg" />
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="h-5 w-24 bg-slate-100 dark:bg-slate-800/40 rounded-lg" />
          <div className="h-10 w-28 bg-slate-200/60 dark:bg-slate-800/60 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);
