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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 py-6 sm:py-10 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl my-auto rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-2xl"
      >
        {/* Banner Header */}
        <div className="relative h-56 w-full overflow-hidden bg-slate-100">
          <img
            src={event.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-2 rounded-xl bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/95 text-slate-900 shadow-sm">
              {event.category}
            </span>
          </div>

          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {event.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Key Event Metadata: Prominent Calendar & Google Maps Showcase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            {/* 1. Google Calendar Prominent Card */}
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-teal-800 font-extrabold block text-[10px] uppercase tracking-wider">
                    JADWAL PELAKSANAAN
                  </span>
                  <p className="font-bold text-slate-900 text-xs sm:text-sm">{formatDate(event.event_date)}</p>
                  <p className="text-[11px] text-slate-500">Pasang pengingat otomatis di ponsel</p>
                </div>
              </div>

              <a
                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${new Date(event.event_date).toISOString().replace(/-|:|\.\d\d\d/g, '')}/${new Date(new Date(event.event_date).getTime() + 4 * 3600000).toISOString().replace(/-|:|\.\d\d\d/g, '')}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                title="Tambahkan jadwal acara ke Google Calendar"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>+ Simpan ke Google Calendar</span>
              </a>
            </div>

            {/* 2. Google Maps Prominent Card */}
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/90 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-rose-800 font-extrabold block text-[10px] uppercase tracking-wider">
                    LOKASI & NAVIGASI VENUE
                  </span>
                  <p className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">{event.location.split(',')[0]}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{event.location}</p>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                title="Buka rute navigasi langsung di Google Maps"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Buka Rute di Google Maps ↗</span>
              </a>
            </div>
          </div>

          {/* Tab Switcher: Info vs Rundown */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'info'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              <span>Deskripsi & Pembicara</span>
            </button>

            <button
              onClick={() => setActiveTab('rundown')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'rundown'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5 text-teal-600" />
              <span>Rundown & Jadwal Sesi ({scheduleList.length})</span>
            </button>
          </div>

          {/* TAB 1: Info & Speaker */}
          {activeTab === 'info' && (
            <div className="space-y-4 animate-fade-in">
              {/* Speaker Bio */}
              {event.speaker_name && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                      Narasumber & Pembicara
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{event.speaker_name}</h4>
                    <p className="text-[11px] text-slate-500">{event.speaker_role || 'Tech Leader & Speaker'}</p>
                  </div>
                </div>
              )}

              {/* Event Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Deskripsi Acara</h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
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
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-500/40 transition-all flex items-start gap-3 text-xs"
                >
                  <div className="flex flex-col items-center shrink-0 pt-0.5">
                    <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-mono text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </div>
                  </div>

                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-teal-800 flex items-center gap-1 font-bold">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-white text-slate-600 border border-slate-200 font-medium">
                        {item.room}
                      </span>
                    </div>

                    <h5 className="font-bold text-slate-900 text-xs leading-snug">
                      {item.title}
                    </h5>

                    <p className="text-[11px] text-slate-500">
                      Oleh: {item.speaker}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quota Tracker */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-600" />
                Status Ketersediaan Kuota Peserta
              </span>
              <span className="font-bold text-slate-900">
                {event.registered_count} <span className="text-slate-400 font-normal">/ {event.quota} Kursi</span>
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isSoldOut
                    ? 'bg-rose-500'
                    : isAlmostFull
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-teal-500 to-cyan-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-4">
          <div className="text-xs">
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Biaya Pendaftaran</span>
            <span className="text-base font-black text-teal-700">Gratis (Free Community Pass)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 transition-all"
            >
              Tutup
            </button>

            {event.is_user_registered ? (
              <button
                onClick={() => {
                  onClose();
                  onViewTicketClick(event);
                }}
                className="px-5 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Lihat E-Tiket Digital</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onRegisterClick(event);
                }}
                disabled={isSoldOut}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                  isSoldOut
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
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
