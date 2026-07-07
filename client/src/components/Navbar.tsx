import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logoutSuccess } from '../features/auth/store/authSlice';
import { clearCart } from '../features/cart/store/cartSlice';
import api from '../services/api';
import { ShoppingCart, User, LogOut, LayoutDashboard, Dumbbell, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      dispatch(logoutSuccess());
      dispatch(clearCart());
      navigate({ to: '/logged-out' });
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logoutSuccess());
      dispatch(clearCart());
      navigate({ to: '/logged-out' });
    }
  };

  const totalCartQty = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <nav className="relative sticky top-0 z-50 w-full glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center transition-all">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <Dumbbell className="w-8 h-8 text-violet-500 transition-transform group-hover:rotate-45" />
        <span className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
          ARBEIT SPORTS
        </span>
      </Link>
      <div className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide text-zinc-300">
        <Link to="/" className="hover:text-white transition-colors [&.active]:text-violet-400">
          HOME
        </Link>
        <Link to="/shop" className="hover:text-white transition-colors [&.active]:text-violet-400">
          SHOP
        </Link>
        <Link to="/about" className="hover:text-white transition-colors [&.active]:text-violet-400">
          ABOUT
        </Link>
        <Link to="/contact" className="hover:text-white transition-colors [&.active]:text-violet-400">
          CONTACT
        </Link>
        {isAuthenticated && (
          <Link to="/orders" className="hover:text-white transition-colors [&.active]:text-violet-400">
            MY ORDERS
          </Link>
        )}
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-4 md:gap-6">
        <Link to="/cart" className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
          <ShoppingCart className="w-5 h-5 text-zinc-300 hover:text-white" />
          {totalCartQty > 0 && (
            <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-[#0b0b0f]">
              {totalCartQty}
            </span>
          )}
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" className="p-2 hover:bg-white/5 rounded-lg transition-colors" title="Admin Dashboard">
                <LayoutDashboard className="w-5 h-5 text-violet-400" />
              </Link>
            )}            <Link to="/profile" className="hidden md:flex flex-col text-right hover:text-violet-400 transition-colors" title="My Profile">
              <span className="text-xs font-bold text-white leading-none">{user?.name}</span>
              <span className="text-[10px] text-zinc-400 font-medium capitalize">{user?.role}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-all"
          >
            <User className="w-4 h-4" />
            SIGN IN
          </Link>
        )}

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 hover:bg-white/5 rounded-lg text-zinc-300 hover:text-white transition-colors"
          title="Toggle Menu"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#0b0b0f]/95 backdrop-blur-md border-b border-white/5 py-4 px-6 flex flex-col gap-4 text-sm font-semibold tracking-wide text-zinc-300 md:hidden z-50">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-white transition-colors py-2 border-b border-white/5 [&.active]:text-violet-400">
            HOME
          </Link>
          <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="hover:text-white transition-colors py-2 border-b border-white/5 [&.active]:text-violet-400">
            SHOP
          </Link>
          <Link to="/about" onClick={() => setIsMenuOpen(false)} className="hover:text-white transition-colors py-2 border-b border-white/5 [&.active]:text-violet-400">
            ABOUT
          </Link>
          <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="hover:text-white transition-colors py-2 border-b border-white/5 [&.active]:text-violet-400">
            CONTACT
          </Link>
          {isAuthenticated && (
            <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="hover:text-white transition-colors py-2 [&.active]:text-violet-400">
              MY ORDERS
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
