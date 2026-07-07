import { createRoute, Link } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { CheckCircle, Home, LogIn } from 'lucide-react';

function LoggedOut() {
  return (
    <div className="flex justify-center items-center py-24">
      <div className="w-full max-w-md p-8 glass-panel border border-white/10 rounded-2xl shadow-2xl space-y-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase">LOGGED OUT</h2>
          <p className="text-zinc-400 text-sm font-semibold max-w-xs mx-auto">
            You have been successfully logged out of your account. Thank you for visiting Arbeit Sports.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all uppercase tracking-wider"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-all uppercase tracking-wider"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/logged-out',
  component: LoggedOut,
});
