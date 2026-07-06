import { useState, useEffect } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import api from '../services/api';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, Search, Package, MapPin, CreditCard, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';

type OrderSearch = {
  id?: string;
};

const steps = [
  { name: 'Pending', label: 'Order Placed' },
  { name: 'Confirmed', label: 'Confirmed' },
  { name: 'Packed', label: 'Packed & Ready' },
  { name: 'Shipped', label: 'In Transit' },
  { name: 'Delivered', label: 'Delivered' },
];

function OrderTrack() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState(id || '');

  // Sync search input if URL search param changes
  useEffect(() => {
    if (id) {
      setSearchId(id);
    }
  }, [id]);

  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ['trackOrder', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await api.get(`/orders/${id}`);
      return res.data;
    },
    enabled: !!id,
    retry: false,
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put(`/orders/${id}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      refetch();
      alert('Order cancelled successfully.');
    },
    onError: (err: any) => {
      alert(`Cancellation failed: ${err.response?.data?.message || err.message}`);
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    navigate({ to: '/orders/track', search: { id: searchId.trim() } });
  };

  const getStepIndex = (status: string) => {
    const idx = steps.findIndex((s) => s.name.toLowerCase() === status.toLowerCase());
    return idx !== -1 ? idx : 0;
  };

  const activeIndex = order ? getStepIndex(order.status) : 0;
  const isCancelled = order?.status === 'Cancelled';

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">TRACK SHIPMENT</h1>
        <p className="text-zinc-400 text-xs font-semibold">ENTER YOUR TRACKING ID TO GET REAL-TIME DELIVERY STATUS</p>
      </div>

      {/* Tracker Search Input */}
      <div className="glass-panel border border-white/10 p-6 rounded-2xl max-w-xl">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Enter Order / Tracking ID (e.g. 64d9f...)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:outline-none focus:border-violet-500/50 transition-all placeholder:text-zinc-600 font-semibold"
            />
          </div>
          <button
            type="submit"
            className="px-6 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs rounded-xl tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            TRACK
          </button>
        </form>
      </div>

      {/* Loading and States */}
      {id && isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      )}

      {id && error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center text-sm font-semibold max-w-xl">
          Order ID not found. Please check the ID and try again.
        </div>
      )}

      {/* Order Status Display */}
      {id && order && !isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Tracking stepper */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel border border-white/10 p-8 rounded-2xl space-y-8">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block">ORDER PLACED</span>
                  <span className="text-sm font-semibold text-white">{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block">CURRENT STATUS</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${isCancelled ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'}`}>
                      {order.status}
                    </span>
                  </div>
                  {order.status === 'Pending' && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel this order?')) {
                          cancelOrderMutation.mutate();
                        }
                      }}
                      disabled={cancelOrderMutation.isPending}
                      className="mt-1 px-3 py-1.5 bg-red-600/10 hover:bg-red-600 border border-red-500/25 text-red-400 hover:text-white text-[10px] font-black tracking-widest uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1"
                    >
                      {cancelOrderMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'CANCEL ORDER'}
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Stepper */}
              {isCancelled ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center text-sm font-bold uppercase tracking-widest">
                  This order was cancelled.
                </div>
              ) : (
                <div className="relative">
                  {/* Web Layout Stepper (Horizontal) */}
                  <div className="hidden md:flex justify-between items-center relative z-10">
                    {steps.map((step, idx) => {
                      const isCompleted = idx <= activeIndex;
                      const isCurrent = idx === activeIndex;
                      return (
                        <div key={step.name} className="flex flex-col items-center flex-1 relative">
                          {/* Connector line */}
                          {idx > 0 && (
                            <div className={`absolute right-1/2 top-5 translate-x-[-18px] w-full h-[3px] -z-10 transition-colors duration-500 ${
                              idx <= activeIndex ? 'bg-violet-500' : 'bg-white/10'
                            }`} style={{ width: 'calc(100% - 36px)', right: 'calc(50% + 18px)' }} />
                          )}
                          
                          {/* Icon Circle */}
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 font-bold text-xs transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20' 
                              : 'bg-[#0b0b0f] border-white/10 text-zinc-500'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                          </div>
                          
                          {/* Details */}
                          <span className={`text-xs font-bold uppercase mt-3 tracking-wider ${isCompleted ? 'text-white' : 'text-zinc-500'}`}>
                            {step.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 mt-0.5">{step.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mobile Layout Stepper (Vertical) */}
                  <div className="md:hidden space-y-6 relative pl-6 border-l border-white/10">
                    {steps.map((step, idx) => {
                      const isCompleted = idx <= activeIndex;
                      return (
                        <div key={step.name} className="relative">
                          {/* Bullet marker */}
                          <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 transition-all ${
                            isCompleted ? 'bg-violet-500 border-violet-400' : 'bg-[#0b0b0f] border-white/10'
                          }`} />
                          <div>
                            <h4 className={`text-sm font-bold uppercase tracking-wider ${isCompleted ? 'text-white' : 'text-zinc-500'}`}>
                              {step.name}
                            </h4>
                            <p className="text-xs text-zinc-400">{step.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Shipment Items */}
            <div className="glass-panel border border-white/10 p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-black uppercase text-white tracking-wide border-b border-white/5 pb-3">ITEMS IN SHIPMENT</h3>
              <div className="divide-y divide-white/5 space-y-3">
                {order.orderItems.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center pt-3 first:pt-0">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-900 border border-white/5 rounded-lg overflow-hidden shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase">{item.name}</h4>
                        <p className="text-xs text-zinc-500 font-semibold">QTY: {item.qty} | SIZE: {item.size || 'N/A'}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-white">₹{(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Address and summary info */}
          <div className="space-y-6">
            {/* Delivery address */}
            <div className="glass-panel border border-white/10 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <MapPin className="w-5 h-5 text-violet-400" />
                <h3 className="text-sm font-extrabold uppercase text-white tracking-wider">DELIVERY DESTINATION</h3>
              </div>
              <div className="text-sm text-zinc-400 font-semibold space-y-1">
                <p className="text-white">{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="glass-panel border border-white/10 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <CreditCard className="w-5 h-5 text-violet-400" />
                <h3 className="text-sm font-extrabold uppercase text-white tracking-wider">PAYMENT INFO</h3>
              </div>
              <div className="space-y-3 text-sm font-semibold text-zinc-400">
                <div className="flex justify-between">
                  <span>Method</span>
                  <span className="text-white uppercase">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">₹{order.itemsPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (15%)</span>
                  <span className="text-white">₹{order.taxPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-white">₹{order.shippingPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-3 border-t border-white/5">
                  <span>Total</span>
                  <span className="text-violet-400">₹{order.totalPrice?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders/track',
  validateSearch: (search: Record<string, unknown>): OrderSearch => {
    return {
      id: search.id as string | undefined,
    };
  },
  component: OrderTrack,
});
