'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  SparklesIcon,
  PlusIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/solid';
import {
  HeartIcon,
  MusicalNoteIcon,
  UserGroupIcon,
  Squares2X2Icon,
  FolderIcon,
  ArrowTrendingUpIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const pathname = usePathname();
  const { token, isAdmin, user } = useAuth();
  const [featuredPlaylists, setFeaturedPlaylists] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [featuredPlaylistError, setFeaturedPlaylistError] = useState('');
  const [userPlaylistError, setUserPlaylistError] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const isFavoritesPlaylist = (playlist: any) =>
    playlist.name?.trim().toLocaleLowerCase('vi') === 'nhạc yêu thích';
  // Chỉ tìm playlist yêu thích của chính tài khoản đăng nhập
  const favoritePlaylist = token ? playlists.find(isFavoritesPlaylist) : null;
  const sidebarPlaylists = [
    ...playlists,
    ...featuredPlaylists.filter(
      (playlist) =>
        !isFavoritesPlaylist(playlist) &&
        !playlists.some((userPlaylist) => userPlaylist._id === playlist._id)
    )
  ];
  const nonFavoriteSidebarPlaylists = sidebarPlaylists.filter(
    (playlist) => !isFavoritesPlaylist(playlist)
  );

  useEffect(() => {
    if (!token) {
      setPlaylists([]);
      setUserPlaylistError('');
      return;
    }
    const fetchPlaylists = async () => {
      try {
        const res = await fetch(`${apiUrl}/playlists`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPlaylists(Array.isArray(data) ? data : []);
          setUserPlaylistError('');
        } else {
          throw new Error('Không thể tải playlist cá nhân');
        }
      } catch (error) {
        console.error('Không thể tải playlist cá nhân:', error);
        setUserPlaylistError('Không thể tải playlist cá nhân');
      }
    };
    fetchPlaylists();
  }, [apiUrl, token, user?.favorites?.join('|')]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchFeaturedPlaylists = async () => {
      try {
        const res = await fetch(`${apiUrl}/playlists/featured`, {
          signal: controller.signal
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Không thể tải playlist công khai');
        }
        setFeaturedPlaylists(Array.isArray(data) ? data : []);
        setFeaturedPlaylistError('');
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Không thể tải playlist công khai:', error);
        setFeaturedPlaylistError('Không thể tải playlist công khai');
      }
    };

    fetchFeaturedPlaylists();
    return () => controller.abort();
  }, [apiUrl]);

  const navItems = [
    { label: 'Khám phá', href: '/', icon: HomeIcon },
    { label: 'Thịnh hành', href: '/bxh', icon: ArrowTrendingUpIcon },
    { label: 'Nghệ sĩ', href: '/nghe-si', icon: UserGroupIcon },
    { label: 'Album & Thể loại', href: '/album', icon: Squares2X2Icon },
    { label: 'Thư viện cá nhân', href: '/thu-vien', icon: FolderIcon },
  ];

  return (
    <aside className="w-64 bg-[#090d11] border-r border-[#17202b] flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Logo: Melodix AUDIOPHILE STUDIO */}
      <div className="p-6 pb-5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#0df580] flex items-center justify-center shadow-lg shadow-[#0df580]/20 transition-transform group-hover:scale-105">
            {/* Waveform / Sound icon */}
            <div className="flex items-center gap-0.5">
              <span className="w-1 h-3 bg-[#080c10] rounded-full animate-eq-1" />
              <span className="w-1 h-5 bg-[#080c10] rounded-full animate-eq-2" />
              <span className="w-1 h-2 bg-[#080c10] rounded-full animate-eq-3" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-white flex items-center gap-1">
              Melodix
            </div>
            <span className="block text-[9px] text-[#6b7c93] tracking-wider uppercase font-extrabold -mt-0.5">
              AUDIOPHILE STUDIO
            </span>
          </div>
        </Link>
      </div>

      {/* Main Navigation & Playlist */}
      <div className="flex-1 overflow-y-auto px-4 py-1 space-y-6">
        {/* KHÁM PHÁ */}
        <div>
          <div className="text-[10px] font-bold text-[#55657a] uppercase tracking-wider px-3 mb-2">
            KHÁM PHÁ
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#131b24] text-[#0df580] font-bold shadow-sm'
                      : 'text-[#8b9bb0] hover:text-white hover:bg-[#111720]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0df580]' : 'text-[#6b7c93]'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* CHỈ HIỂN THỊ KHI ĐÃ ĐĂNG NHẬP */}
        {token && (
          <>
            {/* PLAYLIST CỦA TÔI */}
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[10px] font-bold text-[#55657a] uppercase tracking-wider">
                  PLAYLIST CỦA TÔI
                </span>
                <Link
                  href="/thu-vien"
                  title="Tạo playlist mới"
                  className="text-[#6b7c93] hover:text-[#0df580] transition"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                </Link>
              </div>

              <nav className="space-y-0.5 text-xs">
                <Link
                  href={favoritePlaylist ? `/playlist/${favoritePlaylist._id}` : '/thu-vien'}
                  aria-current={favoritePlaylist && pathname === `/playlist/${favoritePlaylist._id}` ? 'page' : undefined}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition group ${
                    favoritePlaylist && pathname === `/playlist/${favoritePlaylist._id}`
                      ? 'bg-[#131b24] text-[#0df580]'
                      : 'text-[#8b9bb0] hover:text-white hover:bg-[#111720]'
                  }`}
                >
                  <HeartIcon className="w-4 h-4 text-[#0df580] group-hover:scale-110 transition-transform" />
                  <span className="truncate">Nhạc yêu thích</span>
                </Link>

                {nonFavoriteSidebarPlaylists.map((p) => (
                    <Link
                      key={p._id}
                      href={`/playlist/${p._id}`}
                      aria-current={pathname === `/playlist/${p._id}` ? 'page' : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                        pathname === `/playlist/${p._id}`
                          ? 'bg-[#131b24] text-[#0df580]'
                          : 'text-[#8b9bb0] hover:text-white hover:bg-[#111720]'
                      }`}
                    >
                      <MusicalNoteIcon className="w-4 h-4 text-[#6b7c93]" />
                      <span className="truncate">{p.name}</span>
                    </Link>
                  ))}

                {nonFavoriteSidebarPlaylists.length === 0 && (
                  <p className="px-3 py-2 text-[11px] text-[#55657a] italic">
                    Chưa có playlist. Bấm + để tạo
                  </p>
                )}

                {userPlaylistError && (
                  <p role="status" className="px-3 py-2 text-xs text-red-400">
                    {userPlaylistError}
                  </p>
                )}
                {featuredPlaylistError && (
                  <p role="status" className="px-3 py-2 text-xs text-red-400">
                    {featuredPlaylistError}
                  </p>
                )}
              </nav>
            </div>
          </>
        )}

        {/* Admin Navigation if admin */}
        {isAdmin && (
          <div className="pt-2">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold bg-[#131d27] text-[#0df580] border border-[#0df580]/20 hover:border-[#0df580]/40 transition"
            >
              <ShieldCheckIcon className="w-4 h-4 text-[#0df580]" />
              Bảng Quản Trị Studio
            </Link>
          </div>
        )}
      </div>

      {/* Bottom HI-RES LOSSLESS Card (Exact match from screenshot) */}
      <div className="p-4 border-t border-[#17202b] bg-[#090d11]/90">
        <div className="bg-[#101720] border border-[#1d2938] rounded-2xl p-3.5 space-y-1.5 shadow-lg">
          <div className="flex items-center gap-1.5 text-[#00f2fe] text-[10px] font-black tracking-wider uppercase">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-[#00f2fe]" />
            HI-RES LOSSLESS
          </div>
          <p className="text-[11px] leading-snug text-[#7e8f9f] font-medium">
            Âm thanh không nén 24-bit 192kHz đỉnh cao.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
