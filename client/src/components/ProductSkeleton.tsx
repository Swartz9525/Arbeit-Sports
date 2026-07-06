export default function ProductSkeleton() {
  return (
    <div className="flex flex-col h-full rounded-2xl glass-panel border border-white/5 overflow-hidden animate-pulse">
      {/* Image box skeleton */}
      <div className="relative aspect-square w-full bg-zinc-800" />

      {/* Details skeleton */}
      <div className="p-5 flex flex-col justify-between flex-grow gap-4">
        <div className="space-y-2">
          <div className="h-2 bg-zinc-800 rounded w-1/4" />
          <div className="h-4 bg-zinc-800 rounded w-3/4" />
          <div className="h-3 bg-zinc-800 rounded w-1/2" />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-white/5">
          <div className="h-4 bg-zinc-800 rounded w-1/3" />
          <div className="h-3 bg-zinc-800 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}
