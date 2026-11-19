'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  PlusIcon,
  TrashIcon,
  Squares2X2Icon,
  XMarkIcon,
  PencilSquareIcon
} from '@heroicons/react/24/solid';

export default function AdminGenresPage() {
  const { token } = useAuth();
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingGenreId, setEditingGenreId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#10b981');
  const [imageUrl, setImageUrl] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchGenres = async () => {
    try {
      const res = await fetch(`${apiUrl}/genres`);
      if (res.ok) {
        const data = await res.json();
        setGenres(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const handleCreateGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(
        editingGenreId ? `${apiUrl}/genres/${editingGenreId}` : `${apiUrl}/genres`,
        {
          method: editingGenreId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: name.trim(),
            description,
            color,
            image: imageUrl
          })
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || (editingGenreId ? 'Lỗi khi cập nhật thể loại' : 'Lỗi khi tạo thể loại'));
      }
      if (data.color?.toLowerCase() !== color.toLowerCase()) {
        throw new Error('Máy chủ chưa lưu được màu đại diện. Hãy khởi động lại backend rồi thử lại.');
      }

      if (editingGenreId) {
        setGenres((current) =>
          current
            .map((genre) => genre._id === data._id ? data : genre)
            .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
        );
      } else {
        setGenres((current) => [...current, data].sort((a, b) => a.name.localeCompare(b.name, 'vi')));
      }
      alert(editingGenreId ? 'Cập nhật thể loại thành công!' : 'Tạo thể loại thành công!');
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingGenreId(null);
    setName('');
    setDescription('');
    setColor('#10b981');
    setImageUrl('');
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (genre: any) => {
    setEditingGenreId(genre._id);
    setName(genre.name || '');
    setDescription(genre.description || '');
    setColor(genre.color || '#10b981');
    setImageUrl(genre.coverImage || '');
    setIsModalOpen(true);
  };

  const handleDeleteGenre = async (id: string, genreName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa thể loại "${genreName}"?`)) return;
    try {
      const res = await fetch(`${apiUrl}/genres/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setGenres(genres.filter(g => g._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Quản Lý Thể Loại Nhạc</h2>
          <p className="text-xs text-slate-400 mt-1">Tổng cộng {genres.length} thể loại âm nhạc</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
        >
          <PlusIcon className="w-5 h-5" />
          Thêm Thể Loại Mới
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {genres.map((genre) => (
          <div
            key={genre._id}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: genre.color || '#3b82f6' }}
                />
                <h4 className="font-bold text-white text-base">{genre.name}</h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(genre)}
                  aria-label={`Sửa thể loại ${genre.name}`}
                  title="Sửa thể loại"
                  className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteGenre(genre._id, genre.name)}
                  aria-label={`Xóa thể loại ${genre.name}`}
                  title="Xóa thể loại"
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 line-clamp-2">{genre.description || 'Chưa có mô tả'}</p>
            <span className="text-[11px] font-mono text-slate-500">Slug: /{genre.slug}</span>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              disabled={submitting}
              aria-label="Đóng"
              className="absolute right-5 top-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center">
                {editingGenreId
                  ? <PencilSquareIcon className="w-6 h-6" />
                  : <Squares2X2Icon className="w-6 h-6" />}
              </div>
              <h3 className="text-xl font-bold text-white">
                {editingGenreId ? 'Sửa Thể Loại' : 'Thêm Thể Loại Mới'}
              </h3>
            </div>

            <form onSubmit={handleCreateGenre} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Tên Thể Loại</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: R&B / Soul"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Màu Sắc Đại Diện</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-xs text-slate-400">{color}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Ảnh Đại Diện (URL)</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Mô Tả</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả đặc trưng dòng nhạc..."
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition shadow-lg disabled:opacity-50"
                >
                  {submitting
                    ? 'Đang lưu...'
                    : editingGenreId ? 'Cập Nhật Thể Loại' : 'Lưu Thể Loại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

