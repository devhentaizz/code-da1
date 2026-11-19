'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PlusIcon, TrashIcon, CircleStackIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/solid';

export default function AdminAlbumsPage() {
  const { token } = useAuth();
  const [albums, setAlbums] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [artistId, setArtistId] = useState('');
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchData = async () => {
    try {
      const [albumsRes, artistsRes] = await Promise.all([
        fetch(`${apiUrl}/albums`),
        fetch(`${apiUrl}/artists?limit=100`)
      ]);

      if (albumsRes.ok) {
        const data = await albumsRes.json();
        setAlbums(data);
      }

      if (artistsRes.ok) {
        const data = await artistsRes.json();
        setArtists(data);
        if (data.length > 0 && !artistId) {
          setArtistId(data[0]._id);
        }
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

  const resetAlbumForm = () => {
    setEditingAlbumId(null);
    setTitle('');
    setArtistId(artists[0]?._id || '');
    setReleaseDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setCoverUrl('');
    setCoverFile(null);
  };

  const openCreateAlbumModal = () => {
    resetAlbumForm();
    setIsModalOpen(true);
  };

  const openEditAlbumModal = (album: any) => {
    setEditingAlbumId(album._id);
    setTitle(album.title || '');
    const firstArtist = album.artistIds?.[0];
    setArtistId(firstArtist?._id || firstArtist || '');
    setReleaseDate(album.releaseDate || new Date().toISOString().split('T')[0]);
    setDescription(album.description || '');
    setCoverUrl(album.coverImage || '');
    setCoverFile(null);
    setIsModalOpen(true);
  };

  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !title.trim()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('artist', artistId);
      formData.append('releaseDate', releaseDate);
      formData.append('description', description);

      if (coverFile) {
        formData.append('coverImage', coverFile);
      } else if (coverUrl) {
        formData.append('coverImage', coverUrl);
      }

      const res = await fetch(
        editingAlbumId ? `${apiUrl}/albums/${editingAlbumId}` : `${apiUrl}/albums`,
        {
          method: editingAlbumId ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || (editingAlbumId ? 'Lỗi khi cập nhật album' : 'Lỗi khi tạo album'));
      }
      alert(editingAlbumId ? 'Cập nhật album thành công!' : 'Tạo album thành công!');
      setIsModalOpen(false);
      resetAlbumForm();
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể lưu album');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa album này?')) return;

    try {
      const res = await fetch(`${apiUrl}/albums/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setAlbums(prev => prev.filter(a => a._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <CircleStackIcon className="w-6 h-6 text-emerald-400" />
            Danh Sách Album ({albums.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý đĩa nhạc, tuyển tập bài hát phát hành theo album
          </p>
        </div>

        <button
          onClick={openCreateAlbumModal}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-2xl transition shadow-lg shadow-emerald-500/20"
        >
          <PlusIcon className="w-4 h-4" />
          Thêm Album Mới
        </button>
      </div>

      {/* Album List Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Album</th>
                <th className="px-6 py-4">Nghệ Sĩ</th>
                <th className="px-6 py-4">Ngày Phát Hành</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {albums.map((album) => {
                const artistNames = album.artistIds && album.artistIds.length > 0
                  ? album.artistIds.map((a: any) => a.name).join(', ')
                  : 'Chưa gán nghệ sĩ';

                return (
                  <tr key={album._id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={album.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=200&q=80'}
                        alt={album.title}
                        className="w-12 h-12 rounded-xl object-cover shadow"
                      />
                      <div>
                        <p className="font-bold text-white">{album.title}</p>
                        <p className="text-xs text-slate-400">{album._id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-300">
                      {artistNames}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      {album.releaseDate || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditAlbumModal(album)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition"
                        title="Sửa Album"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAlbum(album._id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                        title="Xóa Album"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {albums.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-500 text-xs">
                    Chưa có album nào được tạo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm / Sửa Album */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">
                {editingAlbumId ? 'Sửa Album' : 'Thêm Album Mới'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetAlbumForm();
                }}
                disabled={submitting}
                className="text-slate-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAlbum} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Tên Album *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Thanh Xuân, Đêm Thành Phố..."
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Nghệ Sĩ Đại Diện
                </label>
                <select
                  value={artistId}
                  onChange={(e) => setArtistId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Chọn nghệ sĩ --</option>
                  {artists.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Ngày Phát Hành
                </label>
                <input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Ảnh Bìa Album
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-400 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 mt-1">Hoặc nhập URL ảnh bìa bên dưới:</p>
                <input
                  type="text"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://... hoặc /uploads/..."
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 mt-1"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Mô Tả
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Giới thiệu về album..."
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetAlbumForm();
                  }}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : editingAlbumId ? 'Cập Nhật Album' : 'Tạo Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

