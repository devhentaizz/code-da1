'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  ChartPieIcon,
  MusicalNoteIcon,
  UserGroupIcon,
  Squares2X2Icon,
  CircleStackIcon,
  ArrowUturnLeftIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isAuthenticated } = useAuth();

  const adminNav = [
    { label: 'Tổng Quan', href: '/admin', icon: ChartPieIcon },
    { label: 'Quản Lý Bài Hát', href: '/admin/bai-hat', icon: MusicalNoteIcon },
    { label: 'Quản Lý Album', href: '/admin/album', icon: CircleStackIcon },
    { label: 'Quản Lý Nghệ Sĩ', href: '/admin/nghe-si', icon: UserGroupIcon },
    { label: 'Quản Lý Thể Loại', href: '/admin/the-loai', icon: Squares2X2Icon },
  ];

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="text-center py-24 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 max-w-lg mx-auto">
        <ShieldCheckIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-white">Yêu Cầu Quyền Quản Trị</h2>
        <p className="text-sm text-slate-400 mt-2 mb-6">
          Khu vực này chỉ dành riêng cho Quản trị viên (Admin). Vui lòng đăng nhập bằng tài khoản Admin để tiếp tục.
        </p>
        <Link
          href="/login"
          className="px-8 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-block shadow-lg"
        >
          Đăng Nhập Tài Khoản Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Admin Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-3xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
            <ShieldCheckIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">Bảng Quản Trị WebNhac</h1>
            <p className="text-xs text-emerald-400 font-semibold">Tài khoản: {user?.name}</p>
          </div>
        </div>

        {/* Admin Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition border border-slate-700/60"
          >
            <ArrowUturnLeftIcon className="w-4 h-4" />
            Về Trang Chủ
          </Link>
        </div>
      </div>

      {/* Main Admin Content */}
      <div>{children}</div>
    </div>
  );
}

