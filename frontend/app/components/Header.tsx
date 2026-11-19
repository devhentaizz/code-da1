'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import {
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  IdentificationIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { BoltIcon } from '@heroicons/react/24/solid';

const Header = () => {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'songs' | 'albums' | 'podcasts'>('all');
  const [searchSongs, setSearchSongs] = useState<any[]>([]);
  const [searchAlbums, setSearchAlbums] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const avatarSrc = user?.avatar?.startsWith('/')
    ? `${apiUrl}${user.avatar}`
    : user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';

  useEffect(() => {
    const keyword = searchTerm.trim();
    if (!keyword || activeFilter === 'podcasts') {
      setSearchSongs([]);
      setSearchAlbums([]);
      setSearchError('');
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      const normalizeText = (value: string) => value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/gi, 'd')
        .toLocaleLowerCase('vi');

      try {
        const [songsResponse, albumsResponse] = await Promise.all([
          activeFilter === 'albums'
            ? Promise.resolve(null)
            : fetch(`${apiUrl}/songs?keyword=${encodeURIComponent(keyword)}&limit=6`, {
                signal: controller.signal
              }),
          activeFilter === 'songs'
            ? Promise.resolve(null)
            : fetch(`${apiUrl}/albums`, { signal: controller.signal })
        ]);

        if (songsResponse && !songsResponse.ok) {
          throw new Error('Không thể tìm bài hát lúc này.');
        }
        if (albumsResponse && !albumsResponse.ok) {
          throw new Error('Không thể tìm album lúc này.');
        }

        const songsData = songsResponse ? await songsResponse.json() : null;
        const albumsData = albumsResponse ? await albumsResponse.json() : [];
        const normalizedKeyword = normalizeText(keyword);
        const matchingAlbums = Array.isArray(albumsData)
          ? albumsData.filter((album: any) => {
              const artistNames = Array.isArray(album.artistIds)
                ? album.artistIds.map((artist: any) =>
                    typeof artist === 'string' ? artist : artist?.name
                  ).filter(Boolean).join(' ')
                : '';
              return normalizeText(`${album.title || ''} ${artistNames}`).includes(normalizedKeyword);
            }).slice(0, 6)
          : [];

        if (!controller.signal.aborted) {
          setSearchSongs(songsData?.songs || []);
          setSearchAlbums(matchingAlbums);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Không thể tìm kiếm:', error);
        setSearchSongs([]);
        setSearchAlbums([]);
        setSearchError(error instanceof Error ? error.message : 'Không thể tìm kiếm lúc này.');
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [activeFilter, apiUrl, searchTerm]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!searchContainerRef.current?.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeFilter === 'podcasts') {
      setShowSearchResults(true);
      return;
    }
    if (!searchTerm.trim()) {
      setShowSearchResults(true);
      searchInputRef.current?.focus();
      return;
    }

    setShowSearchResults(false);
    const q = encodeURIComponent(searchTerm.trim());
    const typeParam = activeFilter !== 'all' ? `&type=${activeFilter}` : '';
    router.push(`/tim-kiem?q=${q}${typeParam}`);
  };

  const handleFilterChange = (filter: 'all' | 'songs' | 'albums' | 'podcasts') => {
    setActiveFilter(filter);
    setShowSearchResults(true);
    searchInputRef.current?.focus();
  };

  return (
    <header className="sticky top-0 z-20 bg-[#090d11]/80 backdrop-blur-xl border-b border-[#17202b] px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Search Bar + Filter Pills */}
      <div className="flex min-w-0 flex-1 items-center gap-3 max-w-2xl">
        <div ref={searchContainerRef} className="relative min-w-0 flex-1">
        <form onSubmit={handleSearch} className="relative min-w-0 flex-1">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7c93]" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            aria-label="Tìm bài hát, nghệ sĩ hoặc album"
            placeholder="Tìm bài hát, nghệ sĩ, album..."
            className="w-full pl-10 pr-4 py-2 bg-[#101720] border border-[#1b2533] rounded-full text-xs text-white placeholder-[#55657a] focus:outline-none focus:border-[#0df580] focus:ring-1 focus:ring-[#0df580] transition"
          />
        </form>
        {showSearchResults && (
          <div
            role="region"
            aria-label="Kết quả tìm kiếm"
            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[min(70vh,28rem)] overflow-y-auto rounded-2xl border border-[#1d2938] bg-[#101720] p-2 shadow-2xl"
          >
            {activeFilter === 'podcasts' ? (
              <p className="px-3 py-4 text-xs text-[#6b7c93]">
                Tính năng tìm kiếm podcast chưa được hỗ trợ.
              </p>
            ) : !searchTerm.trim() ? (
              <p className="px-3 py-4 text-xs text-[#6b7c93]">
                Nhập từ khóa để tìm {activeFilter === 'albums' ? 'album' : activeFilter === 'songs' ? 'bài hát' : 'bài hát và album'}.
              </p>
            ) : searchLoading ? (
              <p className="px-3 py-4 text-xs text-[#6b7c93]">Đang tìm kiếm...</p>
            ) : searchError ? (
              <p role="alert" className="px-3 py-4 text-xs text-rose-400">{searchError}</p>
            ) : searchSongs.length === 0 && searchAlbums.length === 0 ? (
              <p className="px-3 py-4 text-xs text-[#6b7c93]">Không tìm thấy kết quả phù hợp.</p>
            ) : (
              <>
                {searchSongs.length > 0 && (
                  <div>
                    <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-[#6b7c93]">
                      Bài hát
                    </p>
                    {searchSongs.map((song: any) => {
                      const artist = song.artist || song.artistIds?.[0];
                      const artistName = typeof artist === 'string'
                        ? artist
                        : artist?.name || 'Đang cập nhật';
                      return (
                        <Link
                          key={song._id}
                          href={`/bai-hat/${song._id}`}
                          onClick={() => setShowSearchResults(false)}
                          className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[#182330]"
                        >
                          <img
                            src={song.coverImage || ''}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-lg bg-[#1b2533] object-cover"
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-semibold text-white">{song.title}</span>
                            <span className="mt-0.5 block truncate text-[11px] text-[#6b7c93]">{artistName}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
                {searchAlbums.length > 0 && (
                  <div>
                    <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-[#6b7c93]">
                      Album
                    </p>
                    {searchAlbums.map((album: any) => {
                      const artists = Array.isArray(album.artistIds)
                        ? album.artistIds.map((artist: any) =>
                            typeof artist === 'string' ? artist : artist?.name
                          ).filter(Boolean).join(', ')
                        : '';
                      return (
                        <Link
                          key={album._id}
                          href={`/album/${album._id}`}
                          onClick={() => setShowSearchResults(false)}
                          className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[#182330]"
                        >
                          <img
                            src={album.coverImage || ''}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-lg bg-[#1b2533] object-cover"
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-semibold text-white">{album.title}</span>
                            <span className="mt-0.5 block truncate text-[11px] text-[#6b7c93]">{artists || 'Album'}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {searchTerm.trim() && (
              <div className="pt-2 border-t border-[#182330] mt-1">
                <Link
                  href={`/tim-kiem?q=${encodeURIComponent(searchTerm.trim())}${activeFilter !== 'all' ? `&type=${activeFilter}` : ''}`}
                  onClick={() => setShowSearchResults(false)}
                  className="flex items-center justify-between rounded-xl border border-[#203248] bg-[#131d2b] px-3.5 py-2.5 text-xs font-bold text-[#0df580] hover:bg-[#1a283b] transition group"
                >
                  <span className="truncate">
                    Xem tất cả kết quả cho &quot;{searchTerm.trim()}&quot;
                  </span>
                  <span className="shrink-0 pl-2 group-hover:translate-x-0.5 transition-transform">➔</span>
                </Link>
              </div>
            )}
          </div>
        )}
        </div>

        {/* Filter Pills from Screenshot */}
        <div className="hidden shrink-0 items-center gap-1.5 text-[11px] font-bold lg:flex">
          <button
            type="button"
            onClick={() => handleFilterChange('all')}
            aria-pressed={activeFilter === 'all'}
            className={`px-3 py-1.5 rounded-full transition ${
              activeFilter === 'all'
                ? 'bg-[#1a2432] text-white border border-[#273549]'
                : 'text-[#6b7c93] hover:text-white'
            } whitespace-nowrap`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('songs')}
            aria-pressed={activeFilter === 'songs'}
            className={`px-3 py-1.5 rounded-full transition ${
              activeFilter === 'songs'
                ? 'bg-[#1a2432] text-white border border-[#273549]'
                : 'text-[#6b7c93] hover:text-white'
            } whitespace-nowrap`}
          >
            Bài hát
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('albums')}
            aria-pressed={activeFilter === 'albums'}
            className={`px-3 py-1.5 rounded-full transition ${
              activeFilter === 'albums'
                ? 'bg-[#1a2432] text-white border border-[#273549]'
                : 'text-[#6b7c93] hover:text-white'
            } whitespace-nowrap`}
          >
            Album
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('podcasts')}
            aria-pressed={activeFilter === 'podcasts'}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full transition ${
              activeFilter === 'podcasts'
                ? 'bg-[#1a2432] text-white border border-[#273549]'
                : 'text-[#6b7c93] hover:text-white'
            }`}
          >
            Podcast
          </button>
        </div>
      </div>

      {/* Right Controls: NÂNG CẤP VIP + Bell + User Pill */}
      <div className="flex items-center gap-3.5">
        {/* NÂNG CẤP VIP Button (Exact match from screenshot) */}
        <Link
          href="/goi-cuoc"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0df580] hover:bg-[#38f895] text-[#080c10] text-[11px] font-black uppercase tracking-wider transition shadow-lg shadow-[#0df580]/20"
        >
          <BoltIcon className="w-3.5 h-3.5" />
          NÂNG CẤP VIP
        </Link>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            title="Thông báo"
            aria-label="Thông báo"
            aria-expanded={showNotifications}
            aria-controls="notifications-panel"
            onClick={() => {
              setShowNotifications((isOpen) => !isOpen);
              setShowDropdown(false);
            }}
            className={`relative rounded-full border border-transparent p-2 transition hover:border-[#1d2938] hover:bg-[#131b24] hover:text-white ${
              showNotifications ? 'bg-[#131b24] text-white' : 'text-[#7d8f9f]'
            }`}
          >
            <BellIcon className="h-4 w-4" />
          </button>

          {showNotifications && (
            <section
              id="notifications-panel"
              aria-label="Thông báo"
              className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[#1d2938] bg-[#101720] shadow-2xl sm:w-80"
            >
              <div className="flex items-center justify-between border-b border-[#1d2938] px-4 py-3">
                <h2 className="text-sm font-bold text-white">Thông báo</h2>
                <span className="text-[10px] font-semibold text-[#6b7c93]">Mới nhất</span>
              </div>
              <div className="px-5 py-8 text-center">
                <BellIcon className="mx-auto h-7 w-7 text-[#55657a]" />
                <p className="mt-3 text-sm font-semibold text-[#c2ccda]">Chưa có thông báo mới</p>
                <p className="mt-1 text-xs leading-relaxed text-[#6b7c93]">
                  Thông báo về tài khoản và hoạt động nghe nhạc sẽ hiển thị tại đây.
                </p>
              </div>
            </section>
          )}
        </div>

        {/* User Profile Pill */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => {
                setShowDropdown((isOpen) => !isOpen);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 p-1 pl-3 pr-1.5 rounded-full bg-[#101720] hover:bg-[#151f2b] border border-[#1b2533] transition"
            >
              <div className="text-left hidden md:block">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white truncate max-w-[100px]">
                    {user.name || 'Minh Nguyễn'}
                  </span>
                  <span className="px-1 py-0.2 text-[9px] font-black uppercase bg-[#8b5cf6] text-white rounded">
                    PRO
                  </span>
                </div>
                <p className="text-[9px] text-[#0df580] font-semibold -mt-0.5">
                  Thành viên VIP
                </p>
              </div>

              <img
                src={avatarSrc}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-[#0df580]/40"
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-[#101720] border border-[#1d2938] rounded-2xl shadow-2xl py-1 z-50 animate-in fade-in">
                <div className="px-4 py-2 border-b border-[#1d2938]">
                  <p className="text-[10px] text-[#6b7c93]">Đăng nhập với</p>
                  <p className="text-xs font-bold text-white truncate">{user.email}</p>
                </div>

                <Link
                  href="/thong-tin-ca-nhan"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-[#8b9bb0] hover:text-white hover:bg-[#16202c] transition"
                >
                  <IdentificationIcon className="w-4 h-4 text-[#0df580]" />
                  Thông tin cá nhân
                </Link>

                <Link
                  href="/thu-vien"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-[#8b9bb0] hover:text-white hover:bg-[#16202c] transition"
                >
                  <UserCircleIcon className="w-4 h-4 text-[#0df580]" />
                  Thư viện cá nhân
                </Link>

                <Link
                  href="/goi-cuoc"
                  onClick={() => setShowDropdown(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-[#0df580] hover:bg-[#16202c] transition font-bold"
                >
                  <BoltIcon className="w-4 h-4" />
                  Gói Hội Viên VIP
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                    router.push('/');
                  }}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-[#16202c] transition cursor-pointer"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3.5 py-1.5 text-xs font-semibold text-[#8b9bb0] hover:text-white transition"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="px-4 py-1.5 text-xs font-bold text-[#080c10] bg-[#0df580] hover:bg-[#38f895] rounded-full transition shadow-md shadow-[#0df580]/20"
            >
              Đăng ký
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
