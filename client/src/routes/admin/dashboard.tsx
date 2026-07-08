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
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
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
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const isAdmin = isAuthenticated && user?.role === 'admin';

  // Fetch all products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: async () => {
      const res = await api.get('/products?limit=100');
      return res.data.products;
    },
    enabled: isAdmin,
  });

  // Fetch all orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data;
    },
    enabled: isAdmin,
  });

  // Fetch all users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data;
    },
    enabled: isAdmin,
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
  const handlePrintInvoice = (o: any) => {
    const itemsHtml = o.orderItems.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name} ${item.size ? `(${item.size})` : ''}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.qty}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${(item.qty * item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    const invoiceElement = document.createElement('div');
    invoiceElement.innerHTML = `
      <div class="invoice-box" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); border-radius: 8px; max-width: 800px; margin: auto; background: #fff;">
        <table style="width: 100%; margin-bottom: 30px;">
          <tr>
            <td>
              <div style="font-size: 28px; font-weight: 800; color: #7c3aed; text-transform: uppercase; letter-spacing: -1px;">ARBEIT SPORTS</div>
              <small>Performance & Style Lab</small>
            </td>
            <td style="text-align: right; font-size: 13px;">
              <strong>INVOICE RECEIPT</strong><br />
              Order ID: ${o._id}<br />
              Date: ${new Date(o.createdAt).toLocaleDateString()}<br />
            </td>
          </tr>
        </table>

        <table style="width: 100%; margin-bottom: 30px;">
          <tr>
            <td style="width: 50%; vertical-align: top;">
              <div style="font-size: 13px; font-weight: 800; color: #666; text-transform: uppercase; margin-bottom: 10px; border-bottom: 2px solid #eee; padding-bottom: 5px;">Shopkeeper / Seller</div>
              <strong>Arbeit Sports Retail Ltd.</strong><br />
              100 Athletic Boulevard, Suite 500<br />
              New Delhi, Delhi 110001<br />
              Email: billing@arbeitsports.com<br />
              GSTIN: 07AAACA1111A1Z1
            </td>
            <td style="width: 50%; vertical-align: top; padding-left: 20px;">
              <div style="font-size: 13px; font-weight: 800; color: #666; text-transform: uppercase; margin-bottom: 10px; border-bottom: 2px solid #eee; padding-bottom: 5px;">Customer Shipping Address</div>
              <strong>${o.user?.name || 'Customer'}</strong><br />
              Address: ${o.shippingAddress?.address}<br />
              City: ${o.shippingAddress?.city}, Pin: ${o.shippingAddress?.postalCode}<br />
              Country: ${o.shippingAddress?.country}
            </td>
          </tr>
        </table>

        <table style="width: 100%; margin-bottom: 20px;">
          <tr>
            <td>
              <div style="font-size: 13px; font-weight: 800; color: #666; text-transform: uppercase; margin-bottom: 10px; border-bottom: 2px solid #eee; padding-bottom: 5px;">Payment Information</div>
              Method: ${o.paymentMethod || 'Card'}<br />
              Status: <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; ${o.isPaid ? 'color: #065f46; background: #d1fae5;' : 'color: #991b1b; background: #fee2e2;'}">${o.isPaid ? 'Paid' : 'Unpaid'}</span>
            </td>
          </tr>
        </table>

        <div style="font-size: 13px; font-weight: 800; color: #666; text-transform: uppercase; margin-bottom: 10px; border-bottom: 2px solid #eee; padding-bottom: 5px;">Items Description</div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr>
              <th style="background: #f9fafb; padding: 10px; text-align: left; font-size: 12px; font-weight: bold; border-bottom: 2px solid #ddd; text-transform: uppercase;">Item Details</th>
              <th style="background: #f9fafb; padding: 10px; text-align: center; font-size: 12px; font-weight: bold; border-bottom: 2px solid #ddd; text-transform: uppercase; width: 60px;">Qty</th>
              <th style="background: #f9fafb; padding: 10px; text-align: right; font-size: 12px; font-weight: bold; border-bottom: 2px solid #ddd; text-transform: uppercase; width: 100px;">Unit Price</th>
              <th style="background: #f9fafb; padding: 10px; text-align: right; font-size: 12px; font-weight: bold; border-bottom: 2px solid #ddd; text-transform: uppercase; width: 120px;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <hr style="border: 0; border-top: 1px dashed #ddd; margin: 20px 0;" />

        <table style="width: 100%; text-align: right; font-weight: bold; font-size: 15px; margin-top: 20px;">
          <tr>
            <td style="width: 70%; font-size: 13px; color: #666; font-weight: normal; padding: 4px 0;">Subtotal:</td>
            <td style="width: 30%; text-align: right; font-size: 14px; font-weight: normal; padding: 4px 0;">₹${(o.totalPrice - (o.taxPrice || 0) - (o.shippingPrice || 0)).toFixed(2)}</td>
          </tr>
          ${o.taxPrice ? `
          <tr>
            <td style="font-size: 13px; color: #666; font-weight: normal; padding: 4px 0;">Tax Amount:</td>
            <td style="text-align: right; font-size: 14px; font-weight: normal; padding: 4px 0;">₹${o.taxPrice.toFixed(2)}</td>
          </tr>` : ''}
          ${o.shippingPrice ? `
          <tr>
            <td style="font-size: 13px; color: #666; font-weight: normal; padding: 4px 0;">Shipping Fees:</td>
            <td style="text-align: right; font-size: 14px; font-weight: normal; padding: 4px 0;">₹${o.shippingPrice.toFixed(2)}</td>
          </tr>` : ''}
          <tr>
            <td style="font-size: 16px; color: #111; padding: 10px 0 0 0;">Total Amount Paid:</td>
            <td style="text-align: right; font-size: 18px; color: #7c3aed; padding: 10px 0 0 0;">₹${o.totalPrice.toFixed(2)}</td>
          </tr>
        </table>
      </div>
    `;

    import('html2pdf.js').then((html2pdfModule) => {
      const html2pdf = html2pdfModule.default;
      const opt = {
        margin:       10,
        filename:     `Invoice_${o._id}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().from(invoiceElement).set(opt).save();
    }).catch((err) => {
      console.error('Failed to load html2pdf.js', err);
      alert('Failed to generate PDF. Please try again.');
    });
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
        <div className="space-y-6">
          <div className="glass-panel border border-white/5 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-white/5">
              <h3 className="text-lg font-black uppercase text-white">ALL ORDERS</h3>
              <div className="w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search by customer, ID, status or city..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0b0b0f] border border-white/10 text-white rounded-xl text-xs focus:outline-none focus:border-violet-500/50 placeholder:text-zinc-600"
                />
              </div>
            </div>

            {ordersLoading ? (
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto" />
            ) : (
              (() => {
                const filteredOrders = ordersData?.filter((o: any) => {
                  const s = orderSearch.toLowerCase();
                  return (
                    o.user?.name?.toLowerCase().includes(s) ||
                    o._id?.toLowerCase().includes(s) ||
                    o.status?.toLowerCase().includes(s) ||
                    o.shippingAddress?.address?.toLowerCase().includes(s) ||
                    o.shippingAddress?.city?.toLowerCase().includes(s)
                  );
                }) || [];

                if (filteredOrders.length === 0) {
                  return (
                    <p className="text-zinc-500 text-xs font-semibold text-center py-8">
                      No orders match your search criteria.
                    </p>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredOrders.map((o: any) => (
                      <div key={o._id} className="glass-panel border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-violet-500/30 transition-all">
                        {/* Header info */}
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[10px] font-bold text-zinc-500 block uppercase">Order ID</span>
                            <span className="font-mono text-[11px] text-zinc-300 font-bold">{o._id}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-zinc-500 block uppercase text-right">Date</span>
                            <span className="text-xs text-zinc-300 font-semibold">{new Date(o.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Customer details */}
                        <div className="border-t border-b border-white/5 py-3 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-zinc-500">ATHLETE</span>
                            <span className="text-white font-bold">{o.user?.name || 'Athlete'}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-zinc-500">PAYMENT</span>
                            <span className="text-white font-semibold">{o.paymentMethod || 'Card'} ({o.isPaid ? '🟢 PAID' : '🔴 UNPAID'})</span>
                          </div>
                          <div className="text-xs space-y-1">
                            <span className="text-zinc-500 block">SHIPPING ADDRESS</span>
                            <span className="text-zinc-400 block font-medium leading-relaxed">
                              {o.shippingAddress ? `${o.shippingAddress.address}, ${o.shippingAddress.city}, ${o.shippingAddress.postalCode}, ${o.shippingAddress.country}` : 'No address provided'}
                            </span>
                          </div>
                        </div>

                        {/* Order items */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-zinc-500 block uppercase">Items Purchased</span>
                          <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                            {o.orderItems?.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-xs text-zinc-300 font-medium">
                                <span>{item.qty}x {item.name} {item.size ? `(${item.size})` : ''}</span>
                                <span>₹{(item.qty * item.price).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="border-t border-white/5 pt-4 flex justify-between items-center gap-4">
                          <div>
                            <span className="text-[10px] font-bold text-zinc-500 block uppercase">Grand Total</span>
                            <span className="text-lg font-black text-violet-400">₹{o.totalPrice.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePrintInvoice(o)}
                              className="px-3 py-2 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-lg text-[10px] font-black uppercase hover:bg-violet-600 hover:text-white transition-all tracking-wider cursor-pointer"
                            >
                              Download Invoice
                            </button>
                            <select
                              value={o.status}
                              onChange={(e) => updateOrderStatusMutation.mutate({ id: o._id, status: e.target.value })}
                              className="px-2.5 py-1.5 bg-[#0b0b0f] border border-white/10 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Packed">Packed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </div>
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
                      <td className="py-3 text-white">
                        <button
                          onClick={() => setSelectedUserId(u._id)}
                          className="hover:text-violet-400 font-bold transition-colors text-left focus:outline-none cursor-pointer"
                        >
                          {u.name}
                        </button>
                      </td>
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

      {/* User Details Modal */}
      {selectedUserId && (
        (() => {
          const selectedUser = usersData?.find((u: any) => u._id === selectedUserId);
          if (!selectedUser) return null;

          const userOrders = ordersData?.filter((o: any) => {
            if (!o.user) return false;
            const oUserId = typeof o.user === 'object' ? o.user._id || o.user.id : o.user;
            return oUserId === selectedUserId;
          }) || [];

          const uniqueAddresses: string[] = Array.from(
            new Set<string>(
              userOrders
                .filter((o: any) => o.shippingAddress)
                .map((o: any) => 
                  `${o.shippingAddress.address}, ${o.shippingAddress.city}, ${o.shippingAddress.postalCode}, ${o.shippingAddress.country}`
                )
            )
          );

          return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-2xl bg-[#0b0b0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                  <div>
                    <h3 className="text-sm font-black uppercase text-white tracking-wider">ATHLETE ACCOUNT DEEP-DIVE</h3>
                    <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mt-0.5">Profile & Order Audit for {selectedUser.name}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedUserId(null)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6">
                  {/* Account Overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                      <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block">Full Name</span>
                      <span className="text-xs font-bold text-white block mt-1">{selectedUser.name}</span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                      <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block">Email Address</span>
                      <span className="text-xs font-bold text-violet-400 font-mono block mt-1 truncate">{selectedUser.email}</span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                      <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block">System Role</span>
                      <span className="text-[10px] font-black text-white mt-1 inline-block uppercase bg-violet-600/20 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full">
                        {selectedUser.role}
                      </span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                      <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest block">Registration Date</span>
                      <span className="text-xs font-bold text-zinc-300 block mt-1">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Delivery Addresses */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-wider">SAVED / SHIPPED ADDRESSES</h4>
                    {uniqueAddresses.length === 0 ? (
                      <p className="text-xs text-zinc-500 font-medium italic">No delivery addresses logged yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {uniqueAddresses.map((addr, idx) => (
                          <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/5 text-xs text-zinc-300 font-medium leading-relaxed">
                            📍 {addr}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Order History */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-wider">ORDER TRANSACTION HISTORY ({userOrders.length})</h4>
                    {userOrders.length === 0 ? (
                      <p className="text-xs text-zinc-500 font-medium italic">No transactions recorded for this user.</p>
                    ) : (
                      <div className="overflow-x-auto border border-white/5 rounded-xl">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-white/5 text-zinc-500 font-bold uppercase border-b border-white/5">
                              <th className="p-3">Order ID</th>
                              <th className="p-3">Date</th>
                              <th className="p-3">Total</th>
                              <th className="p-3">Paid</th>
                              <th className="p-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-semibold text-zinc-300">
                            {userOrders.map((o: any) => (
                              <tr key={o._id} className="hover:bg-white/5">
                                <td className="p-3 font-mono text-[10px] text-zinc-400">{o._id}</td>
                                <td className="p-3">{new Date(o.createdAt).toLocaleDateString()}</td>
                                <td className="p-3 text-violet-400">₹{o.totalPrice.toFixed(2)}</td>
                                <td className="p-3">{o.isPaid ? '🟢 Paid' : '🔴 Unpaid'}</td>
                                <td className="p-3">
                                  <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded text-[10px] font-bold">
                                    {o.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/5 bg-white/5 flex justify-end">
                  <button
                    onClick={() => setSelectedUserId(null)}
                    className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all uppercase cursor-pointer"
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/dashboard',
  component: AdminDashboard,
});
