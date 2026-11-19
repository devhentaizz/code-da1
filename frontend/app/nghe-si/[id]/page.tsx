'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAudio } from '../../context/AudioContext';
import {
  PlayIcon,
  PauseIcon,
  CheckBadgeIcon,
  CheckIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/solid';
import FavoriteSongButton from '../../components/FavoriteSongButton';

// ─── Static fallback data per artist (used when backend is offline) ───────────
const ARTIST_FALLBACKS: Record<string, any> = {
  artist_001: {
    _id: 'artist_001',
    name: 'Minh Anh',
    slug: 'minh-anh',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
    bio: 'Nữ ca sĩ trẻ nổi bật với chất giọng trong trẻo mang hơi thở Pop & Indie hiện đại. Từng bước chinh phục khán giả Việt Nam qua những ca khúc chạm đến trái tim.',
    quote: 'Âm nhạc là sợi chỉ kết nối những tâm hồn đơn độc.',
    country: 'Vietnam',
    isVerified: true,
    genre: 'POP • INDIE',
    monthlyListeners: '342,000 người nghe hàng tháng',
    rank: 'TOP #2 POP VIỆT NAM',
    website: 'minhanhmusic.vn',
  },
  artist_002: {
    _id: 'artist_002',
    name: 'KAI',
    slug: 'kai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
    bio: 'Nghệ sĩ nhạc điện tử tiên phong, kết hợp âm hưởng tương lai synthwave và nhịp bass sôi động. Được vinh danh là một trong những producer tiên phong mang chất liệu âm thanh futuristic electronic tiếp cận người nghe hiện đại.',
    quote: 'Nghệ sĩ nhạc điện tử tiên phong, kết hợp âm hưởng tương lai synthwave và nhịp bass sôi động.',
    country: 'Vietnam',
    isVerified: true,
    genre: 'EDM • ELECTRONIC • SYNTHWAVE',
    monthlyListeners: '510,400 người nghe hàng tháng',
    rank: 'TOP #1 SYNTHWAVE VN',
    website: 'kai-official.audio',
  },
  artist_003: {
    _id: 'artist_003',
    name: 'Linh Chi',
    slug: 'linh-chi',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80',
    bio: 'Giọng ca Ballad & R&B đầy cảm xúc, chinh phục khán giả bằng những giai điệu sâu lắng và ca từ chân thật. Linh Chi là một trong những giọng ca nữ được yêu thích nhất thế hệ hiện tại.',
    quote: 'Mỗi bài hát là một trang nhật ký ghi lại cảm xúc thật nhất của tôi.',
    country: 'Vietnam',
    isVerified: true,
    genre: 'BALLAD • R&B',
    monthlyListeners: '185,200 người nghe hàng tháng',
    rank: 'TOP #3 BALLAD VIỆT NAM',
    website: 'linchi-music.vn',
  },
  artist_004: {
    _id: 'artist_004',
    name: 'Sơn Tùng M-TP',
    slug: 'son-tung-m-tp',
    avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=500&q=80',
    bio: 'Sơn Tùng M-TP là ca sĩ, nhạc sĩ và nhà sản xuất âm nhạc hàng đầu Việt Nam. Nổi tiếng với phong cách trình diễn cuốn hút, khả năng sáng tác đỉnh cao và hàng loạt bản hit phá vỡ mọi kỷ lục nghe nhạc. Anh đã định hình lại bộ mặt nhạc pop Việt Nam qua hơn một thập kỷ hoạt động nghệ thuật.',
    quote: 'Âm nhạc là hơi thở, là ngôn ngữ kỳ diệu kết nối triệu trái tim khán giả.',
    country: 'Vietnam',
    isVerified: true,
    genre: 'POP • V-POP • R&B',
    monthlyListeners: '8,500,000 người nghe hàng tháng',
    rank: 'TOP #1 NGHỆ SĨ VIỆT NAM',
    website: 'sontungmtp.com',
  },
};

// ─── Static fallback songs per artist ────────────────────────────────────────
const SONG_FALLBACKS: Record<string, any[]> = {
  artist_001: [
    { _id: 'fb_s1_001', title: 'Ngày Mới', albumTitle: 'Thanh Xuân', listens: 1210, duration: '03:38', youtubeId: 'dQw4w9WgXcQ', coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=120&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { _id: 'fb_s1_002', title: 'Mưa Đêm', albumTitle: 'Thanh Xuân', listens: 850, duration: '04:05', youtubeId: 'kffacxfA7G4', coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=120&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { _id: 'fb_s1_003', title: 'Nắng Hạ', albumTitle: 'Thanh Xuân', listens: 720, duration: '03:50', youtubeId: '2vjPBrBU-TM', coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=120&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { _id: 'fb_s1_004', title: 'Tìm Về', albumTitle: 'Single 2026', listens: 540, duration: '03:22', youtubeId: 'JGwWNGJdvx8', coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=120&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  ],
  artist_002: [
    { _id: 'fb_s2_001', title: 'Ánh Đèn', albumTitle: 'Đêm Thành Phố', listens: 2458, duration: '03:15', badge: 'HQ LOSSLESS', youtubeId: '9bZkp7q19f0', coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=120&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { _id: 'fb_s2_002', title: 'Nhịp Đêm', albumTitle: 'Đêm Thành Phố', listens: 1800, duration: '03:08', youtubeId: 'RgKAFK5djSk', coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=120&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { _id: 'fb_s2_003', title: 'Điệu Nhảy Thành Thị', albumTitle: 'Single 2026', listens: 1150, duration: '02:54', youtubeId: 'OPf0YbXqDm0', coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=120&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { _id: 'fb_s2_004', title: 'Cyber Glow', albumTitle: 'EP Nhịp Đêm', listens: 980, duration: '03:40', youtubeId: '60ItHLz5WEA', coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=120&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  ],
  artist_003: [
    { _id: 'fb_s3_001', title: 'Lời Chưa Nói', albumTitle: 'Khoảng Lặng', listens: 1620, duration: '03:52', youtubeId: 'Zi_XLOBDo_Y', coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=120&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { _id: 'fb_s3_002', title: 'Đường Về', albumTitle: 'Khoảng Lặng', listens: 940, duration: '03:24', youtubeId: 'hT_nvWreIhg', coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=120&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { _id: 'fb_s3_003', title: 'Mãi Bên Nhau', albumTitle: 'Khoảng Lặng', listens: 780, duration: '04:10', youtubeId: '0KSOMA3QBU0', coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=120&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { _id: 'fb_s3_004', title: 'Nỗi Nhớ', albumTitle: 'Single 2026', listens: 650, duration: '03:35', youtubeId: 'YQHsXMglC9A', coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=120&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  ],
  artist_004: [
    { _id: 'fb_s4_001', title: 'Chúng Ta Của Tương Lai', albumTitle: 'Chúng Ta', listens: 85000000, duration: '04:23', badge: 'V-POP HIT', youtubeId: '2D3GBECd4bA', coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=120&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { _id: 'fb_s4_002', title: 'Đừng Làm Trái Tim Anh Đau', albumTitle: 'Sky Tour', listens: 72000000, duration: '04:08', youtubeId: 'bKDdT_nyP54', coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=120&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { _id: 'fb_s4_003', title: 'Lạc Trôi', albumTitle: 'Sky Tour', listens: 68000000, duration: '04:15', youtubeId: '5TkMDh_DP0Y', coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=120&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { _id: 'fb_s4_004', title: 'Nơi Này Có Anh', albumTitle: 'Chúng Ta', listens: 61000000, duration: '03:58', youtubeId: '0p_N3NqUGPE', coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=120&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { _id: 'fb_s4_005', title: 'Có Chắc Yêu Là Đây', albumTitle: 'Single 2020', listens: 54000000, duration: '03:42', youtubeId: 'V7jHZuSMhII', coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=120&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  ],
};

// ─── Static fallback albums per artist ───────────────────────────────────────
const ALBUM_FALLBACKS: Record<string, any[]> = {
  artist_001: [
    { _id: 'fb_al1_001', title: 'Thanh Xuân', coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80', meta: 'Album • 8 bài hát', href: '/album/album_001' },
    { _id: 'fb_al1_002', title: 'Nắng Mới', coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80', meta: 'Single • 1 bài hát', href: '/album' },
  ],
  artist_002: [
    { _id: 'fb_al2_001', title: 'Đêm Thành Phố (2026)', coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80', meta: 'Album • 8 bài hát • Melodix Records', href: '/album/album_002' },
    { _id: 'fb_al2_002', title: 'EP Nhịp Đêm', coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80', meta: 'EP • 4 bài hát • 2025 Release', href: '/album' },
    { _id: 'fb_al2_003', title: 'Điệu Nhảy Thành Thị', coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80', meta: 'Đĩa đơn • 1 bài hát • Dolby 5.1', href: '/album' },
    { _id: 'fb_al2_004', title: 'Tuyển Tập KAI: Essentials', coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=400&q=80', meta: 'Playlist chọn lọc • Độc quyền', href: '/album' },
  ],
  artist_003: [
    { _id: 'fb_al3_001', title: 'Khoảng Lặng', coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80', meta: 'Album • 10 bài hát', href: '/album/album_003' },
    { _id: 'fb_al3_002', title: 'Lời Chưa Nói', coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80', meta: 'Single • 1 bài hát', href: '/album' },
  ],
  artist_004: [
    { _id: 'fb_al4_001', title: 'Chúng Ta', coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80', meta: 'Album • 10 bài hát • 2021', href: '/album' },
    { _id: 'fb_al4_002', title: 'Sky Tour', coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80', meta: 'Album • 12 bài hát • 2019', href: '/album' },
    { _id: 'fb_al4_003', title: 'Có Chắc Yêu Là Đây', coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80', meta: 'Single • 1 bài hát • 2020', href: '/album' },
    { _id: 'fb_al4_004', title: 'Muộn Rồi Mà Sao Còn', coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=400&q=80', meta: 'Single • 1 bài hát • 2021', href: '/album' },
  ],
};

// ─── Suggested "also like" artists (excluding current) ───────────────────────
const ALL_SUGGESTED = [
  {
    _id: 'artist_001',
    name: 'Minh Anh',
    genre: 'Chillwave • Indie Pop',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    _id: 'artist_003',
    name: 'Linh Chi',
    genre: 'Synth-Pop • Ballad',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80'
  },
  {
    _id: 'artist_002',
    name: 'KAI',
    genre: 'EDM • Electronic Synth',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    _id: 'artist_004',
    name: 'Sơn Tùng M-TP',
    genre: 'Pop • V-Pop • R&B',
    avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=200&q=80'
  },
];

const getArtistGenreString = (art: any): string => {
  if (!art) return 'POP • V-POP';
  if (typeof art.genre === 'object' && art.genre?.name) return art.genre.name;
  if (typeof art.genre === 'string' && art.genre) return art.genre;
  const name = (typeof art.name === 'string' ? art.name : '').toLowerCase();
  if (name.includes('minh anh')) return 'Chillwave • Indie Pop';
  if (name.includes('linh chi')) return 'Synth-Pop • Ballad';
  if (name.includes('sơn tùng') || name.includes('son tung')) return 'Pop • V-Pop • R&B';
  if (name.includes('kai')) return 'EDM • Electronic Synth';
  return 'POP • V-POP';
};

export default function ArtistDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { playSong, currentSong, isPlaying, togglePlay } = useAudio();

  const [artist, setArtist] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [backendArtists, setBackendArtists] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [ticketBooked, setTicketBooked] = useState(false);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    try {
      const saved = localStorage.getItem('melodix_following_artists');
      if (saved && id) {
        const map = JSON.parse(saved);
        setIsFollowing(Boolean(map[id]));
      }
    } catch (e) {}
  }, [id]);

  const handleToggleFollow = () => {
    const nextVal = !isFollowing;
    setIsFollowing(nextVal);
    try {
      const saved = localStorage.getItem('melodix_following_artists');
      const map = saved ? JSON.parse(saved) : {};
      map[id] = nextVal;
      localStorage.setItem('melodix_following_artists', JSON.stringify(map));
    } catch (e) {}
  };

  useEffect(() => {
    if (!id) return;

    // Reset state whenever ID changes
    setArtist(null);
    setSongs([]);
    setAlbums([]);
    setLoading(true);

    const fetchData = async () => {
      try {
        const [artistRes, allArtistsRes] = await Promise.all([
          fetch(`${apiUrl}/artists/${id}`),
          fetch(`${apiUrl}/artists?limit=10`).catch(() => null)
        ]);

        if (artistRes.ok) {
          const aData = await artistRes.json();
          // ✅ FIX: Backend returns { artist, songs, albums } — unpack properly
          const currentArtist = aData.artist || aData;
          const currentSongs = aData.songs || [];
          const currentAlbums = aData.albums || [];

          setArtist(currentArtist);

          if (currentSongs.length > 0) {
            setSongs(currentSongs);
          }
          if (currentAlbums.length > 0) {
            setAlbums(currentAlbums);
          }
        } else {
          // Backend offline or not found — load from fallback
          const fallback = ARTIST_FALLBACKS[id];
          if (fallback) setArtist(fallback);
        }

        if (allArtistsRes && allArtistsRes.ok) {
          const list = await allArtistsRes.json();
          if (Array.isArray(list) && list.length > 0) {
            setBackendArtists(list);
          }
        }
      } catch (err) {
        console.error('Artist fetch error:', err);
        // Network error — load from fallback
        const fallback = ARTIST_FALLBACKS[id];
        if (fallback) setArtist(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, apiUrl]);

  // ── Computed display data (live API first, then per-artist fallback) ─────────
  const artistFallback = ARTIST_FALLBACKS[id] || {};
  const displayArtist = artist || artistFallback;
  const artistName = displayArtist?.name || 'Nghệ Sĩ';

  const displaySongs = songs.length >= 4
    ? songs
    : (SONG_FALLBACKS[id] || SONG_FALLBACKS['artist_002']);

  const displayAlbums = albums.length > 0
    ? albums.map((al: any) => ({
      _id: al._id,
      title: al.title,
      coverImage: al.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
      meta: `Album • ${al.songCount || '?'} bài hát`,
      href: `/album/${al._id}`,
    }))
    : (ALBUM_FALLBACKS[id] || ALBUM_FALLBACKS['artist_002']);

  // Dynamic suggested artists (excluding current artist)
  const suggestedArtists = (backendArtists.length > 0 ? backendArtists : ALL_SUGGESTED)
    .filter((a: any) => a._id !== id && a.name?.toLowerCase() !== artistName.toLowerCase())
    .slice(0, 2);

  // Contextual upcoming event
  const getArtistEvent = () => {
    const aName = (displayArtist?.name || '').toLowerCase();
    if (aName.includes('sơn tùng') || id === 'artist_004') {
      return {
        title: 'Sky Tour Live 2026',
        date: 'Chủ Nhật 12/04 • SVĐ Mỹ Đình, Hà Nội'
      };
    }
    if (aName.includes('minh anh') || id === 'artist_001') {
      return {
        title: 'Acoustic Soul Night',
        date: 'Thứ Sáu 18/04 • Đà Lạt'
      };
    }
    if (aName.includes('linh chi') || id === 'artist_003') {
      return {
        title: 'Khoảng Lặng Concert',
        date: 'Thứ Bảy 02/05 • Nhà hát Hòa Bình, TP.HCM'
      };
    }
    return {
      title: 'Cyber Sound Lounge',
      date: 'Thứ Bảy 25/03 • TP. Hồ Chí Minh'
    };
  };

  const currentEvent = getArtistEvent();

  const isCurrentArtistPlaying = isPlaying && currentSong && displaySongs.some((s: any) => s._id === currentSong._id);

  const handlePlayAll = () => {
    if (displaySongs.length === 0) return;
    if (isCurrentArtistPlaying) {
      togglePlay();
    } else {
      playSong(displaySongs[0], displaySongs);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#0df580] border-t-transparent animate-spin" />
        <p className="text-sm text-[#6b7c93]">Đang tải thông tin nghệ sĩ...</p>
      </div>
    );
  }

  if (!displayArtist?.name) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-white font-bold text-lg">Không tìm thấy nghệ sĩ</p>
        <Link href="/nghe-si" className="text-sm text-[#0df580] hover:underline">← Quay lại danh sách nghệ sĩ</Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* ============================================================== */}
      {/* 1. ARTIST HERO HEADER                                           */}
      {/* ============================================================== */}
      <section className="relative rounded-3xl bg-gradient-to-b from-[#101923] via-[#0d141d] to-[#090d11] border border-[#1b2533] p-8 md:p-10 overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          {/* Avatar */}
          <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden shrink-0 ring-4 ring-[#0df580]/40 shadow-2xl shadow-[#0df580]/10">
            <img
              src={displayArtist.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80'}
              alt={artistName}
              className="w-full h-full object-cover"
            />
            {displayArtist.isVerified && (
              <span className="absolute bottom-2 right-2 p-1 rounded-full bg-[#0df580] text-[#080c10] shadow">
                <CheckIcon className="w-4 h-4 stroke-[3]" />
              </span>
            )}
          </div>

          {/* Artist Metadata */}
          <div className="flex-1 text-center md:text-left space-y-3.5">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              {displayArtist.isVerified && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0df580]/15 text-[#0df580] border border-[#0df580]/30">
                  <CheckBadgeIcon className="w-3.5 h-3.5" />
                  NGHỆ SĨ XÁC MINH
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#16202c] text-[#8ea0b4] border border-[#233142]">
                • HI-RES AUDIO MASTER
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
              {artistName}
            </h1>

            {/* Stats row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-[#8ea0b4]">
              <span>• {artistFallback.monthlyListeners || displayArtist.monthlyListeners || '0 người nghe hàng tháng'}</span>
              <span>/</span>
              <span>📍 {displayArtist.country || 'Vietnam'}</span>
              <span>/</span>
              <span className="text-[#0df580] font-bold flex items-center gap-1">
                🏆 {artistFallback.rank || displayArtist.rank || 'NGHỆ SĨ NỔI BẬT'}
              </span>
            </div>

            {/* Genre badges */}
            {(() => {
              const genreStr = typeof displayArtist.genre === 'object'
                ? (displayArtist.genre?.name || 'POP • V-POP')
                : (displayArtist.genre || artistFallback.genre || '');
              if (!genreStr) return null;
              return (
                <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                  {String(genreStr).split('•').map((g: string, i: number) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#16202c] text-[#8ea0b4] border border-[#233142]">
                      {g.trim()}
                    </span>
                  ))}
                </div>
              );
            })()}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayAll}
                  className="px-6 py-3 rounded-full bg-[#0df580] hover:bg-[#38f895] text-[#080c10] text-xs font-black uppercase tracking-wider flex items-center gap-2 transition shadow-lg shadow-[#0df580]/20"
                >
                  {isCurrentArtistPlaying ? (
                    <><PauseIcon className="w-4 h-4" /> Tạm dừng</>
                  ) : (
                    <><PlayIcon className="w-4 h-4 ml-0.5" /> Phát nhạc</>
                  )}
                </button>

                <button
                  onClick={handleToggleFollow}
                  className={`px-5 py-3 rounded-full text-xs font-bold transition border ${isFollowing
                      ? 'bg-[#16202c] text-white border-[#243346] flex items-center gap-1.5'
                      : 'bg-[#0df580]/20 text-[#0df580] border-[#0df580]/40'
                    }`}
                >
                  {isFollowing ? (
                    <><CheckIcon className="w-3.5 h-3.5 text-[#0df580]" /> Đang theo dõi</>
                  ) : (
                    '+ Theo dõi'
                  )}
                </button>

                <button className="p-3 rounded-full bg-[#121922] hover:bg-[#182330] border border-[#223041] text-[#8ea0b4] hover:text-white transition" title="Chia sẻ">
                  <ShareIcon className="w-4 h-4" />
                </button>

                <button className="p-3 rounded-full bg-[#121922] hover:bg-[#182330] border border-[#223041] text-[#8ea0b4] hover:text-white transition" title="Thêm tùy chọn">
                  <EllipsisHorizontalIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Codec Badge */}
              <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#101720] border border-[#1d2938] text-[10px] text-[#00f2fe] font-mono">
                <span>CODEC MQA 24-bit / 192kHz</span>
                <span className="flex items-center gap-0.5">
                  <span className="w-0.5 h-2 bg-[#00f2fe] rounded-full animate-eq-1" />
                  <span className="w-0.5 h-3 bg-[#00f2fe] rounded-full animate-eq-2" />
                  <span className="w-0.5 h-1.5 bg-[#00f2fe] rounded-full animate-eq-3" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. TAB NAVIGATION                                               */}
      {/* ============================================================== */}
      <div className="flex items-center gap-8 border-b border-[#17202b] text-xs font-bold text-[#6b7c93]">
        {(['overview', 'popular', 'albums', 'playlists', 'about'] as const).map((tab) => {
          const labels: Record<string, string> = { overview: 'Tổng quan', popular: 'Bài hát nổi bật', albums: 'Album & EP', playlists: 'Danh sách phát', about: 'Giới thiệu' };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 transition relative ${activeTab === tab ? 'text-white border-b-2 border-[#0df580]' : 'hover:text-white'}`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 3. Bài hát phổ biến & Audio Signature                          */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Songs */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#0df580] tracking-wider uppercase">THỊNH HÀNH</span>
              <h2 className="text-lg font-black text-white">Bài hát phổ biến</h2>
            </div>
            <button className="text-xs font-bold text-[#6b7c93] hover:text-[#0df580] transition">
              XEM TOÀN BỘ
            </button>
          </div>

          <div className="bg-[#10161f] border border-[#1b2533] rounded-3xl overflow-hidden divide-y divide-[#17202b]">
            {displaySongs.map((song: any, idx: number) => {
              const isThisPlaying = isPlaying && currentSong?._id === song._id;
              return (
                <div
                  key={song._id}
                  onClick={() => playSong(song, displaySongs)}
                  className="group flex items-center justify-between p-3.5 px-5 hover:bg-[#151f2b] transition cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-5 text-center font-mono font-bold text-[#6b7c93]">
                      {isThisPlaying ? (
                        <div className="flex items-center justify-center gap-0.5">
                          <span className="w-0.5 h-3 bg-[#0df580] rounded-full animate-eq-1" />
                          <span className="w-0.5 h-4 bg-[#0df580] rounded-full animate-eq-2" />
                          <span className="w-0.5 h-2 bg-[#0df580] rounded-full animate-eq-3" />
                        </div>
                      ) : (
                        `0${idx + 1}`
                      )}
                    </span>

                    <img
                      src={song.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=100&q=80'}
                      alt={song.title}
                      className="w-10 h-10 rounded-xl object-cover"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xs ${isThisPlaying ? 'text-[#0df580]' : 'text-white'}`}>
                          {song.title}
                        </span>
                        {song.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/30">
                            {song.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6b7c93] mt-0.5 truncate">
                        {song.albumTitle || (typeof song.album === 'object' ? song.album?.title || song.album?.name : song.album) || (typeof song.albumId === 'object' ? song.albumId?.title : null) || artistName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="font-mono text-[11px] text-[#6b7c93]">
                      {typeof song.listens === 'number' ? song.listens.toLocaleString('vi-VN') : song.listens || '0'}
                    </span>
                    <FavoriteSongButton
                      song={song}
                      iconClassName="w-4 h-4"
                      className="text-[#6b7c93] transition hover:text-[#0df580]"
                      activeClassName="text-[#0df580]"
                    />
                    <span className="font-mono text-[11px] text-[#6b7c93]">
                      {song.duration && typeof song.duration === 'number'
                        ? `${Math.floor(song.duration / 60)}:${String(song.duration % 60).padStart(2, '0')}`
                        : song.duration || '03:00'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Audio Signature */}
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold text-[#0df580] tracking-wider uppercase">PHÂN TÍCH ÂM HỌC</span>
            <h2 className="text-lg font-black text-white">Đặc tính âm thanh</h2>
          </div>

          <div className="bg-[#10161f] border border-[#1b2533] rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#0df580] rounded-full" />
                Soundstage: Wide Holographic
              </span>
              <span className="font-mono text-[11px] text-[#0df580] font-bold">124 BPM AVG</span>
            </div>

            <div className="relative h-28 bg-[#090d11] rounded-2xl p-3 border border-[#17202b] flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between text-[8px] font-mono text-[#55657a]">
                <span>20Hz Sub-Bass</span>
                <span className="text-[#0df580]">Peak 1.2kHz Pres</span>
                <span>20kHz Air</span>
              </div>
              <svg className="w-full h-16" viewBox="0 0 300 80" fill="none">
                <defs>
                  <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0df580" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0df580" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 60 Q 50 70, 90 35 T 160 20 T 230 45 T 300 50 L 300 80 L 0 80 Z" fill="url(#eqGrad)" />
                <path d="M0 60 Q 50 70, 90 35 T 160 20 T 230 45 T 300 50" stroke="#0df580" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <div className="flex justify-between text-[9px] font-mono text-[#8ea0b4] pt-1">
                <span>Dynamic Range: 14 LUFS</span>
                <span className="text-[#00f2fe]">Dolby Atmos Mastering</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. Danh sách Album & Đĩa đơn                                   */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#0df580] tracking-wider uppercase">TUYỂN TẬP PHÁT HÀNH</span>
            <h2 className="text-lg font-black text-white">Danh sách Album & Đĩa đơn</h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <button className="px-3 py-1 rounded-full bg-[#1b2533] text-white">Mới nhất</button>
            <button className="px-3 py-1 rounded-full text-[#6b7c93] hover:text-white">Đĩa đơn</button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayAlbums.map((al: any) => (
            <Link
              key={al._id}
              href={al.href || `/album/${al._id}`}
              className="group bg-[#10161f] hover:bg-[#151f2b] border border-[#1b2533] rounded-3xl p-4 transition shadow-lg"
            >
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-[#16202c] mb-3 relative">
                <img
                  src={al.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80'}
                  alt={al.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-[#0df580] transition truncate">
                {al.title}
              </h3>
              <p className="text-[11px] text-[#6b7c93] mt-0.5">{al.meta || 'Album'}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. Tiểu sử & Gợi ý tương tự                                    */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Biography */}
        <div className="lg:col-span-2 space-y-3">
          <div>
            <span className="text-[10px] font-bold text-[#0df580] tracking-wider uppercase">TIỂU SỬ NGHỆ SĨ</span>
            <h2 className="text-lg font-black text-white">Về nghệ sĩ / {artistName}</h2>
          </div>

          <div className="bg-[#10161f] border border-[#1b2533] rounded-3xl p-6 space-y-4 shadow-xl">
            <blockquote className="p-4 rounded-2xl bg-[#0df580]/10 border-l-4 border-[#0df580] text-sm italic font-semibold text-[#0df580]">
              "{artistFallback.quote || displayArtist.quote || displayArtist.bio?.split('.')[0] || 'Âm nhạc là ngôn ngữ của tâm hồn.'}"
            </blockquote>

            <p className="text-xs text-[#8ea0b4] leading-relaxed">
              {displayArtist.bio || artistFallback.bio || 'Thông tin tiểu sử chưa được cập nhật.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-[#6b7c93]">
              <span className="flex items-center gap-1.5 text-[#0df580] font-semibold">
                🌐 {artistFallback.website || displayArtist.website || `${displayArtist.slug || id}.vn`}
              </span>
              <span>•</span>
              <span className="text-[#8ea0b4]">🛡️ ĐÃ XÁC MINH BẢN QUYỀN 2026</span>
            </div>
          </div>
        </div>

        {/* Right: GỢI Ý TƯƠNG TỰ - Người hâm mộ cũng nghe (Exact match with Image 1) */}
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-bold text-[#0df580] tracking-wider uppercase">GỢI Ý TƯƠNG TỰ</span>
            <h2 className="text-lg font-black text-white mt-1">Người hâm mộ cũng nghe</h2>
          </div>

          <div className="space-y-3">
            {suggestedArtists.map((art: any) => {
              const artName = typeof art?.name === 'string' ? art.name : (art?.name?.name || 'Nghệ Sĩ');
              const artGenre = getArtistGenreString(art);

              return (
                <Link
                  key={art._id}
                  href={`/nghe-si/${art._id}`}
                  className="flex items-center justify-between p-4 bg-[#10161f] hover:bg-[#151f2b] border border-[#1b2533] hover:border-[#27374b] rounded-2xl transition-all duration-200 group shadow-lg"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={art.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                      alt={artName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#1b2533] group-hover:ring-[#0df580]/40 transition shrink-0"
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white group-hover:text-[#0df580] transition truncate">{artName}</span>
                        <CheckBadgeIcon className="w-4 h-4 text-[#0df580] shrink-0" />
                      </div>
                      <p className="text-xs text-[#8ea0b4] mt-0.5 truncate">{artGenre}</p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-[#55657a] group-hover:text-white group-hover:translate-x-1 transition shrink-0 ml-3" />
                </Link>
              );
            })}

            {/* Upcoming Event Banner - Exact match with Image 1 */}
            <div className="bg-[#10161f] border border-[#1b2533] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#0df580] block">
                  ĐÊM NHẠC SẮP DIỄN RA
                </span>
                <h3 className="text-base sm:text-lg font-black text-white mt-2 leading-tight">
                  {currentEvent.title}
                </h3>
                <p className="text-xs text-[#8ea0b4] mt-1">
                  {currentEvent.date}
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setTicketBooked(!ticketBooked);
                }}
                className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98] ${ticketBooked
                    ? 'bg-[#16202c] text-[#0df580] border border-[#0df580]/40 shadow-none'
                    : 'bg-[#0df580] hover:bg-[#38f895] text-[#080c10] shadow-[#0df580]/20'
                  }`}
              >
                {ticketBooked ? (
                  <>
                    <CheckIcon className="w-4 h-4 stroke-[3]" />
                    ĐÃ ĐẶT VÉ
                  </>
                ) : (
                  'ĐẶT VÉ'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
