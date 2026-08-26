import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { EventItem, Registration, Ticket } from './types';
import { Navbar } from './components/Navbar';
import { EventCard } from './components/EventCard';
import { EventDetailModal } from './components/EventDetailModal';
import { RegistrationModal } from './components/RegistrationModal';
import { TicketPassModal } from './components/TicketPassModal';
import { CommitteeScanner } from './components/CommitteeScanner';
import { AdminDashboard } from './components/AdminDashboard';
import { MyTicketsView } from './components/MyTicketsView';
import { AuthModal } from './components/AuthModal';
import { Search, Sparkles, Calendar, ShieldCheck, Zap, ArrowRight, Loader2, Heart } from 'lucide-react';

export const App: React.FC = () => {
  const { user, role } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<'events' | 'my-tickets' | 'scanner' | 'admin'>('events');

  // Events & Catalog State
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Modals
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventItem | null>(null);
  const [selectedEventForRegister, setSelectedEventForRegister] = useState<EventItem | null>(null);
  const [activeTicketRegistration, setActiveTicketRegistration] = useState<Registration | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const data = await api.getEvents(searchQuery, selectedCategory);
      setEvents(data.events);
      if (data.categories.length > 0 && categories.length === 0) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.error('Failed to fetch events', e);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRegistrationSuccess = (res: { registration: Registration; ticket: Ticket; event: EventItem }) => {
    // Update local event count
    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === res.event.id
          ? {
              ...evt,
              registered_count: res.event.registered_count,
              remaining_quota: res.event.remaining_quota,
              is_sold_out: res.event.is_sold_out,
              is_user_registered: true,
            }
          : evt
      )
    );
    // Show digital ticket pass modal immediately!
    setActiveTicketRegistration({
      ...res.registration,
      event: res.event,
      user: user || undefined,
      ticket: res.ticket,
    });
  };

  const handleViewExistingTicket = async (event: EventItem) => {
    try {
      const myTickets = await api.getMyTickets();
      const match = myTickets.find((t) => t.event_id === event.id);
      if (match) {
        setActiveTicketRegistration(match);
      } else {
        alert('Tiket tidak ditemukan di akun Anda.');
      }
    } catch (e: any) {
      alert('Gagal mengambil tiket: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Header Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-grow">
        {currentTab === 'events' && (
          <div className="space-y-12 pb-16">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-gradient-to-b from-indigo-950/25 via-slate-950 to-slate-950">
              <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
              <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

              <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>12 Tahun Membangun Talenta Digital Kota Pahlawan</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
                  Rayakan Inovasi di{' '}
                  <span className="bg-gradient-to-r from-amber-400 via-indigo-300 to-indigo-500 bg-clip-text text-transparent">
                    SurabayaDev 12th
                  </span>{' '}
                  Anniversary
                </h1>

                <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                  Platform resmi pendaftaran conference, hands-on workshop, hackathon, dan masterclass.
                  Dapatkan tiket digital ber-QR Code dengan verifikasi instan di venue.
                </p>

                {/* Key Metrics / Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-4 text-left">
                  <div className="p-3.5 rounded-2xl glass-panel border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Kapasitas</span>
                    <span className="text-xl font-extrabold text-white">1.000+</span>
                    <span className="text-[10px] text-indigo-400 block mt-0.5">Peserta Target</span>
                  </div>

                  <div className="p-3.5 rounded-2xl glass-panel border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Teknologi</span>
                    <span className="text-xl font-extrabold text-white">Full-Stack</span>
                    <span className="text-[10px] text-amber-400 block mt-0.5">React + Laravel</span>
                  </div>

                  <div className="p-3.5 rounded-2xl glass-panel border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Basis Data</span>
                    <span className="text-xl font-extrabold text-white">PostgreSQL</span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">Row-Lock Quota</span>
                  </div>

                  <div className="p-3.5 rounded-2xl glass-panel border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Gate Access</span>
                    <span className="text-xl font-extrabold text-white">Anti-Dup</span>
                    <span className="text-[10px] text-rose-400 block mt-0.5">HMAC QR Pass</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Catalog Discovery Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              {/* Search and Filters Bar */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-3xl glass-panel border border-slate-800">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      selectedCategory === 'all'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800'
                    }`}
                  >
                    Semua Kategori
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari event, pembicara, venue..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Event Cards Grid */}
              {isLoadingEvents ? (
                <div className="py-20 text-center text-slate-400 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
                  <p className="text-xs">Memuat katalog acara SurabayaDev...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="p-12 rounded-3xl glass-panel border border-slate-800 text-center space-y-3">
                  <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
                  <h3 className="text-base font-bold text-white">Event Tidak Ditemukan</h3>
                  <p className="text-xs text-slate-400">
                    Tidak ada event yang cocok dengan kata kunci "{searchQuery}". Coba kata kunci lain atau reset filter.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((evt) => (
                    <EventCard
                      key={evt.id}
                      event={evt}
                      onSelect={(e) => setSelectedEventForDetail(e)}
                      onViewTicket={(e) => handleViewExistingTicket(e)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {currentTab === 'my-tickets' && (
          <MyTicketsView
            onOpenTicketPass={(reg) => setActiveTicketRegistration(reg)}
            onExploreEvents={() => setCurrentTab('events')}
          />
        )}

        {currentTab === 'scanner' && <CommitteeScanner />}

        {currentTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Modals */}
      <EventDetailModal
        event={selectedEventForDetail}
        isOpen={!!selectedEventForDetail}
        onClose={() => setSelectedEventForDetail(null)}
        onRegisterClick={(evt) => setSelectedEventForRegister(evt)}
        onViewTicketClick={(evt) => handleViewExistingTicket(evt)}
      />

      <RegistrationModal
        event={selectedEventForRegister}
        isOpen={!!selectedEventForRegister}
        onClose={() => setSelectedEventForRegister(null)}
        onSuccess={handleRegistrationSuccess}
        onRequireAuth={() => {
          setSelectedEventForRegister(null);
          setIsAuthModalOpen(true);
        }}
      />

      <TicketPassModal
        registration={activeTicketRegistration}
        isOpen={!!activeTicketRegistration}
        onClose={() => setActiveTicketRegistration(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Global Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
            <span className="font-bold text-slate-200">SurabayaDev 12th Anniversary</span>
            <span className="text-slate-600">•</span>
            <span>Technical Assessment Divisi Developer</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
            <span>Tech Stack: React 19 + TypeScript + Vite + Tailwind + Laravel 11 + PostgreSQL 18</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
