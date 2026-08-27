import React from 'react';
import { EventItem } from '../types';
import { Calendar, MapPin, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

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
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="card-soft rounded-2xl overflow-hidden flex flex-col justify-between group border border-slate-200/90 hover:border-teal-500/40 hover:shadow-xl transition-all duration-300 bg-white">
      <div>
        {/* Banner with Refined Overlay */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          <img
            src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/95 backdrop-blur-md text-slate-800 shadow-sm border border-slate-200/60">
              {event.category}
            </span>

            {event.is_user_registered ? (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500 text-white shadow-sm backdrop-blur-md">
                <CheckCircle2 className="w-3 h-3" />
                Terdaftar
              </span>
            ) : isSoldOut ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white shadow-sm backdrop-blur-md">
                Habis
              </span>
            ) : isAlmostFull ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-sm backdrop-blur-md">
                Sisa {event.remaining_quota}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/40 text-white backdrop-blur-md">
                Gratis
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3.5">
          <div className="space-y-2">
            {/* Quick Interactive Calendar & Maps Action Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <a
                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${new Date(event.event_date).toISOString().replace(/-|:|\.\d\d\d/g, '')}/${new Date(new Date(event.event_date).getTime() + 4 * 3600000).toISOString().replace(/-|:|\.\d\d\d/g, '')}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 text-[11px] font-bold transition-all hover:scale-102 shadow-2xs group/cal"
                title="Buka & Simpan Jadwal ke Google Calendar"
              >
                <Calendar className="w-3.5 h-3.5 text-teal-600 group-hover/cal:animate-bounce" />
                <span>{formatDate(event.event_date)}</span>
              </a>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/80 text-[11px] font-bold transition-all hover:scale-102 shadow-2xs max-w-[170px] group/map"
                title="Buka Rute & Lokasi di Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 group-hover/map:animate-bounce" />
                <span className="truncate">{event.location.split(',')[0]} ↗</span>
              </a>
            </div>

            <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-teal-600 transition-colors line-clamp-2 pt-0.5">
              {event.title}
            </h3>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
            {event.description}
          </p>

          {/* Quota Tracker */}
          <div className="pt-1 space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Ketersediaan Kursi</span>
              <span className="text-slate-900 font-bold">
                {event.registered_count} <span className="text-slate-400 font-normal">/ {event.quota}</span>
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isSoldOut
                    ? 'bg-rose-500'
                    : isAlmostFull
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-teal-500 to-cyan-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-5 pb-5 pt-1">
        {event.is_user_registered ? (
          <button
            onClick={() => onViewTicket && onViewTicket(event)}
            className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Lihat E-Tiket Digital</span>
          </button>
        ) : (
          <button
            onClick={() => onSelect(event)}
            disabled={isSoldOut}
            className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              isSoldOut
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
            }`}
          >
            <span>{isSoldOut ? 'Kuota Habis' : 'Detail & Daftar'}</span>
            {!isSoldOut && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
};
