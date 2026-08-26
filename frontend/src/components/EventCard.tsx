import React from 'react';
import { EventItem } from '../types';
import { Calendar, MapPin, Users, CheckCircle2, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';

interface EventCardProps {
  event: EventItem;
  onSelect: (event: EventItem) => void;
  onViewTicket?: (event: EventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onSelect, onViewTicket }) => {
  const percentage = Math.min(100, Math.round((event.registered_count / event.quota) * 100));
  const isAlmostFull = event.remaining_quota > 0 && event.remaining_quota <= 10;
  const isSoldOut = event.is_sold_out || event.remaining_quota <= 0;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB';
    } catch {
      return dateString;
    }
  };

  return (
    <div className="group rounded-3xl overflow-hidden glass-panel border border-slate-800/80 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Banner with Category & Status Overlay */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-900">
          <img
            src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-indigo-600/90 text-white backdrop-blur-md shadow-md">
              {event.category}
            </span>

            {event.is_user_registered ? (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Terdaftar
              </span>
            ) : isSoldOut ? (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 backdrop-blur-md">
                <AlertTriangle className="w-3.5 h-3.5" />
                Habis (Sold Out)
              </span>
            ) : isAlmostFull ? (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                Sisa {event.remaining_quota} Kursi!
              </span>
            ) : null}
          </div>

          {/* Bottom Title on Image */}
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-lg font-bold text-white line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors">
              {event.title}
            </h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{formatDate(event.event_date)}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </div>

            {event.speaker_name && (
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="line-clamp-1 text-slate-400">
                  <strong className="text-slate-200">{event.speaker_name}</strong>
                  {event.speaker_role ? ` (${event.speaker_role})` : ''}
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {/* Quota Progress Bar */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Kuota Tiket
              </span>
              <span className="font-semibold text-slate-200">
                {event.registered_count} <span className="text-slate-500">/ {event.quota}</span>
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
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
            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
              <span>{percentage}% terisi</span>
              <span>{event.remaining_quota} kursi tersisa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-5 pt-0">
        {event.is_user_registered && onViewTicket ? (
          <button
            onClick={() => onViewTicket(event)}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Lihat Tiket Digital
          </button>
        ) : (
          <button
            onClick={() => onSelect(event)}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              isSoldOut
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/20'
            }`}
          >
            <span>{isSoldOut ? 'Event Penuh' : 'Detail & Registrasi'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
