'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight, Bell, CheckCircle2, CreditCard,
  Files, FolderKanban, Zap, ShieldCheck, Sparkles,
  Star, Users, ChevronRight,
  FileCheck, DollarSign, BarChart3, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─── Sparkle Canvas ─── */
function SparkleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; life: number; maxLife: number; hue: number;
    }> = [];

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const spawn = () => {
      if (particles.length > 120) return;
      const life = 80 + Math.random() * 120;
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.8,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.5 - 0.1,
        size: Math.random() * 2.5 + 0.5,
        opacity: 0, life: 0, maxLife: life,
        hue: 260 + Math.random() * 80,
      });
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (Math.random() < 0.35) spawn();
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++; p.x += p.vx; p.y += p.vy;
        const t = p.life / p.maxLife;
        p.opacity = t < 0.2 ? t / 0.2 : t > 0.7 ? (1 - t) / 0.3 : 1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.life * 0.02);
        ctx.globalAlpha = p.opacity * 0.7;
        ctx.fillStyle = `hsl(${p.hue}, 90%, 75%)`;
        const s = p.size;
        ctx.beginPath();
        for (let j = 0; j < 4; j++) {
          const a = (j * Math.PI) / 2;
          const ia = a + Math.PI / 4;
          if (j === 0) ctx.moveTo(Math.cos(a) * s * 2, Math.sin(a) * s * 2);
          else ctx.lineTo(Math.cos(a) * s * 2, Math.sin(a) * s * 2);
          ctx.lineTo(Math.cos(ia) * s * 0.6, Math.sin(ia) * s * 0.6);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        if (p.life >= p.maxLife) particles.splice(i, 1);
      }
      animId = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" style={{ opacity: 0.7 }} />;
}

/* ─── Grid Background ─── */
function GridBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(124,58,237,0.07)" strokeWidth="1"/>
          </pattern>
          <radialGradient id="gf" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="0"/>
            <stop offset="70%" stopColor="white" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="white" stopOpacity="1"/>
          </radialGradient>
          <mask id="gm"><rect width="100%" height="100%" fill="white"/><rect width="100%" height="100%" fill="url(#gf)"/></mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" mask="url(#gm)"/>
      </svg>
      <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'porb 6s ease-in-out infinite' }}/>
      <div className="absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'porb 8s ease-in-out infinite reverse' }}/>
      <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(232,121,249,0.08) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'porb 10s ease-in-out infinite 2s' }}/>
    </div>
  );
}

/* ─── Dashboard Mock ─── */
function DashboardPreview() {
  const projects = [
    { name: 'Luminary Brand Suite', client: 'Aria Chen', progress: 68, amount: '$4,200', status: 'active', color: '#7c3aed' },
    { name: 'Nexus App Redesign', client: 'Marcus Webb', progress: 92, amount: '$8,500', status: 'review', color: '#059669' },
    { name: 'Solstice E-commerce', client: 'Priya Nair', progress: 41, amount: '$6,100', status: 'active', color: '#d97706' },
  ];
  const stats = [
    { label: 'Projects', value: '12', icon: FolderKanban, delta: '+3 this month' },
    { label: 'Revenue', value: '$24.8k', icon: DollarSign, delta: '4 pending' },
    { label: 'Approvals', value: '8', icon: FileCheck, delta: '2 need action' },
    { label: 'Avg Reply', value: '1.4h', icon: Clock, delta: 'vs 3.2h avg' },
  ];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.98)',
        border: '1px solid rgba(124,58,237,0.15)',
        boxShadow: '0 0 0 1px rgba(124,58,237,0.08), 0 32px 80px rgba(13,10,26,0.18), 0 0 60px rgba(124,58,237,0.12)',
      }}>
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ background: '#f8f7ff', borderColor: 'rgba(124,58,237,0.08)' }}>
        <div className="h-2.5 w-2.5 rounded-full bg-red-400"/>
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-400"/>
        <div className="h-2.5 w-2.5 rounded-full bg-green-400"/>
        <div className="ml-3 flex-1 text-center">
          <span className="text-[11px] font-medium px-3 py-1 rounded-full" style={{ background: 'rgba(124,58,237,0.06)', color: '#7c3aed' }}>
            app.portalkit.io/dashboard
          </span>
        </div>
      </div>
      <div className="flex" style={{ minHeight: 360 }}>
        {/* Sidebar */}
        <div className="w-44 shrink-0 border-r p-3 flex flex-col gap-1" style={{ background: '#faf9ff', borderColor: 'rgba(124,58,237,0.08)' }}>
          <div className="flex items-center gap-2 px-2 py-2 mb-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}><Zap size={12} strokeWidth={2.5}/></span>
            <span className="text-xs font-black" style={{ color: '#0d0a1a' }}>PortalKit</span>
          </div>
          {[
            { icon: BarChart3, label: 'Dashboard', active: true },
            { icon: FolderKanban, label: 'Projects' },
            { icon: Files, label: 'Files' },
            { icon: CheckCircle2, label: 'Approvals' },
            { icon: CreditCard, label: 'Invoices' },
            { icon: Bell, label: 'Notifications' },
          ].map(({ icon: Icon, label, active }) => (
            <div key={label} className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer"
              style={{ background: active ? 'rgba(124,58,237,0.1)' : 'transparent', color: active ? '#7c3aed' : '#4a5068' }}>
              <Icon size={12}/>{label}
            </div>
          ))}
          <div className="mt-auto pt-3 border-t" style={{ borderColor: 'rgba(124,58,237,0.08)' }}>
            <div className="flex items-center gap-2 px-2">
              <div className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[9px] font-black" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>JD</div>
              <div>
                <p className="text-[10px] font-bold" style={{ color: '#0d0a1a' }}>Jordan Dev</p>
                <p className="text-[9px]" style={{ color: '#8b90a8' }}>Pro plan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black" style={{ color: '#0d0a1a' }}>Good morning, Jordan 👋</h3>
              <p className="text-[11px]" style={{ color: '#8b90a8' }}>Monday, March 9 · 3 projects need attention</p>
            </div>
            <button className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
              + New Project
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {stats.map(({ label, value, icon: Icon, delta }) => (
              <div key={label} className="rounded-xl p-3" style={{ background: '#f8f7ff', border: '1px solid rgba(124,58,237,0.08)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#8b90a8' }}>{label}</span>
                  <Icon size={10} style={{ color: '#7c3aed' }}/>
                </div>
                <p className="text-sm font-black" style={{ color: '#0d0a1a' }}>{value}</p>
                <p className="text-[9px] mt-0.5" style={{ color: '#8b90a8' }}>{delta}</p>
              </div>
            ))}
          </div>

          {/* Projects list */}
          <p className="text-[11px] font-black mb-2" style={{ color: '#0d0a1a' }}>Active Projects</p>
          <div className="space-y-2">
            {projects.map((p) => (
              <div key={p.name} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                style={{ background: '#faf9ff', border: '1px solid rgba(124,58,237,0.07)' }}>
                <div className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0" style={{ background: p.color }}>
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold truncate" style={{ color: '#0d0a1a' }}>{p.name}</p>
                  <p className="text-[9px]" style={{ color: '#8b90a8' }}>{p.client}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div>
                    <p className="text-[10px] font-bold text-right" style={{ color: '#0d0a1a' }}>{p.amount}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="h-1.5 w-14 rounded-full overflow-hidden" style={{ background: 'rgba(124,58,237,0.1)' }}>
                        <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: p.color }}/>
                      </div>
                      <span className="text-[9px]" style={{ color: '#8b90a8' }}>{p.progress}%</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{
                    background: p.status === 'review' ? 'rgba(5,150,105,0.1)' : 'rgba(124,58,237,0.08)',
                    color: p.status === 'review' ? '#059669' : '#7c3aed',
                  }}>
                    {p.status === 'review' ? 'In review' : 'Active'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Data ─── */
const pillars = [
  { icon: FolderKanban, title: 'Project Control', description: 'Track milestones and context in one place. Stop losing work inside message threads.' },
  { icon: Files, title: 'Asset Delivery', description: 'Share files, manage versions, and expose only the client-safe surfaces you actually want visible.' },
  { icon: CheckCircle2, title: 'Approval Flows', description: 'Capture sign-offs and revision requests against specific deliverables with a clear audit trail.' },
  { icon: CreditCard, title: 'Smart Invoicing', description: 'Create invoices, monitor views, follow overdue balances, and keep billing tied to the project.' },
  { icon: Bell, title: 'Live Notifications', description: 'Get signal when clients act instead of polling inboxes, docs, and shared drives all day.' },
  { icon: ShieldCheck, title: 'Client Portal', description: 'Present a secure, branded project portal that feels more like product than a shared folder.' },
];

const testimonials = [
  { name: 'Maya Osei', role: 'UX Freelancer', avatar: 'MO', text: 'I replaced WeTransfer, Wave, and my Notion tracker in one week. My clients think I built a custom app.' },
  { name: 'James Carver', role: 'Dev Consultant', avatar: 'JC', text: 'Zero "where are we?" emails since starting PortalKit. The milestone tracker alone is worth it.' },
  { name: 'Sofia Park', role: 'Brand Strategist', avatar: 'SP', text: 'The approval workflow is a game-changer. Clients approve right on the deliverable — no more email chaos.' },
];

/* ─── Page ─── */
export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--canvas)', overflow: 'hidden' }}>
      <style>{`
        @keyframes porb { 0%,100% { transform:scale(1) translate(0,0); opacity:.7; } 50% { transform:scale(1.15) translate(10px,-20px); opacity:1; } }
        @keyframes float-up { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes badge-in { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
        @keyframes preview-in { from { opacity:0; transform:translateY(60px) rotateX(8deg); } to { opacity:1; transform:translateY(0) rotateX(0deg); } }
        @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        .anim-badge  { animation: badge-in   0.5s cubic-bezier(.16,1,.3,1) both 0.1s; }
        .anim-h1     { animation: float-up   0.7s cubic-bezier(.16,1,.3,1) both 0.25s; }
        .anim-p      { animation: float-up   0.7s cubic-bezier(.16,1,.3,1) both 0.4s; }
        .anim-cta    { animation: float-up   0.7s cubic-bezier(.16,1,.3,1) both 0.55s; }
        .anim-prev   { animation: preview-in 1s   cubic-bezier(.16,1,.3,1) both 0.7s; perspective:1200px; }
        .gradient-text {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #e879f9 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(124,58,237,0.14); }
      `}</style>

      <GridBackground />
      <SparkleCanvas />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        {/* Nav */}
        <header className="flex items-center justify-between rounded-2xl px-5 py-3.5"
          style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(124,58,237,0.12)', backdropFilter: 'blur(20px)', boxShadow: '0 1px 3px rgba(13,10,26,0.04), 0 6px 20px rgba(13,10,26,0.06)' }}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '0 0 16px rgba(124,58,237,0.35)' }}>
              <Zap size={17} strokeWidth={2.5}/>
            </span>
            <span className="text-sm font-black" style={{ color: '#0d0a1a' }}>PortalKit</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {['Features', 'Pricing', 'Docs'].map(item => (
              <a key={item} href="#" className="text-xs font-semibold" style={{ color: '#4a5068' }}>{item}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-xs font-semibold" style={{ color: '#4a5068' }}>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild size="sm" className="rounded-xl text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: 'white', boxShadow: '0 0 16px rgba(124,58,237,0.3)' }}>
              <Link href="/auth/signup">Get started free <ArrowRight size={13}/></Link>
            </Button>
          </div>
        </header>

        {/* Hero */}
        <section className="mt-20 text-center">
          <div className="anim-badge inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-8"
            style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.2)' }}>
            <Sparkles size={11}/>
            The client portal for serious freelancers
            <Sparkles size={11}/>
          </div>

          <h1 className="anim-h1 mx-auto max-w-5xl text-5xl font-black leading-[1.04] tracking-tight md:text-6xl lg:text-7xl"
            style={{ color: '#0d0a1a' }}>
            Stop juggling tools.{' '}
            <br className="hidden md:block"/>
            Start{' '}
            <span className="gradient-text">running your business.</span>
          </h1>

          <p className="anim-p mx-auto mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: '#4a5068' }}>
            PortalKit gives freelancers and studios one secure, beautiful place to run projects,
            deliver files, collect approvals, and send invoices — all under your brand.
          </p>

          <div className="anim-cta mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-xl px-8 font-bold text-sm"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: 'white', boxShadow: '0 0 30px rgba(124,58,237,0.35)', height: 48 }}>
              <Link href="/auth/signup">Create your workspace <ArrowRight size={16}/></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl px-8 font-semibold text-sm"
              style={{ borderColor: 'rgba(124,58,237,0.25)', color: '#4a5068', height: 48, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}>
              <Link href="/dashboard">View live demo</Link>
            </Button>
          </div>

          {/* Trust strip */}
          <div className="mt-6 flex items-center justify-center gap-6 flex-wrap">
            {[
              { icon: ShieldCheck, label: 'No credit card required' },
              { icon: Star, label: '5-star rated by freelancers' },
              { icon: Users, label: '2,400+ studios trust PortalKit' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#8b90a8' }}>
                <Icon size={13} style={{ color: '#7c3aed' }}/>{label}
              </div>
            ))}
          </div>
        </section>

        {/* Dashboard preview */}
        <section className="anim-prev mt-16 mx-auto max-w-5xl">
          <DashboardPreview />
          <div className="h-12 mx-10 rounded-b-3xl -mt-2 blur-xl opacity-25"
            style={{ background: 'linear-gradient(to bottom, rgba(124,58,237,0.5), transparent)' }}/>
        </section>

        {/* Numbers */}
        <section className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { value: '2,400+', label: 'Freelancers & studios' },
            { value: '$4.2M+', label: 'Invoices processed' },
            { value: '18,000+', label: 'Files delivered' },
            { value: '98%', label: 'Client satisfaction' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center rounded-2xl p-5 card-hover"
              style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(124,58,237,0.1)', backdropFilter: 'blur(8px)' }}>
              <p className="text-2xl font-black gradient-text">{value}</p>
              <p className="text-xs font-medium mt-1" style={{ color: '#8b90a8' }}>{label}</p>
            </div>
          ))}
        </section>

        {/* Features */}
        <section className="mt-24">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#7c3aed' }}>Everything included</p>
            <h2 className="text-3xl font-black md:text-4xl" style={{ color: '#0d0a1a' }}>One platform, complete workflow</h2>
            <p className="mt-3 text-base max-w-xl mx-auto" style={{ color: '#4a5068' }}>
              Built specifically for the client-facing workflow freelancers actually run, not a generic project manager with a portal bolted on.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="rounded-2xl p-6 card-hover"
                style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(124,58,237,0.1)', backdropFilter: 'blur(8px)' }}>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl mb-4"
                  style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed' }}>
                  <pillar.icon size={21}/>
                </div>
                <h3 className="text-base font-black mb-2" style={{ color: '#0d0a1a' }}>{pillar.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#4a5068' }}>{pillar.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-24">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#7c3aed' }}>Simple to start</p>
            <h2 className="text-3xl font-black md:text-4xl" style={{ color: '#0d0a1a' }}>Up and running in minutes</h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {[
              { step: '01', title: 'Create a project', desc: 'Name the project, add your client\'s email, and invite them to a dedicated portal with one click.' },
              { step: '02', title: 'Upload, approve, deliver', desc: 'Share files, request approvals, and keep revision threads attached to specific deliverables.' },
              { step: '03', title: 'Invoice and get paid', desc: 'Issue invoices directly from the project, track when they\'re viewed, and follow up on overdue balances.' },
              { step: '04', title: 'Stay organized at scale', desc: 'Use the dashboard to monitor all projects, notifications, and storage across your entire business.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4 items-start rounded-2xl p-4 card-hover"
                style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(124,58,237,0.1)', backdropFilter: 'blur(8px)' }}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-black text-white"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', boxShadow: '0 0 12px rgba(124,58,237,0.25)' }}>
                  {step}
                </span>
                <div>
                  <p className="text-sm font-black mb-1" style={{ color: '#0d0a1a' }}>{title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#4a5068' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mt-24">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#7c3aed' }}>What they say</p>
            <h2 className="text-3xl font-black md:text-4xl" style={{ color: '#0d0a1a' }}>Freelancers love PortalKit</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl p-6 card-hover"
                style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(124,58,237,0.1)', backdropFilter: 'blur(8px)' }}>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} fill="#f59e0b" style={{ color: '#f59e0b' }}/>
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#4a5068' }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-black"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-black" style={{ color: '#0d0a1a' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: '#8b90a8' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-24 mb-12">
          <div className="rounded-3xl p-12 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#7c3aed 0%,#a855f7 50%,#e879f9 100%)', boxShadow: '0 0 60px rgba(124,58,237,0.35)' }}>
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '24px 24px' }}/>
            <div className="relative z-10">
              <p className="text-xs font-black uppercase tracking-widest mb-3 text-purple-200">Ready to upgrade?</p>
              <h2 className="text-3xl font-black text-white md:text-4xl mb-4">Your clients deserve better.</h2>
              <p className="text-base text-purple-100 max-w-xl mx-auto mb-8">
                Join 2,400+ freelancers who replaced scattered tools with one polished client workspace. Free to start, no credit card required.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button asChild size="lg" className="rounded-xl px-8 font-bold text-sm bg-white"
                  style={{ color: '#7c3aed', height: 48 }}>
                  <Link href="/auth/signup">Start for free <ArrowRight size={16}/></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-xl px-8 font-semibold text-sm border-white/30 text-white"
                  style={{ height: 48, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
                  <Link href="/dashboard">See it live <ChevronRight size={16}/></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg text-white" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
              <Zap size={13} strokeWidth={2.5}/>
            </span>
            <span className="text-sm font-black" style={{ color: '#0d0a1a' }}>PortalKit</span>
          </div>
          <p className="text-xs" style={{ color: '#8b90a8' }}>&copy; {new Date().getFullYear()} PortalKit. Built for serious client operations.</p>
          <div className="flex gap-4">
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <a key={l} href="#" className="text-xs" style={{ color: '#8b90a8' }}>{l}</a>
            ))}
          </div>
        </footer>
      </div>
    </main>
  );
}
