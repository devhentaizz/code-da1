import React from 'react';
import Link from 'next/link';

const getGenres = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  try {
    const res = await fetch(`${apiUrl}/genres`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

export default async function GenresPage() {
  const genres = await getGenres();
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-black text-white">Chủ Đề & Thể Loại</h1>
        <p className="text-sm text-slate-400 mt-1">
          Khám phá âm nhạc theo phong cách và dòng nhạc ưa thích
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {genres.map((genre: any) => (
          <Link
            key={genre._id}
            href={`/the-loai/${genre.slug}`}
            className="group relative h-44 rounded-3xl overflow-hidden shadow-xl p-6 flex flex-col justify-end border border-slate-800/80 transition-all duration-300 hover:scale-[1.02]"
            style={{ borderColor: genre.color || '#1e293b' }}
          >
            <img
              src={genre.coverImage?.startsWith('/uploads/')
                ? `${apiUrl}${genre.coverImage}`
                : genre.coverImage || genre.image || ''}
              alt={genre.name}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-40 transition-all duration-500"
            />
            <div className="relative z-10">
              <h3 className="text-xl font-black text-white drop-shadow-md">
                {genre.name}
              </h3>
              <p className="text-xs text-slate-200 line-clamp-2 mt-1 drop-shadow">
                {genre.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

