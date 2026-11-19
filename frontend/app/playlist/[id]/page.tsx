'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAudio } from '../../context/AudioContext';
import { useAuth } from '../../context/AuthContext';
import {
  PlayIcon,
  PauseIcon,
  ArrowsRightLeftIcon,
  HeartIcon,
  ArrowDownTrayIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon
} from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline, XMarkIcon } from '@heroicons/react/24/outline';
import FavoriteSongButton from '../../components/FavoriteSongButton';

const formatTime = (seconds?: number) => {
  if (!seconds || isNaN(seconds) || seconds < 0) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const getArtistName = (song: any) => {
  const artist = song?.artist || song?.artistIds?.[0];
  if (typeof artist === 'string') return artist;
  return artist?.name || artist?.stageName || 'Đang cập nhật';
};

const getReleaseDate = (song: any) => {
  if (!song?.releaseDate) return '—';
  const date = new Date(song.releaseDate);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('vi-VN');
};

export default function PlaylistDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { playSong, currentSong, isPlaying, togglePlay } = useAudio();
  const { user, token } = useAuth();

  const [playlist, setPlaylist] = useState<any>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('added');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showAddSongsModal, setShowAddSongsModal] = useState(false);
  const [songSearch, setSongSearch] = useState('');
  const [availableSongs, setAvailableSongs] = useState<any[]>([]);
  const [songsLoading, setSongsLoading] = useState(false);
  const [addSongBusyId, setAddSongBusyId] = useState('');
  const [addSongError, setAddSongError] = useState('');
  const [removeSongBusyId, setRemoveSongBusyId] = useState('');
  const [removeSongError, setRemoveSongError] = useState('');
  const [showEditPlaylistModal, setShowEditPlaylistModal] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [editCoverPreview, setEditCoverPreview] = useState('');
  const [editPlaylistError, setEditPlaylistError] = useState('');
  const [savingPlaylist, setSavingPlaylist] = useState(false);
  const editCoverInputRef = useRef<HTMLInputElement>(null);
  const [isLiked, setIsLiked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const controller = new AbortController();
    const fetchPlaylistAndSongs = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const response = await fetch(`${apiUrl}/playlists/${id}`, {
          signal: controller.signal
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Không thể tải playlist');
        }
        setPlaylist(data);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Không thể tải playlist:', error);
        setLoadError(error instanceof Error ? error.message : 'Không thể tải playlist');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchPlaylistAndSongs();
    return () => controller.abort();
  }, [apiUrl, id]);

  useEffect(() => {
    if (!showAddSongsModal) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setSongsLoading(true);
      setAddSongError('');
      try {
        const query = new URLSearchParams({ limit: '30', sort: 'listens' });
        if (songSearch.trim()) query.set('keyword', songSearch.trim());

        const response = await fetch(`${apiUrl}/songs?${query}`, {
          signal: controller.signal
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Không thể tải danh sách bài hát');
        }
        if (!controller.signal.aborted) {
          setAvailableSongs(Array.isArray(data.songs) ? data.songs : []);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('Không thể tải danh sách bài hát:', error);
        setAddSongError(
          error instanceof Error ? error.message : 'Không thể tải danh sách bài hát'
        );
      } finally {
        if (!controller.signal.aborted) setSongsLoading(false);
      }
    }, 200);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [apiUrl, showAddSongsModal, songSearch]);

  useEffect(() => {
    if (!editCoverFile) {
      if (editCoverUrl.trim()) {
        setEditCoverPreview(editCoverUrl.trim());
        return;
      }
      const currentImage = playlist?.coverImage || '';
      setEditCoverPreview(
        currentImage.startsWith('/uploads/') ? `${apiUrl}${currentImage}` : currentImage
      );
      return;
    }

    const previewUrl = URL.createObjectURL(editCoverFile);
    setEditCoverPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [apiUrl, editCoverFile, editCoverUrl, playlist]);

  const playlistTitle = playlist?.name || 'Playlist';
  const playlistDesc = playlist?.description || '';

  const fallbackTracklist = [
    {
      _id: 'song_002',
      title: 'Ngày Mới',
      artist: 'Minh Anh',
      album: 'Thanh Xuân',
      dateAdded: '3 ngày trước',
      duration: 218,
      coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
    },
    {
      _id: 'song_003',
      title: 'Mưa Đêm',
      artist: 'Minh Anh',
      album: 'Thanh Xuân',
      dateAdded: '1 tuần trước',
      duration: 245,
      coverImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    },
    {
      _id: 'song_004',
      title: 'Lời Chưa Nói',
      artist: 'Linh Chi',
      album: 'Khoảng Lặng',
      dateAdded: '2 tuần trước',
      duration: 232,
      coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=120&q=80',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
    },
    {
      _id: 'song_005',
      title: 'Đường Về',
      artist: 'Linh Chi',
      album: 'Khoảng Lặng',
      dateAdded: '2 tuần trước',
      duration: 204,
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=120&q=80',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
    },
    {
      _id: 'song_006',
      title: 'Nhịp Đêm',
      artist: 'KAI',
      badge: 'Hi-Res',
      album: 'Đêm Thành Phố',
      dateAdded: '1 tháng trước',
      duration: 188,
      coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=120&q=80',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3'
    }
  ];

  const tracklist = Array.isArray(playlist?.songs) ? playlist.songs : [];
  const handleSongFavoriteChange = (songId: string, isFavorite: boolean) => {
    if (
      isFavorite ||
      playlist?.name?.trim().toLocaleLowerCase('vi') !== 'nhạc yêu thích'
    ) {
      return;
    }

    setPlaylist((current: any) => {
      if (!current) return current;
      const isNotRemovedSong = (item: any) =>
        (typeof item === 'object' ? item?._id : item) !== songId;
      return {
        ...current,
        songs: (current.songs || []).filter(isNotRemovedSong),
        songIds: (current.songIds || []).filter(isNotRemovedSong)
      };
    });
  };
  const filteredSongs = tracklist.filter(s =>
    String(s?.title || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    getArtistName(s).toLowerCase().includes(searchFilter.toLowerCase())
  );
  const sortLabels: Record<string, string> = {
    added: 'Thứ tự thêm vào',
    newest: 'Mới thêm gần đây',
    titleAsc: 'Tên bài hát (A-Z)',
    titleDesc: 'Tên bài hát (Z-A)',
    durationAsc: 'Thời lượng ngắn nhất',
    durationDesc: 'Thời lượng dài nhất'
  };
  const sortedSongs = [...filteredSongs];
  if (sortOrder === 'newest') {
    sortedSongs.reverse();
  } else if (sortOrder === 'titleAsc') {
    sortedSongs.sort((a: any, b: any) => String(a.title || '').localeCompare(String(b.title || ''), 'vi'));
  } else if (sortOrder === 'titleDesc') {
    sortedSongs.sort((a: any, b: any) => String(b.title || '').localeCompare(String(a.title || ''), 'vi'));
  } else if (sortOrder === 'durationAsc') {
    sortedSongs.sort((a: any, b: any) => (Number(a.duration) || 0) - (Number(b.duration) || 0));
  } else if (sortOrder === 'durationDesc') {
    sortedSongs.sort((a: any, b: any) => (Number(b.duration) || 0) - (Number(a.duration) || 0));
  }
  const playlistOwner = typeof playlist?.userId === 'object'
    ? playlist.userId.username
    : user?.name;
  const playlistOwnerId = String(
    typeof playlist?.userId === 'object' ? playlist.userId?._id : playlist?.userId || ''
  );
  const canEditPlaylist = Boolean(token && user?.id && playlistOwnerId === String(user.id));
  const isFavoritesPlaylist =
    playlist?.name?.trim().toLocaleLowerCase('vi') === 'nhạc yêu thích';
  const existingSongIds = new Set(tracklist.map((song: any) => song._id));
  const songsToAdd = availableSongs.filter((song: any) => !existingSongIds.has(song._id));
  const durationMinutes = Math.round(
    tracklist.reduce((total: number, song: any) => total + (Number(song.duration) || 0), 0) / 60
  );

  const isCurrentPlaying = isPlaying && currentSong && sortedSongs.some(s => s._id === currentSong._id);

  const handlePlayAll = () => {
    if (sortedSongs.length === 0) return;
    if (isCurrentPlaying) {
      togglePlay();
    } else {
      playSong(sortedSongs[0], sortedSongs);
    }
  };

  const handleAddSong = async (song: any) => {
    if (!token || !canEditPlaylist || addSongBusyId) return;

    setAddSongBusyId(song._id);
    setAddSongError('');
    try {
      const response = await fetch(`${apiUrl}/playlists/${id}/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ songId: song._id })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Không thể thêm bài hát vào playlist');
      }

      const songForPlaylist = {
        ...song,
        artist: song.artist || song.artistIds?.[0] || null,
        albumTitle: song.albumTitle || song.albumId?.title || ''
      };
      setPlaylist((current: any) => {
        if (!current || (current.songs || []).some((item: any) => item._id === song._id)) {
          return current;
        }
        return {
          ...current,
          songs: [...(current.songs || []), songForPlaylist],
          songIds: [...(current.songIds || []), songForPlaylist]
        };
      });
      setAvailableSongs((current) => current.filter((item) => item._id !== song._id));
    } catch (error) {
      console.error('Không thể thêm bài hát vào playlist:', error);
      setAddSongError(
        error instanceof Error ? error.message : 'Không thể thêm bài hát vào playlist'
      );
    } finally {
      setAddSongBusyId('');
    }
  };

  const handleRemoveSong = async (song: any) => {
    if (!token || !canEditPlaylist || removeSongBusyId) return;

    setRemoveSongBusyId(song._id);
    setRemoveSongError('');
    try {
      const response = await fetch(`${apiUrl}/playlists/${id}/songs`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ songId: song._id })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Không thể xóa bài hát khỏi playlist');
      }

      setPlaylist((current: any) => {
        if (!current) return current;
        const isNotRemovedSong = (item: any) =>
          (typeof item === 'object' ? item?._id : item) !== song._id;
        return {
          ...current,
          songs: (current.songs || []).filter(isNotRemovedSong),
          songIds: (current.songIds || []).filter(isNotRemovedSong)
        };
      });
    } catch (error) {
      console.error('Không thể xóa bài hát khỏi playlist:', error);
      setRemoveSongError(
        error instanceof Error ? error.message : 'Không thể xóa bài hát khỏi playlist'
      );
    } finally {
      setRemoveSongBusyId('');
    }
  };

  const openEditPlaylist = () => {
    setEditDescription(playlist.description || '');
    setEditCoverFile(null);
    setEditCoverUrl('');
    if (editCoverInputRef.current) editCoverInputRef.current.value = '';
    setEditPlaylistError('');
    setShowEditPlaylistModal(true);
  };

  const closeEditPlaylist = () => {
    if (savingPlaylist) return;
    setShowEditPlaylistModal(false);
    setEditCoverFile(null);
    setEditCoverUrl('');
    if (editCoverInputRef.current) editCoverInputRef.current.value = '';
    setEditPlaylistError('');
  };

  const handleUpdatePlaylist = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !canEditPlaylist || savingPlaylist) return;

    setSavingPlaylist(true);
    setEditPlaylistError('');
    try {
      const formData = new FormData();
      formData.append('description', editDescription);
      if (editCoverFile) {
        formData.append('coverImage', editCoverFile);
      } else if (editCoverUrl.trim()) {
        formData.append('coverImageUrl', editCoverUrl.trim());
      }

      const response = await fetch(`${apiUrl}/playlists/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const responseBody = await response.text();
      let data: any;
      try {
        data = responseBody ? JSON.parse(responseBody) : {};
      } catch {
        if (response.status === 404 || response.status === 405) {
          throw new Error('Backend chưa nạp API sửa playlist. Hãy khởi động lại backend rồi thử lại.');
        }
        throw new Error(`Máy chủ trả về phản hồi không hợp lệ (${response.status}).`);
      }
      if (!response.ok) {
        throw new Error(data.message || 'Không thể cập nhật playlist');
      }

      setPlaylist((current: any) => current
        ? { ...current, description: data.description, coverImage: data.coverImage }
        : current);
      setShowEditPlaylistModal(false);
      setEditCoverFile(null);
      setEditCoverUrl('');
      if (editCoverInputRef.current) editCoverInputRef.current.value = '';
    } catch (error) {
      console.error('Không thể cập nhật playlist:', error);
      setEditPlaylistError(
        error instanceof Error ? error.message : 'Không thể cập nhật playlist'
      );
    } finally {
      setSavingPlaylist(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-sm text-[#8ea0b4]">Đang tải playlist...</div>;
  }

  if (loadError || !playlist) {
    return (
      <div role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-300">
        {loadError || 'Không tìm thấy playlist'}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ============================================================== */}
      {/* 1. PLAYLIST HERO BANNER (Exact match with Image 4)             */}
      {/* ============================================================== */}
      <section className="flex flex-col md:flex-row items-center md:items-end gap-8 bg-gradient-to-b from-[#141d27] via-[#0f151e] to-[#090d11] border border-[#1b2533] p-8 md:p-10 rounded-3xl shadow-2xl">
        {/* 3D Artwork Perspective Card */}
        <div className="relative w-52 h-52 md:w-56 md:h-56 rounded-2xl overflow-hidden bg-[#101720] border-2 border-[#202e3f] shadow-2xl shrink-0 group">
          <img
            src={playlist.coverImage?.startsWith('/uploads/')
              ? `${apiUrl}${playlist.coverImage}`
              : playlist.coverImage || ''}
            alt={playlistTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
            <span className="text-[10px] font-black text-[#0df580] tracking-wider uppercase flex items-center gap-1">
              {playlist.visibility === 'public' ? 'PLAYLIST CÔNG KHAI' : 'PLAYLIST RIÊNG TƯ'}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-3.5 text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#16202c] text-[#8ea0b4] border border-[#233142]">
              {playlist.visibility === 'public' ? 'CÔNG KHAI' : 'RIÊNG TƯ'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {playlistTitle}
          </h1>

          <p className="text-xs sm:text-sm text-[#8ea0b4] leading-relaxed max-w-2xl">
            {playlistDesc}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-[#8ea0b4] pt-1">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <span className="w-4 h-4 rounded-full bg-[#0df580] flex items-center justify-center text-[10px] text-black font-black">
                M
              </span>
              {playlistOwner || 'Người dùng'}
            </span>
            <span>•</span>
            <span>{tracklist.length} bài hát, khoảng {durationMinutes} phút</span>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. PLAYLIST CONTROLS & SEARCH BAR (Exact match with Image 4)   */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        {/* Left Actions: Play, Shuffle, Heart, Download, More */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <button
            onClick={handlePlayAll}
            className="w-12 h-12 rounded-full bg-[#0df580] hover:bg-[#38f895] text-[#080c10] flex items-center justify-center shadow-lg shadow-[#0df580]/25 transition transform active:scale-95"
            title="Phát toàn bộ"
          >
            {isCurrentPlaying ? (
              <PauseIcon className="w-5 h-5" />
            ) : (
              <PlayIcon className="w-5 h-5 ml-0.5" />
            )}
          </button>

          {canEditPlaylist && (
            <>
              <button
                type="button"
                onClick={openEditPlaylist}
                className="inline-flex items-center gap-2 rounded-full border border-[#1b2533] bg-[#10161f] px-4 py-2.5 text-xs font-bold text-[#8ea0b4] transition hover:border-[#0df580]/40 hover:text-[#0df580]"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Sửa playlist
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddSongError('');
                  setShowAddSongsModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#1b2533] bg-[#10161f] px-4 py-2.5 text-xs font-bold text-[#8ea0b4] transition hover:border-[#0df580]/40 hover:text-[#0df580]"
              >
                <PlusIcon className="h-4 w-4" />
                Thêm bài hát
              </button>
            </>
          )}

          <button
            title="Phát ngẫu nhiên"
            className="text-[#6b7c93] hover:text-[#0df580] transition p-2"
          >
            <ArrowsRightLeftIcon className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsLiked(!isLiked)}
            title="Thích playlist"
            className="text-[#6b7c93] hover:text-[#0df580] transition p-2"
          >
            {isLiked ? (
              <HeartIcon className="w-5 h-5 text-[#0df580]" />
            ) : (
              <HeartOutline className="w-5 h-5" />
            )}
          </button>

          <button
            title="Tải về ngoại tuyến"
            className="text-[#6b7c93] hover:text-white transition p-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
          </button>

          <button
            title="Tùy chọn khác"
            className="text-[#6b7c93] hover:text-white transition p-2"
          >
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Right Actions: Search in playlist + Sort Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6b7c93]" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Tìm trong playlist..."
              className="pl-9 pr-3 py-1.5 bg-[#10161f] border border-[#1b2533] rounded-full text-xs text-white placeholder-[#55657a] focus:outline-none focus:border-[#0df580] transition w-44"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSortOptions((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={showSortOptions}
              className="flex items-center gap-1.5 rounded-full border border-[#1b2533] bg-[#10161f] px-3 py-1.5 text-xs font-bold text-[#8ea0b4] transition hover:text-white"
            >
              <span>{sortLabels[sortOrder]}</span>
              <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${showSortOptions ? 'rotate-180' : ''}`} />
            </button>
            {showSortOptions && (
              <>
                <button
                  type="button"
                  aria-label="Đóng danh sách sắp xếp"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setShowSortOptions(false)}
                />
                <div
                  role="listbox"
                  aria-label="Sắp xếp bài hát"
                  className="absolute right-0 top-full z-20 mt-2 min-w-48 overflow-hidden rounded-2xl border border-[#233142] bg-[#101720] p-1.5 shadow-2xl"
                >
                  {Object.entries(sortLabels).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      role="option"
                      aria-selected={sortOrder === value}
                      onClick={() => {
                        setSortOrder(value);
                        setShowSortOptions(false);
                      }}
                      className={`block w-full rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
                        sortOrder === value
                          ? 'bg-[#0df580]/10 text-[#0df580]'
                          : 'text-[#8ea0b4] hover:bg-[#1b2533] hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {removeSongError && (
        <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {removeSongError}
        </p>
      )}

      {/* ============================================================== */}
      {/* 3. TRACKLIST TABLE (Exact match with Image 4)                  */}
      {/* ============================================================== */}
      <div className="bg-[#10161f] border border-[#1b2533] rounded-3xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#1b2533] text-[#55657a] text-[10px] font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-6 w-12 text-center">#</th>
              <th className="py-3.5 px-4">TIÊU ĐỀ</th>
              <th className="py-3.5 px-4 hidden md:table-cell">ALBUM</th>
              <th className="py-3.5 px-4 hidden sm:table-cell">NGÀY PHÁT HÀNH</th>
              <th className="py-3.5 px-6 text-right">🕒 THỜI LƯỢNG</th>
              <th className="py-3.5 px-6 text-right w-16">TÁC VỤ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#17202b]">
            {sortedSongs.map((track: any, idx: number) => {
              const isThisPlaying = isPlaying && currentSong?._id === track._id;

              return (
                <tr
                  key={track._id}
                  onClick={() => playSong(track, sortedSongs)}
                  className="group hover:bg-[#151f2b] transition cursor-pointer"
                >
                  {/* # Index or Eq */}
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

                  {/* Artwork + Title + Artist */}
                  <td className="py-3.5 px-4 flex items-center gap-3.5">
                    <img
                      src={track.coverImage || ''}
                      alt={track.title}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xs truncate ${isThisPlaying ? 'text-[#0df580]' : 'text-white'}`}>
                          {track.title}
                        </span>
                        {track.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-[#00f2fe]/15 text-[#00f2fe] border border-[#00f2fe]/30">
                            {track.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6b7c93] mt-0.5">{getArtistName(track)}</p>
                    </div>
                  </td>

                  {/* Album */}
                  <td className="py-3.5 px-4 hidden md:table-cell text-[#6b7c93]">
                    {track.albumTitle || track.albumId?.title || '—'}
                  </td>

                  {/* Release date */}
                  <td className="py-3.5 px-4 hidden sm:table-cell text-[#6b7c93]">
                    {getReleaseDate(track)}
                  </td>

                  {/* Duration + Heart */}
                  <td className="py-3.5 px-6 text-right text-[#6b7c93]">
                    <div className="flex items-center justify-end gap-3">
                      <FavoriteSongButton
                        song={track}
                        iconClassName="w-4 h-4"
                        className="opacity-0 group-hover:opacity-100 text-[#6b7c93] transition hover:text-[#0df580]"
                        activeClassName="text-[#0df580]"
                        onFavoriteChange={(isFavorite) =>
                          handleSongFavoriteChange(track._id, isFavorite)
                        }
                      />
                      <span className="font-mono text-[11px]">{formatTime(track.duration)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-6 text-right text-[#55657a]">
                    {canEditPlaylist && !isFavoritesPlaylist && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRemoveSong(track);
                        }}
                        disabled={Boolean(removeSongBusyId)}
                        aria-label={`Xóa ${track.title} khỏi playlist`}
                        title="Xóa khỏi playlist"
                        className="rounded-full p-2 text-[#6b7c93] transition hover:bg-rose-500/10 hover:text-rose-400 disabled:cursor-wait disabled:opacity-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {sortedSongs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#6b7c93]">
                  {tracklist.length === 0 ? 'Playlist này chưa có bài hát trong MongoDB.' : 'Không tìm thấy bài hát phù hợp.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddSongsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowAddSongsModal(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-songs-title"
            className="flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-[#233142] bg-[#101720] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#1b2533] px-5 py-4">
              <div>
                <h2 id="add-songs-title" className="text-base font-black text-white">
                  Thêm bài hát vào {playlistTitle}
                </h2>
                <p className="mt-1 text-xs text-[#6b7c93]">
                  Tìm bài hát trong kho nhạc rồi chọn Thêm.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddSongsModal(false)}
                aria-label="Đóng"
                className="rounded-full p-2 text-[#6b7c93] transition hover:bg-[#1b2533] hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="relative border-b border-[#1b2533] p-4">
              <MagnifyingGlassIcon className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7c93]" />
              <input
                autoFocus
                type="search"
                value={songSearch}
                onChange={(event) => setSongSearch(event.target.value)}
                placeholder="Tìm tên bài hát hoặc nghệ sĩ..."
                aria-label="Tìm bài hát để thêm"
                className="w-full rounded-full border border-[#233142] bg-[#0b1118] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#55657a] outline-none transition focus:border-[#0df580]"
              />
            </div>

            {addSongError && (
              <p role="alert" className="mx-4 mt-3 rounded-xl bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                {addSongError}
              </p>
            )}

            <div className="min-h-40 flex-1 space-y-1 overflow-y-auto p-3">
              {songsLoading ? (
                <p className="py-10 text-center text-sm text-[#6b7c93]">Đang tìm bài hát...</p>
              ) : songsToAdd.length > 0 ? (
                songsToAdd.map((song: any) => (
                  <div
                    key={song._id}
                    className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-[#182330]"
                  >
                    <img
                      src={song.coverImage || ''}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-xl bg-[#1b2533] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">{song.title}</p>
                      <p className="mt-0.5 truncate text-xs text-[#6b7c93]">
                        {getArtistName(song)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddSong(song)}
                      disabled={Boolean(addSongBusyId)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#0df580] px-3 py-2 text-xs font-black text-[#080c10] transition hover:bg-[#38f895] disabled:cursor-wait disabled:opacity-60"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                      {addSongBusyId === song._id ? 'Đang thêm...' : 'Thêm'}
                    </button>
                  </div>
                ))
              ) : (
                <p className="py-10 text-center text-sm text-[#6b7c93]">
                  {availableSongs.length > 0
                    ? 'Các bài hát phù hợp đã có trong playlist.'
                    : 'Không tìm thấy bài hát phù hợp.'}
                </p>
              )}
            </div>
          </section>
        </div>
      )}

      {showEditPlaylistModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditPlaylist();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-playlist-title"
            className="w-full max-w-md space-y-4 rounded-3xl border border-[#233142] bg-[#101720] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 id="edit-playlist-title" className="text-lg font-black text-white">
                Chỉnh sửa playlist
              </h2>
              <button
                type="button"
                onClick={closeEditPlaylist}
                disabled={savingPlaylist}
                aria-label="Đóng"
                className="rounded-full p-2 text-[#6b7c93] transition hover:bg-[#1b2533] hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePlaylist} className="space-y-4">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-[#8ea0b4]">
                  Ảnh bìa
                </label>
                <label className="group relative block aspect-video cursor-pointer overflow-hidden rounded-2xl border border-[#233142] bg-[#0b1118]">
                  {editCoverPreview ? (
                    <img src={editCoverPreview} alt="Xem trước ảnh bìa" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-sm text-[#6b7c93]">
                      Chọn ảnh bìa
                    </span>
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-bold text-white opacity-0 transition group-hover:opacity-100">
                    Nhấn để đổi ảnh
                  </span>
                  <input
                    ref={editCoverInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setEditCoverFile(file);
                      if (file) setEditCoverUrl('');
                    }}
                  />
                </label>
                <p className="mt-1.5 text-[10px] text-[#6b7c93]">
                  Chọn ảnh JPG, PNG, GIF hoặc WEBP.
                </p>
                <input
                  type="url"
                  value={editCoverUrl}
                  onChange={(event) => {
                    setEditCoverUrl(event.target.value);
                    setEditCoverFile(null);
                    if (editCoverInputRef.current) editCoverInputRef.current.value = '';
                  }}
                  placeholder="Hoặc dán địa chỉ ảnh https://..."
                  aria-label="Địa chỉ ảnh bìa"
                  className="mt-3 w-full rounded-xl border border-[#233142] bg-[#0b1118] px-4 py-2.5 text-xs text-white outline-none placeholder:text-[#55657a] focus:border-[#0df580]"
                />
              </div>

              <div>
                <label htmlFor="playlist-description" className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-[#8ea0b4]">
                  Mô tả
                </label>
                <textarea
                  id="playlist-description"
                  rows={3}
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  placeholder="Mô tả phong cách danh sách phát..."
                  className="w-full resize-none rounded-xl border border-[#233142] bg-[#0b1118] px-4 py-3 text-xs text-white outline-none focus:border-[#0df580]"
                />
              </div>

              {editPlaylistError && (
                <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                  {editPlaylistError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeEditPlaylist}
                  disabled={savingPlaylist}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-[#6b7c93] hover:text-white disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingPlaylist}
                  className="rounded-xl bg-[#0df580] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#080c10] shadow-lg shadow-[#0df580]/20 transition hover:bg-[#38f895] disabled:cursor-wait disabled:opacity-60"
                >
                  {savingPlaylist ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
