import React from 'react';
import SongCard from '../components/SongCard';
import SongRow from '../components/SongRow';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{
    keyword?: string;
    genre?: string;
    sort?: string;
  }>;
}

const getSongsAndGenres = async (keyword?: string, genre?: string, sort?: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  try {
    const query = new URLSearchParams();
    if (keyword) query.set('keyword', keyword);
    if (genre) query.set('genre', genre);
    if (sort) query.set('sort', sort);
    query.set('limit', '50');

    const [songsRes, genresRes] = await Promise.all([
      fetch(`${apiUrl}/songs?${query.toString()}`, { cache: 'no-store' }),
      fetch(`${apiUrl}/genres`, { cache: 'no-store' })
    ]);

    const songsData = songsRes.ok ? await songsRes.json() : { songs: [] };
    const genres = genresRes.ok ? await genresRes.json() : [];

    return {
      songs: songsData.songs || [],
      genres
    };
  } catch (error) {
    console.error(error);
    return { songs: [], genres: [] };
  }
};

export default async function SongsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const keyword = params.keyword;
  const currentGenre = params.genre;
  const currentSort = params.sort || 'newest';

  const { songs, genres } = await getSongsAndGenres(keyword, currentGenre, currentSort);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-white">
          {keyword ? `Kết quả tìm kiếm cho: "${keyword}"` : 'Tất Cả Bài Hát'}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Tìm thấy {songs.length} ca khúc phù hợp
        </p>
      </div>

      {/* Filter and Sort Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60">
        {/* Genre Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/bai-hat"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              !currentGenre
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            Tất cả thể loại
          </Link>
          {genres.map((g: any) => (
            <Link
              key={g._id}
              href={`/bai-hat?genre=${g._id}${currentSort ? `&sort=${currentSort}` : ''}`}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                currentGenre === g._id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {g.name}
            </Link>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Sắp xếp:</span>
          <Link
            href={`/bai-hat?sort=newest${currentGenre ? `&genre=${currentGenre}` : ''}`}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              currentSort === 'newest' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mới nhất
          </Link>
          <Link
            href={`/bai-hat?sort=listens${currentGenre ? `&genre=${currentGenre}` : ''}`}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              currentSort === 'listens' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Nghe nhiều
          </Link>
        </div>
      </div>

      {/* Song List */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-4 sm:p-6 divide-y divide-slate-800/40">
        {songs.map((song: any, index: number) => (
          <SongRow key={song._id} song={song} index={index} queue={songs} />
        ))}
        {songs.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            Không tìm thấy bài hát nào phù hợp với bộ lọc hiện tại.
          </div>
        )}
      </div>
    </div>
  );
}

