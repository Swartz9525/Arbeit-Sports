import { createRootRoute, Outlet } from '@tanstack/react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col justify-between bg-[#0b0b0f] text-zinc-100">
      <Navbar />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  ),
});
