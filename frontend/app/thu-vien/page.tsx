'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import {
  HeartIcon,
  ClockIcon,
  QueueListIcon,
  PlusIcon,
  PlayIcon,
  MusicalNoteIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';

type LibraryTab = 'continue' | 'playlists' | 'history';

const getArtistName = (song: any) => {
  const artist = song?.artist || song?.artistIds?.[0];
  if (typeof artist === 'string') return artist;
  return artist?.name || artist?.stageName || 'Đang cập nhật';
};

const formatDuration = (duration?: number) => {
  if (duration === undefined || duration === null || !Number.isFinite(Number(duration))) return '--:--';
  const seconds = Math.max(0, Number(duration));
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
};

const formatListens = (listens?: number) => Number(listens || 0).toLocaleString('vi-VN');

const getAlbumName = (song: any) => {
  if (song?.albumTitle) return song.albumTitle;
  if (typeof song?.albumId === 'object') return song.albumId?.title || '—';
  return '—';
};

export default function LibraryPage() {
  const { token, isAuthenticated, updateFavorites } = useAuth();
  const { playSong } = useAudio();
  const [profile, setProfile] = useState<any>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<LibraryTab>('continue');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [favoriteBusyId, setFavoriteBusyId] = useState('');
  const [deletingPlaylistId, setDeletingPlaylistId] = useState('');

  // Modal Tạo Playlist
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<any>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [editCoverPreview, setEditCoverPreview] = useState('');
  const [editError, setEditError] = useState('');
  const [savingPlaylist, setSavingPlaylist] = useState(false);
  const editCoverInputRef = useRef<HTMLInputElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const getPlaylistImageUrl = (image?: string) =>
    image?.startsWith('/uploads/') ? `${apiUrl}${image}` : image || '';

  const fetchProfileAndPlaylists = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      setLoadError('');
      const [profileRes, playlistsRes] = await Promise.all([
        fetch(`${apiUrl}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/playlists`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const profileData = await profileRes.json();
      const playlistsData = await playlistsRes.json();
      if (!profileRes.ok) {
        throw new Error(profileData.message || 'Không thể tải thư viện cá nhân');
      }
      if (!playlistsRes.ok) {
        throw new Error(playlistsData.message || 'Không thể tải danh sách phát');
      }
      setProfile(profileData);
      setPlaylists(Array.isArray(playlistsData) ? playlistsData : []);
    } catch (err) {
      console.error(err);
      setLoadError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải thư viện');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndPlaylists();
  }, [token]);

  useEffect(() => {
    if (!editCoverFile) {
      if (editCoverUrl.trim()) {
        setEditCoverPreview(editCoverUrl.trim());
        return;
      }
      const currentImage = editingPlaylist?.coverImage || '';
      setEditCoverPreview(
        currentImage.startsWith('/uploads/') ? `${apiUrl}${currentImage}` : currentImage
      );
      return;
    }

    const previewUrl = URL.createObjectURL(editCoverFile);
    setEditCoverPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [apiUrl, editCoverFile, editCoverUrl, editingPlaylist]);

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch(`${apiUrl}/playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newPlaylistName,
          description: newPlaylistDesc,
          visibility: 'public'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Không thể tạo playlist');
      }
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setShowCreateModal(false);
      setActionError('');
      await fetchProfileAndPlaylists();
    } catch (err) {
      console.error(err);
      setActionError(err instanceof Error ? err.message : 'Không thể tạo playlist');
    } finally {
      setCreating(false);
    }
  };

  const openEditPlaylist = (event: React.MouseEvent, playlist: any) => {
    event.preventDefault();
    event.stopPropagation();
    setEditingPlaylist(playlist);
    setEditDescription(playlist.description || '');
    setEditCoverFile(null);
    setEditCoverUrl('');
    if (editCoverInputRef.current) editCoverInputRef.current.value = '';
    setEditError('');
  };

  const closeEditPlaylist = () => {
    if (savingPlaylist) return;
    setEditingPlaylist(null);
    setEditCoverFile(null);
    setEditCoverUrl('');
    if (editCoverInputRef.current) editCoverInputRef.current.value = '';
    setEditError('');
  };

  const handleUpdatePlaylist = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingPlaylist || !token || savingPlaylist) return;

    setSavingPlaylist(true);
    setEditError('');
    try {
      const formData = new FormData();
      formData.append('description', editDescription);
      if (editCoverFile) {
        formData.append('coverImage', editCoverFile);
      } else if (editCoverUrl.trim()) {
        formData.append('coverImageUrl', editCoverUrl.trim());
      }

      const response = await fetch(`${apiUrl}/playlists/${editingPlaylist._id}`, {
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

      setPlaylists((current) =>
        current.map((playlist) => playlist._id === data._id ? { ...playlist, ...data } : playlist)
      );
      setEditingPlaylist(null);
      setEditCoverFile(null);
      setEditCoverUrl('');
      if (editCoverInputRef.current) editCoverInputRef.current.value = '';
      setActionError('');
    } catch (error) {
      console.error('Không thể cập nhật playlist:', error);
      setEditError(error instanceof Error ? error.message : 'Không thể cập nhật playlist');
    } finally {
      setSavingPlaylist(false);
    }
  };

  const handleDeletePlaylist = async (event: React.MouseEvent, playlist: any) => {
    event.preventDefault();
    event.stopPropagation();
    if (!token || deletingPlaylistId) return;
    if (playlist.name?.trim().toLocaleLowerCase('vi') === 'nhạc yêu thích') {
      return;
    }
    if (!window.confirm(`Bạn có chắc muốn xóa playlist "${playlist.name}" không?`)) {
      return;
    }

    setDeletingPlaylistId(playlist._id);
    setActionError('');
    try {
      const response = await fetch(`${apiUrl}/playlists/${playlist._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const responseBody = await response.text();
      let data: any;
      try {
        data = responseBody ? JSON.parse(responseBody) : {};
      } catch {
        throw new Error(`Máy chủ trả về phản hồi không hợp lệ (${response.status}).`);
      }
      if (!response.ok) {
        throw new Error(data.message || 'Không thể xóa playlist');
      }

      setPlaylists((current) => current.filter((item) => item._id !== playlist._id));
    } catch (error) {
      console.error('Không thể xóa playlist:', error);
      setActionError(error instanceof Error ? error.message : 'Không thể xóa playlist');
    } finally {
      setDeletingPlaylistId('');
    }
  };

  const favoritePlaylist = playlists.find(
    (playlist) => playlist.name?.trim().toLocaleLowerCase('vi') === 'nhạc yêu thích'
  );
  const favoriteSongs = Array.isArray(favoritePlaylist?.songIds)
    ? favoritePlaylist.songIds
      .filter((song: any) => song && typeof song === 'object' && song._id)
      .map((song: any) => ({
        ...song,
        artist: song.artist || song.artistIds?.[0],
        albumTitle: song.albumTitle || song.albumId?.title || '',
        listens: song.listens ?? song.playCount ?? 0
      }))
    : [];
  const historyEntries = profile?.history || [];
  const historySongs = historyEntries.map((entry: any) => entry.song).filter(Boolean);
  const continueEntries = historyEntries.filter(
    (entry: any) => entry.song && !entry.completed
  );
  const continueSongs = continueEntries.map((entry: any) => ({
    ...entry.song,
    resumeAtSeconds: Math.max(0, Number(entry.progressSeconds) || 0)
  }));
  const activeSongs = activeTab === 'continue' ? continueSongs : historySongs;

  const handleToggleFavorite = async (song: any) => {
    if (!token || favoriteBusyId) return;
    setFavoriteBusyId(song._id);
    setActionError('');

    try {
      const res = await fetch(`${apiUrl}/users/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ songId: song._id, isFavorite: false })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Không thể bỏ yêu thích bài hát');
      }

      if (Array.isArray(data.favorites)) updateFavorites(data.favorites);
      setPlaylists((current) => current.map((playlist) => {
        if (playlist._id !== favoritePlaylist?._id) return playlist;
        return {
          ...playlist,
          songIds: playlist.songIds.filter((item: any) =>
            (typeof item === 'object' ? item._id : item) !== song._id
          )
        };
      }));
    } catch (err) {
      console.error(err);
      setActionError(err instanceof Error ? err.message : 'Không thể cập nhật bài hát yêu thích');
    } finally {
      setFavoriteBusyId('');
    }
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-300 sm:space-y-8">
      <div className="flex flex-col gap-5 border-b border-[#17202b] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#0df580]">
            BỘ SƯU TẬP CÁ NHÂN
          </span>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">Thư Viện Studio</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#8ea0b4]">
            Tiếp tục nghe từ vị trí đã dừng, quản lý playlist và xem lại lịch sử nghe
          </p>
        </div>

        {isAuthenticated && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#0df580] px-5 py-3 text-xs font-black uppercase tracking-wider text-[#080c10] shadow-lg shadow-[#0df580]/20 transition hover:-translate-y-0.5 hover:bg-[#38f895] sm:self-auto"
          >
            <PlusIcon className="h-4 w-4" />
            Tạo Playlist Mới
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-[#17202b] pb-3 text-xs font-bold">
        {([
          { id: 'continue', label: 'Tiếp Tục Nghe', count: continueSongs.length, Icon: PlayIcon },
          { id: 'playlists', label: 'Danh Sách Phát', count: playlists.length, Icon: QueueListIcon },
          { id: 'history', label: 'Lịch Sử Nghe', count: historySongs.length, Icon: ClockIcon }
        ] as const).map(({ id, label, count, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 transition ${
              activeTab === id
                ? 'bg-[#1b2533] text-[#0df580] shadow'
                : 'text-[#6b7c93] hover:bg-white/[0.03] hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label} ({count})
          </button>
        ))}
      </div>

      {!isAuthenticated ? (
        <div className="rounded-3xl border border-[#1b2533] bg-[#10161f] px-6 py-14 text-center">
          <HeartIcon className="mx-auto h-10 w-10 text-[#0df580]" />
          <h2 className="mt-4 text-lg font-bold text-white">Đăng nhập để xem thư viện của bạn</h2>
          <p className="mt-2 text-sm text-slate-400">Bài hát yêu thích, lịch sử nghe và playlist sẽ được đồng bộ tại đây.</p>
          <Link href="/login" className="mt-5 inline-flex rounded-full bg-[#0df580] px-5 py-2.5 text-sm font-bold text-[#080c10] transition hover:bg-[#38f895]">
            Đăng nhập
          </Link>
        </div>
      ) : loading ? (
        <div className="rounded-3xl border border-[#1b2533] bg-[#10161f] py-16 text-center text-sm text-slate-400">
          Đang tải thư viện của bạn...
        </div>
      ) : loadError ? (
        <div role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-300">
          {loadError}
          <button onClick={fetchProfileAndPlaylists} className="ml-3 font-bold underline">Thử lại</button>
        </div>
      ) : (
        <>
          {actionError && (
            <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
              {actionError}
            </p>
          )}

          {activeTab === 'playlists' ? (
            playlists.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {playlists.map((playlist) => (
                  <div
                    key={playlist._id}
                    className="group relative rounded-3xl border border-[#1b2533] bg-[#10161f] p-3.5 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-[#0df580]/30 hover:bg-[#151f2b]"
                  >
                    <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl bg-[#16202c]">
                      <Link href={`/playlist/${playlist._id}`} className="absolute inset-0">
                        <img
                          src={getPlaylistImageUrl(playlist.coverImage) || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80'}
                          alt={playlist.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0df580] text-[#080c10] shadow-lg">
                            <PlayIcon className="h-5 w-5" />
                          </span>
                        </span>
                      </Link>
                      <div className="absolute right-2 top-2 z-10 flex gap-2">
                        <button
                          type="button"
                          onClick={(event) => openEditPlaylist(event, playlist)}
                          aria-label={`Chỉnh sửa ${playlist.name}`}
                          title="Chỉnh sửa playlist"
                          className="rounded-full border border-white/10 bg-black/70 p-2 text-white opacity-100 shadow-lg transition hover:bg-[#0df580] hover:text-[#080c10] sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        {playlist.name?.trim().toLocaleLowerCase('vi') !== 'nhạc yêu thích' && (
                          <button
                            type="button"
                            onClick={(event) => handleDeletePlaylist(event, playlist)}
                            disabled={Boolean(deletingPlaylistId)}
                            aria-label={`Xóa playlist ${playlist.name}`}
                            title="Xóa playlist"
                            className="rounded-full border border-white/10 bg-black/70 p-2 text-white opacity-100 shadow-lg transition hover:bg-rose-500 disabled:cursor-wait disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <Link href={`/playlist/${playlist._id}`} className="block">
                      <h3 className="truncate text-sm font-bold text-white transition group-hover:text-[#0df580]">{playlist.name}</h3>
                      <p className="mt-1 line-clamp-1 text-xs text-[#6b7c93]">{playlist.description || 'Playlist cá nhân'}</p>
                      <p className="mt-3 border-t border-[#1b2533] pt-2 text-[10px] font-mono text-[#8ea0b4]">
                        {playlist.songIds?.length || 0} bài hát
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#27374b] bg-[#10161f]/60 px-6 py-14 text-center">
                <QueueListIcon className="mx-auto h-9 w-9 text-slate-600" />
                <h2 className="mt-4 font-bold text-white">Bạn chưa tạo playlist nào</h2>
                <p className="mt-2 text-sm text-slate-400">Tạo danh sách phát đầu tiên để sắp xếp những bài hát yêu thích.</p>
                <button onClick={() => setShowCreateModal(true)} className="mt-5 rounded-full bg-[#0df580] px-5 py-2.5 text-sm font-bold text-[#080c10] hover:bg-[#38f895]">
                  Tạo playlist
                </button>
              </div>
            )
          ) : activeSongs.length > 0 ? (
            <div className="overflow-hidden rounded-3xl border border-[#1b2533] bg-[#10161f] shadow-xl">
              <div className="hidden grid-cols-[48px_minmax(0,1fr)_minmax(120px,0.8fr)_minmax(110px,0.6fr)_80px] items-center gap-4 border-b border-[#1b2533] px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[#55657a] md:grid">
                <span className="text-center">#</span>
                <span>Tiêu đề</span>
                <span>Album</span>
                <span className="text-right">Lượt nghe</span>
                <span className="text-right">Thời lượng</span>
              </div>
              <div className="divide-y divide-[#17202b]">
                {activeSongs.map((song: any, index: number) => (
                  <div
                    key={`${song._id}-${index}`}
                    className="group grid grid-cols-[30px_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3.5 transition hover:bg-[#151f2b] sm:grid-cols-[40px_minmax(0,1fr)_auto] sm:px-5 md:grid-cols-[48px_minmax(0,1fr)_minmax(120px,0.8fr)_minmax(110px,0.6fr)_80px] md:gap-4 md:px-6"
                  >
                    <span className="text-center font-mono text-xs font-bold text-[#6b7c93]">{String(index + 1).padStart(2, '0')}</span>
                    <div className="flex min-w-0 items-center gap-3">
                      <button
                        type="button"
                        onClick={() => playSong(song, activeSongs, song.resumeAtSeconds || 0)}
                        aria-label={`Phát ${song.title}`}
                        className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#1a2330]"
                      >
                        {song.coverImage ? (
                          <img src={song.coverImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <MusicalNoteIcon className="m-auto h-5 w-5 text-[#0df580]" />
                        )}
                        <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[#0df580] opacity-0 transition group-hover:opacity-100">
                          <PlayIcon className="h-4 w-4" />
                        </span>
                      </button>
                      <div className="min-w-0">
                        <Link href={`/bai-hat/${song._id}`} className="block truncate text-sm font-bold text-white transition hover:text-[#0df580]">
                          {song.title}
                        </Link>
                        <p className="mt-0.5 truncate text-[11px] text-[#6b7c93]">{getArtistName(song)}</p>
                        {activeTab === 'continue' && (
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="h-1 w-24 overflow-hidden rounded-full bg-[#27374b]">
                              <div
                                className="h-full rounded-full bg-[#0df580]"
                                style={{
                                  width: `${Math.min(100, Math.max(0, (song.resumeAtSeconds / (song.duration || 1)) * 100))}%`
                                }}
                              />
                            </div>
                            <span className="text-[10px] text-[#6b7c93]">
                              {formatDuration(song.resumeAtSeconds)} / {formatDuration(song.duration)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="hidden truncate text-xs text-[#6b7c93] md:block">{getAlbumName(song)}</span>
                    <span className="hidden text-right font-mono text-xs tabular-nums text-[#8ea0b4] md:block">{formatListens(song.listens ?? song.playCount)}</span>
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-mono text-xs tabular-nums text-[#6b7c93]">{formatDuration(song.duration)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#27374b] bg-[#10161f]/60 px-6 py-14 text-center">
              {activeTab === 'continue'
                ? <PlayIcon className="mx-auto h-9 w-9 text-slate-600" />
                : <ClockIcon className="mx-auto h-9 w-9 text-slate-600" />}
              <h2 className="mt-4 font-bold text-white">
                {activeTab === 'continue' ? 'Chưa có bài hát nghe dở' : 'Chưa có lịch sử nghe'}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {activeTab === 'continue'
                  ? 'Các bài hát bạn đã nghe nhưng chưa nghe hết sẽ xuất hiện tại đây.'
                  : 'Những bài hát bạn phát sẽ xuất hiện tại đây.'}
              </p>
              <Link href="/bai-hat" className="mt-5 inline-flex rounded-full border border-[#27374b] px-5 py-2.5 text-sm font-bold text-slate-200 transition hover:border-[#0df580]/40 hover:text-[#0df580]">
                Khám phá bài hát
              </Link>
            </div>
          )}
        </>
      )}

      {/* Modal Tạo Playlist */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="max-w-md w-full bg-[#10161f] border border-[#1b2533] rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-white">Tạo Playlist Mới</h3>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#8ea0b4] uppercase tracking-wider mb-2">
                  Tên Playlist *
                </label>
                <input
                  type="text"
                  required
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Ví dụ: Nhịp điệu điện tử, Acoustic Chill..."
                  className="w-full px-4 py-2.5 bg-[#090d11] border border-[#1b2533] rounded-xl text-xs text-white focus:outline-none focus:border-[#0df580]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8ea0b4] uppercase tracking-wider mb-2">
                  Mô Tả
                </label>
                <textarea
                  rows={2}
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Mô tả phong cách danh sách phát..."
                  className="w-full px-4 py-2 bg-[#090d11] border border-[#1b2533] rounded-xl text-xs text-white focus:outline-none focus:border-[#0df580] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-[#6b7c93] hover:text-white text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-xl bg-[#0df580] hover:bg-[#38f895] text-[#080c10] text-xs font-black uppercase tracking-wider shadow-lg shadow-[#0df580]/20"
                >
                  {creating ? 'Đang tạo...' : 'Tạo Playlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingPlaylist && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditPlaylist();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-playlist-title"
            className="w-full max-w-md space-y-4 rounded-3xl border border-[#1b2533] bg-[#10161f] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 id="edit-playlist-title" className="text-lg font-black text-white">
                Chỉnh sửa Playlist
              </h3>
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
                <label className="group relative block aspect-video cursor-pointer overflow-hidden rounded-2xl border border-[#1b2533] bg-[#090d11]">
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
                <p className="mt-1.5 text-[10px] text-[#6b7c93]">Chọn ảnh JPG, PNG, GIF hoặc WEBP.</p>
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
                  className="mt-3 w-full rounded-xl border border-[#1b2533] bg-[#090d11] px-4 py-2.5 text-xs text-white outline-none placeholder:text-[#55657a] focus:border-[#0df580]"
                />
              </div>

              <div>
                <label htmlFor="edit-playlist-description" className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-[#8ea0b4]">
                  Mô tả
                </label>
                <textarea
                  id="edit-playlist-description"
                  rows={3}
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  placeholder="Mô tả phong cách danh sách phát..."
                  className="w-full resize-none rounded-xl border border-[#1b2533] bg-[#090d11] px-4 py-3 text-xs text-white outline-none focus:border-[#0df580]"
                />
              </div>

              {editError && (
                <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
                  {editError}
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
