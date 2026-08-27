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

  const playSound = (type: 'success' | 'duplicate' | 'error') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'duplicate') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(165, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
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
      if (scanMode === 'desk') {
        searchDeskAttendees();
      }
    } catch (err: any) {
      const status = err?.status;
      const msg = err?.data?.message || err.message || 'Validasi tiket gagal.';
      if (status === 409) {
        setLastResult({
          status: 'duplicate',
          message: msg,
          data: err?.data?.data,
        });
        playSound('duplicate');
      } else {
        setLastResult({
          status: 'invalid',
          message: msg,
          data: err?.data?.data,
        });
        playSound('error');
      }
      fetchLogsAndStats();
    } finally {
      setIsProcessing(false);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        throw new Error('Tidak ada perangkat kamera yang terdeteksi.');
      }
      const backCamera = devices.find((d) => d.label.toLowerCase().includes('back')) || devices[0];

      const html5QrCode = new Html5Qrcode('qr-camera-stream');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        backCamera.id,
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleValidateTicket(decodedText);
        },
        () => {}
      );
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Error starting camera', err);
      setCameraError(err.message || 'Gagal mengakses kamera. Periksa izin kamera pada browser.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping camera', err);
      } finally {
        html5QrCodeRef.current = null;
        setIsCameraActive(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const html5QrCode = new Html5Qrcode('qr-hidden-canvas');
      const decodedText = await html5QrCode.scanFile(file, true);
      handleValidateTicket(decodedText);
    } catch (err: any) {
      setLastResult({
        status: 'invalid',
        message: 'Tidak ditemukan QR Code yang valid pada gambar.',
      });
      playSound('error');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
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

      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Gatekeeper Terminal • SurabayaDev 12th</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Validasi Presensi Pintu Masuk
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Validasi presensi peserta dengan pemindai QR Code kamera live, input barcode, dan pencegahan duplikat atomik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              soundEnabled
                ? 'bg-slate-100 border-slate-200 text-slate-800'
                : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <Volume2 className={`w-3.5 h-3.5 ${soundEnabled ? 'text-teal-600' : 'text-slate-400'}`} />
            <span>Audio {soundEnabled ? 'Aktif' : 'Mati'}</span>
          </button>

          <button
            onClick={fetchLogsAndStats}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all shadow-xs"
            title="Segarkan data presensi"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Gate Counter Box */}
      <div className="card-soft p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Live Gate Counter Presensi
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">Filter Sesi:</span>
            <select
              value={selectedGateEventId}
              onChange={(e) => setSelectedGateEventId(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-teal-500 font-medium"
            >
              <option value="all">Semua Sesi (Agregat)</option>
              {gateStats?.events.map((evt) => (
                <option key={evt.id} value={evt.id.toString()}>
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
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Pendaftar di Gate</span>
                <p className="text-2xl font-black text-slate-900">{regCount} <span className="text-xs font-normal text-slate-500">Peserta</span></p>
                <p className="text-[11px] text-slate-500">Kapasitas resmi terdaftar</p>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-teal-800 uppercase font-bold block">Sudah Masuk (Checked In)</span>
                  <span className="px-2 py-0.5 rounded-md bg-teal-200/80 text-teal-900 text-[10px] font-bold">{rate}%</span>
                </div>
                <p className="text-2xl font-black text-teal-800">{checkedCount} <span className="text-xs font-normal text-teal-600">Hadir</span></p>
                <div className="w-full h-1.5 bg-teal-200/60 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full transition-all duration-500" style={{ width: `${rate}%` }} />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                <span className="text-[10px] text-amber-800 uppercase font-bold block">Belum Hadir (Antrean)</span>
                <p className="text-2xl font-black text-amber-800">{waitCount} <span className="text-xs font-normal text-amber-600">Menunggu</span></p>
                <p className="text-[11px] text-slate-500">Tiket valid belum check-in</p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Scanner & Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Multi-mode Scanner */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Mode Pemindaian:
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => handleSwitchTab('camera')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    scanMode === 'camera'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-teal-600" />
                  <span>Kamera</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchTab('manual')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    scanMode === 'manual'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5 text-teal-600" />
                  <span>Ketik / Preset</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchTab('upload')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    scanMode === 'upload'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-teal-600" />
                  <span>File QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchTab('desk')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    scanMode === 'desk'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Cari Peserta</span>
                </button>
              </div>
            </div>

            {/* 1. Camera Mode */}
            {scanMode === 'camera' && (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-300 min-h-[260px] flex items-center justify-center">
                  <div id="qr-camera-stream" className="w-full max-w-sm overflow-hidden" />

                  {!isCameraActive && !cameraError && (
                    <div className="text-center p-6 space-y-3">
                      <Camera className="w-8 h-8 text-teal-400 mx-auto animate-pulse" />
                      <p className="text-xs text-slate-300">Menghubungkan ke kamera perangkat...</p>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-sm"
                      >
                        Aktifkan Kamera Sekarang
                      </button>
                    </div>
                  )}

                  {cameraError && (
                    <div className="text-center p-6 space-y-2 text-xs text-rose-300">
                      <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto" />
                      <p className="font-bold">Izin Kamera Ditolak / Tidak Ditemukan</p>
                      <p className="text-[11px] text-slate-400">{cameraError}</p>
                      <button
                        type="button"
                        onClick={() => handleSwitchTab('manual')}
                        className="mt-2 px-3 py-1 rounded-lg bg-white/20 text-white text-xs"
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
                    className="w-full py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-2"
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
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 transition-all uppercase tracking-wider font-semibold"
                    autoFocus
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !ticketInput.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs transition-all disabled:opacity-40 shadow-sm"
                >
                  {isProcessing ? 'Memvalidasi...' : 'Validasi & Presensi Masuk'}
                </button>
              </form>
            )}

            {/* 3. Upload QR Image Mode */}
            {scanMode === 'upload' && (
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-2xl cursor-pointer bg-slate-50 transition-all">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700">Klik untuk Unggah Gambar QR Code</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Mendukung format PNG, JPG, JPEG</span>
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
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 transition-all"
                    autoFocus
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {isSearchingDesk ? (
                    <div className="p-4 text-center text-slate-400 text-xs font-medium">Mencari data pendaftar...</div>
                  ) : deskAttendees.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      {deskSearch ? 'Tidak ada peserta yang cocok.' : 'Ketik nama atau email peserta untuk mencari.'}
                    </div>
                  ) : (
                    deskAttendees.map((reg) => (
                      <div
                        key={reg.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-500/40 flex items-center justify-between gap-3 text-xs transition-all"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-slate-900 truncate">{reg.user?.name}</h5>
                            <span className="font-mono text-[10px] text-teal-800 px-1.5 py-0.5 rounded bg-teal-50 font-bold border border-teal-200">
                              {reg.ticket?.ticket_code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{reg.user?.email}</p>
                          <p className="text-[10px] text-slate-400 truncate">{reg.event?.title}</p>
                        </div>

                        <div className="shrink-0">
                          {reg.ticket?.status === 'checked_in' ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              Sudah Masuk
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleValidateTicket(reg.ticket?.ticket_code)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-xs"
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
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Preset Cepat Reviewer (Sekali Klik):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleValidateTicket('TKT-12TH-F39HBPBR')}
                  className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-teal-200 transition-all shadow-2xs"
                >
                  <span className="text-[10px] font-bold text-teal-700 block">Uji Tiket Valid</span>
                  <span className="text-xs font-mono font-semibold text-slate-800 block truncate">TKT-12TH-F39HBPBR</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleValidateTicket('TKT-LWJL-B09OR9')}
                  className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200 hover:border-rose-200 transition-all shadow-2xs"
                >
                  <span className="text-[10px] font-bold text-rose-600 block">Uji Duplicate Check-in</span>
                  <span className="text-xs font-mono font-semibold text-slate-800 block truncate">TKT-LWJL-B09OR9</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Scan Result Alert Banner */}
        <div className="lg:col-span-6 space-y-4">
          {lastResult.status === null ? (
            <div className="card-soft rounded-2xl p-8 bg-white border border-slate-200 text-center space-y-3 min-h-[300px] flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">Siap Memindai Tiket</h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Arahkan kamera ke QR Code tiket peserta atau gunakan preset pengujian untuk memverifikasi keabsahan tiket.
                </p>
              </div>
            </div>
          ) : lastResult.status === 'success' ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-400 space-y-4 shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-black text-emerald-800">
                    TIKET VALID • PRESENSI BERHASIL
                  </span>
                  <h3 className="text-lg font-black text-emerald-950">
                    {lastResult.message}
                  </h3>
                </div>
              </div>

              {lastResult.data && (
                <div className="p-4 rounded-xl bg-white border border-emerald-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Nama Peserta:</span>
                    <span className="font-bold text-slate-900">{lastResult.data.attendee_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Kode Tiket:</span>
                    <span className="font-mono font-bold text-teal-800">{lastResult.data.ticket_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Sesi Event:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[200px]">{lastResult.data.event_title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Waktu Presensi:</span>
                    <span className="font-mono text-slate-600">{new Date(lastResult.data.checked_in_at).toLocaleTimeString('id-ID')} WIB</span>
                  </div>
                </div>
              )}
            </div>
          ) : lastResult.status === 'duplicate' ? (
            <div className="p-6 rounded-2xl bg-rose-50 border-2 border-rose-400 space-y-4 shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-black text-rose-800">
                    PERINGATAN: TIKET GANDA DITOLAK
                  </span>
                  <h3 className="text-lg font-black text-rose-950">
                    {lastResult.message}
                  </h3>
                </div>
              </div>

              {lastResult.data && (
                <div className="p-4 rounded-xl bg-white border border-rose-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Pemilik Tiket:</span>
                    <span className="font-bold text-slate-900">{lastResult.data.attendee_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Kode Tiket:</span>
                    <span className="font-mono font-bold text-rose-700">{lastResult.data.ticket_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Waktu Masuk Pertama:</span>
                    <span className="font-mono font-bold text-rose-800">
                      {new Date(lastResult.data.already_checked_in_at).toLocaleTimeString('id-ID')} WIB
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-400 space-y-4 shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-black text-amber-800">
                    TIKET TIDAK VALID
                  </span>
                  <h3 className="text-lg font-black text-amber-950">
                    {lastResult.message}
                  </h3>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit Trail Table */}
      <div className="card-soft rounded-2xl p-6 bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Audit Trail Pemindaian Real-Time
            </h3>
            <p className="text-xs text-slate-500">
              Log aktivitas presensi dan verifikasi gate secara transparan.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {recentLogs.length} tercatat
          </span>
        </div>

        {recentLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Belum ada aktivitas pemindaian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] bg-slate-50/60">
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Kode Tiket</th>
                  <th className="py-2.5 px-3">Nama Peserta</th>
                  <th className="py-2.5 px-3">Sesi Acara</th>
                  <th className="py-2.5 px-3">Hasil Pemindaian</th>
                  <th className="py-2.5 px-3">Validator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {log.ticket?.ticket_code || '-'}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {log.ticket?.registration?.user?.name || 'Peserta'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-[180px]">
                      {log.ticket?.registration?.event?.title || '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      {log.scan_result === 'success' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Sukses Masuk
                        </span>
                      ) : log.scan_result === 'duplicate_rejected' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          Duplikat Ditolak
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <XCircle className="w-3 h-3" />
                          Tidak Valid
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {log.validator?.name || 'Panitia Gate'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
