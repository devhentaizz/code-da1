'use client';

import React from 'react';
import Link from 'next/link';
import { useAudio, Song } from '../context/AudioContext';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { QueueListIcon, CheckIcon } from '@heroicons/react/24/outline';
import FavoriteSongButton from './FavoriteSongButton';

interface SongRowProps {
  song: Song;
  index?: number;
  queue?: Song[];
}

const formatDuration = (seconds?: number) => {
  if (seconds === undefined || seconds === null || seconds <= 0) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const formatNumber = (num?: number) => {
  if (num === undefined || num === null || !Number.isFinite(num)) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

const SongRow: React.FC<SongRowProps> = ({ song, index, queue }) => {
  const { currentSong, isPlaying, playSong, togglePlay, addToQueue } = useAudio();
  const [added, setAdded] = React.useState(false);
  const isCurrent = currentSong?._id === song._id;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, queue);
    }
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(song);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const artistName = typeof song.artist === 'object' ? song.artist?.name : song.artist;

  // Rank styling
  const getRankBadge = (idx?: number) => {
    if (idx === undefined) return null;
    const rank = idx + 1;
    let colorClass = 'text-slate-500';
    if (rank === 1) colorClass = 'text-amber-400 font-black text-xl drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]';
    else if (rank === 2) colorClass = 'text-slate-300 font-bold text-lg';
    else if (rank === 3) colorClass = 'text-amber-600 font-bold text-lg';

    return <span className={`w-8 text-center ${colorClass}`}>{rank}</span>;
  };

  return (
    <div
      onClick={handlePlayClick}
      className={`group flex items-center justify-between gap-2 sm:gap-4 p-3 rounded-xl cursor-pointer border transition-colors duration-150 ${
        isCurrent ? 'bg-emerald-500/10 border-emerald-500/30' : 'border-transparent hover:bg-slate-800/60 hover:border-slate-700/60'
      }`}
    >
      {/* Cột trái: Rank & Artwork & Info */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
        {index !== undefined && getRankBadge(index)}

        <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
          <img
            src={song.coverImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=100&q=80'}
            alt={song.title}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            {isCurrent && isPlaying ? (
              <PauseIcon className="w-5 h-5 text-emerald-400" />
            ) : (
              <PlayIcon className="w-5 h-5 text-white ml-0.5" />
            )}
          </div>
        </div>

        <div className="truncate">
          <Link
            href={`/bai-hat/${song._id}`}
            onClick={(e) => e.stopPropagation()}
            className={`text-sm font-semibold truncate block hover:text-emerald-400 transition ${
              isCurrent ? 'text-emerald-400 font-bold' : 'text-white'
            }`}
          >
            {song.title}
          </Link>
          <span className="text-xs text-slate-400 truncate block">
            {artistName || 'Đang cập nhật'}
          </span>
        </div>
      </div>

      {/* Cột giữa: Lượt nghe */}
      <div className="hidden md:block shrink-0 text-xs text-slate-400 font-medium px-2 lg:px-4 tabular-nums">
        {formatNumber(song.listens)} lượt nghe
      </div>

      {/* Cột phải: Thêm vào hàng đợi & Yêu thích & Thời lượng */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={handleAddToQueue}
          title={added ? 'Đã thêm vào hàng đợi' : 'Thêm vào hàng đợi'}
          className={`p-1 rounded-lg transition cursor-pointer ${
            added
              ? 'text-[#0df580] bg-[#0df580]/15'
              : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          {added ? <CheckIcon className="w-4 h-4 stroke-[2.5]" /> : <QueueListIcon className="w-4 h-4" />}
        </button>

        <FavoriteSongButton
          song={song}
          className="text-slate-400 transition hover:text-red-500"
          iconClassName="w-5 h-5"
          activeClassName="text-red-500"
        />
        <span className="text-xs font-mono text-slate-400 w-10 text-right">
          {formatDuration(song.duration)}
        </span>
      </div>
    </div>
  );
};

export default SongRow;
