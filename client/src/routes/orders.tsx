import { createRoute, Link, useNavigate } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Loader2, Package, ArrowRight, Clock } from 'lucide-react';

interface Order {
  _id: string;
  createdAt: string;
  totalPrice: number;
  isPaid: boolean;
  status: string;
}

function Orders() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="text-center py-32 space-y-4">
        <h2 className="text-3xl font-black text-white uppercase">SIGN IN TO VIEW ORDERS</h2>
        <p className="text-zinc-400 text-sm">Please log in to your athlete profile to view order history.</p>
        <button
          onClick={() => navigate({ to: '/login' })}
          className="px-6 py-3 bg-violet-600 hover:bg-violet-700 font-bold text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider text-white"
        >
          GO TO LOGIN
        </button>
      </div>
    );
  }

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const res = await api.get('/orders/myorders');
      return res.data as Order[];
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">ORDER HISTORY</h1>
        <p className="text-zinc-400 text-xs font-semibold">VIEW AND TRACK YOUR ARBEIT SPORTS SHIPMENTS</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center text-sm font-semibold">
          Failed to load orders. Please try again later.
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-6 glass-panel border border-white/5 p-8 rounded-2xl">
          <Package className="w-12 h-12 text-zinc-500" />
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-white uppercase">NO ORDERS YET</h3>
            <p className="text-zinc-400 text-xs max-w-xs">You haven't placed any orders yet. Head to the store to get started.</p>
          </div>
          <Link to="/shop" className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-xs font-black rounded-xl text-white tracking-wider uppercase">
            GO SHOPPING
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="glass-panel border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 font-extrabold uppercase tracking-wider block">ORDER ID</span>
                  <span className="text-xs font-mono bg-white/5 px-2 py-0.5 rounded text-white border border-white/5">{order._id}</span>
                </div>
                <div className="grid grid-cols-2 md:flex md:items-center gap-4 md:gap-8 text-sm font-semibold text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-zinc-500" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span>Total: </span>
                    <span className="text-white">₹{order.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Payment: </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${order.isPaid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                      {order.isPaid ? 'PAID' : 'UNPAID'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Status: </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/orders/track"
                  search={{ id: order._id }}
                  className="px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-black rounded-xl tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer"
                >
                  TRACK ORDER
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  component: Orders,
});
