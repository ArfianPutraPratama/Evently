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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl my-6 rounded-2xl overflow-hidden bg-[#10131c] border border-white/[0.12] shadow-2xl">
        {/* Modal Controls */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06] bg-black/40 print:hidden">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <Award className="w-4 h-4 text-amber-400" />
            <span>E-Sertifikat Kehadiran Resmi SurabayaDev 12th Anniversary</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas */}
        <div
          id="printable-certificate"
          className="p-8 sm:p-12 space-y-8 bg-gradient-to-b from-[#10131c] via-[#0d1017] to-[#090b10] border-8 border-double border-white/[0.08] m-4 rounded-xl relative"
        >
          {/* Subtle Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <span className="font-mono text-[180px] font-black text-white">12TH</span>
          </div>

          {/* Certificate Header */}
          <div className="text-center space-y-2 relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] uppercase font-bold tracking-widest">
              <Award className="w-3.5 h-3.5" />
              <span>Certificate of Attendance & Participation</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-2">
              SURABAYADEV 12TH ANNIVERSARY
            </h2>
            <p className="text-xs text-zinc-400 font-medium tracking-wide">
              Membangun Ekosistem Developer & Inovasi Teknologi Kota Surabaya
            </p>
          </div>

          {/* Recipient Notice */}
          <div className="text-center space-y-3 relative">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">
              Sertifikat Ini Diberikan Kepada:
            </p>

            <h3 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-indigo-300 font-sans tracking-tight border-b border-white/[0.1] pb-3 max-w-xl mx-auto">
              {user?.name || 'Budi Developer'}
            </h3>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed pt-2">
              Atas kehadiran dan partisipasi aktif dalam sesi:
            </p>
            <p className="text-base sm:text-lg font-bold text-indigo-300 max-w-lg mx-auto leading-snug">
              "{event.title}"
            </p>
            <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-white/[0.05] border border-white/10 text-zinc-400">
              Kategori: {event.category} • Venue: {event.location.split(',')[0]}
            </span>
          </div>

          {/* Signatures & Security Validation Footer */}
          <div className="pt-6 border-t border-white/[0.08] grid grid-cols-3 items-end text-xs relative gap-4">
            {/* Signature 1 */}
            <div className="text-center space-y-1">
              <div className="h-12 flex items-center justify-center">
                <span className="font-serif italic text-base text-zinc-400 font-semibold tracking-wider">
                  Surya Kusuma
                </span>
              </div>
              <div className="border-t border-white/[0.15] pt-1">
                <p className="font-bold text-white text-xs">Surya Kusuma, M.Kom.</p>
                <p className="text-[10px] text-zinc-500">Lead Curator SurabayaDev</p>
              </div>
            </div>

            {/* QR Verification in Center */}
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="p-2 bg-white rounded-lg shadow-md">
                <QRCodeSVG
                  value={`https://surabayadev.org/verify/cert/${certNumber}`}
                  size={64}
                  level="M"
                />
              </div>
              <span className="font-mono text-[9px] text-zinc-500 block">
                {certNumber}
              </span>
              <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Attendance</span>
              </div>
            </div>

            {/* Signature 2 */}
            <div className="text-center space-y-1">
              <div className="h-12 flex items-center justify-center">
                <span className="font-serif italic text-base text-zinc-400 font-semibold tracking-wider">
                  Pratama Wijaya
                </span>
              </div>
              <div className="border-t border-white/[0.15] pt-1">
                <p className="font-bold text-white text-xs">Pratama Wijaya</p>
                <p className="text-[10px] text-zinc-500">Ketua Panitia 12th Anniversary</p>
              </div>
            </div>
          </div>

          {/* Certificate Subtext */}
          <div className="text-center text-[10px] text-zinc-600 font-mono border-t border-white/[0.04] pt-3">
            Diterbitkan secara sah oleh Platform Evently SurabayaDev • Tanggal Pelaksanaan: {eventDateFormatted}
          </div>
        </div>
      </div>
    </div>
  );
};
