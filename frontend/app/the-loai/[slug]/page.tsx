import React from 'react';
import SongRow from '../../components/SongRow';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const fallbackGenres: Record<string, any> = {
  'edm-electronic': {
    genre: {
      name: 'EDM & Electronic',
      description: 'Synthwave, Deep House, Melodic Techno đầy năng lượng',
      color: '#0df580',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80'
    },
    songs: [
      { _id: 'song_001', title: 'Ánh Đèn', artist: 'KAI', duration: 195, playCount: 2458, coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { _id: 'song_003', title: 'Nhịp Đêm', artist: 'KAI', duration: 188, playCount: 1800, coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=300&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' }
    ]
  },
  'pop-indie': {
    genre: {
      name: 'Pop & Indie',
      description: 'Giai điệu tươi mới, bay bổng và gần gũi',
      color: '#38bdf8',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80'
    },
    songs: [
      { _id: 'song_002', title: 'Ngày Mới', artist: 'Minh Anh', duration: 218, playCount: 1210, coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
      { _id: 'song_004', title: 'Mưa Đêm', artist: 'Minh Anh', duration: 245, playCount: 850, coverImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
    ]
  },
  'ballad-rnb': {
    genre: {
      name: 'Ballad & R&B',
      description: 'Những bản tình ca sâu lắng và đầy tự sự',
      color: '#f43f5e',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80'
    },
    songs: [
      { _id: 'song_005', title: 'Lời Chưa Nói', artist: 'Linh Chi', duration: 232, playCount: 1620, coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=300&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
      { _id: 'song_006', title: 'Đường Về', artist: 'Linh Chi', duration: 204, playCount: 940, coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' }
    ]
  }
};

const getGenreData = async (slug: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  try {
    const res = await fetch(`${apiUrl}/genres/${slug}`, { cache: 'no-store' });
    if (!res.ok) return fallbackGenres[slug] || fallbackGenres['edm-electronic'];
    return await res.json();
  } catch (err) {
    return fallbackGenres[slug] || fallbackGenres['edm-electronic'];
  }
};

export default async function GenreDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = (await getGenreData(slug)) || fallbackGenres['edm-electronic'];
  const { genre, songs = [] } = data;
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
  const genreColor = genre.color || '#0df580';
  const genreImage = genre.coverImage || genre.image;
  const genreImageUrl = genreImage?.startsWith('/uploads/')
    ? `${apiUrl}${genreImage}`
    : genreImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div
        className="relative rounded-3xl p-8 sm:p-12 overflow-hidden shadow-2xl border-2"
        style={{ backgroundColor: '#10161f', borderColor: genreColor }}
      >
        <img
          src={genreImageUrl}
          alt={genre.name}
          className="absolute inset-0 w-full h-full object-cover opacity-30 filter blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090d11] via-[#090d11]/50 to-transparent" />

        <div className="relative z-10 max-w-xl">
          <span className="px-3 py-1 bg-[#0df580]/15 text-[#0df580] border border-[#0df580]/30 text-xs font-black rounded-full uppercase tracking-widest inline-block mb-3">
            Thể Loại Nhạc
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white drop-shadow-md">
            {genre.name}
          </h1>
          <p className="text-sm sm:text-base text-[#8ea0b4] mt-2">
            {genre.description}
          </p>
        </div>
      </div>

      {/* Song List */}
      <div
        className="bg-[#10161f] border rounded-3xl p-4 sm:p-6 divide-y divide-[#17202b]"
        style={{ borderColor: genreColor }}
      >
        <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#6b7c93]">
          Danh Sách Bài Hát Thuộc Thể Loại
        </div>

        {songs.map((song: any, index: number) => (
          <SongRow key={song._id} song={song} index={index} queue={songs} />
        ))}

        {songs.length === 0 && (
          <div className="text-center py-16 text-[#55657a] text-sm">
            Chưa có bài hát nào thuộc thể loại này.
          </div>
        )}
      </div>
    </div>
  );
}
