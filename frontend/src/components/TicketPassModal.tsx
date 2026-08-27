import React, { useState, useEffect } from 'react';
import { Registration, Ticket } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { X, Calendar, MapPin, Check, ShieldCheck, Printer, Copy, Award, ExternalLink, Share2 } from 'lucide-react';

interface TicketPassModalProps {
  registration: Registration | null;
  ticket?: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCertificate?: (reg: Registration) => void;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({
  registration,
  ticket: explicitTicket,
  isOpen,
  onClose,
  onOpenCertificate,
}) => {
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !registration) return null;

  const ticket = explicitTicket || registration.ticket;
  const event = registration.event;
  const user = registration.user;

  if (!ticket || !event) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ticket.ticket_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isCheckedIn = ticket.status === 'checked_in';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 py-6 sm:py-10 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      {/* Floating Close Button Top-Right (Always visible on screen, hidden on print) */}
      <button
        id="ticket-floating-close-btn"
        onClick={onClose}
        className="fixed top-4 right-4 z-[60] p-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 border border-slate-200 shadow-xl transition-all print:hidden ticket-close-btn flex items-center gap-1.5 text-xs font-semibold"
        title="Tutup Tiket (Esc)"
      >
        <X className="w-4 h-4" />
        <span className="hidden sm:inline">Tutup</span>
      </button>

      {/* Modal Dialog Content Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl my-auto space-y-3 animate-fade-in"
      >
        {/* Top Header Label */}
        <div className="flex items-center justify-between text-slate-800 print:hidden px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-slate-200 font-bold">
              E-TICKET ADMISSION PASS • SURABAYADEV 12TH
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            <span>Tutup (Esc)</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* THE HORIZONTAL BOARDING PASS TICKET (STUB VOUCHER DESIGN) */}
        {/* ========================================================================= */}
        <div
          id="printable-ticket"
          className="relative w-full rounded-2xl overflow-hidden bg-white text-zinc-900 shadow-2xl flex flex-col md:flex-row border border-zinc-200 select-none"
        >
          {/* 1. Left Vertical Color Brand Accent Strip */}
          <div className="w-full md:w-3.5 h-2 md:h-auto flex md:flex-col shrink-0">
            <div className="flex-1" style={{ backgroundColor: '#fbbf24', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }} />
            <div className="flex-1" style={{ backgroundColor: '#10b981', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }} />
            <div className="flex-1" style={{ backgroundColor: '#f43f5e', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }} />
            <div className="flex-1" style={{ backgroundColor: '#4f46e5', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }} />
          </div>

          {/* 2. Main Ticket Body (Left Section) */}
          <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between space-y-4">
            {/* Title & Tagline */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {event.category}
                </span>

                {isCheckedIn ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    CHECKED IN
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-300">
                    VALID PASS
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-zinc-900 leading-snug tracking-tight">
                {event.title}
              </h2>

              <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Boxed E-Ticket Details Table (Exactly matching reference design) */}
            <div className="border-2 border-zinc-800 rounded-lg overflow-hidden text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-zinc-800">
                {/* Cell Top-Left: Large Badge */}
                <div className="p-3 bg-zinc-50 flex flex-col justify-center">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 font-bold block">
                    TIPE TIKET RESMI
                  </span>
                  <span className="text-base font-black text-zinc-900 tracking-tight">
                    E-Ticket Digital
                  </span>
                  {event.price && event.price > 0 ? (
                    <span className="text-[10px] text-amber-900 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      VIP Paid Pass (Rp {event.price.toLocaleString('id-ID')} • Lunas)
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      Free Community Pass
                    </span>
                  )}
                </div>

                {/* Cell Top-Right: Name & ID */}
                <div className="p-3 bg-white space-y-0.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-500 font-medium">Nama:</span>
                    <span className="font-bold text-zinc-900 truncate max-w-[160px]">
                      {user?.name || 'Budi Developer'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-500 font-medium">ID Tiket:</span>
                    <span className="font-mono font-bold text-indigo-700 tracking-wider">
                      {ticket.ticket_code}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-500 font-medium">Institusi:</span>
                    <span className="text-zinc-700 truncate max-w-[160px]">
                      {user?.organization || 'Komunitas Tech Surabaya'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 border-t-2 border-zinc-800 divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-zinc-800">
                {/* Cell Bottom-Left: Date & Time */}
                <div className="p-3 bg-white flex flex-col justify-between space-y-1.5">
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block font-mono">
                      WAKTU PELAKSANAAN
                    </span>
                    <span className="font-extrabold text-zinc-900 text-xs block">
                      {new Date(event.event_date).toLocaleDateString('id-ID', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      , {new Date(event.event_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </span>
                  </div>

                  <a
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${new Date(event.event_date).toISOString().replace(/-|:|\.\d\d\d/g, '')}/${new Date(new Date(event.event_date).getTime() + 4 * 3600000).toISOString().replace(/-|:|\.\d\d\d/g, '')}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[11px] border border-teal-200/80 transition-all shadow-2xs print:hidden w-fit"
                    title="Sinkronkan jadwal acara ke Google Calendar"
                  >
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>+ Simpan Google Calendar</span>
                  </a>
                </div>

                {/* Cell Bottom-Right: Venue & Location */}
                <div className="p-3 bg-white flex flex-col justify-between space-y-1.5">
                  <div className="min-w-0 pr-1">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block font-mono">
                      LOKASI VENUE
                    </span>
                    <span className="font-extrabold text-zinc-900 text-xs truncate block">
                      {event.location.split(',')[0]}
                    </span>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-200/80 transition-all shadow-2xs print:hidden w-fit"
                    title="Buka rute navigasi di Google Maps"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Buka Rute Google Maps ↗</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Brand Stamp */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                {/* Stylized SurabayaDev Logo Emblem */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white font-black text-xs shadow-md">
                  S
                </div>
                <div>
                  <span className="font-extrabold text-xs tracking-tight text-zinc-900 block leading-tight">
                    SURABAYADEV
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    12TH ANNIVERSARY 2026
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-[9px] text-zinc-400 block">
                  OFFICIAL EVENT PASS
                </span>
                <span className="text-[10px] font-bold text-indigo-900">
                  surabayadev.org
                </span>
              </div>
            </div>
          </div>

          {/* 3. Perforated Tear-off Line with Semicircle Notches */}
          <div className="relative hidden md:flex flex-col items-center justify-between w-0 shrink-0 select-none">
            {/* Top Semicircle Punch Notch */}
            <div className="notch-cutout w-6 h-6 -mt-3 -ml-3 rounded-full bg-[#090a0f] print:bg-white border border-zinc-800 print:border-zinc-300 z-10" />

            {/* Vertical Perforated Dashed Line */}
            <div className="w-px h-full border-r-2 border-dashed border-zinc-300 my-1" />

            {/* Bottom Semicircle Punch Notch */}
            <div className="notch-cutout w-6 h-6 -mb-3 -ml-3 rounded-full bg-[#090a0f] print:bg-white border border-zinc-800 print:border-zinc-300 z-10" />
          </div>

          {/* Mobile Horizontal Tear-off Line */}
          <div className="md:hidden relative flex items-center justify-between h-0 select-none">
            <div className="notch-cutout w-6 h-6 -ml-3 -mt-3 rounded-full bg-[#090a0f] print:bg-white border border-zinc-800 print:border-zinc-300 z-10" />
            <div className="w-full border-b-2 border-dashed border-zinc-300" />
            <div className="notch-cutout w-6 h-6 -mr-3 -mt-3 rounded-full bg-[#090a0f] print:bg-white border border-zinc-800 print:border-zinc-300 z-10" />
          </div>

          {/* 4. Ticket Stub (Right Section / Admission Gate Stub) */}
          <div
            className="ticket-stub w-full md:w-60 p-5 sm:p-6 text-white flex flex-col items-center justify-between text-center shrink-0 space-y-3 relative overflow-hidden"
            style={{
              backgroundColor: '#4338ca',
              backgroundImage: 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            {/* Subtle Watermark on Stub */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
              <span className="font-black text-7xl">12</span>
            </div>

            {/* Top Stub Label */}
            <div className="space-y-0.5 relative z-10">
              <span className="font-mono text-[9px] uppercase tracking-widest text-indigo-200 font-bold block">
                GATEPASS • ADMIT ONE
              </span>
              <h4 className="text-xs font-bold text-white tracking-wide">
                Validasi Presensi Masuk
              </h4>
            </div>

            {/* High-Contrast QR Code Container */}
            <div
              className="p-3 bg-white rounded-xl shadow-xl space-y-1.5 relative z-10"
              style={{
                backgroundColor: '#ffffff',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <QRCodeSVG
                value={ticket.qr_payload || ticket.ticket_code}
                size={135}
                level="H"
                includeMargin={false}
              />
              <div className="text-center border-t border-zinc-200 pt-1">
                <span className="font-mono text-[11px] font-black text-zinc-900 tracking-wider block">
                  {ticket.ticket_code}
                </span>
              </div>
            </div>

            {/* Instructional Text */}
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] text-indigo-100 font-medium leading-tight">
                Tunjukkan QR Code ini kepada panitia di pintu gate masuk venue.
              </p>
              <div className="flex items-center justify-center gap-1 text-[9px] text-indigo-200 font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                <span>HMAC Encrypted Verified</span>
              </div>
            </div>

            {/* Half-circle notch on right edge (like classic admission ticket) */}
            <div className="notch-cutout hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#090a0f] print:bg-white border border-zinc-800 print:border-zinc-300" />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ACTION TOOLBAR & CERTIFICATE CONTROLS */}
        {/* ========================================================================= */}
        <div className="space-y-2.5 print:hidden">
          {/* E-Certificate Button */}
          <button
            type="button"
            onClick={() => onOpenCertificate && onOpenCertificate(registration)}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>{isCheckedIn ? 'Unduh E-Sertifikat Kehadiran Resmi' : 'Pratinjau E-Sertifikat Kehadiran'}</span>
          </button>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleCopyCode}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{copied ? 'Disalin!' : 'Salin Kode'}</span>
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Halo! Saya sudah memiliki tiket resmi "${event.title}" di SurabayaDev 12th Anniversary! Kode Tiket: ${ticket.ticket_code}. Lokasi: ${event.location} 🚀`)}`}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Share WA</span>
            </a>

            <button
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition-all"
          >
            Tutup Tiket (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
