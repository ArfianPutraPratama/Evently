import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Ticket, QrCode, ShieldCheck, User as UserIcon, LogOut } from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: 'events' | 'my-tickets' | 'scanner' | 'admin';
  setCurrentTab: (tab: 'events' | 'my-tickets' | 'scanner' | 'admin') => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenAuthModal }) => {
  const { user, role, logout, quickSwitchRole } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Minimalist Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none" 
            onClick={() => setCurrentTab('events')}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-slate-900 p-px shadow-sm">
              <div className="w-full h-full bg-[#090a0f] rounded-[11px] flex items-center justify-center">
                <span className="font-mono font-black text-sm text-indigo-400">S</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                Evently
              </span>
              <span className="text-[10px] font-medium tracking-wide px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400">
                SurabayaDev 12th
              </span>
            </div>
          </div>

          {/* Minimalist Segmented Tabs */}
          <nav className="hidden md:flex items-center bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
            <button
              onClick={() => setCurrentTab('events')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'events'
                  ? 'bg-white/[0.08] text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 opacity-70" />
              Katalog Acara
            </button>

            {user && (
              <button
                onClick={() => setCurrentTab('my-tickets')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'my-tickets'
                    ? 'bg-white/[0.08] text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Ticket className="w-3.5 h-3.5 opacity-70" />
                Tiket Saya
              </button>
            )}

            {(role === 'committee' || role === 'admin') && (
              <button
                onClick={() => setCurrentTab('scanner')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'scanner'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 font-semibold'
                    : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 opacity-70" />
                Gate Check-In
              </button>
            )}

            {role === 'admin' && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentTab === 'admin'
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 font-semibold'
                    : 'text-slate-400 hover:text-indigo-400'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 opacity-70" />
                Admin Panel
              </button>
            )}
          </nav>

          {/* Right Controls: Role Pill Switcher & Auth */}
          <div className="flex items-center gap-3">
            {/* Quick Role Switcher */}
            <div className="hidden lg:flex items-center bg-white/[0.03] p-0.5 rounded-lg border border-white/[0.06] text-[11px]">
              <span className="text-slate-500 text-[10px] uppercase font-semibold px-2 py-0.5">Role:</span>
              {(['participant', 'committee', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => quickSwitchRole(r)}
                  className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
                    role === r
                      ? 'bg-white/[0.1] text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={`Uji coba peran ${r}`}
                >
                  {r === 'participant' ? 'Peserta' : r === 'committee' ? 'Panitia' : 'Admin'}
                </button>
              ))}
            </div>

            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono capitalize">{user.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl bg-white/[0.03] hover:bg-rose-500/10 hover:text-rose-400 border border-white/[0.06] text-slate-400 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold shadow-sm transition-all"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Masuk
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-white/[0.06] bg-[#090a0f] text-xs">
        <button
          onClick={() => setCurrentTab('events')}
          className={`flex flex-col items-center gap-1 py-1 ${currentTab === 'events' ? 'text-white font-semibold' : 'text-slate-400'}`}
        >
          <Calendar className="w-4 h-4" />
          <span>Katalog</span>
        </button>
        {user && (
          <button
            onClick={() => setCurrentTab('my-tickets')}
            className={`flex flex-col items-center gap-1 py-1 ${currentTab === 'my-tickets' ? 'text-white font-semibold' : 'text-slate-400'}`}
          >
            <Ticket className="w-4 h-4" />
            <span>Tiket</span>
          </button>
        )}
        {(role === 'committee' || role === 'admin') && (
          <button
            onClick={() => setCurrentTab('scanner')}
            className={`flex flex-col items-center gap-1 py-1 ${currentTab === 'scanner' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}
          >
            <QrCode className="w-4 h-4" />
            <span>Gate</span>
          </button>
        )}
        {role === 'admin' && (
          <button
            onClick={() => setCurrentTab('admin')}
            className={`flex flex-col items-center gap-1 py-1 ${currentTab === 'admin' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};
