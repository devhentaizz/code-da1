'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlayIcon, Squares2X2Icon, SparklesIcon } from '@heroicons/react/24/solid';

export default function AlbumAndGenresPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'albums' | 'genres'>('all');
  const [albums, setAlbums] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const normalizedSearchKeyword = searchKeyword
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLocaleLowerCase('vi')
    .trim();
  const visibleAlbums = albums.filter((album) => {
    if (!normalizedSearchKeyword) return true;
    const searchableText = `${album.title || ''} ${album.artistNames || ''}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/gi, 'd')
      .toLocaleLowerCase('vi');
    return searchableText.includes(normalizedSearchKeyword);
  });

  useEffect(() => {
    setSearchKeyword(new URLSearchParams(window.location.search).get('keyword') || '');
  }, []);

  useEffect(() => {
    if (searchKeyword) setActiveTab('albums');
  }, [searchKeyword]);

  // Default curated Albums matching Melodix project data
  const defaultAlbums = [
    {
      _id: 'album_001',
      title: 'Đêm Thành Phố',
      slug: 'dem-thanh-pho',
      artistNames: 'KAI',
      year: '2026',
      totalSongs: 8,
      badge: 'HI-RES MASTER',
      coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'album_002',
      title: 'Thanh Xuân',
      slug: 'thanh-xuan',
      artistNames: 'Minh Anh',
      year: '2025',
      totalSongs: 10,
      badge: 'POP INDIE',
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'album_003',
      title: 'Khoảng Lặng',
      slug: 'khoang-lang',
      artistNames: 'Linh Chi',
      year: '2024',
      totalSongs: 6,
      badge: 'BALLAD',
      coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'album_004',
      title: 'EP Nhịp Đêm',
      slug: 'ep-nhip-dem',
      artistNames: 'KAI',
      year: '2025',
      totalSongs: 4,
      badge: 'EP ĐỘC QUYỀN',
      coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'album_005',
      title: 'Điệu Nhảy Thành Thị',
      slug: 'dieu-nhay-thanh-thi',
      artistNames: 'KAI',
      year: '2026',
      totalSongs: 1,
      badge: 'SINGLE',
      coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80'
    }
  ];

  // Default curated Genres
  const defaultGenres = [
    {
      _id: 'genre_001',
      name: 'EDM & Electronic',
      slug: 'edm-electronic',
      color: '#0df580',
      description: 'Synthwave, Deep House, Melodic Techno',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'genre_002',
      name: 'Pop & Indie',
      slug: 'pop-indie',
      color: '#38bdf8',
      description: 'Giai điệu tươi mới, bay bổng và gần gũi',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'genre_003',
      name: 'Ballad & R&B',
      slug: 'ballad-rnb',
      color: '#f43f5e',
      description: 'Những bản tình ca sâu lắng và đầy tự sự',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'genre_004',
      name: 'Lo-Fi & Ambient',
      slug: 'lofi-ambient',
      color: '#a855f7',
      description: 'Âm thanh thư giãn, giải tỏa căng thẳng',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'genre_005',
      name: 'Acoustic Chill',
      slug: 'acoustic-chill',
      color: '#eab308',
      description: 'Tiếng đàn mộc mạc cho buổi chiều yên ả',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'genre_006',
      name: 'Top V-Pop Hit',
      slug: 'top-vpop',
      color: '#10b981',
      description: 'Bảng xếp hạng nhạc Việt thịnh hành nhất',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80'
    }
  ];

  useEffect(() => {
    // Set immediate defaults so page NEVER hangs
    setAlbums(defaultAlbums);
    setGenres(defaultGenres);

    // Try fetching live data with 2s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const fetchData = async () => {
      try {
        const [albumRes, genreRes] = await Promise.all([
          fetch(`${apiUrl}/albums`, { signal: controller.signal }),
          fetch(`${apiUrl}/genres`, { signal: controller.signal })
        ]);

        if (albumRes.ok) {
          const aData = await albumRes.json();
          if (Array.isArray(aData) && aData.length > 0) {
            setAlbums(aData.map((al: any) => ({
              ...al,
              artistNames: al.artistIds?.map((a: any) => a.name).join(', ') || 'Nhiều nghệ sĩ',
              year: al.releaseDate ? new Date(al.releaseDate).getFullYear() : '2026'
            })));
          }
        }

        if (genreRes.ok) {
          const gData = await genreRes.json();
          if (Array.isArray(gData) && gData.length > 0) {
            setGenres(gData);
          }
        }
      } catch (err) {
        // Silently use defaults
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-[#0df580] tracking-wider uppercase font-mono">
            KHO BẢN QUYỀN MELODIX
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-0.5">
            Album & Thể Loại
          </h1>
          <p className="text-xs text-[#8ea0b4] mt-1 max-w-xl">
            Tuyển tập các đĩa nhạc chuẩn Audiophile Studio cùng phân loại thể loại đa dạng
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 p-1 bg-[#10161f] border border-[#1b2533] rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'all'
                ? 'bg-[#1b2533] text-[#0df580] shadow'
                : 'text-[#6b7c93] hover:text-white'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveTab('albums')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'albums'
                ? 'bg-[#1b2533] text-[#0df580] shadow'
                : 'text-[#6b7c93] hover:text-white'
            }`}
          >
            Album Tuyển Chọn
          </button>
          <button
            onClick={() => setActiveTab('genres')}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === 'genres'
                ? 'bg-[#1b2533] text-[#0df580] shadow'
                : 'text-[#6b7c93] hover:text-white'
            }`}
          >
            Chủ Đề & Thể Loại
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. SECTION: Album Tuyển Chọn                                    */}
      {/* ============================================================== */}
      {(activeTab === 'all' || activeTab === 'albums') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#0df580] font-mono font-bold tracking-widest uppercase">DISCOGRAPHY</span>
              <h2 className="text-lg font-black text-white ml-2">Album Tuyển Chọn</h2>
            </div>
            <span className="text-xs text-[#6b7c93]">
              {visibleAlbums.length} {searchKeyword ? 'kết quả' : 'đĩa nhạc'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {visibleAlbums.map((album) => (
              <Link
                key={album._id}
                href={`/album/${album._id}`}
                className="group relative bg-[#10161f] hover:bg-[#151f2b] border border-[#1b2533] hover:border-[#27374b] rounded-3xl p-4 transition-all duration-300 flex flex-col shadow-lg hover:-translate-y-1"
              >
                <div className="aspect-square w-full rounded-2xl overflow-hidden bg-[#16202c] mb-3 relative shadow-md">
                  <img
                    src={album.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80'}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {album.badge && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[8px] font-black uppercase bg-black/60 backdrop-blur-md text-[#0df580] border border-[#0df580]/30">
                      {album.badge}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-[#0df580] flex items-center justify-center shadow-lg shadow-[#0df580]/30 transform scale-75 group-hover:scale-100 transition duration-300">
                      <PlayIcon className="w-5 h-5 text-[#080c10] ml-0.5" />
                    </div>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-white truncate group-hover:text-[#0df580] transition">
                  {album.title}
                </h3>
                <p className="text-xs text-[#6b7c93] truncate mt-0.5">
                  {album.artistNames || 'KAI'}
                </p>
                <div className="flex items-center justify-between text-[10px] text-[#55657a] font-mono mt-2 pt-2 border-t border-[#17202b]">
                  <span>{album.year || '2026'}</span>
                  <span>{album.totalSongs || 8} bài hát</span>
                </div>
              </Link>
            ))}
            {visibleAlbums.length === 0 && (
              <p className="col-span-full py-10 text-center text-sm text-[#6b7c93]">
                Không tìm thấy album phù hợp với “{searchKeyword}”.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 2. SECTION: Chủ Đề & Thể Loại                                 */}
      {/* ============================================================== */}
      {(activeTab === 'all' || activeTab === 'genres') && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#0df580] font-mono font-bold tracking-widest uppercase">GENRES</span>
              <h2 className="text-lg font-black text-white ml-2">Chủ Đề & Thể Loại</h2>
            </div>
            <span className="text-xs text-[#6b7c93]">{genres.length} thể loại</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {genres.map((genre) => (
              <Link
                key={genre._id}
                href={`/the-loai/${genre.slug}`}
                className="group relative h-36 rounded-3xl overflow-hidden p-4 flex flex-col justify-end border border-[#1b2533] transition shadow-lg hover:-translate-y-1"
                style={{ backgroundColor: '#10161f' }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.borderColor = genre.color || '#0df580';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.borderColor = '';
                }}
              >
                <img
                  src={genre.image || genre.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80'}
                  alt={genre.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-30 group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090d11] via-[#090d11]/40 to-transparent" />

                <div className="relative z-10">
                  <h3 className="font-bold text-sm text-white group-hover:text-[#0df580] transition">
                    {genre.name}
                  </h3>
                  <p className="text-[10px] text-[#8ea0b4] line-clamp-1 mt-0.5">
                    {genre.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
