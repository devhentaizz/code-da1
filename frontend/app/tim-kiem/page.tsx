'use client';

import React, { Suspense, useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAudio, Song } from '../context/AudioContext';
import SongRow from '../components/SongRow';
import {
  MagnifyingGlassIcon,
  MusicalNoteIcon,
  UserGroupIcon,
  SparklesIcon,
  PlayIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/solid';

type FilterTab = 'all' | 'songs' | 'artists' | 'albums' | 'playlists';

const QUICK_SUGGESTIONS = [
  'Sơn Tùng M-TP',
  'Vương Anh Tú',
  'Thiên An',
  'KAI',
  'Minh Anh',
  'Ballad',
  'EDM',
  'Pop'
];

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawQ = searchParams.get('q') || '';
  const initialType = (searchParams.get('type') as FilterTab) || 'all';

  const [keyword, setKeyword] = useState(rawQ);
  const [activeTab, setActiveTab] = useState<FilterTab>(initialType);

  const [songs, setSongs] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [, startTransition] = useTransition();

  const { playSong } = useAudio();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Synchronize keyword with URL query
  useEffect(() => {
    setKeyword(rawQ);
  }, [rawQ]);

  // Synchronize tab with URL query
  useEffect(() => {
    if (initialType && ['all', 'songs', 'artists', 'albums', 'playlists'].includes(initialType)) {
      setActiveTab(initialType);
    }
  }, [initialType]);

  // Fetch all categories concurrently
  useEffect(() => {
    const q = rawQ.trim();
    if (!q) {
      setSongs([]);
      setArtists([]);
      setAlbums([]);
      setPlaylists([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError('');

    const normalize = (val: string) =>
      val
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/gi, 'd')
        .toLowerCase();

    const normalizedQ = normalize(q);

    const executeSearch = async () => {
      try {
        const [songsRes, artistsRes, albumsRes, playlistsRes] = await Promise.all([
          fetch(`${apiUrl}/songs?keyword=${encodeURIComponent(q)}&limit=50`),
          fetch(`${apiUrl}/artists?keyword=${encodeURIComponent(q)}&limit=30`),
          fetch(`${apiUrl}/albums`),
          fetch(`${apiUrl}/playlists/featured`)
        ]);

        const songsData = songsRes.ok ? await songsRes.json() : { songs: [] };
        const artistsData = artistsRes.ok ? await artistsRes.json() : [];
        const albumsData = albumsRes.ok ? await albumsRes.json() : [];
        const playlistsData = playlistsRes.ok ? await playlistsRes.json() : [];

        if (!isMounted) return;

        // Filter albums client-side based on title or artist
        const matchedAlbums = Array.isArray(albumsData)
          ? albumsData.filter((al: any) => {
              const alTitle = normalize(al.title || '');
              const artistNames = Array.isArray(al.artistIds)
                ? al.artistIds
                    .map((a: any) => (typeof a === 'string' ? a : a?.name || ''))
                    .join(' ')
                : typeof al.artist === 'string'
                ? al.artist
                : al.artist?.name || '';
              return alTitle.includes(normalizedQ) || normalize(artistNames).includes(normalizedQ);
            })
          : [];

        // Filter playlists client-side based on name or description
        const matchedPlaylists = Array.isArray(playlistsData)
          ? playlistsData.filter((pl: any) => {
              const name = normalize(pl.name || '');
              const desc = normalize(pl.description || '');
              return name.includes(normalizedQ) || desc.includes(normalizedQ);
            })
          : [];

        setSongs(songsData.songs || []);
        setArtists(Array.isArray(artistsData) ? artistsData : []);
        setAlbums(matchedAlbums);
        setPlaylists(matchedPlaylists);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Lỗi khi tải kết quả tìm kiếm:', err);
        setError('Không thể kết nối đến máy chủ tìm kiếm. Vui lòng thử lại sau.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    executeSearch();

    return () => {
      isMounted = false;
    };
  }, [rawQ, apiUrl]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) return;
    startTransition(() => {
      router.push(`/tim-kiem?q=${encodeURIComponent(trimmed)}&type=${activeTab}`);
    });
  };

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    const qParam = encodeURIComponent(rawQ.trim());
    window.history.replaceState(null, '', `/tim-kiem?q=${qParam}&type=${tab}`);
  };

  const totalResults = songs.length + artists.length + albums.length + playlists.length;

  // Determine top highlight (Spotlight)
  const topArtistMatch = artists.find((a) =>
    (a.name || '').toLowerCase().includes(rawQ.toLowerCase().trim())
  );
  const topSongMatch = songs[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner & In-Page Search */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#101722] via-[#0d151f] to-[#0a1017] border border-[#1b2737] p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Neon Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#0df580]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold text-[#0df580] uppercase tracking-widest">
              <SparklesIcon className="w-4 h-4 text-[#0df580]" />
              TRUNG TÂM TÌM KIẾM CHI TIẾT
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {rawQ ? (
                <>
                  Kết quả cho: <span className="text-[#0df580]">&quot;{rawQ}&quot;</span>
                </>
              ) : (
                'Khám phá mọi giai điệu'
              )}
            </h1>
            <p className="text-xs text-[#6b7c93] mt-1 font-medium">
              {loading
                ? 'Đang tìm kiếm trong kho nhạc Melodix...'
                : `Tìm thấy ${totalResults} kết quả phù hợp (${songs.length} bài hát, ${artists.length} nghệ sĩ, ${albums.length} album)`}
            </p>
          </div>

          {/* In-page Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7c93]" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Nhập tên bài hát, nghệ sĩ, album..."
              className="w-full pl-11 pr-24 py-3 bg-[#0a0f16] border border-[#1d2a3c] rounded-2xl text-xs text-white placeholder-[#55677d] focus:outline-none focus:border-[#0df580] focus:ring-1 focus:ring-[#0df580] transition shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-[#0df580] hover:bg-[#38f895] text-[#080c10] text-xs font-black transition cursor-pointer shadow-md"
            >
              Tìm
            </button>
          </form>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-[#182332]/60">
          <span className="text-[11px] font-bold text-[#55677d] uppercase tracking-wider mr-1">
            Gợi ý:
          </span>
          {QUICK_SUGGESTIONS.map((sug) => (
            <button
              key={sug}
              type="button"
              onClick={() => {
                setKeyword(sug);
                router.push(`/tim-kiem?q=${encodeURIComponent(sug)}&type=${activeTab}`);
              }}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-[#121c27] hover:bg-[#192738] text-slate-300 hover:text-[#0df580] border border-[#1e2e42] transition cursor-pointer"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#172230] text-xs font-bold scrollbar-none">
        <button
          onClick={() => handleTabChange('all')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-[#0df580] text-[#080c10] shadow-lg shadow-[#0df580]/20 font-black'
              : 'bg-[#101722] text-[#8ea0b4] hover:text-white border border-[#1b2737]'
          }`}
        >
          <span>Tất Cả</span>
          <span className="text-[10px] opacity-80">({totalResults})</span>
        </button>

        <button
          onClick={() => handleTabChange('songs')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'songs'
              ? 'bg-[#0df580] text-[#080c10] shadow-lg shadow-[#0df580]/20 font-black'
              : 'bg-[#101722] text-[#8ea0b4] hover:text-white border border-[#1b2737]'
          }`}
        >
          <MusicalNoteIcon className="w-3.5 h-3.5" />
          <span>Bài Hát</span>
          <span className="text-[10px] opacity-80">({songs.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('artists')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'artists'
              ? 'bg-[#0df580] text-[#080c10] shadow-lg shadow-[#0df580]/20 font-black'
              : 'bg-[#101722] text-[#8ea0b4] hover:text-white border border-[#1b2737]'
          }`}
        >
          <UserGroupIcon className="w-3.5 h-3.5" />
          <span>Nghệ Sĩ</span>
          <span className="text-[10px] opacity-80">({artists.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('albums')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'albums'
              ? 'bg-[#0df580] text-[#080c10] shadow-lg shadow-[#0df580]/20 font-black'
              : 'bg-[#101722] text-[#8ea0b4] hover:text-white border border-[#1b2737]'
          }`}
        >
          <span>📀 Album</span>
          <span className="text-[10px] opacity-80">({albums.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('playlists')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'playlists'
              ? 'bg-[#0df580] text-[#080c10] shadow-lg shadow-[#0df580]/20 font-black'
              : 'bg-[#101722] text-[#8ea0b4] hover:text-white border border-[#1b2737]'
          }`}
        >
          <span>🎶 Playlist</span>
          <span className="text-[10px] opacity-80">({playlists.length})</span>
        </button>
      </div>

      {/* 3. Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4. Loading State */}
      {loading && (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#0df580] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#6b7c93]">Đang truy xuất kết quả tìm kiếm...</p>
        </div>
      )}

      {/* 5. Empty State */}
      {!loading && rawQ && totalResults === 0 && (
        <div className="py-16 text-center space-y-4 bg-[#101722]/50 border border-dashed border-[#1d2a3c] rounded-3xl p-8 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#15202e] border border-[#233549] flex items-center justify-center text-[#55677d] mx-auto">
            <MagnifyingGlassIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              Không tìm thấy kết quả nào cho &quot;{rawQ}&quot;
            </h3>
            <p className="text-xs text-[#6b7c93] max-w-sm mx-auto">
              Hãy kiểm tra lại chính tả hoặc thử tìm kiếm với các từ khóa ngắn gọn hơn như tên ca sĩ, thể loại hoặc bài hát thịnh hành.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/bai-hat"
              className="inline-block px-5 py-2.5 rounded-full bg-[#0df580] hover:bg-[#38f895] text-[#080c10] text-xs font-black transition shadow-lg shadow-[#0df580]/20"
            >
              Khám Phá Bảng Xếp Hạng ➔
            </Link>
          </div>
        </div>
      )}

      {/* 6. TAB: TẤT CẢ (ALL) */}
      {!loading && activeTab === 'all' && totalResults > 0 && (
        <div className="space-y-10">
          {/* Spotlight Top Match + Top 4 Songs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top Match Spotlight (5 cols) */}
            <div className="lg:col-span-5 flex flex-col">
              <h2 className="text-xs font-mono font-bold tracking-widest text-[#0df580] uppercase mb-3">
                01 // KẾT QUẢ HÀNG ĐẦU
              </h2>

              {topArtistMatch ? (
                <Link
                  href={`/nghe-si/${topArtistMatch._id}`}
                  className="group relative flex-1 p-6 rounded-3xl bg-[#101722] hover:bg-[#131d2b] border border-[#1b2737] hover:border-[#0df580]/40 transition shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-[#1b2533] group-hover:ring-[#0df580]/50 transition duration-300 shadow-2xl">
                      <img
                        src={
                          topArtistMatch.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                        }
                        alt={topArtistMatch.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#0df580]/20 text-[#0df580] border border-[#0df580]/30">
                        NGHỆ SĨ XÁC MINH
                      </span>
                      <h3 className="text-2xl font-black text-white group-hover:text-[#0df580] transition mt-2 flex items-center gap-1.5">
                        {topArtistMatch.name}
                        <CheckBadgeIcon className="w-5 h-5 text-[#0df580]" />
                      </h3>
                      <p className="text-xs text-[#6b7c93] mt-1 font-medium">
                        {(topArtistMatch.followersCount || 420000).toLocaleString('vi-VN')} người theo dõi
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between text-xs font-bold text-[#0df580]">
                    <span>Trang cá nhân & ca khúc</span>
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ) : topSongMatch ? (
                <div
                  onClick={() => playSong(topSongMatch, songs)}
                  className="group relative flex-1 p-6 rounded-3xl bg-[#101722] hover:bg-[#131d2b] border border-[#1b2737] hover:border-[#0df580]/40 transition shadow-xl flex flex-col justify-between cursor-pointer"
                >
                  <div className="space-y-4">
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-[#1b2533] group-hover:ring-[#0df580]/40 transition">
                      <img
                        src={
                          topSongMatch.coverImage ||
                          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80'
                        }
                        alt={topSongMatch.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div className="w-12 h-12 rounded-full bg-[#0df580] text-[#080c10] flex items-center justify-center shadow-lg">
                          <PlayIcon className="w-6 h-6 ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#0df580]/20 text-[#0df580] border border-[#0df580]/30">
                        BÀI HÁT NỔI BẬT NHẤT
                      </span>
                      <h3 className="text-xl font-black text-white group-hover:text-[#0df580] transition mt-2 truncate">
                        {topSongMatch.title}
                      </h3>
                      <p className="text-xs text-[#6b7c93] mt-1 font-semibold truncate">
                        {typeof topSongMatch.artist === 'object'
                          ? topSongMatch.artist?.name
                          : topSongMatch.artist || 'Nghệ sĩ Melodix'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between text-xs font-bold text-[#0df580]">
                    <span>Bấm để phát ngay</span>
                    <PlayIcon className="w-4 h-4 ml-0.5" />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Top Songs List (7 cols) */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-mono font-bold tracking-widest text-[#0df580] uppercase">
                  02 // BÀI HÁT LIÊN QUAN
                </h2>
                {songs.length > 4 && (
                  <button
                    onClick={() => handleTabChange('songs')}
                    className="text-xs font-bold text-[#6b7c93] hover:text-[#0df580] transition cursor-pointer"
                  >
                    Xem tất cả ({songs.length}) ➔
                  </button>
                )}
              </div>

              <div className="space-y-1.5 flex-1 bg-[#0d141e]/50 border border-[#172230] rounded-3xl p-3">
                {songs.slice(0, 4).map((song, idx) => (
                  <SongRow key={song._id} song={song} index={idx} queue={songs} />
                ))}

                {songs.length === 0 && (
                  <div className="py-12 text-center text-xs text-[#55677d]">
                    Không có bài hát phù hợp.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Artists Section */}
          {artists.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#0df580] uppercase">
                    03 // NGHỆ SĨ
                  </span>
                  <h3 className="text-lg font-black text-white">Nghệ Sĩ Liên Quan</h3>
                </div>
                {artists.length > 5 && (
                  <button
                    onClick={() => handleTabChange('artists')}
                    className="text-xs font-bold text-[#6b7c93] hover:text-[#0df580] transition cursor-pointer"
                  >
                    Xem tất cả ({artists.length}) ➔
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {artists.slice(0, 5).map((art) => (
                  <Link
                    key={art._id}
                    href={`/nghe-si/${art._id}`}
                    className="group flex flex-col items-center text-center p-4 rounded-2xl bg-[#101722] hover:bg-[#141f2d] border border-[#1b2737] hover:border-[#0df580]/40 transition shadow-lg"
                  >
                    <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3 ring-2 ring-[#1b2533] group-hover:ring-[#0df580]/50 transition duration-300">
                      <img
                        src={
                          art.avatar ||
                          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'
                        }
                        alt={art.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      />
                    </div>
                    <p className="text-xs font-bold text-white group-hover:text-[#0df580] transition truncate max-w-full">
                      {art.name}
                    </p>
                    <span className="text-[10px] text-[#6b7c93] mt-0.5">Nghệ sĩ</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Albums Section */}
          {albums.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#0df580] uppercase">
                    04 // ALBUM & TUYỂN TẬP
                  </span>
                  <h3 className="text-lg font-black text-white">Album Phù Hợp</h3>
                </div>
                {albums.length > 5 && (
                  <button
                    onClick={() => handleTabChange('albums')}
                    className="text-xs font-bold text-[#6b7c93] hover:text-[#0df580] transition cursor-pointer"
                  >
                    Xem tất cả ({albums.length}) ➔
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {albums.slice(0, 5).map((al) => {
                  const artistNames = Array.isArray(al.artistIds)
                    ? al.artistIds
                        .map((a: any) => (typeof a === 'string' ? a : a?.name || ''))
                        .join(', ')
                    : al.artist || 'Nhiều nghệ sĩ';

                  return (
                    <Link
                      key={al._id}
                      href={`/album/${al._id}`}
                      className="group p-3.5 rounded-2xl bg-[#101722] hover:bg-[#141f2d] border border-[#1b2737] hover:border-[#0df580]/40 transition shadow-lg block"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 ring-1 ring-[#1b2533] group-hover:ring-[#0df580]/40 transition">
                        <img
                          src={
                            al.coverImage ||
                            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80'
                          }
                          alt={al.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>
                      <p className="text-xs font-bold text-white group-hover:text-[#0df580] transition truncate">
                        {al.title}
                      </p>
                      <p className="text-[11px] text-[#6b7c93] truncate mt-0.5 font-medium">
                        {artistNames}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Playlists Section */}
          {playlists.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#0df580] uppercase">
                    05 // PLAYLIST
                  </span>
                  <h3 className="text-lg font-black text-white">Danh Sách Phát</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {playlists.slice(0, 5).map((pl) => (
                  <Link
                    key={pl._id}
                    href={`/playlist/${pl._id}`}
                    className="group p-3.5 rounded-2xl bg-[#101722] hover:bg-[#141f2d] border border-[#1b2737] hover:border-[#0df580]/40 transition shadow-lg block"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-3 ring-1 ring-[#1b2533] group-hover:ring-[#0df580]/40 transition">
                      <img
                        src={
                          pl.coverImage ||
                          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'
                        }
                        alt={pl.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    </div>
                    <p className="text-xs font-bold text-white group-hover:text-[#0df580] transition truncate">
                      {pl.name}
                    </p>
                    <p className="text-[11px] text-[#6b7c93] truncate mt-0.5">
                      {pl.songIds?.length || 0} bài hát
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. TAB: BÀI HÁT (SONGS ONLY) */}
      {!loading && activeTab === 'songs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white">
              Tất Cả Bài Hát Phù Hợp ({songs.length})
            </h2>
            {songs.length > 0 && (
              <button
                onClick={() => playSong(songs[0], songs)}
                className="px-4 py-2 rounded-full bg-[#0df580] hover:bg-[#38f895] text-[#080c10] text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-md"
              >
                <PlayIcon className="w-3.5 h-3.5 ml-0.5" />
                Phát Tất Cả
              </button>
            )}
          </div>

          <div className="space-y-1.5 bg-[#0e1520]/60 border border-[#172230] rounded-3xl p-3">
            {songs.map((song, idx) => (
              <SongRow key={song._id} song={song} index={idx} queue={songs} />
            ))}
            {songs.length === 0 && (
              <div className="py-12 text-center text-xs text-[#55677d]">
                Không tìm thấy bài hát nào cho từ khóa này.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. TAB: NGHỆ SĨ (ARTISTS ONLY) */}
      {!loading && activeTab === 'artists' && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-white">Nghệ Sĩ & Ca Sĩ ({artists.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {artists.map((art) => (
              <Link
                key={art._id}
                href={`/nghe-si/${art._id}`}
                className="group flex flex-col items-center text-center p-4 rounded-2xl bg-[#101722] hover:bg-[#141f2d] border border-[#1b2737] hover:border-[#0df580]/40 transition shadow-lg"
              >
                <div className="relative w-28 h-28 rounded-full overflow-hidden mb-3.5 ring-2 ring-[#1b2533] group-hover:ring-[#0df580]/50 transition duration-300 shadow-xl">
                  <img
                    src={
                      art.avatar ||
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'
                    }
                    alt={art.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-[#0df580] transition truncate max-w-full">
                  {art.name}
                </h4>
                <p className="text-[10px] text-[#6b7c93] mt-1">
                  {(art.followersCount || 420000).toLocaleString('vi-VN')} người theo dõi
                </p>
              </Link>
            ))}
          </div>
          {artists.length === 0 && (
            <div className="py-12 text-center text-xs text-[#55677d]">
              Không tìm thấy nghệ sĩ nào phù hợp.
            </div>
          )}
        </div>
      )}

      {/* 9. TAB: ALBUM ONLY */}
      {!loading && activeTab === 'albums' && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-white">Album & Đĩa Nhạc ({albums.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albums.map((al) => {
              const artistNames = Array.isArray(al.artistIds)
                ? al.artistIds
                    .map((a: any) => (typeof a === 'string' ? a : a?.name || ''))
                    .join(', ')
                : al.artist || 'Nhiều nghệ sĩ';

              return (
                <Link
                  key={al._id}
                  href={`/album/${al._id}`}
                  className="group p-4 rounded-2xl bg-[#101722] hover:bg-[#141f2d] border border-[#1b2737] hover:border-[#0df580]/40 transition shadow-lg block"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3 ring-1 ring-[#1b2533] group-hover:ring-[#0df580]/40 transition">
                    <img
                      src={
                        al.coverImage ||
                        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80'
                      }
                      alt={al.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-[#0df580] transition truncate">
                    {al.title}
                  </h4>
                  <p className="text-[11px] text-[#6b7c93] truncate mt-0.5">{artistNames}</p>
                </Link>
              );
            })}
          </div>
          {albums.length === 0 && (
            <div className="py-12 text-center text-xs text-[#55677d]">
              Không tìm thấy album nào phù hợp.
            </div>
          )}
        </div>
      )}

      {/* 10. TAB: PLAYLIST ONLY */}
      {!loading && activeTab === 'playlists' && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-white">Danh Sách Phát ({playlists.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {playlists.map((pl) => (
              <Link
                key={pl._id}
                href={`/playlist/${pl._id}`}
                className="group p-4 rounded-2xl bg-[#101722] hover:bg-[#141f2d] border border-[#1b2737] hover:border-[#0df580]/40 transition shadow-lg block"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 ring-1 ring-[#1b2533] group-hover:ring-[#0df580]/40 transition">
                  <img
                    src={
                      pl.coverImage ||
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80'
                    }
                    alt={pl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-[#0df580] transition truncate">
                  {pl.name}
                </h4>
                <p className="text-[11px] text-[#6b7c93] truncate mt-0.5">
                  {pl.songIds?.length || 0} bài hát
                </p>
              </Link>
            ))}
          </div>
          {playlists.length === 0 && (
            <div className="py-12 text-center text-xs text-[#55677d]">
              Không tìm thấy playlist nào phù hợp.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#0df580] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#6b7c93]">Đang tải trang tìm kiếm...</p>
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
