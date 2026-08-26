import React, { useState } from 'react';
import { EventItem, Registration, Ticket } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, Calendar, MapPin, Ticket as TicketIcon, AlertCircle, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegistrationModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { registration: Registration; ticket: Ticket; event: EventItem }) => void;
  onRequireAuth: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  event,
  isOpen,
  onClose,
  onSuccess,
  onRequireAuth,
}) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await api.registerEvent(event.id, notes);
      
      // Fire confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#f59e0b', '#10b981', '#ffffff']
        });
      } catch {}

      onSuccess(response);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.data?.message || err.message || 'Gagal melakukan pendaftaran. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel-glow bg-slate-900 border border-slate-700/70 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-slate-800 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
            <TicketIcon className="w-4 h-4" />
            <span>Konfirmasi Pendaftaran Event</span>
          </div>
          <h2 className="text-xl font-bold text-white leading-snug">
            {event.title}
          </h2>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Event Quick Info */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{new Date(event.event_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 pt-1">
              <span>Sisa Kuota Tersedia:</span>
              <strong className="text-amber-400 font-bold">{event.remaining_quota} kursi</strong>
            </div>
          </div>

          {/* Attendee Profile Info */}
          {user ? (
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Data Pendaftar (Akun Anda):</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
                  {user.role}
                </span>
              </div>
              <p className="text-white font-bold text-sm">{user.name}</p>
              <p className="text-slate-400">{user.email} • {user.organization || 'Umum'}</p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
              <p className="font-semibold mb-1">Anda belum login.</p>
              <p className="text-slate-300">
                Silakan login atau daftar akun peserta terlebih dahulu agar tiket digital dapat diterbitkan untuk Anda.
              </p>
            </div>
          )}

          {/* Registration Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Catatan / Harapan Mengikuti Event (Opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Ingin memperdalam arsitektur sistem dan networking dengan komunitas developer Surabaya..."
              className="w-full h-20 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-none"
              maxLength={300}
            />
          </div>

          {/* Concurrency Guarantee Notice */}
          <div className="text-[11px] text-slate-500 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              Sistem menggunakan <strong>PostgreSQL Pessimistic Row Locking</strong> untuk menjamin alokasi kuota yang adil tanpa risiko tiket ganda / <em>overselling</em>.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all"
            >
              Batal
            </button>

            {user ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-2 py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengunci Kuota & Menerbitkan Tiket...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi & Terbitkan Tiket</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onRequireAuth}
                className="flex-2 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
              >
                Login untuk Mendaftar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
