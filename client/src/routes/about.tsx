import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { Trophy, ShieldCheck, Zap, Compass, Users, Layers, Award } from 'lucide-react';
import { motion } from 'framer-motion';

function About() {
  return (
    <div className="space-y-20 pb-12">
      {/* Hero Banner Section */}
      <section className="relative flex flex-col items-center justify-center text-center py-20 overflow-hidden rounded-3xl border border-white/5 glass-panel">
        <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800')] opacity-10 pointer-events-none" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-6 z-10 px-6">
          <span className="px-3.5 py-1 bg-violet-600/10 text-violet-400 text-[10px] font-black rounded-full tracking-widest uppercase border border-violet-500/20 inline-block">
            OUR PHILOSOPHY
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase leading-none">
            ENGINEERING THE <br />
            <span className="text-gradient">FUTURE OF SPORT</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-xl mx-auto font-semibold">
            Arbeit Sports was established in 2024 with a single focus: creating lab-tested high-performance gear that feels like premium design and functions like elite sports tech.
          </p>
        </div>
      </section>

      {/* Corporate Values */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel border border-white/5 p-8 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold uppercase text-white">ELITE VELOCITY</h3>
          <p className="text-zinc-500 text-xs font-semibold leading-relaxed">
            Every product is engineered with active response feedback. Whether it's carbon cores in footwear or aerodynamics in equipment, we optimize for speed.
          </p>
        </div>

        <div className="glass-panel border border-white/5 p-8 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold uppercase text-white">LABORATORY TESTED</h3>
          <p className="text-zinc-500 text-xs font-semibold leading-relaxed">
            Our materials go through rigorous heat chamber testing, surface friction checks, and vacuum seal cycles to guarantee durability under absolute strain.
          </p>
        </div>

        <div className="glass-panel border border-white/5 p-8 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold uppercase text-white">OLYMPIC COMPLIANCE</h3>
          <p className="text-zinc-500 text-xs font-semibold leading-relaxed">
            We partner with gold-medal coaches and international athletic boards to certify that all matches gear adheres to professional parameters.
          </p>
        </div>
      </section>

      {/* Brand Milestones / Info Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-violet-400 text-[10px] font-bold tracking-widest uppercase">INSIDE THE LAB</span>
          <h2 className="text-3xl md:text-4xl font-black uppercase text-white tracking-tight leading-none">
            AESTHETICS METRICALLY BALANCED WITH UTILITY
          </h2>
          <p className="text-zinc-400 text-sm font-semibold leading-relaxed">
            We draw visual and design inspiration from minimalist interfaces, clean typography, and structural dynamics. Every curves in our footwear and textures in our accessories serves a mechanical purpose.
          </p>
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="border-l-2 border-violet-500 pl-4 space-y-1">
              <span className="text-2xl font-black text-white block">99.9%</span>
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Athlete Satisfaction</span>
            </div>
            <div className="border-l-2 border-violet-500 pl-4 space-y-1">
              <span className="text-2xl font-black text-white block">12+</span>
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider block">Material Patents</span>
            </div>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-white/5 h-80">
          <img 
            src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600" 
            alt="Gym Lab" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
        </div>
      </section>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: About,
});
