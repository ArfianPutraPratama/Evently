import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardMetrics, EventItem, Registration } from '../types';
import { ShieldCheck, Plus, Users, Calendar, CheckCircle2, Ticket, Edit3, Trash2, Search, X, Loader2, RefreshCw } from 'lucide-react';

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

  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setEventFormData({
      title: '',
      description: '',
      category: 'Workshop',
      location: '',
      event_date: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
      quota: 100,
      banner_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Admin Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel-glow border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Console & Event Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Dashboard Manajemen Acara
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kelola event, atur kuota peserta, dan pantau kehadiran tiket secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Event Baru</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              TOTAL EVENT
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{metrics.total_events}</p>
            <p className="text-[11px] text-slate-500">Tersedia di platform</p>
          </div>

          <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              TOTAL KUOTA TIKET
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{metrics.total_quota}</p>
            <p className="text-[11px] text-slate-500">Kapasitas seluruh event</p>
          </div>

          <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-indigo-400" />
              PESERTA TERDAFTAR
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{metrics.total_registrations}</p>
            <p className="text-[11px] text-emerald-400 font-medium">Tiket digital diterbitkan</p>
          </div>

          <div className="p-5 rounded-3xl glass-panel border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              TINGKAT KEHADIRAN (CHECK-IN)
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{metrics.check_in_rate}%</p>
            <p className="text-[11px] text-slate-400 font-medium">{metrics.total_checked_in} tiket masuk terverifikasi</p>
          </div>
        </div>
      )}

      {/* Events Table & CRUD List */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          Daftar Seluruh Event SurabayaDev
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3 px-3">JUDUL ACARA</th>
                <th className="pb-3 px-3">KATEGORI</th>
                <th className="pb-3 px-3">JADWAL</th>
                <th className="pb-3 px-3">KUOTA TERISI</th>
                <th className="pb-3 px-3">CHECK-IN</th>
                <th className="pb-3 px-3 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {eventsSummary.map((evt) => (
                <tr
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className={`cursor-pointer transition-colors ${
                    selectedEventId === evt.id ? 'bg-purple-950/30' : 'hover:bg-slate-900/50'
                  }`}
                >
                  <td className="py-3 px-3">
                    <p className="font-bold text-white leading-tight">{evt.title}</p>
                    <p className="text-[10px] text-slate-500">{evt.location}</p>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300">
                      {evt.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 text-[11px]">
                    {new Date(evt.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-200">{evt.registered_count}</span>
                    <span className="text-slate-500"> / {evt.quota}</span>
                  </td>
                  <td className="py-3 px-3 text-emerald-400 font-semibold">
                    {evt.checked_in_count || 0} hadir
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEditModal(evt)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                        title="Edit event"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-rose-400 transition-all"
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
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Data Peserta Terdaftar
              </h3>
              <p className="text-xs text-slate-400">
                Memantau peserta terdaftar dan status validasi pintu masuk event yang dipilih.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={attendeeSearch}
                  onChange={(e) => setAttendeeSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchAttendees()}
                  placeholder="Cari peserta / kode tiket..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>

              <select
                value={attendeeStatus}
                onChange={(e) => setAttendeeStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-300 focus:outline-none"
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
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3 px-3">NO. REGISTRASI</th>
                  <th className="pb-3 px-3">KODE TIKET</th>
                  <th className="pb-3 px-3">NAMA PESERTA</th>
                  <th className="pb-3 px-3">EMAIL & INSTITUSI</th>
                  <th className="pb-3 px-3">STATUS KEHADIRAN</th>
                  <th className="pb-3 px-3">WAKTU DAFTAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {isLoadingAttendees ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
                      <span className="text-xs block mt-2">Memuat data peserta...</span>
                    </td>
                  </tr>
                ) : attendees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Belum ada peserta terdaftar untuk event ini.
                    </td>
                  </tr>
                ) : (
                  attendees.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                        {att.registration_code}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-200">
                        {att.ticket?.ticket_code || 'N/A'}
                      </td>
                      <td className="py-3 px-3 font-bold text-white">
                        {att.user?.name}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        <p>{att.user?.email}</p>
                        <p className="text-[10px] text-slate-500">{att.user?.organization || 'Umum'}</p>
                      </td>
                      <td className="py-3 px-3">
                        {att.ticket?.status === 'checked_in' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            <Ticket className="w-3 h-3" />
                            Tiket Terbit
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {new Date(att.registered_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl my-8 rounded-3xl glass-panel-glow bg-slate-900 border border-slate-700 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingEvent ? 'Edit Data Event' : 'Buat Event Baru'}
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Judul Acara</label>
                <input
                  type="text"
                  required
                  value={eventFormData.title}
                  onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                  placeholder="Contoh: SurabayaDev 12th Anniversary Tech Summit"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Kategori</label>
                  <select
                    value={eventFormData.category}
                    onChange={(e) => setEventFormData({ ...eventFormData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Conference">Conference</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Masterclass">Masterclass</option>
                    <option value="Community Meetup">Community Meetup</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Kuota Peserta</label>
                  <input
                    type="number"
                    required
                    min={editingEvent ? editingEvent.registered_count : 1}
                    value={eventFormData.quota}
                    onChange={(e) => setEventFormData({ ...eventFormData, quota: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Jadwal Mulai</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventFormData.event_date}
                    onChange={(e) => setEventFormData({ ...eventFormData, event_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Lokasi / Venue</label>
                  <input
                    type="text"
                    required
                    value={eventFormData.location}
                    onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
                    placeholder="Contoh: Dyandra Convention Center"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nama Pembicara</label>
                  <input
                    type="text"
                    value={eventFormData.speaker_name}
                    onChange={(e) => setEventFormData({ ...eventFormData, speaker_name: e.target.value })}
                    placeholder="Nama Narasumber"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Peran / Titel</label>
                  <input
                    type="text"
                    value={eventFormData.speaker_role}
                    onChange={(e) => setEventFormData({ ...eventFormData, speaker_role: e.target.value })}
                    placeholder="Contoh: Google Developer Expert"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Deskripsi Acara</label>
                <textarea
                  required
                  rows={3}
                  value={eventFormData.description}
                  onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                  placeholder="Jelaskan agenda dan topik bahasan acara..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">URL Gambar Banner</label>
                <input
                  type="url"
                  value={eventFormData.banner_url}
                  onChange={(e) => setEventFormData({ ...eventFormData, banner_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEvent}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-50"
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
