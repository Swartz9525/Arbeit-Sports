import { Link } from '@tanstack/react-router';
import { ShieldAlert } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center">
      <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20 text-red-500">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-white uppercase tracking-tight">PAGE NOT FOUND</h1>
        <p className="text-zinc-400 text-sm max-w-sm mx-auto">
          The tactical athletic coordinates you are looking for do not exist or have been moved.
        </p>
      </div>
      <Link to="/" className="px-6 py-3 btn-neon font-black text-xs rounded-xl tracking-widest uppercase">
        RETURN TO FIELD
      </Link>
    </div>
  );
}
