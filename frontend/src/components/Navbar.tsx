import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Ticket, QrCode, ShieldCheck, User as UserIcon, LogOut, Sparkles, ArrowRight, Layers, Users, Clock } from 'lucide-react';

interface NavbarProps {
  currentTab: 'events' | 'my-tickets' | 'scanner' | 'admin';
  setCurrentTab: (tab: 'events' | 'my-tickets' | 'scanner' | 'admin') => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenAuthModal }) => {
  const { user, role, logout } = useAuth();

  const scrollToSection = (sectionId: string) => {
    if (currentTab !== 'events') {
      setCurrentTab('events');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">
          
          {/* ========================================================================= */}
          {/* 1. BRAND LOGO (Dataflow modern SaaS style) */}
          {/* ========================================================================= */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none" 
            onClick={() => setCurrentTab('events')}
          >
            {/* Vibrant Modern Logo Mark */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-cyan-400 p-0.5 shadow-md shadow-teal-500/20 group-hover:shadow-teal-500/35 transition-all duration-300 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="font-black text-sm text-transparent bg-clip-text bg-gradient-to-tr from-teal-400 to-cyan-200 tracking-wider">
                  S
                </span>
              </div>
            </div>

            {/* Brand Typography & Pill Badge */}
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-teal-600 transition-colors">
                SurabayaDev
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/70 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                12th Anniversary
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. CENTER MODERN NAVIGATION (Clean SaaS Links like Dataflow) */}
          {/* ========================================================================= */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            {/* Primary Tab: Katalog Acara */}
            <button
              onClick={() => {
                setCurrentTab('events');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                currentTab === 'events'
                  ? 'bg-slate-100 text-slate-950 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calendar className={`w-3.5 h-3.5 ${currentTab === 'events' ? 'text-teal-600' : 'text-slate-400'}`} />
              <span>Katalog Acara</span>
            </button>

            {/* Quick Link: Rundown & Jadwal */}
            <button
              onClick={() => scrollToSection('catalog-section')}
              className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              Jadwal Sesi
            </button>

            {/* Quick Link: Mitra Ekosistem */}
            <button
              onClick={() => scrollToSection('catalog-section')}
              className="px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              Mitra Komunitas
            </button>

            {/* When Logged In: Tiket Saya */}
            {user && (
              <button
                onClick={() => setCurrentTab('my-tickets')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  currentTab === 'my-tickets'
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Ticket className="w-3.5 h-3.5 text-teal-600" />
                <span>Tiket Saya</span>
              </button>
            )}

            {/* Role: Panitia / Admin Gate Scanner */}
            {(role === 'committee' || role === 'admin') && (
              <button
                onClick={() => setCurrentTab('scanner')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  currentTab === 'scanner'
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 shadow-2xs'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>Gate Check-In</span>
              </button>
            )}

            {/* Role: Administrator Panel */}
            {role === 'admin' && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  currentTab === 'admin'
                    ? 'bg-indigo-50 text-indigo-800 font-bold border border-indigo-200 shadow-2xs'
                    : 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Admin Console</span>
              </button>
            )}
          </nav>

          {/* ========================================================================= */}
          {/* 3. RIGHT AUTH & PROFILE CONTROLS */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-3">
            {user ? (
              /* Logged-In User Profile Capsule */
              <div className="flex items-center gap-3 pl-2">
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/90 py-1.5 px-3 rounded-2xl shadow-2xs">
                  {/* User Initial Avatar */}
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name & Role Text */}
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[130px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] font-semibold text-teal-700 capitalize leading-none">
                      {role === 'participant' ? 'Peserta' : role === 'committee' ? 'Panitia Gate' : 'Administrator'}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    logout();
                    setCurrentTab('events');
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-all"
                  title="Logout Akun"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Non-Logged In State (Dataflow modern CTA buttons) */
              <div className="flex items-center gap-2">
                {/* Secondary: Text Sign In */}
                <button
                  onClick={onOpenAuthModal}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors"
                >
                  Masuk
                </button>

                {/* Primary: Modern Dark Pill CTA Button */}
                <button
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm shadow-slate-900/10 hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <span>Daftar Akun</span>
                  <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar (Bottom Row for Small Screens) */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-200 bg-white/95 px-2 text-xs font-semibold">
        <button
          onClick={() => {
            setCurrentTab('events');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex items-center gap-1.5 py-1 px-3 rounded-lg ${
            currentTab === 'events' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-teal-600" />
          <span>Katalog</span>
        </button>

        {user && (
          <button
            onClick={() => setCurrentTab('my-tickets')}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-lg ${
              currentTab === 'my-tickets' ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-500'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-teal-600" />
            <span>Tiket</span>
          </button>
        )}

        {(role === 'committee' || role === 'admin') && (
          <button
            onClick={() => setCurrentTab('scanner')}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-lg ${
              currentTab === 'scanner' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-500'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            <span>Gate</span>
          </button>
        )}

        {role === 'admin' && (
          <button
            onClick={() => setCurrentTab('admin')}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-lg ${
              currentTab === 'admin' ? 'bg-indigo-50 text-indigo-800 font-bold' : 'text-slate-500'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};
