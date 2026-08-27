import React from 'react';
import { EventItem } from '../types';
import { Calendar, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

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
    <div className="elegant-card rounded-2xl overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Banner with Refined Overlay */}
        <div className="relative h-44 w-full overflow-hidden bg-zinc-900">
          <img
            src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#11131a] via-[#11131a]/30 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-black/60 backdrop-blur-md border border-white/10 text-zinc-300">
              {event.category}
            </span>

            {event.is_user_registered ? (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                <CheckCircle2 className="w-3 h-3" />
                Terdaftar
              </span>
            ) : isSoldOut ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-md">
                Habis
              </span>
            ) : isAlmostFull ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                Sisa {event.remaining_quota}
              </span>
            ) : null}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                {formatDate(event.event_date)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 line-clamp-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                {event.location.split(',')[0]}
              </span>
            </div>

            <h3 className="text-base font-bold text-white leading-snug group-hover:text-indigo-300 transition-colors line-clamp-2 pt-1">
              {event.title}
            </h3>
          </div>

          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-normal">
            {event.description}
          </p>

          {/* Slim Modern Quota Tracker */}
          <div className="pt-2 space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-500">Ketersediaan Kuota</span>
              <span className="text-zinc-300 font-medium">
                {event.registered_count} <span className="text-zinc-600">/ {event.quota}</span>
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isSoldOut
                    ? 'bg-rose-500'
                    : isAlmostFull
                    ? 'bg-amber-400'
                    : 'bg-indigo-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 pt-0">
        {event.is_user_registered && onViewTicket ? (
          <button
            onClick={() => onViewTicket(event)}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Lihat E-Tiket Digital</span>
          </button>
        ) : (
          <button
            onClick={() => onSelect(event)}
            disabled={isSoldOut}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              isSoldOut
                ? 'bg-white/[0.02] text-zinc-600 border border-white/[0.04] cursor-not-allowed'
                : 'bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            <span>{isSoldOut ? 'Kuota Penuh' : 'Detail & Pendaftaran'}</span>
            {!isSoldOut && <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />}
          </button>
        )}
      </div>
    </div>
  );
};
