import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { EventItem, Registration, Ticket } from './types';
import { Navbar } from './components/Navbar';
import { EventCard } from './components/EventCard';
import { EventDetailModal } from './components/EventDetailModal';
import { RegistrationModal } from './components/RegistrationModal';
import { TicketPassModal } from './components/TicketPassModal';
import { CertificateModal } from './components/CertificateModal';
import { CommitteeScanner } from './components/CommitteeScanner';
import { AdminDashboard } from './components/AdminDashboard';
import { MyTicketsView } from './components/MyTicketsView';
import { AuthModal } from './components/AuthModal';
import { Search, Loader2, X, Clock } from 'lucide-react';

export const App: React.FC = () => {
  const { user } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<'events' | 'my-tickets' | 'scanner' | 'admin'>('events');
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  // Events & Catalog State
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Modals State
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventItem | null>(null);
  const [selectedEventForRegister, setSelectedEventForRegister] = useState<EventItem | null>(null);
  const [activeTicketRegistration, setActiveTicketRegistration] = useState<Registration | null>(null);
  const [activeCertificateRegistration, setActiveCertificateRegistration] = useState<Registration | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Countdown to SurabayaDev 12th Anniversary Gate Opening (12 September 2026 08:30 WIB)
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 16,
    hours: 14,
    minutes: 30,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date('2026-09-12T08:30:00+07:00').getTime();
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRegistrationSuccess = (res: { registration: Registration; ticket: Ticket; event: EventItem }) => {
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
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Sleek Minimalist Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Live Announcement Banner */}
      {showAnnouncement && (
        <div className="bg-indigo-500/[0.08] border-b border-indigo-500/20 text-xs py-2 px-4 relative flex items-center justify-center gap-2 animate-fade-in print:hidden">
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px] tracking-wider uppercase inline-flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Notice
          </span>
          <span className="text-zinc-300 font-medium text-[11px] sm:text-xs truncate sm:overflow-visible">
            📢 Pintu Gate Dyandra Convention Center dibuka pukul 08.00 WIB • Harap siapkan QR Code tiket digital Anda untuk mempercepat validasi presensi.
          </span>
          <button
            onClick={() => setShowAnnouncement(false)}
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 transition-colors ml-2"
            title="Tutup pengumuman"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Tab Content */}
      <main className="flex-grow">
        {currentTab === 'events' && (
          <div className="space-y-12 pb-20">
            {/* Minimalist Hero Section with Countdown */}
            <section className="relative pt-14 pb-12 px-4 sm:px-6 lg:px-8 border-b border-white/[0.05] bg-subtle-dots">
              <div className="max-w-4xl mx-auto text-center space-y-5">
                {/* Indicator Pill */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-zinc-400 text-[11px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>SurabayaDev 12th Anniversary • Official Event Platform</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.2]">
                  Merayakan 12 Tahun Perjalanan <br className="hidden sm:block" />
                  <span className="text-zinc-400 font-normal">Komunitas Developer Kota Surabaya</span>
                </h1>

                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
                  Pendaftaran resmi sesi Conference, Hands-on Workshop, Hackathon, dan Masterclass dengan sistem tiket digital ber-QR Code terenkripsi.
                </p>

                {/* Live Ticking Countdown Timer */}
                <div className="pt-2 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    Hitung Mundur Pembukaan Gate Dyandra:
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center min-w-[56px]">
                      <span className="text-lg font-black text-white block">{timeLeft.days}</span>
                      <span className="text-[9px] text-zinc-500 uppercase font-sans">Hari</span>
                    </div>
                    <span className="text-zinc-600 font-bold">:</span>
                    <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center min-w-[56px]">
                      <span className="text-lg font-black text-white block">{timeLeft.hours}</span>
                      <span className="text-[9px] text-zinc-500 uppercase font-sans">Jam</span>
                    </div>
                    <span className="text-zinc-600 font-bold">:</span>
                    <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center min-w-[56px]">
                      <span className="text-lg font-black text-white block">{timeLeft.minutes}</span>
                      <span className="text-[9px] text-zinc-500 uppercase font-sans">Menit</span>
                    </div>
                    <span className="text-zinc-600 font-bold">:</span>
                    <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center min-w-[56px]">
                      <span className="text-lg font-black text-indigo-400 block">{String(timeLeft.seconds).padStart(2, '0')}</span>
                      <span className="text-[9px] text-zinc-500 uppercase font-sans">Detik</span>
                    </div>
                  </div>
                </div>

                {/* Minimalist Stat Strip */}
                <div className="pt-4 grid grid-cols-3 max-w-lg mx-auto divide-x divide-white/[0.08] border-y border-white/[0.06] py-3 text-center">
                  <div>
                    <span className="text-lg sm:text-xl font-bold text-white block">1.000+</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Kuota Peserta</span>
                  </div>
                  <div>
                    <span className="text-lg sm:text-xl font-bold text-white block">PostgreSQL</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Row Lock Quota</span>
                  </div>
                  <div>
                    <span className="text-lg sm:text-xl font-bold text-white block">Anti-Dup</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Gate Check-In</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Catalog Discovery Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              {/* Refined Search & Filter Toolbar */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2">
                {/* Minimal Category Buttons */}
                <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                      selectedCategory === 'all'
                        ? 'bg-white text-zinc-950 font-semibold'
                        : 'text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06]'
                    }`}
                  >
                    Semua
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-white text-zinc-950 font-semibold'
                          : 'text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Minimal Search Input */}
                <div className="relative w-full md:w-72">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari acara atau topik..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 transition-all"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Event Cards Grid */}
              {isLoadingEvents ? (
                <div className="py-20 text-center text-zinc-400 space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-400" />
                  <p className="text-xs">Memuat katalog acara...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="p-12 rounded-2xl border border-white/[0.06] text-center space-y-2 max-w-sm mx-auto">
                  <h3 className="text-sm font-semibold text-white">Event Tidak Ditemukan</h3>
                  <p className="text-xs text-zinc-500">
                    Tidak ada event dengan kata kunci "{searchQuery}".
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

              {/* Community Ecosystem & Partners Showcase */}
              <div className="pt-12 border-t border-white/[0.06] space-y-4">
                <div className="text-center space-y-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                    Jejaring Ekosistem & Community Partners
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Didukung oleh komunitas developer, inkubator teknologi, dan perguruan tinggi terkemuka di Jawa Timur
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
                  {[
                    { name: 'GDG Surabaya', tag: 'Google Developer Group' },
                    { name: 'AWS User Group', tag: 'East Java Cloud' },
                    { name: 'Flutter Surabaya', tag: 'Mobile Ecosystem' },
                    { name: 'ITS Surabaya', tag: 'Informatika & Vokasi' },
                    { name: 'UNAIR Surabaya', tag: 'Sains & Data' },
                    { name: 'DILo Surabaya', tag: 'Digital Lounge Hub' },
                    { name: 'Startup East Java', tag: 'Tech Collective' },
                  ].map((partner, pIdx) => (
                    <div
                      key={pIdx}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] text-center space-y-0.5 transition-all group"
                    >
                      <span className="font-semibold text-xs text-zinc-300 group-hover:text-white block transition-colors">
                        {partner.name}
                      </span>
                      <span className="text-[9px] text-zinc-600 block truncate">
                        {partner.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {currentTab === 'my-tickets' && (
          <MyTicketsView
            onOpenTicketPass={(reg) => setActiveTicketRegistration(reg)}
            onOpenCertificate={(reg) => setActiveCertificateRegistration(reg)}
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
        onOpenCertificate={(reg) => setActiveCertificateRegistration(reg)}
      />

      <CertificateModal
        registration={activeCertificateRegistration}
        isOpen={!!activeCertificateRegistration}
        onClose={() => setActiveCertificateRegistration(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-white/[0.05] bg-[#090a0f] py-6 px-4 sm:px-6 lg:px-8 text-xs text-zinc-500 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-300">SurabayaDev 12th Anniversary</span>
            <span>•</span>
            <span>Developer Team Technical Assessment</span>
          </div>

          <div className="font-mono text-zinc-600">
            React + TypeScript + Laravel + PostgreSQL
          </div>
        </div>
      </footer>
    </div>
  );
};
