'use client';

import React from 'react';
import Link from 'next/link';
import { useAudio } from '../context/AudioContext';
import FavoriteSongButton from './FavoriteSongButton';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  ArrowPathRoundedSquareIcon,
  ArrowsRightLeftIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  QueueListIcon
} from '@heroicons/react/24/solid';
import { MicrophoneIcon } from '@heroicons/react/24/outline';

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const AudioPlayer = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    loopMode,
    isShuffle,
    showLyrics,
    showQueue,
    queue,
    togglePlay,
    nextSong,
    prevSong,
    seek,
    changeVolume,
    toggleMute,
    toggleLoop,
    toggleShuffle,
    setShowLyrics,
    toggleQueue
  } = useAudio();

  if (!currentSong) return null;

  const artistName = typeof currentSong.artist === 'object' ? currentSong.artist?.name : currentSong.artist;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#090d11]/95 backdrop-blur-2xl border-t border-[#17202b] px-6 z-40 flex items-center justify-between gap-4 select-none">
      {/* 1. Track Info (Left) */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[200px]">
        <div className="relative group flex-shrink-0">
          <img
            src={currentSong.coverImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=120&q=80'}
            alt={currentSong.title}
            className="w-11 h-11 rounded-xl object-cover shadow-lg border border-[#1b2533]"
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center gap-0.5">
              <span className="w-0.5 bg-[#0df580] rounded-full animate-eq-1" />
              <span className="w-0.5 bg-[#0df580] rounded-full animate-eq-2" />
              <span className="w-0.5 bg-[#0df580] rounded-full animate-eq-3" />
            </div>
          )}
        </div>

        <div className="truncate flex-1">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/bai-hat/${currentSong._id}`}
              className="text-xs font-bold text-white hover:text-[#0df580] transition truncate"
            >
              {currentSong.title}
            </Link>
            <span className="w-1.5 h-1.5 bg-[#0df580] rounded-full shrink-0" />
          </div>
          <span className="text-[11px] text-[#6b7c93] hover:text-[#8b9bb0] transition truncate block mt-0.5">
            {artistName || 'KAI'}
          </span>
        </div>

        <FavoriteSongButton
          song={currentSong}
          className="p-1 text-[#6b7c93] transition hover:text-[#0df580]"
          iconClassName="w-4 h-4"
          activeClassName="text-[#0df580]"
        />
      </div>

      {/* 2. Controls & Progress (Center) */}
      <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-xl">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Shuffle Button */}
          <button
            onClick={toggleShuffle}
            title={isShuffle ? 'Phát ngẫu nhiên: Đang BẬT' : 'Phát ngẫu nhiên: Đang TẮT (Bấm để bật)'}
            className={`relative p-2 rounded-full transition-all duration-200 cursor-pointer flex flex-col items-center justify-center active:scale-90 ${
              isShuffle ? 'text-[#0df580] drop-shadow-[0_0_8px_rgba(13,245,128,0.6)]' : 'text-[#6b7c93] hover:text-white hover:scale-110'
            }`}
          >
            <ArrowsRightLeftIcon className="w-4 h-4" />
            {isShuffle && (
              <span className="w-1 h-1 rounded-full bg-[#0df580] absolute bottom-0 shadow-sm shadow-[#0df580]" />
            )}
          </button>

          {/* Prev */}
          <button
            onClick={prevSong}
            title="Bài trước đó"
            className="p-1.5 rounded-full text-[#8b9bb0] hover:text-white hover:scale-110 active:scale-90 transition cursor-pointer"
          >
            <BackwardIcon className="w-4 h-4" />
          </button>

          {/* Play / Pause Neon Button */}
          <button
            onClick={togglePlay}
            title={isPlaying ? 'Tạm dừng (Space)' : 'Phát nhạc (Space)'}
            className="w-10 h-10 rounded-full bg-[#0df580] hover:bg-[#38f895] text-[#080c10] flex items-center justify-center shadow-lg shadow-[#0df580]/30 transition transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            {isPlaying ? (
              <PauseIcon className="w-5 h-5" />
            ) : (
              <PlayIcon className="w-5 h-5 ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={nextSong}
            title="Bài tiếp theo"
            className="p-1.5 rounded-full text-[#8b9bb0] hover:text-white hover:scale-110 active:scale-90 transition cursor-pointer"
          >
            <ForwardIcon className="w-4 h-4" />
          </button>

          {/* Loop Mode */}
          <button
            onClick={toggleLoop}
            title={
              loopMode === 'one'
                ? 'Lặp lại: 1 bài hát duy nhất'
                : loopMode === 'all'
                ? 'Lặp lại: Toàn bộ danh sách'
                : 'Lặp lại: Đang TẮT (Bấm để bật)'
            }
            className={`relative p-2 rounded-full transition-all duration-200 cursor-pointer flex flex-col items-center justify-center active:scale-90 ${
              loopMode !== 'off' ? 'text-[#0df580] drop-shadow-[0_0_8px_rgba(13,245,128,0.6)]' : 'text-[#6b7c93] hover:text-white hover:scale-110'
            }`}
          >
            <ArrowPathRoundedSquareIcon className="w-4 h-4" />
            {loopMode === 'one' && (
              <span className="absolute -top-0.5 -right-0.5 text-[8px] font-black bg-[#0df580] text-[#080c10] w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-md">
                1
              </span>
            )}
            {loopMode !== 'off' && (
              <span className="w-1 h-1 rounded-full bg-[#0df580] absolute bottom-0 shadow-sm shadow-[#0df580]" />
            )}
          </button>
        </div>

        {/* Progress Slider */}
        <div className="w-full flex items-center gap-2.5">
          <span className="text-[10px] font-mono text-[#55657a] w-7 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 flex items-center group">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full h-1 bg-[#1c2633] rounded-lg appearance-none cursor-pointer focus:outline-none"
            />
          </div>
          <span className="text-[10px] font-mono text-[#55657a] w-7">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* 3. Right Utilities: HQ badge, Lyrics, Volume */}
      <div className="flex items-center justify-end gap-3.5 w-1/4 min-w-[180px]">
        {/* HQ / LOSSLESS Badge */}
        <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase bg-[#141d27] border border-[#233142] text-[#00f2fe]">
          HQ
        </span>

        {/* Lyrics Toggle */}
        <button
          onClick={() => setShowLyrics(!showLyrics)}
          title="Lời bài hát"
          className={`p-1.5 rounded-lg transition ${
            showLyrics
              ? 'text-[#0df580] bg-[#141d27]'
              : 'text-[#6b7c93] hover:text-white'
          }`}
        >
          <MicrophoneIcon className="w-4 h-4" />
        </button>

        {/* Queue button */}
        <button
          onClick={toggleQueue}
          title={showQueue ? 'Đóng hàng đợi phát nhạc' : `Mở hàng đợi phát nhạc (${queue.length} bài)`}
          className={`relative p-1.5 rounded-lg transition cursor-pointer flex items-center justify-center ${
            showQueue
              ? 'text-[#0df580] bg-[#141d27] ring-1 ring-[#0df580]/40'
              : 'text-[#6b7c93] hover:text-white'
          }`}
        >
          <QueueListIcon className="w-4 h-4" />
          {queue.length > 1 && (
            <span className="absolute -top-1 -right-1 text-[8px] font-black bg-[#0df580] text-[#080c10] w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-md">
              {queue.length > 9 ? '9+' : queue.length}
            </span>
          )}
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2 group">
          <button
            onClick={toggleMute}
            className="text-[#6b7c93] hover:text-white transition"
          >
            {isMuted || volume === 0 ? (
              <SpeakerXMarkIcon className="w-4 h-4 text-red-400" />
            ) : (
              <SpeakerWaveIcon className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            className="w-16 h-1 bg-[#1c2633] rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
