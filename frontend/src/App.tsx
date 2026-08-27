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
import { Search, Loader2, X, Clock, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Star, Users, Calendar, MapPin } from 'lucide-react';

export const App: React.FC = () => {
  const { user } = useAuth();

  // Persistent Navigation State (preserves active tab across browser refreshes)
  const getInitialTab = (): 'events' | 'my-tickets' | 'scanner' | 'admin' => {
    const hash = window.location.hash.replace('#', '');
    if (['events', 'my-tickets', 'scanner', 'admin'].includes(hash)) {
      return hash as any;
    }
    const saved = localStorage.getItem('evently_active_tab');
    if (saved && ['events', 'my-tickets', 'scanner', 'admin'].includes(saved)) {
      return saved as any;
    }
    return 'events';
  };

  const [currentTab, setCurrentTabState] = useState<'events' | 'my-tickets' | 'scanner' | 'admin'>(getInitialTab);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  const setCurrentTab = (tab: 'events' | 'my-tickets' | 'scanner' | 'admin') => {
    setCurrentTabState(tab);
    localStorage.setItem('evently_active_tab', tab);
    try {
      if (tab === 'events') {
        window.history.replaceState(null, '', window.location.pathname);
      } else {
        window.history.replaceState(null, '', `#${tab}`);
      }
    } catch {}
  };

  // Sync with browser Back/Forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['events', 'my-tickets', 'scanner', 'admin'].includes(hash)) {
        setCurrentTabState(hash as any);
        localStorage.setItem('evently_active_tab', hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // When user is not logged in, redirect restricted tabs back to 'events'
  useEffect(() => {
    if (!user && (currentTab === 'my-tickets' || currentTab === 'scanner' || currentTab === 'admin')) {
      setCurrentTab('events');
    }
  }, [user]);

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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between selection:bg-teal-500/20 selection:text-teal-900">
      {/* Top Soft Notice Banner */}
      {showAnnouncement && (
        <div className="bg-teal-50 border-b border-teal-200/70 text-xs py-2 px-4 relative flex items-center justify-center gap-2 animate-fade-in print:hidden">
          <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold text-[10px] tracking-wider uppercase inline-flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
            Live Notice
          </span>
          <span className="text-teal-900 font-medium text-[11px] sm:text-xs truncate sm:overflow-visible">
            📢 Pintu Gate Dyandra Convention Center dibuka pukul 08.00 WIB • Harap siapkan QR Code tiket digital Anda untuk mempercepat validasi presensi.
          </span>
          <button
            onClick={() => setShowAnnouncement(false)}
            className="p-1 rounded-md text-teal-600 hover:text-teal-900 transition-colors ml-2"
            title="Tutup pengumuman"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Modern Soft Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-grow print:hidden">
        {currentTab === 'events' && (
          <div className="space-y-12 pb-20">
            {/* ========================================================================= */}
            {/* HERO SECTION (Dataflow soft modern style) */}
            {/* ========================================================================= */}
            <section className="relative bg-white pt-14 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 overflow-hidden">
              {/* Soft background glow */}
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />
              <div className="absolute top-1/3 left-10 w-72 h-72 bg-cyan-100/40 rounded-full blur-2xl -z-10 pointer-events-none" />

              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left Column: Content */}
                <div className="lg:col-span-7 space-y-6 text-left">
                  {/* Indicator Pill */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-pill-teal text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>SurabayaDev 12th Anniversary • Official Event Platform</span>
                  </div>

                  {/* Headline */}
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                    Bangun Ekosistem <br />
                    <span className="text-gradient-teal">Developer Masa Depan</span> <br />
                    dengan Penuh Keyakinan
                  </h1>

                  {/* Subtitle */}
                  <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed font-normal">
                    Pendaftaran resmi sesi Conference, Hands-on Workshop, Hackathon, dan Masterclass dengan sistem tiket digital ber-QR Code terenkripsi dan penjaminan kuota anti-race condition.
                  </p>

                  {/* CTA Buttons Row */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        const el = document.getElementById('catalog-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                    >
                      <span>Daftar Acara Sekarang</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (events.length > 0) setSelectedEventForDetail(events[0]);
                      }}
                      className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-all"
                    >
                      Lihat Rundown Sesi
                    </button>
                  </div>

                  {/* Social Proof Avatars Strip */}
                  <div className="pt-4 flex items-center gap-3">
                    <div className="flex -space-x-2 overflow-hidden">
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-indigo-500 text-white flex items-center justify-center font-bold text-[10px]">
                        BK
                      </div>
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-teal-500 text-white flex items-center justify-center font-bold text-[10px]">
                        SA
                      </div>
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-rose-500 text-white flex items-center justify-center font-bold text-[10px]">
                        PW
                      </div>
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-amber-500 text-white flex items-center justify-center font-bold text-[10px]">
                        RH
                      </div>
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block">1.000+ Peserta Terdaftar</span>
                      <span className="text-slate-500 text-[11px]">Developer, Mahasiswa & Tech Leaders Surabaya</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Interactive Visual Card & Live Countdown */}
                <div className="lg:col-span-5 relative">
                  <div className="card-soft rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white via-slate-50 to-teal-50/30 border border-slate-200 shadow-xl space-y-6 relative">
                    {/* Floating Status Tag (Top-Right) */}
                    <div className="absolute -top-3 -right-3 px-3 py-1.5 rounded-xl bg-white border border-teal-200 shadow-md flex items-center gap-1.5 text-xs font-bold text-teal-800">
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                      <span>KUOTA 1.000+ KURSI</span>
                    </div>

                    {/* Header of Badge Card */}
                    <div className="space-y-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                          STATUS EVENT HARI-H
                        </span>
                        <h3 className="text-xl font-extrabold text-slate-900">
                          Dyandra Convention Center
                        </h3>
                        <p className="text-xs text-slate-500">
                          12 September 2026 • Jl. Basuki Rahmat No. 93-105, Surabaya
                        </p>
                      </div>

                      {/* Prominent Direct Navigation & Calendar Action Strip */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <a
                          href="https://www.google.com/maps/search/?api=1&query=Dyandra+Convention+Center+Surabaya"
                          target="_blank"
                          rel="noreferrer"
                          className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                          title="Buka rute peta di Google Maps"
                        >
                          <MapPin className="w-3.5 h-3.5 text-rose-600 group-hover:animate-bounce" />
                          <span>Peta Maps ↗</span>
                        </a>

                        <a
                          href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('SurabayaDev 12th Anniversary Tech Summit & Community Gathering')}&dates=20260912T010000Z/20260912T100000Z&details=${encodeURIComponent('Peringatan 12 tahun SurabayaDev: Tech Summit & Community Gathering')}&location=${encodeURIComponent('Dyandra Convention Center, Jl. Basuki Rahmat No. 93-105, Surabaya')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs group"
                          title="Simpan jadwal acara ke Google Calendar"
                        >
                          <Calendar className="w-3.5 h-3.5 text-teal-600 group-hover:animate-bounce" />
                          <span>+ Kalender</span>
                        </a>
                      </div>
                    </div>

                    {/* Live Ticking Countdown Timer */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        Hitung Mundur Pembukaan Gate:
                      </span>
                      <div className="grid grid-cols-4 gap-2 text-center font-mono">
                        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                          <span className="text-2xl font-black text-slate-900 block">{timeLeft.days}</span>
                          <span className="text-[9px] text-slate-500 uppercase font-sans font-semibold">Hari</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                          <span className="text-2xl font-black text-slate-900 block">{timeLeft.hours}</span>
                          <span className="text-[9px] text-slate-500 uppercase font-sans font-semibold">Jam</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                          <span className="text-2xl font-black text-slate-900 block">{timeLeft.minutes}</span>
                          <span className="text-[9px] text-slate-500 uppercase font-sans font-semibold">Menit</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-white border border-teal-300 shadow-xs bg-teal-50/40">
                          <span className="text-2xl font-black text-teal-600 block">{String(timeLeft.seconds).padStart(2, '0')}</span>
                          <span className="text-[9px] text-teal-700 uppercase font-sans font-semibold">Detik</span>
                        </div>
                      </div>
                    </div>

                    {/* Floating Status Tag (Bottom-Left) */}
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-slate-200/70">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-teal-600" />
                        <span className="font-semibold text-slate-900">Anti-Race Condition</span>
                      </div>
                      <span className="font-mono text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        PostgreSQL Row Lock
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ========================================================================= */}
            {/* CONTRAST METRICS STRIP (Deep Dark Bar like Dataflow reference image) */}
            {/* ========================================================================= */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl bg-[#0b0f19] text-white p-8 sm:p-12 shadow-2xl border border-slate-800">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
                  <div className="space-y-1">
                    <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 block">
                      1.000+
                    </span>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Kuota Pendaftar
                    </span>
                    <span className="text-[11px] text-slate-500">Kapasitas resmi 4 sesi</span>
                  </div>

                  <div className="space-y-1 pt-4 lg:pt-0">
                    <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 block">
                      99.99%
                    </span>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Akurasi Presensi Gate
                    </span>
                    <span className="text-[11px] text-slate-500">Pencegahan tiket ganda</span>
                  </div>

                  <div className="space-y-1 pt-4 lg:pt-0">
                    <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 block">
                      12+
                    </span>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Tahun Berdiri
                    </span>
                    <span className="text-[11px] text-slate-500">Perjalanan komunitas sejak 2014</span>
                  </div>

                  <div className="space-y-1 pt-4 lg:pt-0">
                    <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 block">
                      40+
                    </span>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Narasumber & Mentor
                    </span>
                    <span className="text-[11px] text-slate-500">Praktisi teknologi terkemuka</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* CATALOG DISCOVERY SECTION */}
            {/* ========================================================================= */}
            <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-4">
              {/* Section Header */}
              <div className="text-center space-y-2 max-w-2xl mx-auto">
                <span className="inline-block px-3 py-1 rounded-full badge-pill-teal text-xs font-semibold uppercase tracking-wider">
                  Katalog Sesi Acara
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  Pilihan Sesi & <span className="text-gradient-teal">Workshop Unggulan</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Temukan topik teknologi yang relevan dengan minat Anda, mulai dari rekayasa arsitektur terdistribusi hingga kecerdasan buatan otonom.
                </p>
              </div>

              {/* Refined Search & Filter Toolbar */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                      selectedCategory === 'all'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-100'
                    }`}
                  >
                    Semua ({events.length})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Minimal Search Input */}
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari acara atau topik..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Event Cards Grid */}
              {isLoadingEvents ? (
                <div className="py-20 text-center text-slate-400 space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600" />
                  <p className="text-xs font-medium">Memuat katalog acara...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-2 max-w-sm mx-auto shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900">Event Tidak Ditemukan</h3>
                  <p className="text-xs text-slate-500">
                    Tidak ada event dengan kata kunci "{searchQuery}".
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

              {/* ========================================================================= */}
              {/* TESTIMONIALS / COMMUNITY VOICES (Matches Dataflow reference image) */}
              {/* ========================================================================= */}
              <div className="pt-12 space-y-6">
                <div className="text-center space-y-1.5 max-w-xl mx-auto">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                    Testimoni & Rekan Komunitas
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    Dipercaya oleh <span className="text-gradient-teal">Praktisi & Mahasiswa</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kesan para pengembang dan komunitas terhadap perayaan 12 tahun SurabayaDev.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="card-soft rounded-2xl p-5 bg-white border border-slate-200 space-y-3">
                    <div className="flex text-amber-400 text-xs gap-0.5">
                      ★★★★★
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "SurabayaDev selalu menjadi barometer komunitas tech di Jawa Timur. Sesi workshop-nya langsung hands-on ke arsitektur produksi, bukan sekadar teori."
                    </p>
                    <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                        DF
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">Dicky Firmansyah</h5>
                        <p className="text-[10px] text-slate-500">Lead Engineer • Surabaya Tech Hub</p>
                      </div>
                    </div>
                  </div>

                  <div className="card-soft rounded-2xl p-5 bg-white border border-slate-200 space-y-3">
                    <div className="flex text-amber-400 text-xs gap-0.5">
                      ★★★★★
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "Sistem registrasi tiket digital dan check-in gate-nya sangat cepat dan presisi. Pengalaman registrasinya mulus tanpa hambatan."
                    </p>
                    <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                        MR
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">Maya Rahmawati</h5>
                        <p className="text-[10px] text-slate-500">Full-Stack Developer & Mentor</p>
                      </div>
                    </div>
                  </div>

                  <div className="card-soft rounded-2xl p-5 bg-white border border-slate-200 space-y-3">
                    <div className="flex text-amber-400 text-xs gap-0.5">
                      ★★★★★
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "12 tahun perjalanan yang konsisten melahirkan talenta digital hebat di Surabaya. Wajib ikut bagi siapapun yang ingin berjejaring!"
                    </p>
                    <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
                        AP
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">Aldi Pratama</h5>
                        <p className="text-[10px] text-slate-500">Mahasiswa Informatika ITS</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* ECOSYSTEM PARTNERS SHOWCASE */}
              {/* ========================================================================= */}
              <div className="pt-8 space-y-4">
                <div className="text-center space-y-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Jejaring Ekosistem & Community Partners
                  </h4>
                  <p className="text-[11px] text-slate-500">
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
                      className="p-3 rounded-xl bg-white border border-slate-200/80 hover:border-teal-500/40 text-center space-y-0.5 transition-all shadow-xs group"
                    >
                      <span className="font-semibold text-xs text-slate-800 group-hover:text-teal-600 block transition-colors">
                        {partner.name}
                      </span>
                      <span className="text-[9px] text-slate-500 block truncate">
                        {partner.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ========================================================================= */}
              {/* BOTTOM CTA CALLOUT (Deep Dark Card like Dataflow reference) */}
              {/* ========================================================================= */}
              <div className="pt-6">
                <div className="rounded-3xl bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#0b0f19] text-white p-10 sm:p-14 text-center space-y-5 shadow-2xl border border-slate-800">
                  <span className="inline-block px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold uppercase tracking-wider">
                    Pendaftaran Terbuka
                  </span>

                  <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-white max-w-2xl mx-auto">
                    Siap Menjadi Bagian dari <br />
                    <span className="text-gradient-teal">SurabayaDev 12th Anniversary?</span>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                    Pilih sesi yang sesuai dan amankan tiket digital Anda sekarang sebelum seluruh kuota kursi resmi terpenuhi.
                  </p>

                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={() => {
                        const el = document.getElementById('catalog-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all"
                    >
                      <span>Pilih Sesi Sekarang</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
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

      {/* ========================================================================= */}
      {/* DEEP DARK FOOTER (Matches reference image) */}
      {/* ========================================================================= */}
      <footer className="bg-[#0b0f19] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 print:hidden text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/80">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-black text-xs">
                S
              </div>
              <span className="font-bold text-sm text-white">SurabayaDev</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Komunitas pengembang perangkat lunak, pegiat teknologi, dan inovator digital di Kota Surabaya sejak 2014.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Kategori Acara</h5>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-white transition-colors cursor-pointer">Conference & Tech Summit</li>
              <li className="hover:text-white transition-colors cursor-pointer">Hands-on Workshop</li>
              <li className="hover:text-white transition-colors cursor-pointer">AI & Autonomous Hackathon</li>
              <li className="hover:text-white transition-colors cursor-pointer">Architecture Masterclass</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Portal & Akses</h5>
            <ul className="space-y-2 text-xs">
              <li onClick={() => setCurrentTab('events')} className="hover:text-white transition-colors cursor-pointer">Jelajah Katalog Event</li>
              <li onClick={() => setCurrentTab('my-tickets')} className="hover:text-white transition-colors cursor-pointer">Dompet Tiket Digital</li>
              <li onClick={() => setCurrentTab('scanner')} className="hover:text-white transition-colors cursor-pointer">Terminal Check-In Gate</li>
              <li onClick={() => setCurrentTab('admin')} className="hover:text-white transition-colors cursor-pointer">Konsol Administrator</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Teknologi Sistem</h5>
            <p className="text-xs text-slate-500 leading-relaxed font-mono">
              Frontend: React 19 + TypeScript + Vite<br />
              Backend: Laravel 11 REST API<br />
              Database: PostgreSQL 18 ACID Locking
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © 2026 SurabayaDev 12th Anniversary. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Panduan Reviewer</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Dokumentasi API</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">GitHub Repository</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
