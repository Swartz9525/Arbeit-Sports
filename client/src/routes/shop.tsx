import { useState } from 'react';
import { createRoute, Link } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Search, Loader2 } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  images: string[];
  stock: number;
  rating: number;
}

// 3D Tilt Card wrapper for Product items
function ProductTiltCard({ children, to, params, className }: { 
  children: React.ReactNode; 
  to: string; 
  params: any; 
  className: string; 
}) {
  const x = useMotionValue(100);
  const y = useMotionValue(100);

  const rotateX = useTransform(y, [0, 200], [8, -8]);
  const rotateY = useTransform(x, [0, 200], [-8, 8]);

  function handleMouse(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  function handleMouseLeave() {
    x.set(100);
    y.set(100);
  }

  return (
    <Link to={to} params={params} className="block h-full">
      <motion.div
        onMouseMove={handleMouse}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={className}
      >
        <div style={{ transform: 'translateZ(15px)' }} className="h-full w-full flex flex-col justify-between">
          {children}
        </div>
      </motion.div>
    </Link>
  );
}

function Shop() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [sort, setSort] = useState('createdAtDesc');

  // React Query to fetch products
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', search, category, brand, sort],
    queryFn: async () => {
      const res = await api.get('/products', {
        params: {
          search: search || undefined,
          category: category || undefined,
          brand: brand || undefined,
          sort: sort || undefined,
        },
      });
      return res.data;
    },
  });

  return (
    <div className="space-y-8">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-6 glass-panel">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search athletic gear..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-violet-500/50 text-sm text-white focus:outline-none transition-all placeholder:text-zinc-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-300 focus:outline-none focus:border-violet-500/50"
          >
            <option value="" className="bg-[#0b0b0f]">All Categories</option>
            <option value="Footwear" className="bg-[#0b0b0f]">Footwear</option>
            <option value="Equipment" className="bg-[#0b0b0f]">Equipment</option>
            <option value="Accessories" className="bg-[#0b0b0f]">Accessories</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-300 focus:outline-none focus:border-violet-500/50"
          >
            <option value="createdAtDesc" className="bg-[#0b0b0f]">Newest Arrivals</option>
            <option value="priceAsc" className="bg-[#0b0b0f]">Price: Low to High</option>
            <option value="priceDesc" className="bg-[#0b0b0f]">Price: High to Low</option>
            <option value="rating" className="bg-[#0b0b0f]">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-400">
          Failed to load products. Make sure the backend server is running.
        </div>
      ) : data?.products?.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          No sports products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data?.products?.map((product: Product) => (
            <ProductTiltCard
              key={product._id}
              to="/product/$productId"
              params={{ productId: product._id }}
              className="group flex flex-col h-full rounded-2xl glass-panel border border-white/5 overflow-hidden transition-all hover:border-violet-500/25 hover:shadow-xl cursor-pointer"
            >
              {/* Image Box */}
              <div className="relative aspect-square w-full bg-zinc-900 overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-zinc-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {product.category}
                </span>
              </div>

              {/* Detail Box */}
              <div className="p-5 flex flex-col justify-between flex-grow gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-violet-400 uppercase tracking-widest">
                    {product.brand}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-xs text-zinc-300 font-semibold">{product.rating || 'New'}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <span className="text-lg font-black text-white">₹{product.price.toFixed(2)}</span>
                  <span className="text-[10px] font-bold text-violet-400 group-hover:underline">
                    VIEW DETAILS →
                  </span>
                </div>
              </div>
            </ProductTiltCard>
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shop',
  component: Shop,
});
