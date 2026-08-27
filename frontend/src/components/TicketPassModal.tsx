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
      {/* Floating Close Button Top-Right (Always visible) */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[60] p-2.5 rounded-full bg-zinc-900/95 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/20 shadow-2xl transition-all print:hidden flex items-center gap-1.5 text-xs font-semibold"
        title="Tutup Tiket (Esc)"
      >
        <X className="w-4 h-4" />
        <span className="hidden sm:inline">Tutup</span>
      </button>

      {/* Modal Dialog Content Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl my-auto space-y-4 animate-fade-in"
      >
        {/* Top Header Label */}
        <div className="flex items-center justify-between text-white print:hidden px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              E-TICKET ADMISSION PASS • SURABAYADEV 12TH
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-300 hover:text-white transition-all text-xs flex items-center gap-1"
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
            <div className="flex-1 bg-amber-400" />
            <div className="flex-1 bg-emerald-500" />
            <div className="flex-1 bg-rose-500" />
            <div className="flex-1 bg-indigo-600" />
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
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    Free Community Pass
                  </span>
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
                <div className="p-2.5 bg-white flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block">
                      Waktu Pelaksanaan
                    </span>
                    <span className="font-bold text-zinc-900 text-xs">
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
                    className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[10px] border border-indigo-200 transition-colors print:hidden shrink-0"
                    title="Tambah ke Google Calendar"
                  >
                    + Calendar
                  </a>
                </div>

                {/* Cell Bottom-Right: Venue & Location */}
                <div className="p-2.5 bg-white flex items-center justify-between">
                  <div className="min-w-0 pr-1">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase block">
                      Lokasi Venue
                    </span>
                    <span className="font-bold text-zinc-900 text-xs truncate block">
                      {event.location.split(',')[0]}
                    </span>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[10px] border border-rose-200 transition-colors print:hidden shrink-0"
                    title="Buka rute navigasi di Google Maps"
                  >
                    Maps
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
            <div className="w-6 h-6 -mt-3 -ml-3 rounded-full bg-[#090a0f] border border-zinc-800 z-10" />

            {/* Vertical Perforated Dashed Line */}
            <div className="w-px h-full border-r-2 border-dashed border-zinc-300 my-1" />

            {/* Bottom Semicircle Punch Notch */}
            <div className="w-6 h-6 -mb-3 -ml-3 rounded-full bg-[#090a0f] border border-zinc-800 z-10" />
          </div>

          {/* Mobile Horizontal Tear-off Line */}
          <div className="md:hidden relative flex items-center justify-between h-0 select-none">
            <div className="w-6 h-6 -ml-3 -mt-3 rounded-full bg-[#090a0f] border border-zinc-800 z-10" />
            <div className="w-full border-b-2 border-dashed border-zinc-300" />
            <div className="w-6 h-6 -mr-3 -mt-3 rounded-full bg-[#090a0f] border border-zinc-800 z-10" />
          </div>

          {/* 4. Ticket Stub (Right Section / Admission Gate Stub) */}
          <div className="w-full md:w-60 bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-700 p-5 sm:p-6 text-white flex flex-col items-center justify-between text-center shrink-0 space-y-3 relative overflow-hidden">
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
            <div className="p-3 bg-white rounded-xl shadow-xl space-y-1.5 relative z-10">
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
            <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#090a0f] border border-zinc-800" />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ACTION TOOLBAR & CERTIFICATE CONTROLS */}
        {/* ========================================================================= */}
        <div className="space-y-2.5 print:hidden">
          {/* E-Certificate Button for Checked-in Attendees */}
          {isCheckedIn && (
            <button
              type="button"
              onClick={() => onOpenCertificate && onOpenCertificate(registration)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Unduh E-Sertifikat Kehadiran Resmi</span>
            </button>
          )}

          {/* Action Buttons Row */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleCopyCode}
              className="py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>{copied ? 'Kode Disalin!' : 'Salin Kode'}</span>
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Halo! Saya sudah memiliki tiket resmi "${event.title}" di SurabayaDev 12th Anniversary! Kode Tiket: ${ticket.ticket_code}. Lokasi: ${event.location} 🚀`)}`}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Share WA</span>
            </a>

            <button
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-950" />
              <span>Cetak / PDF</span>
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] text-zinc-400 hover:text-white text-xs font-medium border border-white/[0.06] transition-all"
          >
            Tutup Tiket (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
