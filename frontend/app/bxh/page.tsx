import React from 'react';
import SongRow from '../components/SongRow';
import { TrophyIcon } from '@heroicons/react/24/solid';

const getTopCharts = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  try {
    const res = await fetch(`${apiUrl}/songs/trending?limit=50`, { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Không thể tải bảng xếp hạng');
    }
    if (!Array.isArray(data)) {
      throw new Error('Dữ liệu bảng xếp hạng không hợp lệ');
    }
    return { songs: data, error: '' };
  } catch (error) {
    console.error(error);
    return {
      songs: [],
      error: error instanceof Error ? error.message : 'Không thể kết nối máy chủ'
    };
  }
};

export default async function ChartPage() {
  const { songs, error } = await getTopCharts();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-amber-600/30 via-rose-600/20 to-purple-700/30 border border-amber-500/20 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider mb-4 border border-amber-500/30">
            <TrophyIcon className="w-4 h-4 text-amber-400" />
            Bảng Xếp Hạng Âm Nhạc
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            Top 50 Ca Khúc Hot Nhất
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2">
            Được tính toán tự động dựa trên tổng lượt nghe thực tế của người dùng trên toàn hệ thống.
          </p>
          <p className="text-xs text-slate-400 mt-4">
            {songs.length > 0 ? `${songs.length} bài hát đang được xếp hạng` : 'Chưa có bài hát trong bảng xếp hạng'}
          </p>
        </div>
      </div>

      {/* Song List */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-3 sm:p-5 divide-y divide-slate-800/40">
        {songs.map((song: any, index: number) => (
          <SongRow key={song._id} song={song} index={index} queue={songs} />
        ))}
        {songs.length === 0 && (
          <div className="text-center py-12 px-4">
            <p className="text-slate-300 font-semibold">
              {error ? 'Không tải được bảng xếp hạng' : 'Bảng xếp hạng chưa có bài hát'}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {error || 'Hãy quay lại sau khi có dữ liệu lượt nghe.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
