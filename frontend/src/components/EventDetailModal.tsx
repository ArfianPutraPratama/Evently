import React from 'react';
import { EventItem } from '../types';
import { X, Calendar, MapPin, Users, UserCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface EventDetailModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: (event: EventItem) => void;
  onViewTicketClick: (event: EventItem) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onRegisterClick,
  onViewTicketClick,
}) => {
  if (!isOpen || !event) return null;

  const isSoldOut = event.is_sold_out || event.remaining_quota <= 0;
  const isAlmostFull = event.remaining_quota > 0 && event.remaining_quota <= 10;
  const percentage = Math.min(100, Math.round((event.registered_count / event.quota) * 100));

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB';
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-3xl glass-panel-glow bg-slate-900 border border-slate-700/80 overflow-hidden shadow-2xl">
        {/* Banner with Close Button */}
        <div className="relative h-64 w-full bg-slate-950">
          <img
            src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/70 border border-slate-700 text-slate-300 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-indigo-600 text-white shadow-lg">
              {event.category}
            </span>
          </div>

          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {event.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Key Event Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 font-semibold block text-[10px]">WAKTU PELAKSANAAN</span>
                <p className="font-bold text-slate-200 mt-0.5">{formatDate(event.event_date)}</p>
                {event.end_date && (
                  <p className="text-slate-400 text-[11px] mt-0.5">Selesai: {formatDate(event.end_date)}</p>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 font-semibold block text-[10px]">LOKASI VENUE</span>
                <p className="font-bold text-slate-200 mt-0.5">{event.location}</p>
                <span className="text-slate-400 text-[11px]">Surabaya, Jawa Timur</span>
              </div>
            </div>
          </div>

          {/* Speaker Bio (If present) */}
          {event.speaker_name && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-slate-950 border border-indigo-900/40 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold shrink-0">
                <UserCheck className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
                  Narasumber & Pembicara
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">{event.speaker_name}</h4>
                <p className="text-xs text-slate-400">{event.speaker_role || 'Tech Leader & Speaker'}</p>
              </div>
            </div>
          )}

          {/* Event Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Deskripsi Acara</h4>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </div>

          {/* Quota Tracker */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-400" />
                Status Ketersediaan Kuota Peserta
              </span>
              <span className="font-bold text-white">
                {event.registered_count} <span className="text-slate-500">/ {event.quota} Kursi</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isSoldOut
                    ? 'bg-rose-500'
                    : isAlmostFull
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-indigo-500 to-indigo-400'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">{percentage}% Kuota Terisi</span>
              <span className={`font-bold ${isSoldOut ? 'text-rose-400' : isAlmostFull ? 'text-amber-400' : 'text-emerald-400'}`}>
                {isSoldOut ? 'Kuota Penuh' : `${event.remaining_quota} Kursi Tersedia`}
              </span>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-2">
            {event.is_user_registered ? (
              <button
                onClick={() => {
                  onClose();
                  onViewTicketClick(event);
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Anda Sudah Terdaftar — Buka E-Tiket Digital</span>
              </button>
            ) : isSoldOut ? (
              <button
                disabled
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 text-slate-500 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <AlertTriangle className="w-4 h-4 text-slate-500" />
                <span>Pendaftaran Ditutup (Kuota Habis)</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onRegisterClick(event);
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-extrabold shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <span>Daftar Sekarang (Gratis)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
