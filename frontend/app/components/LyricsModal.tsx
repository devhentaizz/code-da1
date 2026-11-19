'use client';

import React from 'react';
import { useAudio, getFallbackLyrics } from '../context/AudioContext';
import { XMarkIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';

const LyricsModal = () => {
  const { currentSong, showLyrics, setShowLyrics } = useAudio();

  if (!showLyrics || !currentSong) return null;

  const artistName = typeof currentSong.artist === 'object' ? currentSong.artist?.name : currentSong.artist;
  const lyricsText = currentSong.lyrics || getFallbackLyrics(currentSong.title, currentSong._id);

  return (
    <div
      onClick={() => setShowLyrics(false)}
      className="fixed inset-0 z-50 bg-[#060a0e]/95 backdrop-blur-3xl flex flex-col animate-in fade-in duration-300 select-none"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#0df580]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-[#1b2533] bg-[#090d11]/80 backdrop-blur-md"
      >
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-[#0df580]/30 shrink-0">
            <img
              src={currentSong.coverImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=120&q=80'}
              alt={currentSong.title}
              className="w-full h-full object-cover animate-pulse"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">{currentSong.title}</h2>
              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#0df580]/15 text-[#0df580] border border-[#0df580]/30">
                LỜI BÀI HÁT
              </span>
            </div>
            <p className="text-xs text-[#0df580] font-bold mt-0.5">{artistName || 'Đang phát'}</p>
          </div>
        </div>

        <button
          onClick={() => setShowLyrics(false)}
          className="p-3 rounded-full bg-[#121922] hover:bg-[#1b2533] border border-[#233142] text-[#8ea0b4] hover:text-white transition shadow-lg"
          title="Đóng (ESC)"
        >
          <XMarkIcon className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Lyrics Content */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex-1 overflow-y-auto px-6 py-12 flex justify-center custom-scrollbar"
      >
        <div className="max-w-2xl w-full text-center space-y-8 my-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#10161f] border border-[#1d2938] text-[10px] font-mono uppercase tracking-widest text-[#0df580]">
            <SparklesIcon className="w-3.5 h-3.5 text-[#0df580]" />
            ĐỒNG BỘ THEO NHẠC • MELODIX AUDIOPHILE
          </div>

          {lyricsText ? (
            <div className="space-y-6 text-xl sm:text-2xl md:text-3xl font-bold leading-relaxed text-slate-200 whitespace-pre-line tracking-wide drop-shadow-md">
              {lyricsText}
            </div>
          ) : (
            <div className="py-20 text-center space-y-2">
              <p className="text-[#8ea0b4] text-lg font-bold">Đang cập nhật lời bài hát...</p>
              <p className="text-[#55657a] text-xs">Hãy tận hưởng giai điệu tuyệt vời này nhé!</p>
            </div>
          )}

          <div className="pt-10 flex items-center justify-center gap-2 text-[11px] text-[#55657a]">
            <span>© Bản quyền lời bài hát thuộc về tác giả & nhà sản xuất</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LyricsModal;
