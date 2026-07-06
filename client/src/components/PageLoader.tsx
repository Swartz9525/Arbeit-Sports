import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-center items-center bg-[#0b0b0f]/80 backdrop-blur-md">
      <div className="glass-panel p-8 rounded-2xl flex flex-col items-center gap-4 border border-white/10 shadow-2xl">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
        <span className="text-xs font-black tracking-widest text-zinc-300 uppercase">
          LOADING ARBEIT SPORTS...
        </span>
      </div>
    </div>
  );
}
