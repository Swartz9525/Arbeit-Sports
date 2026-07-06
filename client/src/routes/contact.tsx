import { useState } from 'react';
import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { Mail, Phone, MapPin, Send, Loader2, MessageSquare } from 'lucide-react';

function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      alert('Please fill out all fields.');
      return;
    }

    setIsPending(true);
    // Simulate API Submission
    setTimeout(() => {
      setIsPending(false);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      alert('Message sent successfully! Our sports tech advisory team will reach out shortly.');
    }, 1500);
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="px-3.5 py-1 bg-violet-600/10 text-violet-400 text-[10px] font-black rounded-full tracking-widest uppercase border border-violet-500/20 inline-block">
          SUPPORT PORTAL
        </span>
        <h1 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">CONTACT ATHLETE LABS</h1>
        <p className="text-zinc-400 text-sm max-w-sm mx-auto font-semibold">GET IN TOUCH FOR PRODUCT CONSULTANCY, PARTNERSHIPS, OR ORDERS.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Columns: Contact Details cards */}
        <div className="space-y-4">
          <div className="glass-panel border border-white/5 p-6 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">EMAIL SUPPORT</span>
              <a href="mailto:arbeitsports@gmail.com" className="text-sm font-semibold text-white hover:underline">
                arbeitsports@gmail.com
              </a>
            </div>
          </div>

          <div className="glass-panel border border-white/5 p-6 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">CONTACT PHONE</span>
              <span className="text-sm font-semibold text-white">+91 8521121289</span>
            </div>
          </div>

          <div className="glass-panel border border-white/5 p-6 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">HQ LAB LOCATION</span>
              <span className="text-sm font-semibold text-white block">
                Paswan Complex <br />
                Dehri-on-Sone
              </span>
            </div>
          </div>
        </div>

        {/* Right Form column */}
        <div className="lg:col-span-2 glass-panel border border-white/10 p-8 rounded-3xl shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-6">
            <MessageSquare className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-black uppercase text-white">SEND US A MESSAGE</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">FULL NAME</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0b0b0f] border border-white/10 text-white rounded-xl text-sm focus:outline-none focus:border-violet-500/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">EMAIL ADDRESS</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0b0b0f] border border-white/10 text-white rounded-xl text-sm focus:outline-none focus:border-violet-500/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">SUBJECT</label>
              <input
                type="text"
                placeholder="Product sizing query, Bulk order info, etc."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0b0b0f] border border-white/10 text-white rounded-xl text-sm focus:outline-none focus:border-violet-500/50"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">MESSAGE</label>
              <textarea
                placeholder="Type your query details here..."
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0b0b0f] border border-white/10 text-white rounded-xl text-sm focus:outline-none focus:border-violet-500/50 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs rounded-xl tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              SEND MESSAGE
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: Contact,
});
