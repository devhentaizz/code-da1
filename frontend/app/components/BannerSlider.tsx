'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlayIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface Banner {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

interface BannerSliderProps {
  banners: Banner[];
}

const BannerSlider: React.FC<BannerSliderProps> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  const current = banners[currentIndex];

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative w-full h-56 sm:h-72 md:h-80 rounded-3xl overflow-hidden shadow-2xl group">
      {/* Background Banner Image */}
      <img
        src={current.image}
        alt={current.title}
        className="w-full h-full object-cover transition-all duration-700 filter brightness-75 group-hover:scale-105"
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-10">
        <span className="px-3 py-1 bg-emerald-500 text-slate-950 text-xs font-black rounded-full uppercase tracking-widest w-fit mb-3">
          Tâm Điểm Âm Nhạc
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-md max-w-xl">
          {current.title}
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-lg drop-shadow">
          {current.subtitle}
        </p>

        <div className="mt-4">
          <Link
            href={current.link || '#'}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition transform hover:scale-105 shadow-lg shadow-emerald-500/30"
          >
            <PlayIcon className="w-5 h-5 ml-0.5" />
            Khám Phá Ngay
          </Link>
        </div>
      </div>

      {/* Controls */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-md"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-md"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 right-6 flex items-center gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-6 bg-emerald-400' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BannerSlider;

