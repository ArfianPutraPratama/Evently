import React, { useState } from 'react';
import { Registration, Ticket } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { X, Calendar, MapPin, Download, Check, ShieldCheck, UserCheck, Sparkles, Printer } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md my-8 rounded-3xl overflow-hidden shadow-2xl border border-indigo-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/70 border border-slate-700 text-slate-400 hover:text-white transition-all print:hidden"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Printable Pass Container */}
        <div id="printable-ticket" className="p-6 space-y-6">
          {/* Header Pass */}
          <div className="relative pb-4 border-b border-dashed border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-white tracking-tight">SurabayaDev</span>
                  <span className="text-[10px] block text-indigo-400 font-mono">Official E-Ticket Pass</span>
                </div>
              </div>

              {ticket.status === 'checked_in' ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  CHECKED IN
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  VALID PASS
                </span>
              )}
            </div>

            <h3 className="text-base font-extrabold text-white leading-snug">
              {event.title}
            </h3>
            <span className="inline-block mt-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {event.category}
            </span>
          </div>

          {/* Schedule & Location */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-semibold block mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-400" />
                WAKTU
              </span>
              <p className="font-bold text-slate-200">
                {new Date(event.event_date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <p className="text-[11px] text-slate-400">
                {new Date(event.event_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-semibold block mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-400" />
                LOKASI
              </span>
              <p className="font-bold text-slate-200 line-clamp-1">{event.location}</p>
              <p className="text-[11px] text-slate-400">Surabaya, ID</p>
            </div>
          </div>

          {/* Attendee Details */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Nama Peserta:</span>
              <span className="font-bold text-white text-xs">{user?.name || 'Peserta'}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Email Terdaftar:</span>
              <span className="text-slate-300 font-mono text-[11px]">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Institusi / Org:</span>
              <span className="text-slate-300">{user?.organization || 'Umum'}</span>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="p-5 rounded-2xl bg-white text-slate-900 flex flex-col items-center justify-center space-y-3 shadow-inner">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200">
              <QRCodeSVG
                value={ticket.qr_payload || ticket.ticket_code}
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-0.5">
                Kode Tiket Resmi
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono font-extrabold text-sm tracking-wider text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-300">
                  {ticket.ticket_code}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all print:hidden"
                >
                  {copied ? 'Tersalin!' : 'Salin'}
                </button>
              </div>
            </div>
          </div>

          {/* Security & Gate Instruction */}
          <div className="space-y-1 text-center">
            <p className="text-[10px] text-slate-400">
              Tunjukkan QR Code ini kepada panitia gatekeeper saat registrasi ulang di venue.
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[9px] text-indigo-400 font-mono">
              <ShieldCheck className="w-3 h-3" />
              <span>HMAC Signed Cryptographic Pass • Anti-Forgery</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Printer className="w-4 h-4 text-indigo-400" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 text-center"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
