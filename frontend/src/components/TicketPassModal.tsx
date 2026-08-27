import React, { useState } from 'react';
import { Registration, Ticket } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { X, Calendar, MapPin, Check, ShieldCheck, Printer, Copy } from 'lucide-react';

interface TicketPassModalProps {
  registration: Registration | null;
  ticket?: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({
  registration,
  ticket: explicitTicket,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-sm my-6 rounded-2xl overflow-hidden bg-[#11131a] border border-white/[0.08] shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-all print:hidden"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Boarding Pass Body */}
        <div id="printable-ticket" className="p-6 space-y-5">
          {/* Header */}
          <div className="space-y-2 border-b border-white/[0.06] pb-4 pr-8">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                SurabayaDev 12th • Pass
              </span>
              {ticket.status === 'checked_in' ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  CHECKED IN
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/[0.08] text-zinc-300 border border-white/10">
                  VALID PASS
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-white leading-snug">
              {event.title}
            </h3>
            <span className="inline-block text-[10px] uppercase font-semibold text-zinc-400">
              {event.category}
            </span>
          </div>

          {/* Key Details with Action Links */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1.5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Waktu</span>
                <p className="font-semibold text-zinc-200">
                  {new Date(event.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-[11px] text-zinc-400">
                  {new Date(event.event_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </p>
              </div>

              <a
                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${new Date(event.event_date).toISOString().replace(/-|:|\.\d\d\d/g, '')}/${new Date(new Date(event.event_date).getTime() + 4 * 3600000).toISOString().replace(/-|:|\.\d\d\d/g, '')}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 pt-1 transition-colors print:hidden"
              >
                <Calendar className="w-3 h-3" />
                <span>+ Google Calendar</span>
              </a>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1.5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Lokasi</span>
                <p className="font-semibold text-zinc-200 line-clamp-1">{event.location.split(',')[0]}</p>
                <p className="text-[11px] text-zinc-400">Surabaya</p>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 hover:text-rose-300 pt-1 transition-colors print:hidden"
              >
                <MapPin className="w-3 h-3" />
                <span>Buka Google Maps</span>
              </a>
            </div>
          </div>

          {/* Attendee Info */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">Nama:</span>
              <span className="font-semibold text-white">{user?.name || 'Budi Developer'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Email:</span>
              <span className="text-zinc-300 font-mono text-[11px]">{user?.email || 'peserta@surabayadev.org'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Institusi:</span>
              <span className="text-zinc-300">{user?.organization || 'Institut Teknologi Sepuluh Nopember'}</span>
            </div>
          </div>

          {/* Perforated Divider Line */}
          <div className="relative py-1">
            <div className="border-b border-dashed border-white/[0.1]" />
          </div>

          {/* Minimalist QR Code */}
          <div className="flex flex-col items-center justify-center space-y-3 bg-white p-4 rounded-xl">
            <QRCodeSVG
              value={ticket.qr_payload || ticket.ticket_code}
              size={160}
              level="H"
              includeMargin={false}
            />
            <div className="text-center">
              <span className="font-mono text-xs font-bold text-zinc-900 tracking-wider">
                {ticket.ticket_code}
              </span>
            </div>
          </div>

          {/* Security Subtext */}
          <div className="text-center space-y-1">
            <p className="text-[10px] text-zinc-500">
              Tunjukkan kode QR kepada panitia di pintu masuk venue acara.
            </p>
            <div className="flex items-center justify-center gap-1 text-[9px] text-zinc-600 font-mono">
              <ShieldCheck className="w-3 h-3" />
              <span>HMAC Cryptographically Verified</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2 pt-2 print:hidden">
            <button
              onClick={handleCopyCode}
              className="py-2 px-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-300 text-xs font-medium flex items-center justify-center gap-1 transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Disalin' : 'Salin'}</span>
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Halo! Saya sudah terdaftar di "${event.title}" (SurabayaDev 12th Anniversary)! Kode Tiket: ${ticket.ticket_code}. Lokasi: ${event.location} 🚀`)}`}
              target="_blank"
              rel="noreferrer"
              className="py-2 px-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center justify-center gap-1 transition-all"
            >
              <span>Share WA</span>
            </a>
            <button
              onClick={handlePrint}
              className="py-2 px-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold flex items-center justify-center gap-1 transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
