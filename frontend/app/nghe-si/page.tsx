import React from 'react';
import ArtistCard from '../components/ArtistCard';

const FALLBACK_ARTISTS = [
  {
    _id: 'artist_001',
    name: 'Minh Anh',
    slug: 'minh-anh',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    followersCount: 342000,
    isVerified: true,
  },
  {
    _id: 'artist_002',
    name: 'KAI',
    slug: 'kai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    followersCount: 510400,
    isVerified: true,
  },
  {
    _id: 'artist_003',
    name: 'Linh Chi',
    slug: 'linh-chi',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    followersCount: 185200,
    isVerified: true,
  },
  {
    _id: 'artist_004',
    name: 'Sơn Tùng M-TP',
    slug: 'son-tung-m-tp',
    avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
    followersCount: 8500000,
    isVerified: true,
  },
];

const getArtists = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  try {
    const res = await fetch(`${apiUrl}/artists?limit=100`, { cache: 'no-store' });
    if (!res.ok) return FALLBACK_ARTISTS;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : FALLBACK_ARTISTS;
  } catch (err) {
    console.error(err);
    return FALLBACK_ARTISTS;
  }
};

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-black text-white">Nghệ Sĩ & Ca Sĩ</h1>
        <p className="text-sm text-slate-400 mt-1">
          Theo dõi những giọng ca và nhà sản xuất âm nhạc hàng đầu
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {artists.map((artist: any) => (
          <ArtistCard key={artist._id} artist={artist} />
        ))}
      </div>
    </div>
  );
}
