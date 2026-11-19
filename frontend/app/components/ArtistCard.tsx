'use client';

import React from 'react';
import Link from 'next/link';
import { Artist } from '../context/AudioContext';

interface ArtistCardProps {
  artist: Artist & { followersCount?: number };
}

const formatFollowers = (count?: number) => {
  if (!count) return '0 quan tâm';
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M quan tâm';
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k quan tâm';
  return count + ' quan tâm';
};

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  return (
    <Link
      href={`/nghe-si/${artist._id}`}
      className="group flex flex-col items-center text-center p-4 rounded-2xl bg-slate-900/30 hover:bg-slate-800/60 border border-slate-800/40 hover:border-emerald-500/30 transition-all duration-300"
    >
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-3.5 ring-2 ring-slate-800 group-hover:ring-emerald-500 transition-all duration-300 shadow-lg">
        <img
          src={artist.avatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'}
          alt={artist.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      <h4 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition truncate max-w-full">
        {artist.stageName || artist.name}
      </h4>
      <p className="text-xs text-slate-400 mt-1">
        {formatFollowers(artist.followersCount)}
      </p>
    </Link>
  );
};

export default ArtistCard;

