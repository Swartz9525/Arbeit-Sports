import { Dumbbell } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export default function Footer() {
  return (
    <footer className="w-full glass-panel border-t border-white/5 py-12 px-6 md:px-12 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-violet-500" />
            <span className="text-lg font-black tracking-tighter text-white uppercase bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
              ARBEIT SPORTS
            </span>
          </div>
          <p className="text-zinc-400 text-sm">
            High performance sports gear and custom footwears tailored for professional athletes.
          </p>
        </div>

        {/* Links Section 1 */}
        <div>
          <h4 className="text-white text-xs font-extrabold tracking-widest uppercase mb-4">SHOPPING</h4>
          <ul className="space-y-2 text-zinc-400 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Men's Athletic</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Women's Training</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Accessories</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Custom Gear</a></li>
          </ul>
        </div>

        {/* Links Section 2 */}
        <div>
          <h4 className="text-white text-xs font-extrabold tracking-widest uppercase mb-4">SUPPORT</h4>
          <ul className="space-y-2 text-zinc-400 text-sm">
            <li>
              <Link to="/about" className="hover:text-white transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/orders/track" className="hover:text-white transition-colors">
                Track Orders
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition-colors">
                Contact Labs
              </Link>
            </li>
            <li><a href="#" className="hover:text-white transition-colors">Returns & Refunds</a></li>
          </ul>
        </div>

        {/* Links Section 3 */}
        <div>
          <h4 className="text-white text-xs font-extrabold tracking-widest uppercase mb-4">LEGAL</h4>
          <ul className="space-y-2 text-zinc-400 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Cookie Preferences</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-500">
        <p>&copy; {new Date().getFullYear()} ARBEIT SPORTS. All rights reserved.</p>
        <p>Crafted for Next-Gen Athletes.</p>
      </div>
    </footer>
  );
}
