import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { CheckInLog } from '../types';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, Search, CheckCircle2, AlertTriangle, XCircle, Clock, ShieldCheck, RefreshCw, Volume2, Camera, Keyboard, Upload, StopCircle, UserCheck } from 'lucide-react';

export const CommitteeScanner: React.FC = () => {
  const [scanMode, setScanMode] = useState<'camera' | 'manual' | 'upload' | 'desk'>('manual');
  const [ticketInput, setTicketInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{
    status: 'success' | 'duplicate' | 'invalid' | null;
    message: string;
    data?: any;
  }>({ status: null, message: '' });
  const [recentLogs, setRecentLogs] = useState<CheckInLog[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gateStats, setGateStats] = useState<{
    total_registered: number;
    total_checked_in: number;
    total_waiting: number;
    check_in_rate: number;
    events: { id: number; title: string; registered_count: number; quota: number; checked_in_count: number }[];
  } | null>(null);
  const [selectedGateEventId, setSelectedGateEventId] = useState<string>('all');

  // Emergency Desk Search State
  const [deskSearch, setDeskSearch] = useState('');
  const [deskAttendees, setDeskAttendees] = useState<any[]>([]);
  const [isSearchingDesk, setIsSearchingDesk] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const fetchLogsAndStats = async () => {
    try {
      const logs = await api.getCheckInLogs();
      if (Array.isArray(logs)) setRecentLogs(logs);
    } catch (e) {
      console.error('Failed to load check-in logs', e);
    }

    try {
      const stats = await api.getGateStats();
      if (stats) setGateStats(stats);
    } catch (e) {
      console.error('Failed to load gate stats', e);
    }
  };

  useEffect(() => {
    fetchLogsAndStats();
    return () => {
      stopCamera();
    };
  }, []);

  const playSound = (type: 'success' | 'duplicate') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.setValueAtTime(146.83, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch {}
  };

  const handleValidateTicket = async (rawCodeOrPayload?: string) => {
    const text = (rawCodeOrPayload || ticketInput).trim();
    if (!text) return;

    setIsProcessing(true);
    setLastResult({ status: null, message: '' });

    try {
      const isJson = text.startsWith('{');
      const response = await api.checkIn(isJson ? undefined : text, isJson ? text : undefined);
      setLastResult({
        status: 'success',
        message: response.message || 'Check-in Berhasil!',
        data: response.data,
      });
      playSound('success');
      setTicketInput('');
      fetchLogsAndStats();
    } catch (err: any) {
      if (err.status === 409) {
        setLastResult({
          status: 'duplicate',
          message: err.data?.message || 'PERINGATAN: Tiket ini SUDAH PERNAH di-check in!',
          data: err.data?.data,
        });
        playSound('duplicate');
      } else {
        setLastResult({
          status: 'invalid',
          message: err.data?.message || err.message || 'Tiket tidak valid atau tidak ditemukan.',
        });
        playSound('duplicate');
      }
      fetchLogsAndStats();
    } finally {
      setIsProcessing(false);
    }
  };

  // Camera Management
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-camera-stream');
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Success callback
          handleValidateTicket(decodedText);
        },
        () => {
          // ignore frame errors
        }
      );
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera failed to start', err);
      setCameraError(err.message || 'Kamera tidak dapat diakses atau diblokir oleh peramban.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && isCameraActive) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.error('Error stopping camera', e);
      } finally {
        setIsCameraActive(false);
      }
    }
  };

  // Image Upload Scanner
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const scanner = new Html5Qrcode('qr-hidden-canvas');
      const decodedText = await scanner.scanFile(file, true);
      handleValidateTicket(decodedText);
      scanner.clear();
    } catch (err: any) {
      alert('Gagal mendeteksi QR Code dari gambar yang diunggah. Pastikan gambar jelas.');
    }
  };

  const searchDeskAttendees = async (query = deskSearch) => {
    setIsSearchingDesk(true);
    try {
      const results = await api.searchGateAttendees(query, selectedGateEventId);
      setDeskAttendees(results);
    } catch (e) {
      console.error('Failed to search desk attendees', e);
    } finally {
      setIsSearchingDesk(false);
    }
  };

  const handleSwitchTab = async (mode: 'camera' | 'manual' | 'upload' | 'desk') => {
    if (scanMode === 'camera' && mode !== 'camera') {
      await stopCamera();
    }
    setScanMode(mode);
    if (mode === 'camera') {
      setTimeout(() => startCamera(), 100);
    }
    if (mode === 'desk') {
      searchDeskAttendees('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <div id="qr-hidden-canvas" className="hidden" />

      {/* Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl elegant-card">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Gatekeeper Terminal • SurabayaDev 12th</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Validasi Tiket Pintu Masuk
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Validasi presensi peserta dengan pemindai kamera QR Code dan pencegahan duplicate check-in atomik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
              soundEnabled
                ? 'bg-white/[0.06] border-white/10 text-zinc-200'
                : 'bg-white/[0.02] border-white/[0.05] text-zinc-500'
            }`}
            title="Toggle audio feedback"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Audio {soundEnabled ? 'Aktif' : 'Nonaktif'}</span>
          </button>

          <button
            onClick={fetchLogsAndStats}
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 hover:text-white transition-all"
            title="Refresh logs and stats"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Gate Counter Box (Statistik Pintu Masuk Real-Time) */}
      <div className="p-5 rounded-2xl elegant-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Live Gate Counter Presensi
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500">Filter Event:</span>
            <select
              value={selectedGateEventId}
              onChange={(e) => setSelectedGateEventId(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-zinc-200 focus:outline-none focus:border-white/20"
            >
              <option value="all" className="bg-zinc-900 text-white">Semua Acara (Agregat)</option>
              {gateStats?.events.map((evt) => (
                <option key={evt.id} value={evt.id.toString()} className="bg-zinc-900 text-white">
                  {evt.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3 Metric Cards */}
        {(() => {
          let regCount = gateStats?.total_registered || 0;
          let checkedCount = gateStats?.total_checked_in || 0;
          let waitCount = gateStats?.total_waiting || 0;
          let rate = gateStats?.check_in_rate || 0;

          if (selectedGateEventId !== 'all' && gateStats?.events) {
            const current = gateStats.events.find((e) => e.id.toString() === selectedGateEventId);
            if (current) {
              regCount = current.registered_count;
              checkedCount = current.checked_in_count || 0;
              waitCount = Math.max(0, regCount - checkedCount);
              rate = regCount > 0 ? Math.round((checkedCount / regCount) * 100) : 0;
            }
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Total Pendaftar di Gate</span>
                <p className="text-xl font-bold text-white">{regCount} <span className="text-xs font-normal text-zinc-500">Peserta</span></p>
                <p className="text-[11px] text-zinc-500">Kapasitas resmi terdaftar</p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Sudah Masuk (Checked In)</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">{rate}%</span>
                </div>
                <p className="text-xl font-bold text-emerald-400">{checkedCount} <span className="text-xs font-normal text-emerald-500">Hadir</span></p>
                <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${rate}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/[0.05] border border-amber-500/20 space-y-1">
                <span className="text-[10px] text-amber-400 uppercase font-semibold block">Belum Hadir (Antrean)</span>
                <p className="text-xl font-bold text-amber-400">{waitCount} <span className="text-xs font-normal text-amber-500">Menunggu</span></p>
                <p className="text-[11px] text-zinc-500">Tiket valid belum check-in</p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Scanner & Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Multi-mode Scanner */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl elegant-card space-y-4">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Mode Pemindaian:
              </span>
              <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => handleSwitchTab('camera')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    scanMode === 'camera'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Kamera Live</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchTab('manual')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    scanMode === 'manual'
                      ? 'bg-white/[0.1] text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>Ketik / Preset</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchTab('upload')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    scanMode === 'upload'
                      ? 'bg-white/[0.1] text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>File QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchTab('desk')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    scanMode === 'desk'
                      ? 'bg-white/[0.1] text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Cari Peserta</span>
                </button>
              </div>
            </div>

            {/* 1. Camera Mode */}
            {scanMode === 'camera' && (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-black border border-white/[0.08] min-h-[260px] flex items-center justify-center">
                  <div id="qr-camera-stream" className="w-full max-w-sm overflow-hidden" />

                  {!isCameraActive && !cameraError && (
                    <div className="text-center p-6 space-y-3">
                      <Camera className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
                      <p className="text-xs text-zinc-300">Menghubungkan ke kamera perangkat...</p>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                      >
                        Aktifkan Kamera Sekarang
                      </button>
                    </div>
                  )}

                  {cameraError && (
                    <div className="text-center p-6 space-y-2 text-xs text-rose-300">
                      <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto" />
                      <p className="font-semibold">Izin Kamera Ditolak / Tidak Ditemukan</p>
                      <p className="text-[11px] text-zinc-400">{cameraError}</p>
                      <button
                        type="button"
                        onClick={() => handleSwitchTab('manual')}
                        className="mt-2 px-3 py-1 rounded-lg bg-white/[0.08] text-white text-xs"
                      >
                        Beralih ke Input Manual / Preset
                      </button>
                    </div>
                  )}
                </div>

                {isCameraActive && (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <StopCircle className="w-3.5 h-3.5" />
                    <span>Hentikan Kamera</span>
                  </button>
                )}
              </div>
            )}

            {/* 2. Manual Keyboard Mode */}
            {scanMode === 'manual' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleValidateTicket();
                }}
                className="space-y-3"
              >
                <div className="relative">
                  <input
                    type="text"
                    value={ticketInput}
                    onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
                    placeholder="Ketik Kode Tiket (misal: TKT-12TH-F39HBPBR)"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 transition-all uppercase tracking-wider"
                    autoFocus
                  />
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !ticketInput.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-xs transition-all disabled:opacity-40"
                >
                  {isProcessing ? 'Memvalidasi...' : 'Validasi & Presensi Masuk'}
                </button>
              </form>
            )}

            {/* 3. Upload QR Image Mode */}
            {scanMode === 'upload' && (
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/[0.1] hover:border-emerald-500/40 rounded-2xl cursor-pointer bg-white/[0.02] transition-all">
                  <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                  <span className="text-xs font-semibold text-zinc-200">Klik untuk Unggah Gambar QR Code</span>
                  <span className="text-[11px] text-zinc-500 mt-0.5">Mendukung format PNG, JPG, JPEG</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* 4. Emergency Desk Search Mode */}
            {scanMode === 'desk' && (
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={deskSearch}
                    onChange={(e) => {
                      setDeskSearch(e.target.value);
                      searchDeskAttendees(e.target.value);
                    }}
                    placeholder="Ketik nama peserta / email / institusi..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 transition-all"
                    autoFocus
                  />
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {isSearchingDesk ? (
                    <div className="p-4 text-center text-zinc-500 text-xs">Mencari data pendaftar...</div>
                  ) : deskAttendees.length === 0 ? (
                    <div className="p-4 text-center text-zinc-500 text-xs">
                      {deskSearch ? 'Tidak ada peserta yang cocok.' : 'Ketik nama atau email peserta untuk mencari.'}
                    </div>
                  ) : (
                    deskAttendees.map((reg) => (
                      <div
                        key={reg.id}
                        className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="font-semibold text-white truncate">{reg.user?.name}</h5>
                            <span className="font-mono text-[10px] text-zinc-400 px-1.5 py-0.5 rounded bg-white/[0.04]">
                              {reg.ticket?.ticket_code}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate">{reg.user?.email}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{reg.event?.title}</p>
                        </div>

                        <div className="shrink-0">
                          {reg.ticket?.status === 'checked_in' ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                              Sudah Masuk
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleValidateTicket(reg.ticket?.ticket_code)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all shadow-sm"
                            >
                              Presensi Darurat
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Preset Buttons for Reviewer Testing */}
            <div className="pt-3 border-t border-white/[0.06] space-y-2">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Preset Cepat Reviewer (Sekali Klik):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleValidateTicket('TKT-12TH-F39HBPBR')}
                  className="p-2.5 text-left rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] transition-all"
                >
                  <span className="text-[10px] font-semibold text-emerald-400 block">Uji Tiket Valid</span>
                  <span className="text-xs font-mono text-zinc-300 block truncate">TKT-12TH-F39HBPBR</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleValidateTicket('TKT-12TH-CHECKED')}
                  className="p-2.5 text-left rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] transition-all"
                >
                  <span className="text-[10px] font-semibold text-rose-400 block">Uji Duplicate Check-in</span>
                  <span className="text-xs font-mono text-zinc-300 block truncate">TKT-12TH-CHECKED</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Scan Result Alert Box */}
        <div className="lg:col-span-6 flex flex-col">
          {lastResult.status === 'success' && (
            <div className="p-5 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/20 text-white space-y-3 animate-slide-up h-full">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                    Validasi Berhasil
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {lastResult.data?.attendee_name}
                  </h4>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/10 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Kode:</span>
                  <span className="font-mono text-emerald-300">{lastResult.data?.ticket_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Email:</span>
                  <span className="text-zinc-200">{lastResult.data?.attendee_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Acara:</span>
                  <span className="text-zinc-200 line-clamp-1">{lastResult.data?.event_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Waktu Masuk:</span>
                  <span className="text-emerald-400 font-medium">{lastResult.data?.checked_in_at}</span>
                </div>
              </div>
            </div>
          )}

          {lastResult.status === 'duplicate' && (
            <div className="p-5 rounded-2xl bg-rose-500/[0.08] border border-rose-500/20 text-white space-y-3 animate-slide-up h-full">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                    Duplicate Check-In Ditolak
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Tiket Sudah Pernah Digunakan
                  </h4>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-rose-500/10 text-xs space-y-1.5 text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Pemilik:</span>
                  <span className="text-white font-medium">{lastResult.data?.attendee_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Check-in Pertama:</span>
                  <span className="text-rose-400 font-medium">{lastResult.data?.checked_in_at}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Divalidasi Oleh:</span>
                  <span className="text-zinc-300">{lastResult.data?.checked_in_by}</span>
                </div>
              </div>
            </div>
          )}

          {lastResult.status === 'invalid' && (
            <div className="p-5 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20 text-white space-y-2 animate-slide-up h-full flex flex-col justify-center">
              <div className="flex items-center gap-2 text-amber-400">
                <XCircle className="w-5 h-5" />
                <h4 className="font-semibold text-xs">Tiket Tidak Valid</h4>
              </div>
              <p className="text-xs text-zinc-400">{lastResult.message}</p>
            </div>
          )}

          {lastResult.status === null && (
            <div className="h-full min-h-[180px] p-6 rounded-2xl border border-dashed border-white/[0.07] flex flex-col items-center justify-center text-center text-zinc-500 space-y-1">
              <QrCode className="w-8 h-8 text-zinc-700" />
              <p className="text-xs font-medium text-zinc-400">Menunggu Pemindaian</p>
              <p className="text-[11px] text-zinc-600">Aktifkan kamera live, ketik kode tiket, atau pilih preset cepat.</p>
            </div>
          )}
        </div>
      </div>

      {/* Audit Trail Table */}
      <div className="p-5 rounded-2xl elegant-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            Audit Trail Pemindaian Real-Time
          </h3>
          <span className="text-[11px] text-zinc-500">{recentLogs.length} tercatat</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-zinc-500 text-[10px] uppercase font-semibold">
                <th className="pb-2.5 px-2">WAKTU</th>
                <th className="pb-2.5 px-2">KODE TIKET</th>
                <th className="pb-2.5 px-2">PESERTA</th>
                <th className="pb-2.5 px-2">HASIL</th>
                <th className="pb-2.5 px-2">PETUGAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-zinc-500 text-xs">
                    Belum ada aktivitas pemindaian.
                  </td>
                </tr>
              ) : (
                recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-2 font-mono text-[11px] text-zinc-400">
                      {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-2 font-mono text-zinc-200">
                      {log.ticket?.ticket_code || 'N/A'}
                    </td>
                    <td className="py-2.5 px-2 text-zinc-300">
                      {log.ticket?.registration?.user?.name || 'Peserta'}
                    </td>
                    <td className="py-2.5 px-2">
                      {log.scan_result === 'success' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Sukses Masuk
                        </span>
                      ) : log.scan_result === 'duplicate_rejected' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400">
                          <AlertTriangle className="w-3 h-3" />
                          Duplikat Ditolak
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400">
                          <XCircle className="w-3 h-3" />
                          Tidak Valid
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-zinc-500 text-[11px]">
                      {log.scanner?.name || 'Gate System'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
