import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Ticket, QrCode, ShieldCheck, User as UserIcon, LogOut, Calendar, Layers } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: 'events' | 'my-tickets' | 'scanner' | 'admin';
  setCurrentTab: (tab: 'events' | 'my-tickets' | 'scanner' | 'admin') => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenAuthModal }) => {
  const { user, role, logout, quickSwitchRole } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('events')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 p-0.5 shadow-lg shadow-indigo-500/25">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  Evently
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-indigo-500/20 border border-amber-500/30 text-amber-300">
                  12th Anniv
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                SurabayaDev Community Ecosystem
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setCurrentTab('events')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'events'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Jelajah Event
            </button>

            {user && (
              <button
                onClick={() => setCurrentTab('my-tickets')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  currentTab === 'my-tickets'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                Tiket Saya
              </button>
            )}

            {(role === 'committee' || role === 'admin') && (
              <button
                onClick={() => setCurrentTab('scanner')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  currentTab === 'scanner'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                Gate Check-In
              </button>
            )}

            {role === 'admin' && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  currentTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-purple-400 hover:bg-slate-800/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Panel
              </button>
            )}
          </nav>

          {/* Reviewer Quick Role Switcher & Auth Section */}
          <div className="flex items-center gap-2.5">
            {/* Quick Role Switcher (Crucial for testing) */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-900/90 px-2 py-1 rounded-xl border border-slate-800 text-[11px]">
              <span className="text-slate-500 font-medium px-1 flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-400" />
                Role:
              </span>
              {(['participant', 'committee', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => quickSwitchRole(r)}
                  className={`px-2 py-0.5 rounded-lg capitalize font-medium transition-all ${
                    role === r
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={`Login instan sebagai ${r}`}
                >
                  {r === 'participant' ? 'Peserta' : r === 'committee' ? 'Panitia' : 'Admin'}
                </button>
              ))}
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                  <p className="text-[10px] text-indigo-400 capitalize font-mono">{user.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Masuk / Daftar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Row */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800/80 bg-slate-950/80 px-2 text-xs">
        <button
          onClick={() => setCurrentTab('events')}
          className={`flex flex-col items-center gap-1 py-1 ${currentTab === 'events' ? 'text-indigo-400' : 'text-slate-400'}`}
        >
          <Calendar className="w-4 h-4" />
          <span>Katalog</span>
        </button>
        {user && (
          <button
            onClick={() => setCurrentTab('my-tickets')}
            className={`flex flex-col items-center gap-1 py-1 ${currentTab === 'my-tickets' ? 'text-indigo-400' : 'text-slate-400'}`}
          >
            <Ticket className="w-4 h-4" />
            <span>Tiket</span>
          </button>
        )}
        {(role === 'committee' || role === 'admin') && (
          <button
            onClick={() => setCurrentTab('scanner')}
            className={`flex flex-col items-center gap-1 py-1 ${currentTab === 'scanner' ? 'text-emerald-400' : 'text-slate-400'}`}
          >
            <QrCode className="w-4 h-4" />
            <span>Gate</span>
          </button>
        )}
        {role === 'admin' && (
          <button
            onClick={() => setCurrentTab('admin')}
            className={`flex flex-col items-center gap-1 py-1 ${currentTab === 'admin' ? 'text-purple-400' : 'text-slate-400'}`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};
