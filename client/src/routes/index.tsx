import { useEffect, useRef, useState } from 'react';
import { createRoute, Link } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { ShoppingBag, Trophy, Zap, Compass, Orbit, ArrowUpRight, Cpu, Wind, Thermometer, ShieldCheck, Flame } from 'lucide-react';
import gsap from 'gsap';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import ShoeShowcase from '../features/three-d-showcase/components/ShoeShowcase';

// Ambient 3D Particle Background for premium feel
function ParticleBackground() {
  const ref = useRef<any>(null);
  const [sphere] = useState(() => {
    const arr = new Float32Array(3000);
    for (let i = 0; i < 3000; i++) {
      arr[i] = (Math.random() - 0.5) * 3;
    }
    return arr;
  });

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 12;
      ref.current.rotation.y -= delta / 18;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#a78bfa"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

// 3D Tilt Card Component
function TiltCard({ children, className, to }: { children: React.ReactNode; className: string; to: string }) {
  const x = useMotionValue(200);
  const y = useMotionValue(200);

  const rotateX = useTransform(y, [0, 400], [15, -15]);
  const rotateY = useTransform(x, [0, 400], [-15, 15]);

  function handleMouse(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  function handleMouseLeave() {
    x.set(200);
    y.set(200);
  }

  return (
    <Link to={to} className="block w-full">
      <motion.div
        onMouseMove={handleMouse}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={`${className} transition-all duration-200`}
      >
        <div style={{ transform: 'translateZ(50px)' }} className="h-full w-full">
          {children}
        </div>
      </motion.div>
    </Link>
  );
}

function Home() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // GSAP Intro animation
    const tl = gsap.timeline();
    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out' }
    );
    tl.fromTo(subtitleRef.current, 
      { opacity: 0, y: 25 }, 
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
      '-=0.8'
    );
    tl.fromTo(buttonRef.current, 
      { opacity: 0, scale: 0.9 }, 
      { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.5)' },
      '-=0.5'
    );

    // Mouse Move Custom Cursor Follower / Parallax Background positions
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="space-y-32 relative overflow-hidden pb-16">
      {/* Styles for Infinite Marquee */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 25s linear infinite;
        }
      `}</style>

      {/* Dynamic Custom Cursor Follower (Desktop Only) */}
      <div 
        className="hidden lg:block fixed w-8 h-8 rounded-full border border-violet-500/50 pointer-events-none z-50 transition-all duration-75 mix-blend-screen bg-violet-600/5"
        style={{
          left: `${cursorPos.x - 16}px`,
          top: `${cursorPos.y - 16}px`,
          boxShadow: '0 0 15px rgba(124, 58, 237, 0.3)',
        }}
      />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center pt-24 pb-12 min-h-[85vh]">
        {/* Dynamic 3D Particle Background canvas */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 1] }}>
            <ParticleBackground />
          </Canvas>
        </div>

        {/* Ambient Blur Depth Layers */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto space-y-8 z-10 px-4">
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="px-4 py-2 bg-white/5 border border-white/10 text-violet-400 text-xs font-black tracking-widest rounded-full inline-flex items-center gap-2"
          >
            <Trophy className="w-3.5 h-3.5" />
            ENGINEERED FOR CHAMPIONS
          </motion.span>
          
          <h1 
            ref={titleRef}
            className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase leading-none"
          >
            NEXT-GEN SPORTS <br />
            <span className="text-gradient">PERFORMANCE</span>
          </h1>

          <p 
            ref={subtitleRef}
            className="text-zinc-400 text-base md:text-xl max-w-2xl mx-auto font-medium"
          >
            Experience hand-crafted athletic gears, customized footwear, and high-performance equipment inspired by Nike, Apple, and Adidas.
          </p>

          <div ref={buttonRef} className="pt-4 flex flex-col sm:flex-row justify-center gap-4 items-center">
            {/* Motion Hover CTA Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/shop" className="px-8 py-4.5 btn-neon text-xs font-black rounded-xl flex items-center gap-2.5 tracking-widest uppercase shadow-lg shadow-violet-500/25">
                <ShoppingBag className="w-4 h-4" />
                EXPLORE CATALOG
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/shop" className="px-8 py-4.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black rounded-xl flex items-center gap-2 tracking-widest uppercase">
                <Orbit className="w-4 h-4 text-violet-400" />
                3D SHOWROOM
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Infinite Sport Marquee Section */}
      <section className="border-y border-white/5 py-6 bg-white/[0.01] overflow-hidden whitespace-nowrap">
        <div className="animate-marquee gap-12 text-sm font-black text-zinc-500 uppercase tracking-widest">
          {Array(2).fill([
            'HYPER CUSHIONING', 'CARBON FIBER PLATES', 'ZERO ENERGY LOSS', 'THERMALLY VACUUMED',
            '3D CUSTOMIZED BASES', 'AERODYNAMIC KNIT MESH', 'ULTRA LIGHT COMPOSITE', 'OLYMPIC GRADE CERTIFIED'
          ]).flat().map((phrase, idx) => (
            <span key={idx} className="flex items-center gap-3">
              <span className="text-violet-500">•</span>
              {phrase}
            </span>
          ))}
        </div>
      </section>

      {/* 360 Customizer Area */}
      <section className="space-y-12 max-w-7xl mx-auto px-4">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 bg-violet-600/10 text-violet-400 text-[10px] font-black rounded-full tracking-widest uppercase border border-violet-500/20">
            360 PRODUCT STUDIO
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">
            INTERACTIVE CUSTOMIZER
          </h2>
          <p className="text-zinc-400 text-sm max-w-lg mx-auto">
            Design your sneakers in real time. Rotate, zoom, and recolor each part to match your athletic look.
          </p>
        </div>
        <ShoeShowcase />
      </section>

      {/* 3D Features Grid */}
      <section className="space-y-12 max-w-7xl mx-auto px-4">
        <div className="text-center space-y-2">
          <span className="text-violet-400 text-[10px] font-bold tracking-widest uppercase">LABORATORY INNOVATION</span>
          <h2 className="text-3xl font-black uppercase text-white tracking-tight">ENGINEERED INNOVATIONS</h2>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto">Next-gen tech materials working for your performance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel border border-white/5 p-6 rounded-2xl space-y-4 hover:border-violet-500/35 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-md font-extrabold uppercase text-white">CARBON CORE</h4>
            <p className="text-zinc-500 text-xs leading-relaxed font-semibold">Integrates aerospace-grade carbon fiber plates for explosive energy rebound.</p>
          </div>

          <div className="glass-panel border border-white/5 p-6 rounded-2xl space-y-4 hover:border-violet-500/35 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
              <Wind className="w-5 h-5" />
            </div>
            <h4 className="text-md font-extrabold uppercase text-white">AERO RESPONSIVE</h4>
            <p className="text-zinc-500 text-xs leading-relaxed font-semibold">Micro-mesh knit allows 360 airflow, minimizing drag and thermal spikes.</p>
          </div>

          <div className="glass-panel border border-white/5 p-6 rounded-2xl space-y-4 hover:border-violet-500/35 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
              <Thermometer className="w-5 h-5" />
            </div>
            <h4 className="text-md font-extrabold uppercase text-white">THERMO-SHIELD</h4>
            <p className="text-zinc-500 text-xs leading-relaxed font-semibold">Double-walled copper vacuum layers seal temperatures for hours.</p>
          </div>

          <div className="glass-panel border border-white/5 p-6 rounded-2xl space-y-4 hover:border-violet-500/35 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-md font-extrabold uppercase text-white">TITAN TRACTION</h4>
            <p className="text-zinc-500 text-xs leading-relaxed font-semibold">Micro-grooved channels deliver absolute grip across court and field surfaces.</p>
          </div>
        </div>
      </section>

      {/* Trending Releases */}
      <section className="space-y-12 max-w-7xl mx-auto px-4">
        <div className="text-center space-y-2">
          <span className="text-violet-400 text-[10px] font-bold tracking-widest uppercase">SEASON RELEASES</span>
          <h2 className="text-3xl font-black uppercase text-white tracking-tight">TRENDING RELEASES</h2>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto">Get your hands on our highly rated athletic releases.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Release 1 */}
          <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden group flex flex-col justify-between">
            <div className="relative h-64 overflow-hidden bg-zinc-950 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600" 
                alt="Shoe" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 bg-violet-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded">HOT RELEASE</span>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-bold text-white uppercase group-hover:text-violet-400 transition-colors">APEX RUNNER X1</h4>
                <span className="text-white text-base font-black">₹15,999</span>
              </div>
              <p className="text-zinc-500 text-xs font-semibold leading-relaxed">Engineered with high performance carbon fiber plates and ultra responsive cushion bases.</p>
              <Link to="/shop" className="w-full py-3 bg-white/5 group-hover:bg-violet-600 text-white font-bold text-xs uppercase rounded-xl tracking-wider flex items-center justify-center gap-2 transition-all">
                VIEW DETAIL
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Release 2 */}
          <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden group flex flex-col justify-between">
            <div className="relative h-64 overflow-hidden bg-zinc-950 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600" 
                alt="Basketball" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 bg-violet-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded">PRO CHOICE</span>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-bold text-white uppercase group-hover:text-violet-400 transition-colors">TITAN GRIP BALL</h4>
                <span className="text-white text-base font-black">₹4,999</span>
              </div>
              <p className="text-zinc-500 text-xs font-semibold leading-relaxed">Premium composite leather match basketball with micro-fiber textured grip surfaces.</p>
              <Link to="/shop" className="w-full py-3 bg-white/5 group-hover:bg-violet-600 text-white font-bold text-xs uppercase rounded-xl tracking-wider flex items-center justify-center gap-2 transition-all">
                VIEW DETAIL
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Release 3 */}
          <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden group flex flex-col justify-between">
            <div className="relative h-64 overflow-hidden bg-zinc-950 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600" 
                alt="Flask" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 bg-violet-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded">BEST SELLER</span>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-bold text-white uppercase group-hover:text-violet-400 transition-colors">HYDRA-FLOW FLASK</h4>
                <span className="text-white text-base font-black">₹2,499</span>
              </div>
              <p className="text-zinc-500 text-xs font-semibold leading-relaxed">Double-walled vacuum insulated stainless steel water bottle keeping drinks ice cold.</p>
              <Link to="/shop" className="w-full py-3 bg-white/5 group-hover:bg-violet-600 text-white font-bold text-xs uppercase rounded-xl tracking-wider flex items-center justify-center gap-2 transition-all">
                VIEW DETAIL
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Category Cards */}
      <section className="space-y-12 max-w-7xl mx-auto px-4">
        <div className="text-center space-y-2">
          <span className="text-violet-400 text-[10px] font-bold tracking-widest uppercase">DISCOVER THE LINEUP</span>
          <h2 className="text-3xl font-black uppercase text-white tracking-tight">
            PERFORMANCE CATEGORIES
          </h2>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto">Selected gear optimized for elite sports categories.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <TiltCard to="/shop" className="group relative h-80 rounded-2xl overflow-hidden glass-panel border border-white/5 flex flex-col justify-end p-8 cursor-pointer">
            <div className="absolute inset-0 bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400')] opacity-35 group-hover:opacity-45 group-hover:scale-105 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="z-10 space-y-3 text-left">
              <Zap className="w-8 h-8 text-violet-400" />
              <h3 className="text-2xl font-black uppercase text-white">Footwear</h3>
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">High performance spikes & sneakers.</p>
            </div>
          </TiltCard>

          {/* Card 2 */}
          <TiltCard to="/shop" className="group relative h-80 rounded-2xl overflow-hidden glass-panel border border-white/5 flex flex-col justify-end p-8 cursor-pointer">
            <div className="absolute inset-0 bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=400')] opacity-35 group-hover:opacity-45 group-hover:scale-105 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="z-10 space-y-3 text-left">
              <Trophy className="w-8 h-8 text-violet-400" />
              <h3 className="text-2xl font-black uppercase text-white">Equipment</h3>
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Match quality balls, tennis bats & rackets.</p>
            </div>
          </TiltCard>

          {/* Card 3 */}
          <TiltCard to="/shop" className="group relative h-80 rounded-2xl overflow-hidden glass-panel border border-white/5 flex flex-col justify-end p-8 cursor-pointer">
            <div className="absolute inset-0 bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400')] opacity-35 group-hover:opacity-45 group-hover:scale-105 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="z-10 space-y-3 text-left">
              <Compass className="w-8 h-8 text-violet-400" />
              <h3 className="text-2xl font-black uppercase text-white">Accessories</h3>
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Athlete duffels, wrist bands & trackers.</p>
            </div>
          </TiltCard>
        </div>
      </section>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});
