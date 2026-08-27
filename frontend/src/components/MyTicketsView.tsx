import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Registration } from '../types';
import { Ticket as TicketIcon, Calendar, MapPin, QrCode, CheckCircle2, Award, Clock, Loader2 } from 'lucide-react';

interface MyTicketsViewProps {
  onOpenTicketPass: (registration: Registration) => void;
  onOpenCertificate?: (registration: Registration) => void;
  onExploreEvents: () => void;
}

export const MyTicketsView: React.FC<MyTicketsViewProps> = ({
  onOpenTicketPass,
  onOpenCertificate,
  onExploreEvents,
}) => {
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
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <TicketIcon className="w-4 h-4 text-teal-600" />
            <span>Dompet Tiket Peserta</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Tiket Digital Saya
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Simpan atau cetak tiket digital Anda untuk ditunjukkan kepada panitia di pintu masuk acara.
          </p>
        </div>

        <button
          onClick={onExploreEvents}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all self-start sm:self-auto shadow-sm"
        >
          + Jelajah Event Lainnya
        </button>
      </div>

      {/* Tickets List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 space-y-3">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600" />
          <p className="text-xs font-medium">Memuat tiket Anda...</p>
        </div>
      ) : registrations.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-4 max-w-md mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto text-teal-600">
            <TicketIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Belum Ada Tiket Terdaftar</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Anda belum mendaftar di sesi manapun. Jelajahi katalog acara sekarang dan amankan tiket Anda.
            </p>
          </div>
          <button
            onClick={onExploreEvents}
            className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
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
                className="card-soft p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-500/40 hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200">
                      {event.category}
                    </span>

                    {isCheckedIn ? (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        CHECKED IN
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <TicketIcon className="w-3 h-3" />
                        VALID PASS
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2 leading-snug">
                    {event.title}
                  </h3>

                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{new Date(event.event_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">KODE TIKET</span>
                    <span className="text-xs font-mono font-bold text-slate-800">{ticket.ticket_code}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCheckedIn && (
                      <button
                        type="button"
                        onClick={() => onOpenCertificate && onOpenCertificate(reg)}
                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-all shadow-xs"
                        title="Buka E-Sertifikat Kehadiran"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>Sertifikat</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenTicketPass(reg)}
                      className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Tiket Pass</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
