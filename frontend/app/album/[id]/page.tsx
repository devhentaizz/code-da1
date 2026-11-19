'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAudio } from '../../context/AudioContext';
import {
  PlayIcon,
  PauseIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  ArrowsRightLeftIcon,
  HeartIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds) || seconds < 0) return '03:15';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const getArtistName = (artist: unknown): string => {
  if (typeof artist === 'string') return artist;
  if (!artist || typeof artist !== 'object') return '';
  if (Array.isArray(artist)) {
    return artist.map(getArtistName).filter(Boolean).join(', ');
  }

  const artistRecord = artist as Record<string, unknown>;
  return typeof artistRecord.name === 'string' ? artistRecord.name : '';
};

export default function AlbumDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { playSong, currentSong, isPlaying, togglePlay } = useAudio();

  const [album, setAlbum] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Curated Fallbacks based on album id
  const fallbackAlbums: Record<string, any> = {
    album_001: {
      _id: 'album_001',
      title: 'Đêm Thành Phố',
      artist: 'KAI',
      year: '2026',
      badge: 'HI-RES MASTER 24-BIT 192KHZ',
      desc: 'Album synthwave điện tử đỉnh cao tái hiện nhịp sống đô thị về đêm với chất âm Audiophile.',
      coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      songs: [
        { _id: 'song_001', title: 'Ánh Đèn', artist: 'KAI', duration: 195, listens: 2458, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
        { _id: 'song_003', title: 'Nhịp Đêm', artist: 'KAI', duration: 188, listens: 1800, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
        { _id: 'song_007', title: 'Điệu Nhảy Thành Thị', artist: 'KAI', duration: 174, listens: 1150, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
        { _id: 'song_008', title: 'Cyber Glow', artist: 'KAI', duration: 220, listens: 980, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' }
      ]
    },
    album_002: {
      _id: 'album_002',
      title: 'Thanh Xuân',
      artist: 'Minh Anh',
      year: '2025',
      badge: 'POP & INDIE STUDIO',
      desc: 'Những câu chuyện tuổi trẻ rực rỡ và giai điệu mộc mạc lắng đọng.',
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
      songs: [
        { _id: 'song_002', title: 'Ngày Mới', artist: 'Minh Anh', duration: 218, listens: 1210, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
        { _id: 'song_004', title: 'Mưa Đêm', artist: 'Minh Anh', duration: 245, listens: 850, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' }
      ]
    },
    album_003: {
      _id: 'album_003',
      title: 'Khoảng Lặng',
      artist: 'Linh Chi',
      year: '2024',
      badge: 'BALLAD LOSSLESS',
      desc: 'Những khoảng lặng giữa cuộc sống với tiếng hát truyền cảm và da diết.',
      coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&q=80',
      songs: [
        { _id: 'song_005', title: 'Lời Chưa Nói', artist: 'Linh Chi', duration: 232, listens: 1620, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
        { _id: 'song_006', title: 'Đường Về', artist: 'Linh Chi', duration: 204, listens: 940, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' }
      ]
    }
  };

  useEffect(() => {
    const currentFallback = fallbackAlbums[id] || fallbackAlbums['album_001'];
    setAlbum(currentFallback);
    setSongs(currentFallback.songs);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const fetchAlbum = async () => {
      try {
        const res = await fetch(`${apiUrl}/albums/${id}`, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          setAlbum({
            ...data,
            artist: data.artistIds?.map((a: any) => a.name).join(', ') || 'Nhiều nghệ sĩ',
            year: data.releaseDate ? new Date(data.releaseDate).getFullYear() : '2026'
          });
          if (data.songs && data.songs.length > 0) {
            setSongs(data.songs);
          }
        }
      } catch (err) {
        // Silently use fallback
      } finally {
        clearTimeout(timeoutId);
      }
    };

    fetchAlbum();
  }, [id]);

  const currentAlbum = album || fallbackAlbums['album_001'];
  const tracklist = songs.length > 0 ? songs : currentAlbum.songs;

  const isCurrentAlbumPlaying = isPlaying && currentSong && tracklist.some((s: any) => s._id === currentSong._id);

  const handlePlayAll = () => {
    if (tracklist.length === 0) return;
    if (isCurrentAlbumPlaying) {
      togglePlay();
    } else {
      playSong(tracklist[0], tracklist);
    }
  };

  return (
    <div className="space-y-7 sm:space-y-9 animate-in fade-in duration-500">
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#101720] shadow-2xl">
        <img
          src={currentAlbum.coverImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full scale-110 object-cover opacity-20 blur-2xl"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#101720]/75 via-[#090d11]/90 to-[#090d11]" />
        <div className="absolute -right-20 -top-28 -z-10 h-80 w-80 rounded-full bg-[#0df580]/10 blur-3xl" />

        <div className="grid gap-7 p-5 sm:p-8 md:grid-cols-[minmax(220px,300px)_1fr] md:items-end md:gap-9 md:p-10 lg:p-12">
          <div className="group relative mx-auto w-full max-w-[280px] md:mx-0 md:max-w-none">
            <div className="absolute -inset-3 rounded-[1.8rem] bg-[#0df580]/10 opacity-70 blur-xl transition duration-500 group-hover:opacity-100" />
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-[#151e29] shadow-2xl">
              <img
                src={currentAlbum.coverImage}
                alt={currentAlbum.title}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-white/[0.04]" />
              <span className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-[#c2ffe0] backdrop-blur-md">
                {currentAlbum.badge || '24-BIT LOSSLESS'}
              </span>
            </div>
          </div>

          <div className="min-w-0 space-y-5 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <span className="rounded-full border border-[#0df580]/25 bg-[#0df580]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#0df580]">
                Album
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                <ShieldCheckIcon className="h-3.5 w-3.5 text-[#0df580]" />
                Studio edition
              </span>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Đang nghe album</p>
              <h1 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-6xl">
                {currentAlbum.title}
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-300/80 md:mx-0 md:text-base">
                {currentAlbum.desc || 'Tuyển tập đĩa nhạc chất lượng cao với âm thanh nguyên bản.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm md:justify-start">
              <span className="font-bold text-white">{getArtistName(currentAlbum.artist) || 'KAI'}</span>
              <span className="hidden text-slate-600 sm:inline">•</span>
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <CalendarDaysIcon className="h-4 w-4" />
                {currentAlbum.year || '2026'}
              </span>
              <span className="hidden text-slate-600 sm:inline">•</span>
              <span className="text-slate-400">{tracklist.length} bài hát</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-1 md:justify-start">
              <button
                onClick={handlePlayAll}
                className="inline-flex h-12 items-center gap-2.5 rounded-full bg-[#0df580] px-6 text-sm font-black text-[#07110b] shadow-lg shadow-[#0df580]/20 transition hover:-translate-y-0.5 hover:bg-[#38f895] hover:shadow-[#0df580]/30 active:translate-y-0"
                title="Phát toàn bộ album"
              >
                {isCurrentAlbumPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                {isCurrentAlbumPlaying ? 'Đang phát' : 'Phát album'}
              </button>
              <button
                type="button"
                title="Phát ngẫu nhiên"
                aria-label="Phát ngẫu nhiên"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-[#0df580]/40 hover:bg-[#0df580]/10 hover:text-[#0df580]"
              >
                <ArrowsRightLeftIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsLiked(!isLiked)}
                title={isLiked ? 'Bỏ thích album' : 'Thích album'}
                aria-label={isLiked ? 'Bỏ thích album' : 'Thích album'}
                aria-pressed={isLiked}
                className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                  isLiked
                    ? 'border-[#0df580]/30 bg-[#0df580]/10 text-[#0df580]'
                    : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-[#0df580]/40 hover:text-[#0df580]'
                }`}
              >
                {isLiked ? <HeartIcon className="h-5 w-5" /> : <HeartOutline className="h-5 w-5" />}
              </button>
              <Link
                href="/album"
                className="ml-1 rounded-full px-3 py-2 text-xs font-bold text-slate-400 transition hover:text-white sm:ml-auto"
              >
                ← Tất cả album
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#1b2533] bg-[#0d131b]/90 shadow-xl shadow-black/10">
        <div className="flex flex-col gap-1 border-b border-[#1b2533] px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-7">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0df580]">Tracklist</p>
            <h2 className="mt-1 text-lg font-bold text-white">Danh sách bài hát</h2>
          </div>
          <span className="text-xs text-slate-500">{tracklist.length} ca khúc</span>
        </div>

        <div className="px-2 py-2 sm:px-4">
          <div className="hidden grid-cols-[44px_minmax(0,1fr)_120px_72px] items-center gap-4 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:grid">
            <span className="text-center">#</span>
            <span>Tiêu đề</span>
            <span className="text-right">Lượt nghe</span>
            <span className="text-right">Thời lượng</span>
          </div>

          <div className="space-y-1">
            {tracklist.map((track: any, idx: number) => {
              const isThisPlaying = isPlaying && currentSong?._id === track._id;

              return (
                <button
                  key={track._id}
                  type="button"
                  onClick={() => playSong(track, tracklist)}
                  aria-label={`Phát ${track.title}`}
                  className={`group grid w-full grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-3 py-3 text-left transition sm:grid-cols-[44px_minmax(0,1fr)_120px_72px] sm:gap-4 sm:px-4 ${
                    isThisPlaying
                      ? 'bg-[#0df580]/[0.08] ring-1 ring-inset ring-[#0df580]/20'
                      : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <span className={`flex h-7 items-center justify-center font-mono text-xs font-bold ${
                    isThisPlaying ? 'text-[#0df580]' : 'text-slate-500 group-hover:text-white'
                  }`}>
                    {isThisPlaying ? (
                      <span className="flex items-center gap-0.5" aria-label="Đang phát">
                        <span className="h-3 w-0.5 rounded-full bg-[#0df580] animate-eq-1" />
                        <span className="h-4 w-0.5 rounded-full bg-[#0df580] animate-eq-2" />
                        <span className="h-2 w-0.5 rounded-full bg-[#0df580] animate-eq-3" />
                      </span>
                    ) : (
                      <><span className="group-hover:hidden">{String(idx + 1).padStart(2, '0')}</span><PlayIcon className="hidden h-4 w-4 group-hover:block" /></>
                    )}
                  </span>

                  <span className="flex min-w-0 items-center gap-3">
                    <span className="hidden h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#17212d] sm:block">
                      <img
                        src={track.coverImage || currentAlbum.coverImage}
                        alt=""
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className={`block truncate text-sm font-semibold ${
                        isThisPlaying ? 'text-[#0df580]' : 'text-slate-100 group-hover:text-white'
                      }`}>
                        {track.title}
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-500">
                        {getArtistName(track.artist) || getArtistName(currentAlbum.artist) || 'Đang cập nhật'}
                      </span>
                    </span>
                  </span>

                  <span className="hidden text-right font-mono text-xs tabular-nums text-slate-500 sm:block">
                    {(track.listens || (2500 - idx * 300)).toLocaleString('vi-VN')}
                  </span>
                  <span className="text-right font-mono text-xs tabular-nums text-slate-400">
                    {formatTime(track.duration || 195)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
