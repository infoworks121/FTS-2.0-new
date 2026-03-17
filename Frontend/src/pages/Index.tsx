import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  ShieldCheck, 
  BarChart3, 
  Globe2, 
  Users2, 
  Zap, 
  LayoutDashboard,
  CheckCircle
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100">
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/fts-logo.jpeg" alt="FTS Logo" className="w-12 h-12 rounded-lg" />
            <span className="text-xl font-bold tracking-tighter text-slate-900">
              FTS
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Ecosystem</a>
            <a href="#network" className="hover:text-emerald-600 transition-colors">Network</a>
            <a href="#security" className="hover:text-emerald-600 transition-colors">Security</a>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:flex font-semibold">Support</Button>
            <Button className="bg-slate-900 hover:bg-emerald-600 text-white px-6 rounded-full transition-all duration-300 shadow-xl shadow-slate-900/10" onClick={() => window.location.href = '/login'}>
              Proceed to Login
            </Button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest animate-fade-in">
            <Zap className="w-3 h-3 fill-emerald-600" />
            Now Powered by Enterprise AI
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-slate-900 max-w-5xl mx-auto leading-[0.95]">
            Digitizing the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Farm-to-Trade</span> Backbone.
          </h1>
          
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
            Farm & Tech Service is the secure multi-business ecosystem connecting administrators, dealers, and businessmen through high-fidelity digital commerce.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button className="h-14 px-10 bg-slate-900 text-lg rounded-2xl group transition-all hover:scale-105 shadow-2xl shadow-slate-900/20">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Floating Mockup Preview */}
        <div className="mt-20 max-w-6xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-800">
            <div className="flex items-center gap-2 px-6 py-4 bg-slate-800/50 border-b border-slate-700/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
              </div>
              <div className="mx-auto text-xs text-slate-500 font-mono tracking-widest uppercase">FTS_DASHBOARD_V1.0</div>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" 
              alt="Platform Dashboard" 
              className="w-full h-auto object-cover opacity-80"
            />
          </div>
        </div>
      </section>

      {/* --- ROLE ECOSYSTEM (The Bento Grid) --- */}
      <section id="features" className="py-24 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4 text-left">
              <h2 className="text-4xl font-bold tracking-tight">Unified Multi-Role Portal</h2>
              <p className="text-slate-500 max-w-md">One platform. Five distinct experiences tailored to your specific role in the supply chain.</p>
            </div>
            <div className="flex gap-2">
              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm"><LayoutDashboard className="text-emerald-600" /></div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm"><ShieldCheck className="text-emerald-600" /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Admin Card */}
            <div className="md:col-span-2 bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 group">
               <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Control Center</span>
                    <h3 className="text-3xl font-bold">Administrator</h3>
                    <p className="text-slate-500 max-w-xs leading-relaxed">Global oversight, user management, and core system configuration for the entire ecosystem.</p>
                    <ul className="grid grid-cols-2 gap-y-2 pt-4">
                      {['User Audits', 'API Access', 'Revenue Logs', 'System Health'].map(item => (
                        <li key={item} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                          <CheckCircle className="w-4 h-4 text-emerald-500" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="hidden lg:block w-48 h-48 bg-slate-50 rounded-2xl rotate-3 group-hover:rotate-6 transition-transform overflow-hidden border border-slate-100">
                     <BarChart3 className="w-full h-full p-12 text-emerald-100" />
                  </div>
               </div>
            </div>

            {/* Core Body Card */}
            <div className="bg-slate-900 p-10 rounded-[2rem] text-white space-y-6 flex flex-col justify-between">
              <Users2 className="w-12 h-12 text-emerald-400" />
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Core Body & Dealers</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Manage regional distribution, inventory stock, and dealer networks with real-time sync.</p>
              </div>
              <Button variant="link" className="text-emerald-400 p-0 self-start group">
                Access Dealer Portal <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Businessman/Customer Cards */}
            <div className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
               <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="text-amber-600" />
               </div>
               <h3 className="text-xl font-bold">Businessman</h3>
               <p className="text-slate-500 text-sm italic">"High-volume trade management and stakeholder reporting."</p>
            </div>

            <div className="md:col-span-2 bg-emerald-600 p-10 rounded-[2rem] text-white flex flex-col md:flex-row items-center gap-10">
               <div className="space-y-4">
                <h3 className="text-3xl font-bold leading-tight">Consumer Trust <br />Direct Access.</h3>
                <p className="text-emerald-50/80">Every customer gets a dedicated portal to track orders, manage payments, and view tech-service logs.</p>
               </div>
               <div className="flex-shrink-0 w-full md:w-64 h-32 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-4xl">
                 99.9%
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <img src="/fts-logo.jpeg" alt="FTS Logo" className="w-8 h-8 rounded" />
              <span className="text-xl font-bold tracking-tighter">FarmTech</span>
            </div>
            <p className="text-slate-500 max-w-sm">The world's most advanced digital distribution network for agricultural and technical services.</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold uppercase text-xs tracking-widest text-slate-400">Platform</h4>
            <ul className="space-y-2 text-sm font-medium text-slate-600">
              <li><a href="#" className="hover:text-emerald-600">Dashboard</a></li>
              <li><a href="#" className="hover:text-emerald-600">API Documentation</a></li>
              <li><a href="#" className="hover:text-emerald-600">Security Layers</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold uppercase text-xs tracking-widest text-slate-400">Company</h4>
            <ul className="space-y-2 text-sm font-medium text-slate-600">
              <li><a href="#" className="hover:text-emerald-600">About FTS</a></li>
              <li><a href="#" className="hover:text-emerald-600">Compliance</a></li>
              <li><a href="#" className="hover:text-emerald-600">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 Farm & Tech Service. All rights reserved.</p>
          <div className="flex gap-6 font-bold uppercase tracking-tighter">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}