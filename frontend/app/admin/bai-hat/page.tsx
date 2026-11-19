'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PlusIcon, TrashIcon, MusicalNoteIcon, XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/solid';

export default function AdminSongsPage() {
  const { token } = useAuth();
  const [songs, setSongs] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [artistId, setArtistId] = useState('');
  const [genreId, setGenreId] = useState('');
  const [albumId, setAlbumId] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [duration, setDuration] = useState('210');
  const [lyrics, setLyrics] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchData = async () => {
    try {
      const [songsRes, artistsRes, genresRes, albumsRes] = await Promise.all([
        fetch(`${apiUrl}/songs?limit=100`),
        fetch(`${apiUrl}/artists?limit=100`),
        fetch(`${apiUrl}/genres`),
        fetch(`${apiUrl}/albums`)
      ]);

      if (songsRes.ok) {
        const sData = await songsRes.json();
        setSongs(sData.songs || []);
      }
      if (artistsRes.ok) {
        const aData = await artistsRes.json();
        setArtists(aData);
        if (aData.length > 0 && !artistId) setArtistId(aData[0]._id);
      }
      if (genresRes.ok) {
        const gData = await genresRes.json();
        setGenres(gData);
        if (gData.length > 0 && !genreId) setGenreId(gData[0]._id);
      }
      if (albumsRes.ok) {
        const alData = await albumsRes.json();
        setAlbums(Array.isArray(alData) ? alData : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    resetForm();
    setEditingSongId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (song: any) => {
    setEditingSongId(song._id);
    setTitle(song.title || '');
    const artId = typeof song.artist === 'object' ? song.artist?._id : (song.artistIds?.[0] || '');
    setArtistId(artId || (artists[0]?._id || ''));
    const genId = typeof song.genre === 'object' ? song.genre?._id : (song.genreIds?.[0] || '');
    setGenreId(genId || (genres[0]?._id || ''));
    const albId = typeof song.albumId === 'object' ? song.albumId?._id : (song.albumId || '');
    setAlbumId(albId || '');
    setDuration(String(song.duration || 210));
    setLyrics(song.lyrics || '');
    setAudioUrl(song.audioUrl || song.youtubeId || '');
    setCoverImageUrl(song.coverImage || '');
    setAudioFile(null);
    setImageFile(null);
    setIsFeatured(Boolean(song.isFeatured));
    setIsTrending(Boolean(song.isTrending));
    setIsModalOpen(true);
  };

  const handleSaveSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Vui lòng đăng nhập với quyền Admin');
      return;
    }

    if (!title || !artistId || !genreId) {
      alert('Vui lòng điền đủ Tên bài hát, Nghệ sĩ và Thể loại');
      return;
    }

    if (!editingSongId && !audioFile && !audioUrl) {
      alert('Vui lòng chọn file âm thanh hoặc nhập link URL audio / mã YouTube');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('artist', artistId);
      formData.append('genre', genreId);
      formData.append('album', albumId); // Gán Album hoặc rỗng
      formData.append('duration', duration);
      formData.append('lyrics', lyrics);
      formData.append('isFeatured', String(isFeatured));
      formData.append('isTrending', String(isTrending));

      if (audioFile) {
        formData.append('audio', audioFile);
      } else if (audioUrl) {
        formData.append('audioUrl', audioUrl);
      }

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (coverImageUrl) {
        formData.append('coverImage', coverImageUrl);
      }

      const url = editingSongId ? `${apiUrl}/songs/${editingSongId}` : `${apiUrl}/songs`;
      const method = editingSongId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || (editingSongId ? 'Lỗi khi cập nhật bài hát' : 'Lỗi khi thêm bài hát'));
      }

      alert(editingSongId ? 'Cập nhật bài hát & gán Album thành công!' : 'Thêm bài hát mới thành công!');
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSong = async (id: string, songTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài hát "${songTitle}"?`)) return;
    try {
      const res = await fetch(`${apiUrl}/songs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSongs(songs.filter(s => s._id !== id));
      } else {
        alert('Không thể xóa bài hát này');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setTitle('');
    setArtistId(artists[0]?._id || '');
    setGenreId(genres[0]?._id || '');
    setAlbumId('');
    setAudioUrl('');
    setAudioFile(null);
    setCoverImageUrl('');
    setImageFile(null);
    setDuration('210');
    setLyrics('');
    setIsFeatured(false);
    setIsTrending(false);
    setEditingSongId(null);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Quản Lý Danh Sách Bài Hát</h2>
          <p className="text-xs text-slate-400 mt-1">Tổng cộng {songs.length} bài hát trong hệ thống</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
        >
          <PlusIcon className="w-5 h-5" />
          Thêm Bài Hát Mới
        </button>
      </div>

      {/* Song Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Bài Hát</th>
                <th className="px-6 py-4">Nghệ Sĩ</th>
                <th className="px-6 py-4">Album</th>
                <th className="px-6 py-4">Thể Loại</th>
                <th className="px-6 py-4">Lượt Nghe</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {songs.map((song) => {
                const artistName = typeof song.artist === 'object' ? song.artist?.name : (song.artist || 'N/A');
                const genreName = typeof song.genre === 'object' ? song.genre?.name : (song.genre || 'Chung');
                const albumTitle = typeof song.albumId === 'object'
                  ? song.albumId?.title
                  : (song.albumTitle || song.album?.title || '— Đĩa đơn');

                return (
                  <tr key={song._id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={song.coverImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=80&q=80'}
                        alt={song.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-semibold text-white">{song.title}</p>
                        <p className="text-xs text-slate-500">
                          {Math.floor((song.duration || 0) / 60)}:{(song.duration || 0) % 60 < 10 ? '0' : ''}{(song.duration || 0) % 60}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-300">
                      {artistName}
                    </td>
                    <td className="px-6 py-4 font-medium text-emerald-400/90 text-xs">
                      {albumTitle !== '— Đĩa đơn' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-semibold text-emerald-400">
                          📀 {albumTitle}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-normal">
                          {albumTitle}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {genreName}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {song.listens?.toLocaleString('vi-VN') || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(song)}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition cursor-pointer"
                          title="Sửa bài hát & gán Album"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSong(song._id, song.title)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
                          title="Xóa bài hát"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {songs.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    Chưa có bài hát nào trong hệ thống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm / Chỉnh Sửa Bài Hát */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative my-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                {editingSongId ? <PencilSquareIcon className="w-4 h-4" /> : <MusicalNoteIcon className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  {editingSongId ? 'Chỉnh Sửa Bài Hát' : 'Thêm Bài Hát Mới'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {editingSongId ? 'Cập nhật metadata & gán Album' : 'Điền thông tin & đính kèm Album'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSong} className="space-y-3">
              {/* Tên bài hát */}
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tên bài hát *"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />

              {/* 3 Dropdowns: Nghệ Sĩ, Album, Thể Loại */}
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={artistId}
                  onChange={(e) => setArtistId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {artists.map((a) => (
                    <option key={a._id} value={a._id}>{a.stageName || a.name}</option>
                  ))}
                </select>

                <select
                  value={albumId}
                  onChange={(e) => setAlbumId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-800 border border-emerald-500/40 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">📀 Đĩa đơn</option>
                  {albums.map((al) => (
                    <option key={al._id} value={al._id}>{al.title}</option>
                  ))}
                </select>

                <select
                  value={genreId}
                  onChange={(e) => setGenreId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {genres.map((g) => (
                    <option key={g._id} value={g._id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 font-semibold uppercase px-0.5">
                <span>Nghệ sĩ</span><span className="text-emerald-500/70">Album</span><span>Thể loại</span>
              </div>

              {/* Audio + Ảnh bìa — 2 cột */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 space-y-2">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase">🎵 Audio</p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files ? e.target.files[0] : null)}
                    className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-400 cursor-pointer w-full"
                  />
                  <input
                    type="text"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    placeholder="YouTube ID hoặc URL .mp3"
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 space-y-2">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase">🖼 Ảnh bìa</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                    className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-400 cursor-pointer w-full"
                  />
                  <input
                    type="text"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="URL ảnh trực tiếp"
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Thời lượng + Checkboxes — 1 hàng */}
              <div className="flex items-center gap-3">
                <div className="w-28 shrink-0">
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Giây (210)"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5 pl-0.5">Thời lượng (s)</p>
                </div>
                <div className="flex items-center gap-4 flex-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300">
                    <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded text-emerald-500 focus:ring-0" />
                    Nổi Bật
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300">
                    <input type="checkbox" checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} className="rounded text-emerald-500 focus:ring-0" />
                    Thịnh Hành
                  </label>
                </div>
              </div>

              {/* Lyrics */}
              <textarea
                rows={2}
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Lời bài hát (tùy chọn)..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono resize-none"
              />

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Đang lưu...' : (editingSongId ? 'Cập Nhật' : 'Lưu Bài Hát')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
