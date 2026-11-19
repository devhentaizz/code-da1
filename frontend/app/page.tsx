'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAudio } from './context/AudioContext';
import { useAuth } from './context/AuthContext';
import FavoriteSongButton from './components/FavoriteSongButton';
import {
  PlayIcon,
  PauseIcon,
  CheckBadgeIcon,
  CheckIcon,
  EllipsisHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  BoltIcon
} from '@heroicons/react/24/solid';
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';

type QuickAccessCard = {
  id: string;
  title: string;
  sub: string;
  img: string;
  link: string;
};

export default function HomePage() {
  const { playSong, currentSong, isPlaying, togglePlay } = useAudio();
  const { token } = useAuth();
  const [songs, setSongs] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [quickAccess, setQuickAccess] = useState<QuickAccessCard[]>([]);
  const [quickAccessLoading, setQuickAccessLoading] = useState(true);
  const [quickAccessError, setQuickAccessError] = useState('');
  const [recommendedPlaylists, setRecommendedPlaylists] = useState<any[]>([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(true);
  const [playlistsError, setPlaylistsError] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    try {
      const saved = localStorage.getItem('melodix_following_artists');
      if (saved) {
        setFollowingMap(JSON.parse(saved));
      } else {
        // Default: start with Sơn Tùng followed if present
        setFollowingMap({});
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const handleToggleFollow = (artistId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFollowingMap(prev => {
      const nextVal = !prev[artistId];
      const updated = { ...prev, [artistId]: nextVal };
      try {
        localStorage.setItem('melodix_following_artists', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [songsRes, artistsRes] = await Promise.all([
          fetch(`${apiUrl}/songs?limit=20&sort=listens`),
          fetch(`${apiUrl}/artists?limit=10`)
        ]);

        if (songsRes.ok) {
          const sData = await songsRes.json();
          setSongs(sData.songs || []);
        }

        if (artistsRes.ok) {
          const aData = await artistsRes.json();
          setArtists(aData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchQuickAccess = async () => {
      setQuickAccessLoading(true);
      setQuickAccessError('');
      setPlaylistsLoading(true);
      setPlaylistsError('');

      const fetchJson = async (url: string, init?: RequestInit) => {
        const response = await fetch(url, init);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Không thể đồng bộ dữ liệu truy cập nhanh');
        }
        return data;
      };

      try {
        const [featuredPlaylists, albums, userPlaylists] = await Promise.all([
          fetchJson(`${apiUrl}/playlists/featured`),
          fetchJson(`${apiUrl}/albums`),
          token
            ? fetchJson(`${apiUrl}/playlists`, {
                headers: { Authorization: `Bearer ${token}` }
              })
            : Promise.resolve([])
        ]);
        setRecommendedPlaylists(Array.isArray(featuredPlaylists) ? featuredPlaylists : []);

        const cards: QuickAccessCard[] = [];
        const favoritePlaylist = userPlaylists.find(
          (playlist: any) => playlist.name?.trim().toLocaleLowerCase('vi') === 'nhạc yêu thích'
        );
        const countSongs = (playlist: any) =>
          Array.isArray(playlist.songIds) ? playlist.songIds.length : 0;

        if (favoritePlaylist?._id) {
          cards.push({
            id: favoritePlaylist._id,
            title: favoritePlaylist.name,
            sub: `${countSongs(favoritePlaylist)} bài hát • Đã đồng bộ`,
            img: favoritePlaylist.coverImage || '',
            link: `/playlist/${favoritePlaylist._id}`
          });
        }

        const otherPlaylist = [...userPlaylists, ...featuredPlaylists].find(
          (playlist: any) => playlist._id && playlist._id !== favoritePlaylist?._id
        );
        if (otherPlaylist) {
          cards.push({
            id: otherPlaylist._id,
            title: otherPlaylist.name,
            sub: `${countSongs(otherPlaylist)} bài hát • Playlist`,
            img: otherPlaylist.coverImage || '',
            link: `/playlist/${otherPlaylist._id}`
          });
        }

        const latestAlbum = albums.find((album: any) => album?._id);
        if (latestAlbum) {
          const artistNames = Array.isArray(latestAlbum.artistIds)
            ? latestAlbum.artistIds
                .map((artist: any) => typeof artist === 'string' ? artist : artist?.name)
                .filter(Boolean)
                .join(', ')
            : '';
          const releaseYear = latestAlbum.releaseDate
            ? new Date(latestAlbum.releaseDate).getFullYear()
            : null;
          const releaseLabel = releaseYear && !Number.isNaN(releaseYear)
            ? `Phát hành ${releaseYear}`
            : '';

          cards.push({
            id: latestAlbum._id,
            title: latestAlbum.title,
            sub: [artistNames, releaseLabel].filter(Boolean).join(' • ') || 'Album',
            img: latestAlbum.coverImage || '',
            link: `/album/${latestAlbum._id}`
          });
        }

        setQuickAccess(cards);
      } catch (error) {
        console.error(error);
        setPlaylistsError(
          error instanceof Error ? error.message : 'Không thể đồng bộ playlist'
        );
        setQuickAccessError(
          error instanceof Error ? error.message : 'Không thể đồng bộ dữ liệu truy cập nhanh'
        );
      } finally {
        setQuickAccessLoading(false);
        setPlaylistsLoading(false);
      }
    };

    fetchQuickAccess();
  }, [apiUrl, token]);

  // Spotlight song (Default to Ánh Đèn / KAI or first song)
  const spotlightSong = songs.find(s => s.title?.toLowerCase().includes('ánh đèn')) || songs[0] || {
    _id: 'song_001',
    title: 'Ánh Đèn & Thanh Âm Đô Thị',
    artist: { name: 'KAI', _id: 'artist_002' },
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    youtubeId: '9bZkp7q19f0',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    listens: 2458
  };

  const isSpotlightPlaying = isPlaying && currentSong?._id === spotlightSong._id;

  const handlePlaySpotlight = () => {
    if (isSpotlightPlaying) {
      togglePlay();
    } else {
      playSong(spotlightSong, songs);
    }
  };

  // Section 04: Trending Artists
  const trendingArtists = artists.length > 0 ? artists : [
    {
      _id: 'artist_004',
      name: 'Sơn Tùng M-TP',
      genre: 'POP • V-POP • R&B',
      followers: 8500000,
      isTop1: true,
      avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80'
    },
    {
      _id: 'artist_001',
      name: 'Minh Anh',
      genre: 'POP • INDIE',
      followers: 342000,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    },
    {
      _id: 'artist_002',
      name: 'KAI',
      genre: 'EDM • ELECTRONIC',
      followers: 510400,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
    }
  ];

  const getArtistInfo = (art: any, index: number) => {
    const name = (typeof art?.name === 'string' ? art.name : (art?.name?.name || '')).toLowerCase();

    let genre = typeof art?.genre === 'object' ? art.genre?.name : (typeof art?.genre === 'string' ? art.genre : '');
    let baseFollowers = 420000;
    let isTop = Boolean(art?.isTop1);
    let topBadge = '#1 TUẦN NÀY';

    if (name.includes('sơn tùng') || name.includes('son tung') || art?._id === 'artist_004') {
      genre = genre || 'POP • V-POP • R&B';
      baseFollowers = 8500000;
      isTop = true;
      topBadge = '#1 THỊNH HÀNH';
    } else if (name.includes('vương anh tú') || name.includes('vuong anh tu')) {
      genre = genre || 'BALLAD • POP MELODIC';
      baseFollowers = 980000;
      isTop = isTop || false;
    } else if (name.includes('thiên an') || name.includes('thien an')) {
      genre = genre || 'INDIE • ACOUSTIC • POP';
      baseFollowers = 320000;
      isTop = isTop || false;
    } else if (name.includes('kai') || art?._id === 'artist_002') {
      genre = genre || 'EDM • SYNTHWAVE';
      baseFollowers = 510400;
      isTop = isTop || index === 0;
      topBadge = '#1 TUẦN NÀY';
    } else if (name.includes('minh anh') || art?._id === 'artist_001') {
      genre = genre || 'POP • INDIE CHILL';
      baseFollowers = 342000;
      isTop = isTop || false;
    } else if (name.includes('linh chi') || art?._id === 'artist_003') {
      genre = genre || 'BALLAD • R&B';
      baseFollowers = 185200;
      isTop = isTop || false;
    } else {
      const defaultGenres = ['POP • V-POP', 'BALLAD • ACOUSTIC', 'R&B • SOUL', 'INDIE • ALTERNATIVE', 'EDM • DANCE'];
      const defaultCounts = [650000, 480000, 390000, 280000];
      genre = genre || defaultGenres[index % defaultGenres.length];
      baseFollowers = typeof art?.followers === 'number' ? art.followers : defaultCounts[index % defaultCounts.length];
      isTop = isTop || (index === 0 && !artists.some((a: any) => (a?.name || '').toLowerCase().includes('sơn tùng')));
    }

    const isFollowing = Boolean(followingMap[art?._id]);
    const displayCount = isFollowing ? baseFollowers + 1 : baseFollowers;
    const followersText = displayCount.toLocaleString('vi-VN') + ' người theo dõi';

    const safeGenre = typeof genre === 'object' ? (genre?.name || 'POP • V-POP') : String(genre || 'POP • V-POP');

    return {
      genre: safeGenre,
      followersText,
      isTop,
      topBadge,
      isFollowing
    };
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* ============================================================== */}
      {/* 1. HERO SPOTLIGHT BANNER (Exact match with Image 1 & 2)       */}
      {/* ============================================================== */}
      <section className="relative rounded-3xl overflow-hidden border border-[#1d2735] bg-[#0c1219] p-8 md:p-12 shadow-2xl">
        {/* Studio Background Image with Gradient Mask */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1600&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090d11] via-[#090d11]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090d11] via-transparent to-transparent" />

        <div className="relative z-10 max-w-2xl space-y-4">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-black uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0df580]/15 text-[#0df580] border border-[#0df580]/30">
                <span className="w-1.5 h-1.5 bg-[#0df580] rounded-full animate-pulse" />
                PHÁT HÀNH TIÊU ĐIỂM
              </span>
              <span className="px-3 py-1 rounded-full bg-[#16202c] text-[#8ea0b4] border border-[#233142]">
                MASTER HI-RES
              </span>
            </div>

            <div className="text-[#8ea0b4] text-xs font-semibold normal-case flex items-center gap-1.5">
              <span>🎧 2,400+ lượt nghe hôm nay</span>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-xs font-bold text-[#8ea0b4] uppercase tracking-wider pt-2">
            ALBUM • ĐÊM THÀNH PHỐ / <span className="text-[#0df580]">KAI</span>
          </p>

          {/* Giant Title */}
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Ánh Đèn & Thanh Âm Đô Thị
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#8ea0b4] leading-relaxed max-w-xl">
            Hòa quyện giữa Synthwave huyền ảo và nhịp bass điện tử sâu lắng. Bản thu đạt chứng nhận 24-bit 192kHz Audiophile Studio độc quyền tại Melodix.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={handlePlaySpotlight}
              className="px-8 py-3.5 rounded-full bg-[#0df580] hover:bg-[#38f895] text-[#080c10] font-black text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-lg shadow-[#0df580]/25 transform active:scale-95"
            >
              {isSpotlightPlaying ? (
                <>
                  <PauseIcon className="w-4 h-4" />
                  TẠM DỪNG
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4 ml-0.5" />
                  NGHE NGAY
                </>
              )}
            </button>

            <FavoriteSongButton
              song={spotlightSong}
              addLabel="THÊM VÀO YÊU THÍCH"
              removeLabel="BỎ YÊU THÍCH"
              iconClassName="w-4 h-4"
              className="flex items-center gap-2 rounded-full border border-[#223041] bg-[#121922] px-6 py-3.5 text-xs font-bold transition hover:bg-[#182330]"
              activeClassName="text-[#0df580]"
              inactiveClassName="text-white"
            />

            <button
              className="p-3.5 rounded-full bg-[#121922] hover:bg-[#182330] border border-[#223041] text-[#8ea0b4] hover:text-white transition"
              title="Tùy chọn khác"
            >
              <EllipsisHorizontalIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. SECTION 01 // TRUY CẬP NHANH: "Gần đây & Đang nghe"        */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#0df580] font-mono font-bold tracking-widest uppercase">01 // TRUY CẬP NHANH</span>
            <h2 className="text-lg font-black text-white ml-2">Gần đây & Đang nghe</h2>
          </div>
          <Link href="/thu-vien" className="text-xs font-bold text-[#6b7c93] hover:text-[#0df580] transition">
            Xem tất cả
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickAccessLoading ? (
            <p className="text-sm text-[#6b7c93]">Đang đồng bộ dữ liệu...</p>
          ) : quickAccessError ? (
            <p className="text-sm text-rose-400">{quickAccessError}</p>
          ) : quickAccess.length === 0 ? (
            <p className="text-sm text-[#6b7c93]">Chưa có playlist hoặc album để hiển thị.</p>
          ) : quickAccess.map((card) => (
            <Link
              key={card.id}
              href={card.link}
              className="group flex items-center gap-4 p-3 bg-[#10161f] hover:bg-[#16202c] border border-[#1b2533] hover:border-[#28384d] rounded-2xl transition duration-200"
            >
              <img
                src={card.img}
                alt={card.title}
                onError={(event) => {
                  event.currentTarget.style.visibility = 'hidden';
                }}
                className="w-14 h-14 rounded-xl object-cover shadow group-hover:scale-105 transition-transform shrink-0"
              />
              <div className="truncate">
                <h3 className="text-sm font-bold text-white group-hover:text-[#0df580] transition truncate">
                  {card.title}
                </h3>
                <p className="text-[11px] text-[#6b7c93] mt-0.5 truncate">{card.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. SECTION 02 // BẢNG XẾP HẠNG: "Bài Hát Nổi Bật Hôm Nay"      */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#0df580] font-mono font-bold tracking-widest uppercase">02 // BẢNG XẾP HẠNG</span>
            <h2 className="text-lg font-black text-white ml-2">Bài Hát Nổi Bật Hôm Nay</h2>
          </div>
          <span className="text-[11px] text-[#6b7c93] font-medium flex items-center gap-1.5">
            Cập nhật mỗi 15 phút <span className="w-1.5 h-1.5 bg-[#0df580] rounded-full" />
          </span>
        </div>

        {/* Ranked Songs Table */}
        <div className="bg-[#10161f] border border-[#1b2533] rounded-3xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#1b2533] text-[#55657a] text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6 w-12 text-center">#</th>
                <th className="py-3.5 px-4">TIÊU ĐỀ & NGHỆ SĨ</th>
                <th className="py-3.5 px-4 hidden md:table-cell">ALBUM</th>
                <th className="py-3.5 px-4 hidden sm:table-cell text-right">LƯỢT NGHE</th>
                <th className="py-3.5 px-6 text-right">THỜI LƯỢNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17202b]">
              {songs.slice(0, 5).map((s, idx) => {
                const isThisPlaying = isPlaying && currentSong?._id === s._id;
                const artist = s.artist || s.artistIds?.[0];
                const artistName = typeof artist === 'object'
                  ? artist?.name || artist?.stageName || 'Đang cập nhật'
                  : artist || 'Đang cập nhật';
                const albumTitle = s.albumId?.title || '—';
                const listenCount = Number(s.listens ?? s.playCount ?? 0);
                const durationSeconds = Number(s.duration);
                const durationText = Number.isFinite(durationSeconds) && durationSeconds > 0
                  ? `${String(Math.floor(durationSeconds / 60)).padStart(2, '0')}:${String(Math.floor(durationSeconds % 60)).padStart(2, '0')}`
                  : '--:--';

                return (
                  <tr
                    key={s._id}
                    onClick={() => playSong(s, songs)}
                    className="group hover:bg-[#151f2b] transition cursor-pointer"
                  >
                    {/* Index or Equalizer */}
                    <td className="py-3.5 px-6 text-center font-mono font-bold text-[#6b7c93]">
                      {isThisPlaying ? (
                        <div className="flex items-center justify-center gap-0.5">
                          <span className="w-0.5 h-3 bg-[#0df580] rounded-full animate-eq-1" />
                          <span className="w-0.5 h-4 bg-[#0df580] rounded-full animate-eq-2" />
                          <span className="w-0.5 h-2 bg-[#0df580] rounded-full animate-eq-3" />
                        </div>
                      ) : (
                        `0${idx + 1}`
                      )}
                    </td>

                    {/* Song Cover & Title */}
                    <td className="py-3.5 px-4 flex items-center gap-3">
                      <img
                        src={s.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=100&q=80'}
                        alt={s.title}
                        className="w-10 h-10 rounded-xl object-cover shrink-0"
                      />
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-xs truncate ${isThisPlaying ? 'text-[#0df580]' : 'text-white'}`}>
                            {s.title}
                          </span>
                          {idx === 0 && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                              HOT
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#6b7c93] mt-0.5">{artistName}</p>
                      </div>
                    </td>

                    {/* Album */}
                    <td className="py-3.5 px-4 hidden md:table-cell text-[#6b7c93]">
                      {albumTitle}
                    </td>

                    {/* Listens */}
                    <td className="py-3.5 px-4 hidden sm:table-cell text-right font-mono text-[#8ea0b4]">
                      {listenCount.toLocaleString('vi-VN')}
                    </td>

                    {/* Duration & Like */}
                    <td className="py-3.5 px-6 text-right text-[#6b7c93]">
                      <div className="flex items-center justify-end gap-3">
                        <FavoriteSongButton
                          song={s}
                          iconClassName="w-4 h-4"
                          className="opacity-0 group-hover:opacity-100 text-[#6b7c93] hover:text-[#0df580] transition"
                          activeClassName="text-[#0df580]"
                        />
                        <span className="font-mono text-[11px]">{durationText}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className="text-[#55657a] hover:text-white transition"
                        >
                          <EllipsisHorizontalIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. SECTION 03 // ĐỀ XUẤT CHO BẠN: "Playlist Dành Cho Bạn"     */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#0df580] font-mono font-bold tracking-widest uppercase">03 // ĐỀ XUẤT CHO BẠN</span>
            <h2 className="text-lg font-black text-white ml-2">Playlist Dành Cho Bạn</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 rounded-full bg-[#10161f] border border-[#1b2533] text-[#6b7c93] hover:text-white transition">
              <ChevronLeftIcon className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 rounded-full bg-[#10161f] border border-[#1b2533] text-[#6b7c93] hover:text-white transition">
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {playlistsLoading ? (
          <p className="text-sm text-[#6b7c93]">Đang đồng bộ playlist...</p>
        ) : playlistsError ? (
          <p className="text-sm text-rose-400">{playlistsError}</p>
        ) : recommendedPlaylists.length === 0 ? (
          <p className="text-sm text-[#6b7c93]">Chưa có playlist công khai để đề xuất.</p>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recommendedPlaylists.slice(0, 10).map((pl) => (
            <Link
              key={pl._id}
              href={`/playlist/${pl._id}`}
              className="group bg-[#10161f] hover:bg-[#151f2b] border border-[#1b2533] hover:border-[#27374b] rounded-3xl p-4 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="aspect-square w-full rounded-2xl overflow-hidden bg-[#16202c] mb-3 shadow-md relative">
                  {pl.coverImage && (
                    <img
                      src={pl.coverImage}
                      alt={pl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#0df580] flex items-center justify-center shadow-lg shadow-[#0df580]/30 transform scale-75 group-hover:scale-100 transition">
                      <PlayIcon className="w-5 h-5 text-[#080c10] ml-0.5" />
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-[#0df580] transition truncate">
                  {pl.name}
                </h3>
                <p className="text-[11px] text-[#6b7c93] line-clamp-2 mt-1 leading-relaxed">
                  {pl.description || `${Array.isArray(pl.songIds) ? pl.songIds.length : 0} bài hát`}
                </p>
              </div>
            </Link>
          ))}
        </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* 5. SECTION 04 // CỘNG ĐỒNG SÁNG TẠO: "Nghệ Sĩ Thịnh Hành"      */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#0df580] font-mono font-bold tracking-widest uppercase">04 // CỘNG ĐỒNG SÁNG TẠO</span>
            <h2 className="text-lg font-black text-white ml-2">Nghệ Sĩ Thịnh Hành</h2>
          </div>
          <Link href="/nghe-si" className="text-xs font-bold text-[#6b7c93] hover:text-[#0df580] transition">
            Khám phá thêm
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {trendingArtists.slice(0, 3).map((art: any, index: number) => {
            const { genre, followersText, isTop, topBadge, isFollowing } = getArtistInfo(art, index);

            return (
              <div
                key={art._id}
                className="relative bg-[#10161f] border border-[#1b2533] hover:border-[#27374b] rounded-3xl p-6 text-center space-y-4 transition-all duration-300 group hover:shadow-2xl hover:shadow-black/60"
              >
                {isTop && (
                  <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#0df580]/20 text-[#0df580] border border-[#0df580]/30 shadow-sm">
                    {topBadge || '#1 TUẦN NÀY'}
                  </span>
                )}

                {/* Avatar */}
                <Link href={`/nghe-si/${art._id}`} className="block">
                  <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden ring-4 ring-[#1b2533] group-hover:ring-[#0df580]/50 transition-all duration-300 shadow-xl">
                    <img
                      src={art.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
                      alt={typeof art.name === 'string' ? art.name : (art.name?.name || '')}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </Link>

                <div>
                  <div className="flex items-center justify-center gap-1.5">
                    <Link
                      href={`/nghe-si/${art._id}`}
                      className="font-bold text-base text-white group-hover:text-[#0df580] transition truncate max-w-[200px]"
                    >
                      {typeof art.name === 'string' ? art.name : (art.name?.name || 'Nghệ sĩ')}
                    </Link>
                    <CheckBadgeIcon className="w-4 h-4 text-[#0df580] shrink-0" />
                  </div>
                  <p className="text-[10px] font-bold text-[#0df580] uppercase tracking-wider mt-1">
                    {genre}
                  </p>
                  <p className="text-[11px] text-[#6b7c93] mt-0.5 font-medium">
                    {followersText}
                  </p>
                </div>

                {/* Follow Button with active interactive toggle */}
                <div>
                  <button
                    type="button"
                    onClick={(e) => handleToggleFollow(art._id, e)}
                    className={`w-full py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer select-none active:scale-95 ${
                      isFollowing
                        ? 'bg-[#0df580] hover:bg-[#38f895] text-[#080c10] shadow-md shadow-[#0df580]/20 ring-1 ring-[#0df580]'
                        : 'bg-[#16202c] hover:bg-[#1e2c3d] text-white hover:text-[#0df580] border border-[#233142] hover:border-[#0df580]/40'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />
                        ĐANG THEO DÕI
                      </>
                    ) : (
                      '+ THEO DÕI'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. BOTTOM PROMO BANNER (Exact match with Image 1 & 2)          */}
      {/* ============================================================== */}
      <section className="rounded-3xl border border-[#1b2533] bg-gradient-to-r from-[#10161f] via-[#101822] to-[#14232c] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0df580]/15 border border-[#0df580]/30 text-[#0df580] flex items-center justify-center shrink-0">
            <SpeakerWaveIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white">
                Âm Thanh Đa Chiều Melodix Spatial 360°
              </h3>
              <span className="px-2 py-0.2 rounded text-[9px] font-black uppercase bg-[#0df580]/20 text-[#0df580]">
                MỚI
              </span>
            </div>
            <p className="text-xs text-[#6b7c93] mt-1">
              Tối ưu trường âm trường cho tai nghe chuyên dụng với bộ mã hóa FLAC nguyên bản.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button className="px-5 py-2.5 rounded-full text-xs font-bold text-[#8ea0b4] hover:text-white transition">
            TÌM HIỂU THÊM
          </button>
          <Link
            href="/goi-cuoc"
            className="px-6 py-2.5 rounded-full bg-[#0df580] hover:bg-[#38f895] text-[#080c10] text-xs font-black uppercase tracking-wider transition shadow-lg shadow-[#0df580]/20"
          >
            KÍCH HOẠT NGAY
          </Link>
        </div>
      </section>
    </div>
  );
}
