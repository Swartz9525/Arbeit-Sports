import { useState } from 'react';
import { createRoute, useParams, useNavigate } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import api from '../services/api';
import { addToCart } from '../features/cart/store/cartSlice';
import { ChevronRight, ShieldCheck, ShoppingCart, Truck, Loader2 } from 'lucide-react';
import ShoeShowcase from '../features/three-d-showcase/components/ShoeShowcase';

function ProductDetail() {
  const { productId } = useParams({ from: '/product/$productId' });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [showThreeD, setShowThreeD] = useState(false);

  // Fetch product from backend
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const res = await api.get(`/products/${productId}`);
      return res.data;
    },
  });

  const handleAddToCart = () => {
    if (!product) return;

    if (product.sizes?.length > 0 && !selectedSize) {
      alert('Please select a size');
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      alert('Please select a color');
      return;
    }

    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        qty,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        stock: product.stock,
      })
    );

    navigate({ to: '/cart' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-40">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-40 text-red-400">
        Product not found or failed to load.
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
        <span className="hover:text-white transition-colors cursor-pointer" onClick={() => navigate({ to: '/' })}>HOME</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="hover:text-white transition-colors cursor-pointer" onClick={() => navigate({ to: '/shop' })}>SHOP</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-violet-400 font-bold">{product.name}</span>
      </div>

      {/* Main product columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Side: Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 relative">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.threeDModelUrl && (
              <button
                onClick={() => setShowThreeD(!showThreeD)}
                className="absolute bottom-4 right-4 px-4 py-2 bg-violet-600/80 hover:bg-violet-600 text-white font-extrabold text-xs rounded-xl tracking-wider uppercase border border-violet-400/30 backdrop-blur-sm transition-all"
              >
                {showThreeD ? 'VIEW IMAGE' : 'INTERACT IN 3D ⚡'}
              </button>
            )}
          </div>
        </div>

        {/* Right Side: details and CTA */}
        <div className="space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-violet-400 uppercase tracking-widest">
              {product.brand}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white uppercase">
              {product.name}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-sm">★</span>
              <span className="text-sm text-zinc-300 font-semibold">{product.rating}</span>
              <span className="text-xs text-zinc-500">• {product.numReviews || 0} reviews</span>
            </div>
          </div>

          <div className="text-3xl font-black text-white">
            ₹{product.price.toFixed(2)}
          </div>

          <p className="text-zinc-400 text-sm leading-relaxed">
            {product.description}
          </p>

          <div className="space-y-6">
            {/* Size Selector */}
            {product.sizes?.length > 0 && (
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2 uppercase tracking-wide">Select Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      className={`px-4 py-2 border rounded-lg text-xs font-bold transition-all ${
                        selectedSize === size
                          ? 'border-violet-500 bg-violet-500/20 text-white'
                          : 'border-white/10 hover:border-white/20 text-zinc-400 hover:text-white'
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors?.length > 0 && (
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2 uppercase tracking-wide">Select Color</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      className={`px-4 py-2 border rounded-lg text-xs font-bold transition-all ${
                        selectedColor === color
                          ? 'border-violet-500 bg-violet-500/20 text-white'
                          : 'border-white/10 hover:border-white/20 text-zinc-400 hover:text-white'
                      }`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">QTY</span>
                <select
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="px-3 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-sm focus:outline-none"
                >
                  {[...Array(Math.min(product.stock, 10)).keys()].map((x) => (
                    <option key={x + 1} value={x + 1} className="bg-[#0b0b0f]">
                      {x + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Action CTA */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            {product.stock > 0 ? (
              <button
                onClick={handleAddToCart}
                className="w-full md:w-auto px-8 py-4 btn-neon font-black text-xs rounded-xl flex items-center justify-center gap-2 tracking-widest uppercase"
              >
                <ShoppingCart className="w-4 h-4" />
                ADD TO ATHLETIC BAG
              </button>
            ) : (
              <div className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl text-center">
                OUT OF STOCK
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-zinc-400 pt-4">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-violet-400" />
                <span>Fast Delivery Worldwide</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-violet-400" />
                <span>100% Original Products</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render 3D Canvas in-place when interactive mode is active */}
      {showThreeD && product.threeDModelUrl && (
        <div className="space-y-4 pt-12 border-t border-white/5">
          <div className="text-center">
            <h3 className="text-xl font-bold uppercase tracking-tight text-white">INTERACTIVE 3D DESIGN STUDIO</h3>
            <p className="text-zinc-400 text-xs">Edit layout and customize finishes below.</p>
          </div>
          <ShoeShowcase />
        </div>
      )}
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/product/$productId',
  component: ProductDetail,
});
