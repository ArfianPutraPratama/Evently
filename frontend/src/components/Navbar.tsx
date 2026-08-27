import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Ticket, QrCode, ShieldCheck, User as UserIcon, LogOut, Sparkles } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: 'events' | 'my-tickets' | 'scanner' | 'admin';
  setCurrentTab: (tab: 'events' | 'my-tickets' | 'scanner' | 'admin') => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenAuthModal }) => {
  const { user, role, logout, quickSwitchRole } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-nav-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand (Dataflow soft tech style) */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none" 
            onClick={() => setCurrentTab('events')}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-cyan-400 p-0.5 shadow-sm shadow-teal-500/20 flex items-center justify-center text-white font-black text-sm">
              S
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900 group-hover:text-teal-600 transition-colors">
                SurabayaDev
              </span>
              <span className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full badge-pill-teal">
                12th Anniversary
              </span>
            </div>
          </div>

          {/* Segmented Soft Tabs */}
          <nav className="hidden md:flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs font-medium">
            <button
              onClick={() => setCurrentTab('events')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                currentTab === 'events'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              Katalog Acara
            </button>

            {user && (
              <button
                onClick={() => setCurrentTab('my-tickets')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                  currentTab === 'my-tickets'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Ticket className="w-3.5 h-3.5 text-teal-600" />
                Tiket Saya
              </button>
            )}

            {(role === 'committee' || role === 'admin') && (
              <button
                onClick={() => setCurrentTab('scanner')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                  currentTab === 'scanner'
                    ? 'bg-white text-teal-700 shadow-sm font-semibold border border-teal-200/60'
                    : 'text-slate-600 hover:text-teal-700'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-teal-600" />
                Gate Check-In
              </button>
            )}

            {role === 'admin' && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                  currentTab === 'admin'
                    ? 'bg-white text-indigo-700 shadow-sm font-semibold border border-indigo-200/60'
                    : 'text-slate-600 hover:text-indigo-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Admin Console
              </button>
            )}
          </nav>

          {/* Right Controls: Role Switcher & Auth */}
          <div className="flex items-center gap-3">

            {/* Auth Profile / Login */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[130px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-medium text-teal-600 capitalize">
                    {role === 'participant' ? 'Peserta' : role === 'committee' ? 'Panitia Gate' : 'Administrator'}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-all"
                  title="Logout Akun"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Tab Row */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-200 bg-white/95 px-2 text-xs font-medium">
        <button
          onClick={() => setCurrentTab('events')}
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
              currentTab === 'my-tickets' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-500'
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
              currentTab === 'scanner' ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-500'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-teal-600" />
            <span>Gate</span>
          </button>
        )}

        {role === 'admin' && (
          <button
            onClick={() => setCurrentTab('admin')}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-lg ${
              currentTab === 'admin' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500'
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
