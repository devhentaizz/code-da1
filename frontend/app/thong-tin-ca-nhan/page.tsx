'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftIcon, IdentificationIcon, PhotoIcon } from '@heroicons/react/24/outline';

export default function PersonalInformationPage() {
  const { user, token, isAuthenticated, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const avatarSrc = avatarPreview.startsWith('/') ? `${apiUrl}${avatarPreview}` : avatarPreview;

  useEffect(() => {
    setName(user?.name || '');
    setAvatarPreview(user?.avatar || '');
  }, [user]);

  useEffect(() => {
    if (!avatarPreview.startsWith('blob:')) return;
    return () => URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setAvatar(file);
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !name.trim()) {
      setError('Vui lòng nhập tên hiển thị.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const body = new FormData();
      body.append('name', name.trim());
      if (avatar) body.append('avatar', avatar);

      const response = await fetch(`${apiUrl}/users/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Không thể cập nhật thông tin cá nhân');
      }

      updateUser({
        name: data.name || data.username,
        username: data.username,
        email: data.email,
        avatar: data.avatar
      });
      setAvatar(null);
      setSuccess('Thông tin cá nhân đã được cập nhật.');
    } catch (saveError) {
      console.error('Không thể cập nhật thông tin cá nhân:', saveError);
      setError(saveError instanceof Error ? saveError.message : 'Không thể cập nhật thông tin cá nhân');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="rounded-3xl border border-[#1b2533] bg-[#10161f] px-6 py-14 text-center">
        <IdentificationIcon className="mx-auto h-10 w-10 text-[#0df580]" />
        <h1 className="mt-4 text-xl font-bold text-white">Đăng nhập để xem thông tin cá nhân</h1>
        <Link href="/login" className="mt-5 inline-flex rounded-full bg-[#0df580] px-5 py-2.5 text-sm font-bold text-[#080c10] transition hover:bg-[#38f895]">
          Đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#8ea0b4] transition hover:text-[#0df580]">
        <ArrowLeftIcon className="h-4 w-4" />
        Quay lại trang chủ
      </Link>

      <section className="overflow-hidden rounded-3xl border border-[#1b2533] bg-[#10161f] shadow-xl">
        <div className="border-b border-[#1b2533] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0df580]/10 text-[#0df580]">
              <IdentificationIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Thông tin cá nhân</h1>
              <p className="mt-1 text-sm text-[#8ea0b4]">Quản lý thông tin hiển thị trên tài khoản của bạn.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
          {error && (
            <p role="alert" className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}
          {success && (
            <p role="status" className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {success}
            </p>
          )}

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#0df580]/40 bg-[#1a2330]">
              {avatarPreview ? (
                <img src={avatarSrc} alt="Ảnh đại diện" className="h-full w-full object-cover" />
              ) : (
                <PhotoIcon className="h-9 w-9 text-[#6b7c93]" />
              )}
            </div>
            <div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#27374b] px-4 py-2.5 text-sm font-bold text-white transition hover:border-[#0df580]/50 hover:text-[#0df580]">
                <PhotoIcon className="h-4 w-4" />
                Chọn ảnh đại diện
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={handleAvatarChange}
                />
              </label>
              <p className="mt-2 text-xs text-[#6b7c93]">Chấp nhận ảnh JPG, PNG, WEBP hoặc GIF.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="profile-name" className="block text-xs font-bold uppercase tracking-wider text-[#8ea0b4]">
              Tên hiển thị
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={80}
              className="w-full rounded-xl border border-[#27374b] bg-[#090d11] px-4 py-3 text-sm text-white outline-none transition focus:border-[#0df580]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="profile-email" className="block text-xs font-bold uppercase tracking-wider text-[#8ea0b4]">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={user.email}
              readOnly
              className="w-full cursor-not-allowed rounded-xl border border-[#1b2533] bg-[#151c26] px-4 py-3 text-sm text-[#6b7c93] outline-none"
            />
            <p className="text-xs text-[#6b7c93]">Email hiện chưa thể thay đổi.</p>
          </div>

          <div className="flex justify-end border-t border-[#1b2533] pt-5">
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-full bg-[#0df580] px-6 py-3 text-sm font-black text-[#080c10] shadow-lg shadow-[#0df580]/15 transition hover:bg-[#38f895] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
