import React from 'react';
import { Registration } from '../types';
import { Award, CheckCircle2, Printer, X, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface CertificateModalProps {
  registration: Registration | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  registration,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !registration) return null;

  const event = registration.event;
  const user = registration.user;
  const ticket = registration.ticket;

  if (!event || !ticket) return null;

  const certNumber = `SBYDEV12/CERT/${event.category.toUpperCase().slice(0, 4)}/${ticket.ticket_code.replace('TKT-', '')}`;
  const eventDateFormatted = new Date(event.event_date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

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

  return (
    <div
      onClick={onClose}
      className="certificate-modal-wrapper fixed inset-0 z-50 flex items-start justify-center p-4 py-6 sm:py-10 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="certificate-dialog-card relative w-full max-w-4xl my-auto rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-2xl"
      >
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2 text-teal-800 text-xs font-bold">
            <Award className="w-4 h-4 text-amber-500" />
            <span>E-Sertifikat Kehadiran Resmi • SurabayaDev 12th Anniversary</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all"
              title="Tutup (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas (Optimized for A4 Landscape Print) */}
        <div
          id="printable-certificate"
          className="p-6 sm:p-10 space-y-5 bg-[#fafaf9] border-6 border-double border-amber-600 m-3 sm:m-4 rounded-2xl relative text-slate-900"
          style={{
            backgroundColor: '#fafaf9',
            borderColor: '#d97706',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
        >
          {/* Subtle Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <span className="font-mono text-[180px] font-black text-slate-900">12TH</span>
          </div>

          {/* Certificate Header */}
          <div className="text-center space-y-1.5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] uppercase font-bold tracking-widest border border-amber-300">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>Certificate of Attendance & Participation</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-1">
              SURABAYADEV 12TH ANNIVERSARY
            </h2>
            <p className="text-xs text-slate-500 font-medium tracking-wide">
              Membangun Ekosistem Developer & Inovasi Teknologi Masa Depan di Kota Surabaya
            </p>
          </div>

          {/* Recipient Notice */}
          <div className="text-center space-y-2 relative z-10">
            <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">
              Sertifikat Kehadiran Ini Resmi Diberikan Kepada:
            </p>

            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 font-sans tracking-tight border-b-2 border-amber-400/40 pb-2 max-w-xl mx-auto">
              {user?.name || 'Peserta Terdaftar'}
            </h3>

            <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed pt-1">
              Atas kehadiran dan partisipasi aktif dalam sesi:
            </p>
            <p className="text-base sm:text-lg font-bold text-teal-800 max-w-xl mx-auto leading-snug">
              "{event.title}"
            </p>
          </div>

          {/* Certificate Details Strip */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-center relative z-10 text-xs">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">NOMOR SERTIFIKAT</span>
              <span className="font-mono text-[11px] font-bold text-slate-800">{certNumber}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">TANGGAL PELAKSANAAN</span>
              <span className="font-medium text-slate-800 text-[11px]">{eventDateFormatted}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">STATUS VALIDASI</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Presensi Terverifikasi Gate
              </span>
            </div>
          </div>

          {/* Signatures & Security Validation */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-200 relative z-10">
            <div className="text-center sm:text-left space-y-1">
              <div className="h-9 flex items-end">
                <span className="font-serif italic text-lg text-slate-800 tracking-wider">
                  SurabayaDev Board
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 border-t border-slate-300 pt-1">
                Advisory Committee
              </p>
              <p className="text-[10px] text-slate-500">SurabayaDev 12th Anniversary</p>
            </div>

            {/* QR Verification Code */}
            <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <QRCodeSVG
                value={`https://surabayadev.org/verify-cert/${ticket.ticket_code}`}
                size={58}
                level="M"
              />
              <div className="text-left space-y-0.5">
                <span className="text-[8px] uppercase font-bold text-slate-400 block font-mono">VERIFIKASI INTEGRITAS</span>
                <span className="font-mono text-[10px] font-bold text-slate-900 block">{ticket.ticket_code}</span>
                <span className="text-[9px] text-emerald-700 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Keaslian Terjamin
                </span>
              </div>
            </div>

            <div className="text-center sm:text-right space-y-1">
              <div className="h-9 flex items-end justify-center sm:justify-end">
                <span className="font-serif italic text-lg text-slate-800 tracking-wider">
                  Program Lead
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 border-t border-slate-300 pt-1">
                Head of Technical Program
              </p>
              <p className="text-[10px] text-slate-500">SurabayaDev Tech Summit</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Close Button (Hidden in Print) */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
          >
            Tutup Jendela (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
