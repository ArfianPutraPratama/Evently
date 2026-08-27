import React, { useState } from 'react';
import { EventItem } from '../types';
import { X, Calendar, MapPin, Users, UserCheck, CheckCircle2, AlertTriangle, ArrowRight, Clock, BookOpen, ListOrdered } from 'lucide-react';

interface EventDetailModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: (event: EventItem) => void;
  onViewTicketClick: (event: EventItem) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  onRegisterClick,
  onViewTicketClick,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'rundown'>('info');

  if (!isOpen || !event) return null;

  const isSoldOut = event.is_sold_out || event.remaining_quota <= 0;
  const isAlmostFull = event.remaining_quota > 0 && event.remaining_quota <= 10;
  const percentage = Math.min(100, Math.round((event.registered_count / event.quota) * 100));

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB';
    } catch {
      return dateStr;
    }
  };

  const getRundown = (category: string) => {
    if (category === 'Conference') {
      return [
        { time: '08:00 - 08:45 WIB', title: 'Open Gate, Registrasi Peserta & Morning Coffee', room: 'Main Lobby', speaker: 'Panitia SurabayaDev' },
        { time: '08:45 - 09:30 WIB', title: 'Opening Ceremony & 12th Anniversary Keynote', room: 'Grand Ballroom', speaker: 'SurabayaDev Advisory Board' },
        { time: '09:30 - 11:30 WIB', title: 'Tech Panel: Scaling Digital Architecture & East Java Ecosystem', room: 'Grand Ballroom', speaker: 'VP of Engineering & Tech Leaders' },
        { time: '11:30 - 13:00 WIB', title: 'Networking Lunch, Exhibition Booth & Community Showcase', room: 'Exhibition Hall', speaker: 'All Attendees' },
        { time: '13:00 - 15:30 WIB', title: 'Deep-Dive Tech Sessions & Engineering Innovations', room: 'Hall A & B', speaker: 'Invited Tech Speakers' },
        { time: '15:30 - 16:30 WIB', title: 'Grand Doorprise, Community Awards & Foto Bersama', room: 'Grand Ballroom', speaker: 'Panitia Pelaksana' },
      ];
    }
    if (category === 'Workshop') {
      return [
        { time: '08:30 - 09:00 WIB', title: 'Check-in, Wi-Fi Setup & Repository Cloning', room: 'Lab Room 1', speaker: 'Technical Assistant' },
        { time: '09:00 - 10:30 WIB', title: 'Sesi 1: Fundamental Architecture & Core Theory', room: 'Main Lab', speaker: event.speaker_name || 'Workshop Instructor' },
        { time: '10:30 - 12:00 WIB', title: 'Sesi 2: Hands-on Lab & Live Coding Implementation', room: 'Main Lab', speaker: event.speaker_name || 'Workshop Instructor' },
        { time: '12:00 - 13:00 WIB', title: 'Istirahat Siang & Lunch Break', room: 'Dining Area', speaker: 'All Attendees' },
        { time: '13:00 - 15:00 WIB', title: 'Sesi 3: Advanced Patterns, Benchmarking & Stress Testing', room: 'Main Lab', speaker: event.speaker_name || 'Workshop Instructor' },
        { time: '15:00 - 15:30 WIB', title: 'Q&A, Code Review & Penyerahan E-Sertifikat', room: 'Main Lab', speaker: 'Instruktur & Tim' },
      ];
    }
    if (category === 'Hackathon') {
      return [
        { time: '08:00 - 08:30 WIB', title: 'Team Check-In & Final Team Assembly', room: 'Hack Zone', speaker: 'Hackathon Committee' },
        { time: '08:30 - 09:00 WIB', title: 'Problem Statement Release & Rules Briefing', room: 'Stage Area', speaker: 'Mentors & Judges' },
        { time: '09:00 - 12:00 WIB', title: 'Hacking Sprint 1: Ideation, API Integration & MVP Scaffolding', room: 'Hack Pods', speaker: 'All Teams' },
        { time: '12:00 - 13:00 WIB', title: 'Lunch & Quick Mentor Check-in', room: 'Dining Area', speaker: 'Mentors' },
        { time: '13:00 - 16:00 WIB', title: 'Hacking Sprint 2: Model Tuning, Polishing & Demo Preparation', room: 'Hack Pods', speaker: 'All Teams' },
        { time: '16:00 - 17:30 WIB', title: 'Live Pitching & Product Showcase (3 Menit Tiap Tim)', room: 'Main Stage', speaker: 'Judging Panel' },
        { time: '17:30 - 18:00 WIB', title: 'Winner Announcement & Prize Distribution', room: 'Main Stage', speaker: 'SurabayaDev Committee' },
      ];
    }
    return [
      { time: '09:00 - 09:30 WIB', title: 'Registrasi Peserta & Welcome Pack', room: 'Meeting Room', speaker: 'Panitia' },
      { time: '09:30 - 12:00 WIB', title: 'Sesi Teori & Studi Kasus Arsitektur Produksi', room: 'Main Room', speaker: event.speaker_name || 'Expert Trainer' },
      { time: '12:00 - 13:00 WIB', title: 'Networking Lunch', room: 'Lounge', speaker: 'All' },
      { time: '13:00 - 15:30 WIB', title: 'Hands-on Implementation & Interactive Q&A', room: 'Main Room', speaker: event.speaker_name || 'Expert Trainer' },
      { time: '15:30 - 16:00 WIB', title: 'Wrap-up, Mentoring Session & Foto Bersama', room: 'Main Room', speaker: 'Trainer' },
    ];
  };

  const scheduleList = getRundown(event.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-2xl overflow-hidden bg-[#11131a] border border-white/[0.08] shadow-2xl">
        {/* Banner Header */}
        <div className="relative h-56 w-full overflow-hidden bg-zinc-900">
          <img
            src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#11131a] via-[#11131a]/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute top-4 left-4">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/10 text-zinc-300">
              {event.category}
            </span>
          </div>

          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              {event.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Key Event Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-500 font-semibold block text-[10px]">WAKTU PELAKSANAAN</span>
                  <p className="font-bold text-zinc-200 mt-0.5">{formatDate(event.event_date)}</p>
                </div>
              </div>
              <a
                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${new Date(event.event_date).toISOString().replace(/-|:|\.\d\d\d/g, '')}/${new Date(new Date(event.event_date).getTime() + 4 * 3600000).toISOString().replace(/-|:|\.\d\d\d/g, '')}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-0.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-[10px] font-semibold shrink-0 transition-all"
                title="Tambahkan ke Google Calendar"
              >
                + Calendar
              </a>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-500 font-semibold block text-[10px]">LOKASI VENUE</span>
                  <p className="font-bold text-zinc-200 mt-0.5 line-clamp-1">{event.location.split(',')[0]}</p>
                  <span className="text-zinc-500 text-[11px]">Surabaya</span>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-0.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-semibold shrink-0 transition-all"
                title="Buka rute navigasi di Google Maps"
              >
                Maps
              </a>
            </div>
          </div>

          {/* Tab Switcher: Info vs Rundown */}
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'info'
                  ? 'bg-white/[0.08] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Deskripsi & Pembicara</span>
            </button>

            <button
              onClick={() => setActiveTab('rundown')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'rundown'
                  ? 'bg-white/[0.08] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Rundown & Jadwal Sesi ({scheduleList.length})</span>
            </button>
          </div>

          {/* TAB 1: Info & Speaker */}
          {activeTab === 'info' && (
            <div className="space-y-4 animate-fade-in">
              {/* Speaker Bio */}
              {event.speaker_name && (
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-zinc-300 font-bold shrink-0">
                    <UserCheck className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">
                      Narasumber & Pembicara
                    </span>
                    <h4 className="text-xs font-bold text-white">{event.speaker_name}</h4>
                    <p className="text-[11px] text-zinc-400">{event.speaker_role || 'Tech Leader & Speaker'}</p>
                  </div>
                </div>
              )}

              {/* Event Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Deskripsi Acara</h4>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                  {event.description}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Rundown Sesi Timeline */}
          {activeTab === 'rundown' && (
            <div className="space-y-2.5 animate-fade-in max-h-60 overflow-y-auto pr-1">
              {scheduleList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all flex items-start gap-3 text-xs"
                >
                  <div className="flex flex-col items-center shrink-0 pt-0.5">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </div>
                  </div>

                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-zinc-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        {item.time}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
                        {item.room}
                      </span>
                    </div>

                    <h5 className="font-semibold text-white text-xs leading-snug">
                      {item.title}
                    </h5>

                    <p className="text-[11px] text-zinc-500">
                      Oleh: {item.speaker}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quota Tracker */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-zinc-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Status Ketersediaan Kuota Peserta
              </span>
              <span className="font-semibold text-white">
                {event.registered_count} <span className="text-zinc-500">/ {event.quota} Kursi</span>
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isSoldOut
                    ? 'bg-rose-500'
                    : isAlmostFull
                    ? 'bg-amber-400'
                    : 'bg-indigo-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-5 border-t border-white/[0.06] bg-black/40 flex items-center justify-between gap-4">
          <div className="text-xs">
            <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Biaya Pendaftaran</span>
            <span className="text-base font-bold text-emerald-400">Gratis (Free Community Pass)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-all"
            >
              Tutup
            </button>

            {event.is_user_registered ? (
              <button
                onClick={() => {
                  onClose();
                  onViewTicketClick(event);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Lihat E-Tiket Digital</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onRegisterClick(event);
                }}
                disabled={isSoldOut}
                className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
                  isSoldOut
                    ? 'bg-white/[0.04] text-zinc-600 cursor-not-allowed'
                    : 'bg-white text-zinc-950 hover:bg-zinc-200'
                }`}
              >
                {isSoldOut ? (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Kuota Penuh</span>
                  </>
                ) : (
                  <>
                    <span>Daftar Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
