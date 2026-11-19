'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PlusIcon, TrashIcon, UserGroupIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/solid';

export default function AdminArtistsPage() {
  const { token } = useAuth();
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingArtistId, setEditingArtistId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [stageName, setStageName] = useState('');
  const [bio, setBio] = useState('');
  const [nationality, setNationality] = useState('Việt Nam');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchArtists = async () => {
    try {
      const res = await fetch(`${apiUrl}/artists?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setArtists(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const resetArtistForm = () => {
    setEditingArtistId(null);
    setName('');
    setStageName('');
    setBio('');
    setNationality('Việt Nam');
    setAvatarUrl('');
    setAvatarFile(null);
  };

  const openCreateArtistModal = () => {
    resetArtistForm();
    setIsModalOpen(true);
  };

  const openEditArtistModal = (artist: any) => {
    setEditingArtistId(artist._id);
    setName(artist.name || '');
    setStageName(artist.stageName || '');
    setBio(artist.bio || '');
    setNationality(artist.country || artist.nationality || 'Việt Nam');
    setAvatarUrl(artist.avatar || '');
    setAvatarFile(null);
    setIsModalOpen(true);
  };

  const handleSaveArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !name.trim()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('stageName', stageName.trim() || name.trim());
      formData.append('bio', bio);
      formData.append('country', nationality);

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      } else {
        formData.append('avatar', avatarUrl);
      }

      const res = await fetch(
        editingArtistId ? `${apiUrl}/artists/${editingArtistId}` : `${apiUrl}/artists`,
        {
          method: editingArtistId ? 'PUT' : 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || (editingArtistId ? 'Lỗi khi cập nhật nghệ sĩ' : 'Lỗi khi thêm nghệ sĩ'));
      }

      alert(editingArtistId ? 'Cập nhật nghệ sĩ thành công!' : 'Thêm nghệ sĩ thành công!');
      setIsModalOpen(false);
      resetArtistForm();
      await fetchArtists();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteArtist = async (id: string, artistName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa nghệ sĩ "${artistName}"?`)) return;
    try {
      const res = await fetch(`${apiUrl}/artists/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setArtists(artists.filter(a => a._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Quản Lý Ca Sĩ & Nghệ Sĩ</h2>
          <p className="text-xs text-slate-400 mt-1">Tổng cộng {artists.length} nghệ sĩ trong hệ thống</p>
        </div>

        <button
          onClick={openCreateArtistModal}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
        >
          <PlusIcon className="w-5 h-5" />
          Thêm Nghệ Sĩ Mới
        </button>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Nghệ Sĩ</th>
                <th className="px-6 py-4">Tên Thật</th>
                <th className="px-6 py-4">Quốc Gia</th>
                <th className="px-6 py-4">Người Quan Tâm</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {artists.map((artist) => (
                <tr key={artist._id} className="hover:bg-slate-800/30 transition">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img
                      src={artist.avatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=80&q=80'}
                      alt={artist.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-700"
                    />
                    <p className="font-semibold text-white">{artist.stageName || artist.name}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{artist.name}</td>
                  <td className="px-6 py-4">{artist.country || artist.nationality || 'Việt Nam'}</td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {artist.followersCount?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEditArtistModal(artist)}
                      className="p-2 mr-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition"
                      title="Sửa nghệ sĩ"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteArtist(artist._id, artist.stageName || artist.name)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition"
                      title="Xóa nghệ sĩ"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetArtistForm();
              }}
              disabled={submitting}
              className="absolute right-5 top-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {editingArtistId ? 'Sửa Ca Sĩ / Nghệ Sĩ' : 'Thêm Ca Sĩ / Nghệ Sĩ Mới'}
              </h3>
            </div>

            <form onSubmit={handleSaveArtist} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Tên Thật</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Thanh Tùng"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Nghệ Danh</label>
                <input
                  type="text"
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  placeholder="Ví dụ: Sơn Tùng M-TP"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Quốc Gia</label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Ảnh Đại Diện (Avatar)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files ? e.target.files[0] : null)}
                  className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-slate-950 mb-2 cursor-pointer"
                />
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Hoặc link URL ảnh đại diện online"
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Tiểu Sử Tóm Tắt</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Giới thiệu về nghệ sĩ..."
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetArtistForm();
                  }}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : editingArtistId ? 'Cập Nhật Nghệ Sĩ' : 'Lưu Nghệ Sĩ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

