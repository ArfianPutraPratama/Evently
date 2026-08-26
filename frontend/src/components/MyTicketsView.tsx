import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Registration } from '../types';
import { Ticket as TicketIcon, Calendar, MapPin, QrCode, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface MyTicketsViewProps {
  onOpenTicketPass: (registration: Registration) => void;
  onExploreEvents: () => void;
}

export const MyTicketsView: React.FC<MyTicketsViewProps> = ({ onOpenTicketPass, onExploreEvents }) => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMyTickets();
      setRegistrations(data);
    } catch (e) {
      console.error('Failed to load my tickets', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel-glow border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <TicketIcon className="w-4 h-4" />
            <span>Dompet Tiket Peserta</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Tiket Digital Saya
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simpan atau cetak tiket digital Anda untuk ditunjukkan kepada panitia di pintu masuk acara.
          </p>
        </div>

        <button
          onClick={onExploreEvents}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-indigo-300 text-xs font-semibold transition-all self-start sm:self-auto"
        >
          + Jelajah Event Lainnya
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
          <p className="text-xs">Memuat tiket digital Anda...</p>
        </div>
      ) : registrations.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel border border-slate-800 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
            <TicketIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Belum Ada Tiket</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Anda belum mendaftar untuk event SurabayaDev apa pun. Pilih event menarik dari katalog dan dapatkan tiket gratis Anda!
          </p>
          <button
            onClick={onExploreEvents}
            className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
          >
            Lihat Jadwal Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {registrations.map((reg) => {
            const ticket = reg.ticket;
            const event = reg.event;
            if (!event || !ticket) return null;

            const isCheckedIn = ticket.status === 'checked_in';

            return (
              <div
                key={reg.id}
                className="p-5 rounded-3xl glass-panel border border-slate-800/90 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300">
                      {event.category}
                    </span>

                    {isCheckedIn ? (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        CHECKED IN
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        <TicketIcon className="w-3 h-3" />
                        VALID PASS
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                    {event.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{new Date(event.event_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">KODE TIKET</span>
                    <span className="text-xs font-mono font-bold text-slate-200">{ticket.ticket_code}</span>
                  </div>

                  <button
                    onClick={() => onOpenTicketPass(reg)}
                    className="flex items-center gap-2 py-2 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Lihat QR Pass</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
