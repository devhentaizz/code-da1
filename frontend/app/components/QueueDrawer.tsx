'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAudio } from '../context/AudioContext';
import {
  XMarkIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  SparklesIcon,
  QueueListIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/solid';

const formatDuration = (seconds?: number) => {
  if (seconds === undefined || seconds === null || seconds <= 0) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export default function QueueDrawer() {
  const {
    currentSong,
    isPlaying,
    queue,
    showQueue,
    setShowQueue,
    playSong,
    togglePlay,
    removeFromQueue,
    clearQueue,
    reorderQueue
  } = useAudio();

  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');

  if (!showQueue) return null;

  const currentArtistName = currentSong
    ? typeof currentSong.artist === 'object'
      ? currentSong.artist?.name
      : currentSong.artist
    : '';

  // Get current song index in queue
  const currentIdx = currentSong ? queue.findIndex((s) => s._id === currentSong._id) : -1;

  // Upcoming songs: songs appearing after current song in queue, or all other songs in queue
  const upcomingSongs = currentSong
    ? currentIdx !== -1
      ? queue.slice(currentIdx + 1)
      : queue.filter((s) => s._id !== currentSong._id)
    : queue;

  // Played songs before current song
  const previousSongs = currentSong && currentIdx > 0 ? queue.slice(0, currentIdx) : [];

  const handleMoveUp = (indexInUpcoming: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (indexInUpcoming <= 0) return;
    const realFromIdx = currentIdx + 1 + indexInUpcoming;
    const realToIdx = realFromIdx - 1;
    reorderQueue(realFromIdx, realToIdx);
  };

  const handleMoveDown = (indexInUpcoming: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (indexInUpcoming >= upcomingSongs.length - 1) return;
    const realFromIdx = currentIdx + 1 + indexInUpcoming;
    const realToIdx = realFromIdx + 1;
    reorderQueue(realFromIdx, realToIdx);
  };

  const handleRemove = (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromQueue(songId);
  };

  return (
    <aside
      aria-label="Hàng đợi phát nhạc"
      className="fixed top-[72px] bottom-auto right-3 sm:right-6 w-[calc(100vw-1.5rem)] sm:w-[350px] h-[510px] max-h-[calc(100vh-160px)] bg-[#0a0f16]/95 backdrop-blur-2xl border border-[#1b2636] rounded-2xl shadow-2xl shadow-black/90 z-50 flex flex-col overflow-hidden select-none animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      {/* 1. Header — Compact Single Row */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#141e2b] bg-[#0c1219]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#0df580]/15 flex items-center justify-center text-[#0df580]">
            <QueueListIcon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-black text-white uppercase tracking-wider">Hàng đợi</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#14202d] text-[#0df580] border border-[#1d2d3e]">
            {queue.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {upcomingSongs.length > 0 && (
            <button
              onClick={clearQueue}
              title="Xóa các bài hát tiếp theo"
              className="px-2 py-1 rounded-md text-[11px] font-semibold text-[#6b7c93] hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer flex items-center gap-1"
            >
              <TrashIcon className="w-3 h-3" />
              <span>Xóa chờ</span>
            </button>
          )}

          <button
            onClick={() => setShowQueue(false)}
            aria-label="Đóng hàng đợi"
            className="p-1 rounded-lg hover:bg-[#182332] text-[#6b7c93] hover:text-white transition cursor-pointer"
          >
            <XMarkIcon className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* 2. Tabs Selector — Sleek Segmented Control */}
      <div className="p-2 border-b border-[#131b26] bg-[#080d14]/60">
        <div className="flex p-0.5 rounded-xl bg-[#0e1520] border border-[#192433]">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex-1 py-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-[#182434] text-[#0df580] shadow-sm'
                : 'text-[#6b7c93] hover:text-white'
            }`}
          >
            <span>Tiếp theo</span>
            <span className="text-[10px] opacity-75">({upcomingSongs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#182434] text-[#0df580] shadow-sm'
                : 'text-[#6b7c93] hover:text-white'
            }`}
          >
            <span>Đã phát</span>
            <span className="text-[10px] opacity-75">({previousSongs.length})</span>
          </button>
        </div>
      </div>

      {/* 3. Body Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 custom-scrollbar">
        {/* Current Song Section — Compact & Elegant */}
        {currentSong && (
          <div className="p-2 rounded-xl bg-gradient-to-r from-[#0f1722] to-[#0c1219] border border-[#0df580]/30 shadow-md">
            <div className="flex items-center justify-between mb-1 px-0.5">
              <span className="text-[9px] font-mono font-bold tracking-widest text-[#0df580] uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0df580] animate-pulse" />
                ĐANG PHÁT
              </span>
              <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#0df580]/15 text-[#0df580] border border-[#0df580]/30">
                LOSSLESS
              </span>
            </div>

            <div
              onClick={togglePlay}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 ring-1 ring-[#0df580]/40">
                <img
                  src={
                    currentSong.coverImage ||
                    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=120&q=80'
                  }
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  {isPlaying ? (
                    <PauseIcon className="w-4 h-4 text-[#0df580]" />
                  ) : (
                    <PlayIcon className="w-4 h-4 text-white ml-0.5" />
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate group-hover:text-[#0df580] transition leading-tight">
                  {currentSong.title}
                </p>
                <p className="text-[10px] text-[#0df580] font-medium truncate mt-0.5 leading-tight">
                  {currentArtistName || 'Nghệ sĩ Melodix'}
                </p>
              </div>

              <span className="text-[10px] font-mono text-[#55677d] shrink-0">
                {formatDuration(currentSong.duration)}
              </span>
            </div>
          </div>
        )}

        {/* Tab 1: UPCOMING SONGS */}
        {activeTab === 'queue' && (
          <div>
            <div className="flex items-center justify-between mb-1.5 px-1 pt-0.5">
              <span className="text-[9px] font-mono font-bold tracking-widest text-[#55677d] uppercase">
                DANH SÁCH CHỜ ({upcomingSongs.length})
              </span>
            </div>

            {upcomingSongs.length === 0 ? (
              <div className="py-6 text-center space-y-1.5 border border-dashed border-[#182332] rounded-xl bg-[#0b1118]/50 p-3">
                <MusicalNoteIcon className="w-6 h-6 text-[#3d4d61] mx-auto" />
                <p className="text-xs font-semibold text-slate-300">Hàng đợi đang trống</p>
                <p className="text-[10px] text-[#55677d]">
                  Bấm vào bài hát bất kỳ để tiếp tục nghe.
                </p>
                <Link
                  href="/bai-hat"
                  onClick={() => setShowQueue(false)}
                  className="inline-block mt-1 px-2.5 py-1 rounded-lg bg-[#141f2d] hover:bg-[#1c2c3f] border border-[#233549] text-[11px] font-bold text-[#0df580] transition"
                >
                  Khám phá bài hát ➔
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {upcomingSongs.map((song, idx) => {
                  const songArtist =
                    typeof song.artist === 'object' ? song.artist?.name : song.artist;

                  return (
                    <div
                      key={`${song._id}-${idx}`}
                      onClick={() => playSong(song)}
                      className="group flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-[#121c28] border border-transparent hover:border-[#1d2d3e] transition cursor-pointer"
                    >
                      {/* Left: Index & Image & Info */}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="w-4 text-center text-[10px] font-mono text-[#4e5f73] group-hover:hidden shrink-0">
                          {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playSong(song);
                          }}
                          className="w-4 hidden group-hover:flex items-center justify-center text-[#0df580] shrink-0 cursor-pointer"
                          title="Phát ngay"
                        >
                          <PlayIcon className="w-3.5 h-3.5 ml-0.5" />
                        </button>

                        <img
                          src={
                            song.coverImage ||
                            'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=80&q=80'
                          }
                          alt={song.title}
                          className="w-8 h-8 rounded-lg object-cover bg-slate-800 shrink-0"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-white truncate group-hover:text-[#0df580] transition leading-tight">
                            {song.title}
                          </p>
                          <p className="text-[10px] text-[#6b7c93] truncate mt-0.5 leading-tight">
                            {songArtist || 'Đang cập nhật'}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions on hover + Duration */}
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] font-mono text-[#55677d] group-hover:hidden pr-1">
                          {formatDuration(song.duration)}
                        </span>

                        <div className="hidden group-hover:flex items-center gap-0.5">
                          <button
                            disabled={idx === 0}
                            onClick={(e) => handleMoveUp(idx, e)}
                            title="Lên trên"
                            className="p-1 rounded hover:bg-[#1a2737] text-[#6b7c93] hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <ChevronUpIcon className="w-3 h-3" />
                          </button>

                          <button
                            disabled={idx === upcomingSongs.length - 1}
                            onClick={(e) => handleMoveDown(idx, e)}
                            title="Xuống dưới"
                            className="p-1 rounded hover:bg-[#1a2737] text-[#6b7c93] hover:text-white disabled:opacity-20 cursor-pointer"
                          >
                            <ChevronDownIcon className="w-3 h-3" />
                          </button>

                          <button
                            onClick={(e) => handleRemove(song._id, e)}
                            title="Xóa khỏi hàng đợi"
                            className="p-1 rounded hover:bg-red-500/15 text-[#6b7c93] hover:text-red-400 transition cursor-pointer"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: PREVIOUS PLAYED SONGS */}
        {activeTab === 'history' && (
          <div>
            <div className="flex items-center justify-between mb-1.5 px-1 pt-0.5">
              <span className="text-[9px] font-mono font-bold tracking-widest text-[#55677d] uppercase">
                ĐÃ PHÁT TRƯỚC ĐÓ ({previousSongs.length})
              </span>
            </div>

            {previousSongs.length === 0 ? (
              <div className="py-6 text-center space-y-1.5 border border-dashed border-[#182332] rounded-xl bg-[#0b1118]/50 p-3">
                <p className="text-xs font-semibold text-slate-300">Chưa có bài phát trước đó</p>
                <p className="text-[10px] text-[#55677d]">
                  Các bài hát bạn vừa nghe sẽ hiển thị ở đây.
                </p>
              </div>
            ) : (
              <div className="space-y-1 opacity-85 hover:opacity-100 transition">
                {previousSongs.map((song, idx) => {
                  const songArtist =
                    typeof song.artist === 'object' ? song.artist?.name : song.artist;

                  return (
                    <div
                      key={`prev-${song._id}-${idx}`}
                      onClick={() => playSong(song)}
                      className="group flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-[#121c28] border border-transparent hover:border-[#1d2d3e] transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <img
                          src={
                            song.coverImage ||
                            'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=80&q=80'
                          }
                          alt={song.title}
                          className="w-7 h-7 rounded-md object-cover bg-slate-800 shrink-0 grayscale group-hover:grayscale-0 transition"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-300 truncate group-hover:text-[#0df580] transition leading-tight">
                            {song.title}
                          </p>
                          <p className="text-[10px] text-[#55677d] truncate leading-tight">
                            {songArtist || 'Đang cập nhật'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSong(song);
                        }}
                        className="px-2 py-0.5 rounded-md bg-[#131d2a] hover:bg-[#0df580] text-slate-300 hover:text-slate-950 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <PlayIcon className="w-2.5 h-2.5" />
                        Phát lại
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Bottom Footer Info — Slim Bar */}
      <div className="px-3.5 py-2 border-t border-[#131b26] bg-[#080d14] flex items-center justify-between text-[10px] text-[#55677d]">
        <div className="flex items-center gap-1 text-[#0df580]">
          <SparklesIcon className="w-3 h-3" />
          <span className="text-[#55677d]">Tự động phát bài tiếp theo</span>
        </div>
        <Link
          href="/thu-vien"
          onClick={() => setShowQueue(false)}
          className="text-[#0df580] hover:underline font-bold"
        >
          Mở Thư viện ➔
        </Link>
      </div>
    </aside>
  );
}
