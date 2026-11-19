'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import {
  MusicalNoteIcon,
  UserGroupIcon,
  Squares2X2Icon,
  UsersIcon,
  PlayCircleIcon,
  HeartIcon
} from '@heroicons/react/24/solid';

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!token) return;
    const fetchStats = async () => {
      try {
        const res = await fetch(`${apiUrl}/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return <div className="text-center py-16 text-slate-400">Đang tải số liệu thống kê...</div>;
  }

  const statCards = [
    { label: 'Tổng Bài Hát', value: stats?.totalSongs || 0, icon: MusicalNoteIcon, color: 'from-emerald-500 to-teal-400' },
    { label: 'Tổng Nghệ Sĩ', value: stats?.totalArtists || 0, icon: UserGroupIcon, color: 'from-blue-500 to-indigo-400' },
    { label: 'Tổng Thể Loại', value: stats?.totalGenres || 0, icon: Squares2X2Icon, color: 'from-purple-500 to-pink-400' },
    { label: 'Tổng Thành Viên', value: stats?.totalUsers || 0, icon: UsersIcon, color: 'from-amber-500 to-orange-400' },
    { label: 'Tổng Lượt Nghe', value: stats?.totalListens?.toLocaleString() || '0', icon: PlayCircleIcon, color: 'from-rose-500 to-red-400' },
    { label: 'Tổng Lượt Thích', value: stats?.totalLikes?.toLocaleString() || '0', icon: HeartIcon, color: 'from-pink-500 to-rose-400' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-slate-950 font-bold mb-3 shadow-md`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{card.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Tables: Top Songs & Recent Songs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Bài Hát Nghe Nhiều */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Top 5 Bài Hát Nghe Nhiều Nhất</h3>
            <Link href="/admin/bai-hat" className="text-xs text-emerald-400 hover:underline">
              Quản lý tất cả
            </Link>
          </div>

          <div className="divide-y divide-slate-800/60">
            {stats?.topSongs?.map((song: any, i: number) => (
              <div key={song._id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-500 w-4">{i + 1}</span>
                  <img src={song.coverImage} alt={song.title} className="w-9 h-9 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-white truncate max-w-[180px]">{song.title}</p>
                    <p className="text-xs text-slate-400">{song.artist?.name || 'N/A'}</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {song.listens?.toLocaleString()} lượt
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bài Hát Mới Thêm */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Bài Hát Mới Cập Nhật</h3>
            <Link href="/admin/bai-hat" className="text-xs text-emerald-400 hover:underline">
              Thêm bài mới
            </Link>
          </div>

          <div className="divide-y divide-slate-800/60">
            {stats?.recentSongs?.map((song: any) => (
              <div key={song._id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={song.coverImage} alt={song.title} className="w-9 h-9 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-white truncate max-w-[180px]">{song.title}</p>
                    <p className="text-xs text-slate-400">{song.artist?.name || 'N/A'}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(song.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

