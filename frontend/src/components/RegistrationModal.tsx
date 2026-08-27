import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { EventItem, Registration, Ticket } from '../types';
import { X, Ticket as TicketIcon, Calendar, MapPin, AlertCircle, Loader2, CheckCircle2, ShieldCheck, CreditCard, QrCode, Building2, Check } from 'lucide-react';
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
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'va_bca' | 'va_mandiri'>('qris');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const isPaid = (event.price || 0) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // If Paid Event and Midtrans Snap is loaded
    if (isPaid && typeof window !== 'undefined' && window.snap) {
      try {
        const snapData = await api.createSnapToken(event.id);

        window.snap.pay(snapData.snap_token, {
          onSuccess: async (result: any) => {
            try {
              const confirmRes = await api.finishMidtransPayment(
                event.id,
                snapData.order_id,
                result.payment_type,
                result.transaction_status,
                notes
              );
              try {
                confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
              } catch {}
              onSuccess({ ...confirmRes, event });
              onClose();
            } catch (err: any) {
              setErrorMessage(err?.data?.message || err?.message || 'Gagal menerbitkan tiket setelah pembayaran.');
            } finally {
              setIsSubmitting(false);
            }
          },
          onPending: async (result: any) => {
            try {
              const confirmRes = await api.finishMidtransPayment(
                event.id,
                snapData.order_id,
                result.payment_type || 'qris',
                'settlement',
                notes
              );
              onSuccess({ ...confirmRes, event });
              onClose();
            } catch (err: any) {
              setErrorMessage('Menunggu pembayaran diselesaikan.');
            } finally {
              setIsSubmitting(false);
            }
          },
          onError: () => {
            setErrorMessage('Pembayaran Midtrans dibatalkan atau gagal.');
            setIsSubmitting(false);
          },
          onClose: () => {
            setIsSubmitting(false);
          },
        });
        return;
      } catch (err: any) {
        console.warn('Midtrans Snap fallback to instant simulation:', err);
      }
    }

    // Default / Free event registration (or sandbox fallback)
    try {
      const response = await api.registerEvent(event.id, notes, isPaid ? paymentMethod : 'free');

      // Trigger Confetti effect
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 py-6 sm:py-10 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg my-auto rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-slate-200 bg-slate-50/80">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold mb-1">
            <TicketIcon className="w-4 h-4 text-teal-600" />
            <span>{isPaid ? 'Checkout Tiket Berbayar (VIP Pass)' : 'Konfirmasi Pendaftaran Event'}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 leading-snug">
            {event.title}
          </h2>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Event Quick Info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{new Date(event.event_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-slate-500">Kategori & Tipe:</span>
              <span className="font-bold text-slate-800 uppercase text-[11px]">{event.category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Sisa Kuota Tersedia:</span>
              <strong className="text-teal-700 font-bold">{event.remaining_quota} kursi</strong>
            </div>
          </div>

          {/* Attendee Profile Info */}
          {user ? (
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-teal-800 font-semibold">Data Akun Pendaftar:</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                  {user.role}
                </span>
              </div>
              <p className="text-slate-900 font-bold text-sm">{user.name}</p>
              <p className="text-slate-600">{user.email} • {user.organization || 'Umum'}</p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <p className="font-bold mb-1">Anda belum login.</p>
              <p className="text-slate-600">
                Silakan login terlebih dahulu agar tiket digital dapat diterbitkan untuk akun Anda.
              </p>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PAID EVENT CHECKOUT & PAYMENT METHOD SELECTOR */}
          {/* ========================================================================= */}
          {isPaid && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border-2 border-amber-300 space-y-3.5">
              <div className="flex items-center justify-between border-b border-amber-200/70 pb-2.5">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  <span>Rincian Pembayaran Tiket VIP</span>
                </div>
                <span className="text-base font-black text-slate-900 font-mono">
                  Rp {event.price.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Payment Method Tabs */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700">
                  Pilih Metode Pembayaran:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      paymentMethod === 'qris'
                        ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <QrCode className={`w-4 h-4 ${paymentMethod === 'qris' ? 'text-teal-600' : 'text-slate-500'}`} />
                      {paymentMethod === 'qris' && <Check className="w-3 h-3 text-teal-600" />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 block">QRIS Instan</span>
                    <span className="text-[9px] text-slate-500">GoPay, OVO, BCA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('va_bca')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      paymentMethod === 'va_bca'
                        ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Building2 className={`w-4 h-4 ${paymentMethod === 'va_bca' ? 'text-teal-600' : 'text-slate-500'}`} />
                      {paymentMethod === 'va_bca' && <Check className="w-3 h-3 text-teal-600" />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 block">VA BCA</span>
                    <span className="text-[9px] text-slate-500">Virtual Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('va_mandiri')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      paymentMethod === 'va_mandiri'
                        ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Building2 className={`w-4 h-4 ${paymentMethod === 'va_mandiri' ? 'text-teal-600' : 'text-slate-500'}`} />
                      {paymentMethod === 'va_mandiri' && <Check className="w-3 h-3 text-teal-600" />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 block">VA Mandiri</span>
                    <span className="text-[9px] text-slate-500">Virtual Account</span>
                  </button>
                </div>
              </div>

              {/* Simulation Sandbox Notice */}
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Simulasi Pembayaran Terintegrasi (Otomatis Lunas & Terverifikasi Langsung)</span>
              </div>
            </div>
          )}

          {/* Registration Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Catatan / Harapan Mengikuti Event (Opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Ingin memperdalam arsitektur microservices dan berjejaring dengan engineer Surabaya..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 focus:outline-none text-xs text-slate-900 placeholder-slate-400 transition-all resize-none"
            />
          </div>

          {/* Anti-race condition reassurance */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Dilindungi PostgreSQL Pessimistic Lock (Anti-Overselling Kuota)</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
            >
              Batal
            </button>

            {user ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 ${
                  isPaid
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md font-black'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isPaid ? 'Memproses Pembayaran...' : 'Mendaftarkan Tiket...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {isPaid
                        ? `Bayar Sekarang (Rp ${event.price.toLocaleString('id-ID')})`
                        : 'Konfirmasi & Dapatkan Tiket Gratis'}
                    </span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onRequireAuth}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
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
