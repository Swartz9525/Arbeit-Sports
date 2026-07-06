import { useState } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { Route as rootRoute } from '../__root';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { 
  LayoutDashboard, 
  Plus, 
  Trash2, 
  Loader2, 
  Coins, 
  TrendingUp, 
  AlertTriangle, 
  Download, 
  Users,
  Upload,
  X
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  stock: number;
}

interface Order {
  _id: string;
  user: {
    name: string;
  };
  totalPrice: number;
  isPaid: boolean;
  status: string;
}

function AdminDashboard() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Footwear');
  const [newProductBrand, setNewProductBrand] = useState('Arbeit');
  const [newProductStock, setNewProductStock] = useState('20');
  const [newProductImage, setNewProductImage] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Verify Role
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="text-center py-40 space-y-4">
        <h2 className="text-3xl font-black text-red-500 uppercase">ACCESS DENIED</h2>
        <p className="text-zinc-400 text-sm">You must be logged in as an administrator to view this page.</p>
        <button
          onClick={() => navigate({ to: '/admin/login' })}
          className="px-6 py-2.5 bg-violet-600 font-bold text-xs rounded-xl"
        >
          GO TO LOGIN
        </button>
      </div>
    );
  }

  // Fetch all products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: async () => {
      const res = await api.get('/products?limit=100');
      return res.data.products;
    },
  });

  // Fetch all orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data;
    },
  });

  // Fetch all users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data;
    },
  });

  // Product mutation handlers
  const createProductMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post('/products', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      // Reset inputs
      setNewProductName('');
      setNewProductPrice('');
      setNewProductDesc('');
      setNewProductImage('');
      alert('Product created successfully');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      alert('Product deleted successfully');
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api.put(`/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      alert('Order status updated successfully');
    },
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice || !newProductDesc) {
      alert('Please fill out the product form');
      return;
    }
    if (!newProductImage) {
      alert('Please upload a product image first.');
      return;
    }

    createProductMutation.mutate({
      name: newProductName,
      price: Number(newProductPrice),
      description: newProductDesc,
      category: newProductCategory,
      brand: newProductBrand,
      stock: Number(newProductStock),
      images: [newProductImage],
      sizes: ['8', '9', '10'],
      colors: ['Black', 'Blue'],
      threeDModelUrl: newProductCategory === 'Footwear' ? 'ApexRunner' : '',
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setIsUploadingImage(true);
    setUploadError('');

    try {
      const res = await api.post('/products/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewProductImage(res.data.imageUrl);
    } catch (err: any) {
      setUploadError(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Export Product Inventory to CSV
  const exportToCSV = () => {
    if (!productsData || productsData.length === 0) {
      alert('No product data available to export.');
      return;
    }
    const headers = ['Product ID', 'Name', 'Category', 'Brand', 'Price', 'Stock'];
    const rows = productsData.map((p: any) => [
      p._id,
      `"${p.name}"`,
      p.category,
      p.brand,
      p.price,
      p.stock
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Arbeit_Sports_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations
  const totalRevenue = ordersData?.reduce((acc: number, o: any) => o.isPaid ? acc + o.totalPrice : acc, 0) || 0;
  const totalSalesCount = ordersData?.length || 0;
  const lowStockCount = productsData?.filter((p: any) => p.stock < 5).length || 0;

  // Analytics and Charts Calculations
  // 1. Last 7 Days Revenue Trend
  const getLast7DaysRevenue = () => {
    const trendData: { dateLabel: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const dateKey = d.toDateString();
      
      const dayRevenue = ordersData?.reduce((acc: number, o: any) => {
        const orderDate = new Date(o.createdAt).toDateString();
        return (orderDate === dateKey && o.isPaid) ? acc + o.totalPrice : acc;
      }, 0) || 0;
      
      trendData.push({ dateLabel: dateString, revenue: dayRevenue });
    }
    return trendData;
  };

  const revenueTrend = getLast7DaysRevenue();
  const maxRevenue = Math.max(...revenueTrend.map(d => d.revenue), 100);

  // 2. Category Sales Breakdown (QTY sold)
  const getCategoryBreakdown = () => {
    const categories = { Footwear: 0, Equipment: 0, Accessories: 0 };
    ordersData?.forEach((o: any) => {
      o.orderItems?.forEach((item: any) => {
        const match = productsData?.find((p: any) => p._id === item.product);
        const cat = match?.category || 'Footwear';
        if (cat === 'Footwear') categories.Footwear += item.qty;
        else if (cat === 'Equipment') categories.Equipment += item.qty;
        else if (cat === 'Accessories') categories.Accessories += item.qty;
      });
    });
    return [
      { name: 'Footwear', count: categories.Footwear },
      { name: 'Equipment', count: categories.Equipment },
      { name: 'Accessories', count: categories.Accessories },
    ];
  };

  const categoryBreakdown = getCategoryBreakdown();
  const maxCategoryCount = Math.max(...categoryBreakdown.map(c => c.count), 5);

  // 3. Advanced Analysis Metrics
  const averageOrderValue = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;
  const completedOrders = ordersData?.filter((o: any) => o.status === 'Delivered').length || 0;
  const completionRate = totalSalesCount > 0 ? (completedOrders / totalSalesCount) * 100 : 0;
  const cancelledOrders = ordersData?.filter((o: any) => o.status === 'Cancelled').length || 0;
  const cancellationRate = totalSalesCount > 0 ? (cancelledOrders / totalSalesCount) * 100 : 0;

  return (
    <div className="space-y-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <LayoutDashboard className="w-10 h-10 text-violet-500" />
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">ADMIN MANAGEMENT</h1>
            <p className="text-zinc-400 text-xs font-semibold">MANAGE CATALOG PRODUCTS & ATHLETE ORDERS</p>
          </div>
        </div>

        {/* Action Controls */}
        <button
          onClick={exportToCSV}
          className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-all uppercase tracking-wider"
        >
          <Download className="w-4 h-4" />
          EXPORT CSV
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/5 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Overview & Analytics' },
          { id: 'products', label: 'Products & Inventory' },
          { id: 'orders', label: 'Athlete Orders' },
          { id: 'users', label: 'Registered Accounts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-violet-500 text-white bg-violet-500/5'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conditionally Render Sections */}
      {activeTab === 'overview' && (
        <div className="space-y-12">
          {/* Analytics Summary Panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Rev Card */}
            <div className="glass-panel border border-white/5 rounded-2xl p-6 flex items-center gap-4">
              <div className="p-3 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-xl">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block">TOTAL REVENUE</span>
                <span className="text-2xl font-black text-white">₹{totalRevenue.toFixed(2)}</span>
              </div>
            </div>

            {/* Sales Card */}
            <div className="glass-panel border border-white/5 rounded-2xl p-6 flex items-center gap-4">
              <div className="p-3 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block">TOTAL SALES</span>
                <span className="text-2xl font-black text-white">{totalSalesCount} ORDERS</span>
              </div>
            </div>

            {/* Inventory alert */}
            <div className="glass-panel border border-white/5 rounded-2xl p-6 flex items-center gap-4">
              <div className="p-3 bg-red-600/10 border border-red-500/20 text-red-400 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block">LOW STOCK ALERTS</span>
                <span className="text-2xl font-black text-white">{lowStockCount} PRODUCTS</span>
              </div>
            </div>

            {/* Active users */}
            <div className="glass-panel border border-white/5 rounded-2xl p-6 flex items-center gap-4">
              <div className="p-3 bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block">REGISTERED ATHLETES</span>
                <span className="text-2xl font-black text-white">
                  {usersLoading ? '...' : `${usersData?.length || 0} USERS`}
                </span>
              </div>
            </div>
          </div>

          {/* Analytics Charts & Insights Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Line Chart: Revenue Trend */}
            <div className="lg:col-span-2 glass-panel border border-white/5 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-extrabold uppercase text-white tracking-widest">7-Day Revenue Trend</h3>
                <span className="text-xs text-violet-400 font-bold bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20">₹ Real-time</span>
              </div>
              <div className="h-64 relative flex items-end">
                <svg className="w-full h-56 overflow-visible" viewBox="0 0 500 200">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                  
                  {(() => {
                    const points = revenueTrend.map((d, index) => {
                      const x = (index / 6) * 500;
                      const y = 200 - (d.revenue / maxRevenue) * 160;
                      return { x, y };
                    });
                    const pathData = points.reduce((acc, p, index) => {
                      return index === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
                    }, '');
                    const areaData = `${pathData} L ${points[points.length - 1].x} 200 L ${points[0].x} 200 Z`;
                    return (
                      <>
                        <path d={areaData} fill="url(#chartGradient)" />
                        <path d={pathData} fill="none" stroke="rgb(139, 92, 246)" strokeWidth="3" className="drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                        {points.map((p, idx) => (
                          <g key={idx} className="group cursor-pointer">
                            <circle cx={p.x} cy={p.y} r="5" fill="rgb(139, 92, 246)" stroke="#0b0b0f" strokeWidth="2" />
                            <circle cx={p.x} cy={p.y} r="10" fill="rgb(139, 92, 246)" className="opacity-0 group-hover:opacity-30 transition-all duration-300" />
                            <foreignObject x={p.x - 40} y={p.y - 45} width="80" height="40" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                              <div className="bg-[#0b0b0f] border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-white text-center font-bold">
                                ₹{revenueTrend[idx].revenue.toFixed(0)}
                              </div>
                            </foreignObject>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 font-extrabold uppercase px-1">
                {revenueTrend.map((d, index) => (
                  <span key={index}>{d.dateLabel}</span>
                ))}
              </div>
            </div>

            {/* Category sales & Advanced Insights */}
            <div className="glass-panel border border-white/5 p-6 rounded-2xl space-y-6">
              <h3 className="text-sm font-extrabold uppercase text-white tracking-widest">Category & Insights</h3>
              
              <div className="space-y-4">
                <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block">Unit Sales Breakdown</span>
                <div className="space-y-3.5">
                  {categoryBreakdown.map((c) => {
                    const widthPercent = Math.max((c.count / maxCategoryCount) * 100, 5);
                    return (
                      <div key={c.name} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-zinc-300">{c.name}</span>
                          <span className="text-white font-bold">{c.count} sold</span>
                        </div>
                        <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="h-full bg-violet-600 rounded-full" 
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-500 uppercase">Average Order Value (AOV)</span>
                  <span className="text-white font-black">₹{averageOrderValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-500 uppercase">Order Delivery Ratio</span>
                  <span className="text-emerald-400 font-black">{completionRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-500 uppercase">Cancellation Ratio</span>
                  <span className="text-red-400 font-black">{cancellationRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Product Column */}
          <div className="glass-panel border border-white/10 p-6 rounded-2xl space-y-6 h-fit">
            <h3 className="text-lg font-black uppercase text-white border-b border-white/5 pb-2">ADD NEW PRODUCT</h3>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">PRODUCT NAME</label>
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Air Spike Runners"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:outline-none focus:border-violet-500/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">PRICE (₹)</label>
                  <input
                    type="number"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    placeholder="120"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">STOCK</label>
                  <input
                    type="number"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">DESCRIPTION</label>
                <textarea
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  placeholder="Product description detailing performance metrics..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:outline-none min-h-[80px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">CATEGORY</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0b0b0f] border border-white/10 text-white rounded-xl text-sm focus:outline-none"
                  >
                    <option value="Footwear">Footwear</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">BRAND</label>
                  <input
                    type="text"
                    value={newProductBrand}
                    onChange={(e) => setNewProductBrand(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">PRODUCT IMAGE</label>
                {uploadError && <div className="text-red-400 text-xs font-semibold">{uploadError}</div>}

                {isUploadingImage ? (
                  <div className="w-full py-8 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center bg-white/5 gap-2">
                    <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                    <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Uploading to Cloud...</span>
                  </div>
                ) : newProductImage ? (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-zinc-950">
                    <img src={newProductImage} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewProductImage('')}
                      className="absolute top-2 right-2 p-1.5 bg-red-600/90 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="product-image-file" className="w-full py-6 border border-dashed border-white/15 hover:border-violet-500/50 rounded-xl flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition-all cursor-pointer gap-2">
                      <Upload className="w-6 h-6 text-zinc-500" />
                      <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Upload Product Image</span>
                    </label>
                    <input
                      type="file"
                      id="product-image-file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={createProductMutation.isPending}
                className="w-full py-3 btn-neon font-black text-xs rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                {createProductMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                SAVE PRODUCT
              </button>
            </form>
          </div>

          {/* Products List */}
          <div className="lg:col-span-2 glass-panel border border-white/5 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-black uppercase text-white">ALL PRODUCTS</h3>
            {productsLoading ? (
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-zinc-500 font-extrabold uppercase text-xs">
                      <th className="py-2.5">NAME</th>
                      <th className="py-2.5">CATEGORY</th>
                      <th className="py-2.5">STOCK</th>
                      <th className="py-2.5">PRICE</th>
                      <th className="py-2.5 text-center">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-semibold text-zinc-300">
                    {productsData?.map((p: Product) => (
                      <tr key={p._id} className="hover:bg-white/5">
                        <td className="py-3 text-white max-w-[150px] truncate">{p.name}</td>
                        <td className="py-3">{p.category}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.stock < 5 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-zinc-800 text-zinc-300'}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="py-3">₹{p.price.toFixed(2)}</td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => deleteProductMutation.mutate(p._id)}
                            className="p-1.5 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-black uppercase text-white">ALL ORDERS</h3>
          {ordersLoading ? (
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-zinc-500 font-extrabold uppercase text-xs">
                    <th className="py-2.5">ATHLETE</th>
                    <th className="py-2.5">TOTAL</th>
                    <th className="py-2.5">PAID</th>
                    <th className="py-2.5">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-semibold text-zinc-300">
                  {ordersData?.map((o: Order) => (
                    <tr key={o._id} className="hover:bg-white/5">
                      <td className="py-3 text-white">{o.user?.name || 'Athlete'}</td>
                      <td className="py-3">₹{o.totalPrice.toFixed(2)}</td>
                      <td className="py-3">{o.isPaid ? '🟢 YES' : '🔴 NO'}</td>
                      <td className="py-3">
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatusMutation.mutate({ id: o._id, status: e.target.value })}
                          className="px-2 py-1.5 bg-[#0b0b0f] border border-white/10 rounded-lg text-xs font-semibold focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-black uppercase text-white">ALL REGISTERED USERS</h3>
          {usersLoading ? (
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-zinc-500 font-extrabold uppercase text-xs">
                    <th className="py-2.5">NAME</th>
                    <th className="py-2.5">EMAIL</th>
                    <th className="py-2.5">ROLE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-semibold text-zinc-300">
                  {usersData?.map((u: any) => (
                    <tr key={u._id} className="hover:bg-white/5">
                      <td className="py-3 text-white">{u.name}</td>
                      <td className="py-3 font-mono text-zinc-400 text-xs">{u.email}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin' 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                            : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/dashboard',
  component: AdminDashboard,
});
