import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardMetrics, EventItem, Registration } from '../types';
import { ShieldCheck, Plus, Users, Calendar, CheckCircle2, Ticket, Edit3, Trash2, Search, X, Loader2, RefreshCw, Download, Check, DollarSign, CreditCard } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [eventsSummary, setEventsSummary] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [attendees, setAttendees] = useState<Registration[]>([]);
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [attendeeStatus, setAttendeeStatus] = useState('all');
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);

  // Event modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    category: 'Conference',
    location: '',
    event_date: '',
    quota: 100,
    price: 0,
    banner_url: '',
    speaker_name: '',
    speaker_role: '',
    is_published: true,
  });
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await api.getAdminDashboard();
      setMetrics(res.metrics);
      setEventsSummary(res.events_summary);
      if (res.events_summary.length > 0 && !selectedEventId) {
        setSelectedEventId(res.events_summary[0].id);
      }
    } catch (e) {
      console.error('Failed to load dashboard', e);
    }
  };

  const fetchAttendees = async () => {
    if (!selectedEventId) return;
    setIsLoadingAttendees(true);
    try {
      const res = await api.getEventAttendees(selectedEventId, attendeeSearch, attendeeStatus);
      setAttendees(res.attendees);
    } catch (e) {
      console.error('Failed to load attendees', e);
    } finally {
      setIsLoadingAttendees(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    fetchAttendees();
  }, [selectedEventId, attendeeStatus]);

  const exportToCSV = () => {
    if (attendees.length === 0) {
      alert('Tidak ada data peserta untuk diekspor.');
      return;
    }

    const currentEvent = eventsSummary.find((e) => e.id === selectedEventId);
    const eventTitle = currentEvent ? currentEvent.title : 'Event';

    let csvContent = '\uFEFF';
    csvContent += 'No,Kode Registrasi,Kode Tiket,Nama Peserta,Email,Institusi / Organisasi,Status Kehadiran,Waktu Check-In,Tanggal Mendaftar\n';

    attendees.forEach((att, index) => {
      const no = index + 1;
      const regCode = `"${att.registration_code || ''}"`;
      const ticketCode = `"${att.ticket?.ticket_code || ''}"`;
      const name = `"${(att.user?.name || '').replace(/"/g, '""')}"`;
      const email = `"${(att.user?.email || '').replace(/"/g, '""')}"`;
      const org = `"${(att.user?.organization || 'Umum').replace(/"/g, '""')}"`;
      const status = att.ticket?.status === 'checked_in' ? 'Checked In' : 'Belum Masuk';
      const checkInTime = att.ticket?.checked_in_at
        ? `"${new Date(att.ticket.checked_in_at).toLocaleString('id-ID')}"`
        : '-';
      const regTime = `"${new Date(att.registered_at).toLocaleString('id-ID')}"`;

      csvContent += `${no},${regCode},${ticketCode},${name},${email},${org},${status},${checkInTime},${regTime}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `peserta-${eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManualCheckIn = async (ticketCode: string) => {
    try {
      await api.checkIn(ticketCode);
      fetchAttendees();
      fetchDashboard();
    } catch (e: any) {
      alert(e.message || 'Presensi manual gagal.');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setEventFormData({
      title: '',
      description: '',
      category: 'Conference',
      location: 'Dyandra Convention Center, Surabaya',
      event_date: '',
      quota: 100,
      price: 0,
      banner_url: '',
      speaker_name: '',
      speaker_role: '',
      is_published: true,
    });
    setIsEventModalOpen(true);
  };

  const handleOpenEditModal = (event: any) => {
    setEditingEvent(event);
    setEventFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      location: event.location,
      event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '',
      quota: event.quota,
      price: event.price || 0,
      banner_url: event.banner_url || '',
      speaker_name: event.speaker_name || '',
      speaker_role: event.speaker_role || '',
      is_published: event.is_published,
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEvent(true);
    try {
      if (editingEvent) {
        await api.updateEvent(editingEvent.id, eventFormData);
      } else {
        await api.createEvent(eventFormData);
      }
      setIsEventModalOpen(false);
      fetchDashboard();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan event.');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Yakin ingin menghapus event ini?')) return;
    try {
      await api.deleteEvent(id);
      fetchDashboard();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus event.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Admin Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Admin Console & Event Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Dashboard Manajemen Acara
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Kelola event, atur kuota peserta, dan pantau kehadiran tiket secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all shadow-xs"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Event Baru</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="card-soft p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              TOTAL EVENT
            </span>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{metrics.total_events}</p>
            <p className="text-[10px] text-slate-500">Tersedia di platform</p>
          </div>

          <div className="card-soft p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-500" />
              TOTAL KUOTA
            </span>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{metrics.total_quota}</p>
            <p className="text-[10px] text-slate-500">Kapasitas seluruh event</p>
          </div>

          <div className="card-soft p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
              <Ticket className="w-3.5 h-3.5 text-teal-600" />
              PENDAFTAR
            </span>
            <p className="text-xl sm:text-2xl font-black text-teal-700">{metrics.total_registrations}</p>
            <p className="text-[10px] text-teal-600 font-medium">Tiket diterbitkan</p>
          </div>

          <div className="card-soft p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              CHECK-IN GATE
            </span>
            <p className="text-xl sm:text-2xl font-black text-emerald-600">{metrics.check_in_rate}%</p>
            <p className="text-[10px] text-slate-500 font-medium">{metrics.total_checked_in} tiket valid</p>
          </div>

          <div className="card-soft p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1 col-span-2 lg:col-span-1">
            <span className="text-[10px] text-amber-800 font-bold uppercase flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              PENDAPATAN TIKET
            </span>
            <p className="text-xl sm:text-2xl font-black text-amber-900 font-mono">
              Rp {(metrics.total_revenue || 0).toLocaleString('id-ID')}
            </p>
            <p className="text-[10px] text-amber-700 font-medium">Tiket berbayar terverifikasi</p>
          </div>
        </div>
      )}

      {/* Events Table & CRUD List */}
      <div className="card-soft p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-600" />
          Daftar Seluruh Event SurabayaDev
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] bg-slate-50/60">
                <th className="py-2.5 px-3">JUDUL ACARA</th>
                <th className="py-2.5 px-3">KATEGORI</th>
                <th className="py-2.5 px-3">HARGA</th>
                <th className="py-2.5 px-3">JADWAL</th>
                <th className="py-2.5 px-3">KUOTA TERISI</th>
                <th className="py-2.5 px-3">CHECK-IN</th>
                <th className="py-2.5 px-3 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eventsSummary.map((evt) => (
                <tr
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className={`cursor-pointer transition-colors ${
                    selectedEventId === evt.id ? 'bg-teal-50/60' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900 leading-tight">{evt.title}</p>
                    <p className="text-[10px] text-slate-500">{evt.location}</p>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      {evt.category}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {evt.price > 0 ? (
                      <span className="font-extrabold text-amber-800 text-[11px] font-mono">
                        Rp {evt.price.toLocaleString('id-ID')}
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-bold text-[11px]">
                        Gratis
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-600 text-[11px]">
                    {new Date(evt.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900">{evt.registered_count}</span>
                    <span className="text-slate-400"> / {evt.quota}</span>
                  </td>
                  <td className="py-3 px-3 text-emerald-700 font-bold">
                    {evt.checked_in_count || 0} hadir
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEditModal(evt)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                        title="Edit event"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all"
                        title="Hapus event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Event Attendee Explorer */}
      {selectedEventId && (
        <div className="card-soft p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                Data Peserta Terdaftar
              </h3>
              <p className="text-xs text-slate-500">
                Memantau peserta terdaftar dan status validasi pintu masuk event yang dipilih.
              </p>
            </div>

            {/* Filter & Export controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={exportToCSV}
                disabled={attendees.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-all disabled:opacity-40 shadow-xs"
                title="Unduh daftar peserta format CSV / Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV ({attendees.length})</span>
              </button>

              <div className="relative">
                <input
                  type="text"
                  value={attendeeSearch}
                  onChange={(e) => setAttendeeSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchAttendees()}
                  placeholder="Cari peserta / kode tiket..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={attendeeStatus}
                onChange={(e) => setAttendeeStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
              >
                <option value="all">Semua Status</option>
                <option value="checked_in">Checked In</option>
                <option value="issued">Belum Masuk</option>
              </select>
            </div>
          </div>

          {/* Attendees Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] bg-slate-50/60">
                  <th className="py-2.5 px-3">NO. REGISTRASI</th>
                  <th className="py-2.5 px-3">KODE TIKET</th>
                  <th className="py-2.5 px-3">NAMA PESERTA</th>
                  <th className="py-2.5 px-3">EMAIL & INSTITUSI</th>
                  <th className="py-2.5 px-3">STATUS KEHADIRAN</th>
                  <th className="py-2.5 px-3">WAKTU DAFTAR</th>
                  <th className="py-2.5 px-3 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingAttendees ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600" />
                      <span className="text-xs block mt-2">Memuat data peserta...</span>
                    </td>
                  </tr>
                ) : attendees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Belum ada peserta terdaftar untuk event ini.
                    </td>
                  </tr>
                ) : (
                  attendees.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {att.registration_code}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {att.ticket?.ticket_code || 'N/A'}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {att.user?.name}
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-[11px]">
                        <p>{att.user?.email}</p>
                        <p className="text-[10px] text-slate-400">{att.user?.organization || 'Umum'}</p>
                      </td>
                      <td className="py-3 px-3">
                        {att.ticket?.status === 'checked_in' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <Ticket className="w-3 h-3" />
                            Tiket Terbit
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {new Date(att.registered_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {att.ticket?.status !== 'checked_in' ? (
                          <button
                            type="button"
                            onClick={() => handleManualCheckIn(att.ticket?.ticket_code || '')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-[11px] font-bold transition-all shadow-xs"
                            title="Tandai kehadiran peserta ini secara manual"
                          >
                            <Check className="w-3 h-3" />
                            <span>Presensi</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">Tervalidasi</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Event Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl my-8 rounded-3xl bg-white border border-slate-200 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingEvent ? 'Edit Data Event' : 'Buat Event Baru'}
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Acara</label>
                <input
                  type="text"
                  required
                  value={eventFormData.title}
                  onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                  placeholder="Contoh: SurabayaDev 12th Anniversary Tech Summit"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={eventFormData.category}
                    onChange={(e) => setEventFormData({ ...eventFormData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Conference">Conference</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Masterclass">Masterclass</option>
                    <option value="Community Meetup">Community Meetup</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kuota Peserta</label>
                  <input
                    type="number"
                    required
                    min={editingEvent ? editingEvent.registered_count : 1}
                    value={eventFormData.quota}
                    onChange={(e) => setEventFormData({ ...eventFormData, quota: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga Tiket (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="0 = Gratis"
                    value={eventFormData.price}
                    onChange={(e) => setEventFormData({ ...eventFormData, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jadwal Mulai</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventFormData.event_date}
                    onChange={(e) => setEventFormData({ ...eventFormData, event_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lokasi / Venue</label>
                  <input
                    type="text"
                    required
                    value={eventFormData.location}
                    onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
                    placeholder="Contoh: Dyandra Convention Center"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Pembicara</label>
                  <input
                    type="text"
                    value={eventFormData.speaker_name}
                    onChange={(e) => setEventFormData({ ...eventFormData, speaker_name: e.target.value })}
                    placeholder="Nama Narasumber"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peran / Titel</label>
                  <input
                    type="text"
                    value={eventFormData.speaker_role}
                    onChange={(e) => setEventFormData({ ...eventFormData, speaker_role: e.target.value })}
                    placeholder="Contoh: Google Developer Expert"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Acara</label>
                <textarea
                  required
                  rows={3}
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                  placeholder="Jelaskan agenda dan topik bahasan acara..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Gambar Banner</label>
                <input
                  type="url"
                  value={eventFormData.banner_url}
                  onChange={(e) => setEventFormData({ ...eventFormData, banner_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEvent}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold disabled:opacity-50 shadow-sm"
                >
                  {isSubmittingEvent ? 'Menyimpan...' : 'Simpan Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
