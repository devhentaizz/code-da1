'use client';

import React from 'react';
import Link from 'next/link';
import { useAudio, Song } from '../context/AudioContext';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';

interface SongCardProps {
  song: Song;
  queue?: Song[];
}

const SongCard: React.FC<SongCardProps> = ({ song, queue }) => {
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const isCurrent = currentSong?._id === song._id;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, queue);
    }
  };

  const artistName = typeof song.artist === 'object' ? song.artist?.name : song.artist;

  return (
    <div className="group p-3.5 rounded-2xl bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800/60 hover:border-emerald-500/30 transition-all duration-300 flex flex-col">
      {/* Artwork with hover play button */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-slate-800">
        <img
          src={song.coverImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80'}
          alt={song.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Overlay gradient */}
        <div className={`absolute inset-0 bg-black/30 group-hover:bg-black/50 transition duration-300 flex items-center justify-center ${isCurrent ? 'opacity-100 bg-black/50' : 'opacity-0 group-hover:opacity-100'}`}>
          <button
            onClick={handlePlayClick}
            className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-xl transform hover:scale-110 active:scale-95 transition"
          >
            {isCurrent && isPlaying ? (
              <PauseIcon className="w-6 h-6" />
            ) : (
              <PlayIcon className="w-6 h-6 ml-0.5" />
            )}
          </button>
        </div>

        {/* Currently playing badge */}
        {isCurrent && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded-full uppercase tracking-wider">
            Đang phát
          </span>
        )}
      </div>

      {/* Info */}
      <div className="truncate">
        <Link
          href={`/bai-hat/${song._id}`}
          className={`font-semibold text-sm truncate block hover:text-emerald-400 transition ${isCurrent ? 'text-emerald-400 font-bold' : 'text-white'}`}
        >
          {song.title}
        </Link>
        <p className="text-xs text-slate-400 truncate mt-0.5">
          {artistName || 'Đang cập nhật'}
        </p>
      </div>
    </div>
  );
};

export default SongCard;

