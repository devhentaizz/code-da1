'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import {
  SparklesIcon,
  CheckCircleIcon,
  StarIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  BoltIcon
} from '@heroicons/react/24/solid';

export default function SubscriptionPricingPage() {
  const { user, token, isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [mySub, setMySub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchData = async () => {
    try {
      const plansRes = await fetch(`${apiUrl}/subscriptions/plans`);
      if (plansRes.ok) {
        const data = await plansRes.json();
        setPlans(data);
      }

      if (token) {
        const subRes = await fetch(`${apiUrl}/subscriptions/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (subRes.ok) {
          const subData = await subRes.json();
          setMySub(subData);
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
  }, [token]);

  const handleUpgrade = async (planId: string) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập trước khi nâng cấp gói!');
      return;
    }

    setUpgrading(true);
    setSuccessMessage('');
    try {
      const months = planId === 'premium_year' ? 12 : 1;
      const res = await fetch(`${apiUrl}/subscriptions/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: 'premium',
          months,
          provider: 'demo_wallet'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMessage(`Chúc mừng! Bạn đã nâng cấp gói ${data.subscription.plan.toUpperCase()} thành công!`);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || 'Lỗi khi nâng cấp gói');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300 max-w-6xl mx-auto py-4">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest shadow-sm">
          <SparklesIcon className="w-4 h-4" /> WebNhac VIP Hội Viên
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Nâng Tầm Trải Nghiệm <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Âm Nhạc Không Giới Hạn
          </span>
        </h1>
        <p className="text-sm md:text-base text-slate-400">
          Tận hưởng âm thanh lossless 320kbps siêu trung thực, tắt sạch quảng cáo và mở khóa kho bài hát độc quyền.
        </p>

        {mySub?.isPremium && (
          <div className="inline-block p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold">
            ✨ Bạn hiện đang sở hữu gói <span className="uppercase text-white underline">{mySub.plan} VIP</span> (Hạn dùng: {mySub.endDate ? new Date(mySub.endDate).toLocaleDateString('vi-VN') : 'Không giới hạn'})
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-sm font-bold shadow-lg">
            {successMessage}
          </div>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((p) => {
          const isCurrent = mySub?.plan === p.id || (mySub?.isPremium && p.plan === 'premium');

          return (
            <div
              key={p.id}
              className={`relative flex flex-col justify-between rounded-3xl p-8 border transition-all duration-300 ${
                p.isPopular
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900/90 to-emerald-950/30 border-emerald-500/50 shadow-2xl shadow-emerald-500/10 ring-2 ring-emerald-500/30 md:-translate-y-2'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              {p.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                  Được Chọn Nhiều Nhất
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-white">{p.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl md:text-4xl font-black text-white">
                      {p.price === 0 ? 'Miễn Phí' : `${p.price.toLocaleString('vi-VN')}đ`}
                    </span>
                    {p.price > 0 && <span className="text-xs text-slate-400 font-medium">/{p.period}</span>}
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-6 space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đặc quyền bao gồm:</p>
                  <ul className="space-y-3">
                    {p.features?.map((feat: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                {p.price === 0 ? (
                  <button
                    disabled
                    className="w-full py-3.5 rounded-2xl bg-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider cursor-default"
                  >
                    Gói Mặc Định
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(p.id)}
                    disabled={upgrading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <BoltIcon className="w-4 h-4" />
                    {upgrading ? 'Đang kích hoạt...' : isCurrent ? 'Gia Hạn Gói Này' : 'Nâng Cấp Ngay'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-md">
        <h2 className="text-xl font-black text-white mb-6 text-center">Bảng So Sánh Quyền Lợi</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm text-slate-300">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[11px] font-bold">
              <tr>
                <th className="py-3 px-4">Tính Năng</th>
                <th className="py-3 px-4 text-center">Tài Khoản Thường</th>
                <th className="py-3 px-4 text-center text-emerald-400 font-black">Hội Viên VIP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-3.5 px-4 font-medium">Chất lượng âm thanh</td>
                <td className="py-3.5 px-4 text-center text-slate-400">128 kbps tiêu chuẩn</td>
                <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">Lossless 320 kbps</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">Chặn quảng cáo âm thanh & banner</td>
                <td className="py-3.5 px-4 text-center text-slate-500">❌</td>
                <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">✅ 100% Không quảng cáo</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">Tạo & quản lý Playlist không giới hạn</td>
                <td className="py-3.5 px-4 text-center text-slate-400">Tối đa 5 playlist</td>
                <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">Không giới hạn</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium">Huy hiệu VIP trên Hồ sơ & Bình luận</td>
                <td className="py-3.5 px-4 text-center text-slate-500">❌</td>
                <td className="py-3.5 px-4 text-center text-emerald-400 font-bold">⭐ Huy hiệu vàng nổi bật</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

