import { useState } from 'react';
import { createRoute, Link, useNavigate } from '@tanstack/react-router';
import { Route as rootRoute } from '../__root';
import { useDispatch } from 'react-redux';
import { loginSuccess, logoutSuccess } from '../../features/auth/store/authSlice';
import api from '../../services/api';
import { Mail, Lock, Loader2, ArrowRight, ShieldAlert } from 'lucide-react';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('All fields are required');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/auth/login', { email, password });
      const user = res.data;

      if (user.role !== 'admin') {
        setErrorMsg('Access denied. This portal is strictly for administrators.');
        // Logout immediately to clear any partial session cookies/state
        await api.post('/auth/logout').catch(() => {});
        dispatch(logoutSuccess());
        return;
      }

      dispatch(loginSuccess(user));
      navigate({ to: '/admin/dashboard' });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-16">
      <div className="w-full max-w-md p-8 glass-panel border border-violet-500/20 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-2xl mb-2">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
            ADMIN PORTAL
          </h2>
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">SECURE ADMINISTRATOR SIGN IN</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">ADMIN EMAIL</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                placeholder="admin@arbeitsports.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-zinc-600"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-zinc-600"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 tracking-widest uppercase transition-all shadow-lg shadow-violet-500/10 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                AUTHORIZE LOGIN
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500 font-semibold pt-2 border-t border-white/5">
          Regular athlete?{' '}
          <Link to="/login" className="text-violet-400 hover:underline">
            Go to athlete sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/login',
  component: AdminLogin,
});
