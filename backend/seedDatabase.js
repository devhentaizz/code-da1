require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import all models
const userModel = require('./models/userModel');
const artistModel = require('./models/artistModel');
const genreModel = require('./models/genreModel');
const albumModel = require('./models/albumModel');
const songModel = require('./models/songModel');
const playlistModel = require('./models/playlistModel');
const favoriteModel = require('./models/favoriteModel');
const listeningHistoryModel = require('./models/listeningHistoryModel');
const lyricsModel = require('./models/lyricsModel');
const commentModel = require('./models/commentModel');
const subscriptionModel = require('./models/subscriptionModel');
const playbackStatsModel = require('./models/playbackStatsModel');
const bannerModel = require('./models/bannerModel');

// Audio demo URLs trực tiếp phát được
const demoAudioStreams = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
];

const seedDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI không tìm thấy trong file .env');
    process.exit(1);
  }

  console.log('🔄 Đang kết nối tới MongoDB Atlas...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 20000 });
  console.log('✅ Đã kết nối MongoDB thành công!\n');

  console.log('🧹 Đang làm sạch các collection cũ...');
  await Promise.all([
    userModel.deleteMany({}),
    artistModel.deleteMany({}),
    genreModel.deleteMany({}),
    albumModel.deleteMany({}),
    songModel.deleteMany({}),
    playlistModel.deleteMany({}),
    favoriteModel.deleteMany({}),
    listeningHistoryModel.deleteMany({}),
    lyricsModel.deleteMany({}),
    commentModel.deleteMany({}),
    subscriptionModel.deleteMany({}),
    playbackStatsModel.deleteMany({}),
    bannerModel.deleteMany({}),
  ]);
  console.log('✅ Đã xóa trắng dữ liệu cũ.\n');

  const salt = await bcrypt.genSalt(10);
  const commonHash = await bcrypt.hash('123456', salt);

  // 1. Users (Minh Nguyễn PRO & Admin)
  console.log('[Seed 1/12] Đồng bộ Users...');
  const users = [
    {
      _id: 'user_001',
      username: 'Minh Nguyễn',
      email: 'minh@example.com',
      passwordHash: commonHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      role: 'user',
      status: 'active'
    },
    {
      _id: 'user_002',
      username: 'Admin Melodix',
      email: 'admin@example.com',
      passwordHash: commonHash,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      role: 'admin',
      status: 'active'
    }
  ];
  await userModel.insertMany(users);

  // 2. Artists (KAI, Minh Anh, Linh Chi, Sơn Tùng M-TP)
  console.log('[Seed 2/12] Đồng bộ Artists...');
  const artists = [
    {
      _id: 'artist_001',
      name: 'Minh Anh',
      slug: 'minh-anh',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Nữ ca sĩ trẻ nổi bật với chất giọng trong trẻo mang hơi thở Pop & Indie hiện đại. Từng bước chinh phục khán giả Việt Nam qua những ca khúc chạm đến trái tim.',
      country: 'Vietnam',
      isVerified: true
    },
    {
      _id: 'artist_002',
      name: 'KAI',
      slug: 'kai',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Nghệ sĩ nhạc điện tử tiên phong, kết hợp âm hưởng tương lai synthwave và nhịp bass sôi động. Được vinh danh là một trong những producer tiên phong mang chất liệu âm thanh futuristic electronic tiếp cận người nghe hiện đại.',
      country: 'Vietnam',
      isVerified: true
    },
    {
      _id: 'artist_003',
      name: 'Linh Chi',
      slug: 'linh-chi',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      bio: 'Giọng ca Ballad & R&B đầy cảm xúc, chinh phục khán giả bằng những giai điệu sâu lắng và ca từ chân thật.',
      country: 'Vietnam',
      isVerified: true
    },
    {
      _id: 'artist_004',
      name: 'Sơn Tùng M-TP',
      slug: 'son-tung-m-tp',
      avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
      bio: 'Sơn Tùng M-TP là ca sĩ, nhạc sĩ và nhà sản xuất âm nhạc hàng đầu Việt Nam. Nổi tiếng với phong cách trình diễn cuốn hút, khả năng sáng tác đỉnh cao và hàng loạt bản hit phá vỡ mọi kỷ lục nghe nhạc. Anh đã định hình lại bộ mặt nhạc pop Việt Nam qua hơn một thập kỷ hoạt động nghệ thuật.',
      country: 'Vietnam',
      isVerified: true
    }
  ];
  await artistModel.insertMany(artists);

  // 3. Genres
  console.log('[Seed 3/12] Đồng bộ Genres...');
  const genres = [
    {
      _id: 'genre_001',
      name: 'EDM & Electronic',
      slug: 'edm-electronic',
      description: 'Giai điệu điện tử sôi động, Synthwave và Techno.',
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'genre_002',
      name: 'Pop & Indie',
      slug: 'pop-indie',
      description: 'Giai điệu nhẹ nhàng, mộc mạc và gần gũi.',
      coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'genre_003',
      name: 'Ballad & R&B',
      slug: 'ballad-rnb',
      description: 'Giai điệu tình ca da diết, trầm lắng.',
      coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'genre_004',
      name: 'Lo-Fi Chill & Ambient',
      slug: 'lofi-ambient',
      description: 'Âm thanh thư giãn giúp tập trung và giải tỏa căng thẳng.',
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
    }
  ];
  await genreModel.insertMany(genres);

  // 4. Albums (Đêm Thành Phố, Thanh Xuân, Khoảng Lặng, Chúng Ta, Sky Tour)
  console.log('[Seed 4/12] Đồng bộ Albums...');
  const albums = [
    {
      _id: 'album_001',
      title: 'Đêm Thành Phố',
      slug: 'dem-thanh-pho',
      artistIds: ['artist_002'],
      releaseDate: '2026-03-15',
      description: 'Album synthwave điện tử đỉnh cao với âm thanh 24-bit 192kHz.',
      coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'album_002',
      title: 'Thanh Xuân',
      slug: 'thanh-xuan',
      artistIds: ['artist_001'],
      releaseDate: '2025-11-20',
      description: 'Album kể lại những năm tháng tươi đẹp và khát khao tuổi trẻ.',
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'album_003',
      title: 'Khoảng Lặng',
      slug: 'khoang-lang',
      artistIds: ['artist_003'],
      releaseDate: '2024-08-10',
      description: 'Những khoảng lặng cần thiết giữa nhịp sống hối hả.',
      coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'album_004',
      title: 'Chúng Ta',
      slug: 'chung-ta',
      artistIds: ['artist_004'],
      releaseDate: '2021-04-30',
      description: 'Album đầu tay của Sơn Tùng M-TP với loạt hit để đời.',
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'album_005',
      title: 'Sky Tour',
      slug: 'sky-tour',
      artistIds: ['artist_004'],
      releaseDate: '2019-07-20',
      description: 'Live concert album từ tour diễn Sky Tour 2019 huyền thoại.',
      coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80'
    }
  ];
  await albumModel.insertMany(albums);

  // 5. Songs (Exact list from screenshots)
  console.log('[Seed 5/12] Đồng bộ Songs...');
  const songs = [
    {
      _id: 'song_001',
      title: 'Ánh Đèn',
      slug: 'anh-den',
      artistIds: ['artist_002'],
      genreIds: ['genre_001'],
      albumId: 'album_001',
      duration: 195,
      playCount: 2458,
      youtubeId: '9bZkp7q19f0',
      coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      status: 'active'
    },
    {
      _id: 'song_002',
      title: 'Ngày Mới',
      slug: 'ngay-moi',
      artistIds: ['artist_001'],
      genreIds: ['genre_002'],
      albumId: 'album_002',
      duration: 218,
      playCount: 1210,
      youtubeId: 'dQw4w9WgXcQ',
      coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      status: 'active'
    },
    {
      _id: 'song_003',
      title: 'Nhịp Đêm',
      slug: 'nhip-dem',
      artistIds: ['artist_002'],
      genreIds: ['genre_001'],
      albumId: 'album_001',
      duration: 188,
      playCount: 1800,
      youtubeId: 'RgKAFK5djSk',
      coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
      status: 'active'
    },
    {
      _id: 'song_004',
      title: 'Mưa Đêm',
      slug: 'mua-dem',
      artistIds: ['artist_001'],
      genreIds: ['genre_002'],
      albumId: 'album_002',
      duration: 245,
      playCount: 850,
      youtubeId: 'kffacxfA7G4',
      coverImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      status: 'active'
    },
    {
      _id: 'song_005',
      title: 'Lời Chưa Nói',
      slug: 'loi-chua-noi',
      artistIds: ['artist_003'],
      genreIds: ['genre_003'],
      albumId: 'album_003',
      duration: 232,
      playCount: 1620,
      youtubeId: 'Zi_XLOBDo_Y',
      coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&q=80',
      status: 'active'
    },
    {
      _id: 'song_006',
      title: 'Đường Về',
      slug: 'duong-ve',
      artistIds: ['artist_003'],
      genreIds: ['genre_003'],
      albumId: 'album_003',
      duration: 204,
      playCount: 940,
      youtubeId: 'hT_nvWreIhg',
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
      status: 'active'
    },
    {
      _id: 'song_007',
      title: 'Điệu Nhảy Thành Thị',
      slug: 'dieu-nhay-thanh-thi',
      artistIds: ['artist_002'],
      genreIds: ['genre_001'],
      albumId: 'album_001',
      duration: 174,
      playCount: 1150,
      youtubeId: 'OPf0YbXqDm0',
      coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
      status: 'active'
    },
    {
      _id: 'song_008',
      title: 'Cyber Glow',
      slug: 'cyber-glow',
      artistIds: ['artist_002'],
      genreIds: ['genre_001'],
      albumId: 'album_001',
      duration: 220,
      playCount: 980,
      youtubeId: '60ItHLz5WEA',
      coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      status: 'active'
    },
    // Sơn Tùng M-TP songs
    {
      _id: 'song_009',
      title: 'Chúng Ta Của Tương Lai',
      slug: 'chung-ta-cua-tuong-lai',
      artistIds: ['artist_004'],
      genreIds: ['genre_002'],
      albumId: 'album_004',
      duration: 263,
      playCount: 85000000,
      youtubeId: '2D3GBECd4bA',
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
      status: 'active'
    },
    {
      _id: 'song_010',
      title: 'Đừng Làm Trái Tim Anh Đau',
      slug: 'dung-lam-trai-tim-anh-dau',
      artistIds: ['artist_004'],
      genreIds: ['genre_002'],
      albumId: 'album_005',
      duration: 248,
      playCount: 72000000,
      youtubeId: 'bKDdT_nyP54',
      coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      status: 'active'
    },
    {
      _id: 'song_011',
      title: 'Lạc Trôi',
      slug: 'lac-troi',
      artistIds: ['artist_004'],
      genreIds: ['genre_002'],
      albumId: 'album_005',
      duration: 255,
      playCount: 68000000,
      youtubeId: '5TkMDh_DP0Y',
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
      status: 'active'
    },
    {
      _id: 'song_012',
      title: 'Nơi Này Có Anh',
      slug: 'noi-nay-co-anh',
      artistIds: ['artist_004'],
      genreIds: ['genre_002'],
      albumId: 'album_004',
      duration: 238,
      playCount: 61000000,
      youtubeId: '0p_N3NqUGPE',
      coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
      status: 'active'
    },
    {
      _id: 'song_013',
      title: 'Có Chắc Yêu Là Đây',
      slug: 'co-chac-yeu-la-day',
      artistIds: ['artist_004'],
      genreIds: ['genre_002'],
      albumId: 'album_004',
      duration: 222,
      playCount: 54000000,
      youtubeId: 'V7jHZuSMhII',
      coverImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&q=80',
      status: 'active'
    }
  ];
  await songModel.insertMany(songs);

  // 6. Playlists (Exact from Image 4)
  console.log('[Seed 6/12] Đồng bộ Playlists...');
  const playlists = [
    {
      _id: 'playlist_001',
      name: 'Nhịp điệu điện tử',
      userId: 'user_001',
      description: 'Tuyển tập EDM, Deep House và Melodic Techno đốt cháy năng lượng.',
      coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
      visibility: 'public',
      songIds: ['song_001', 'song_003', 'song_007', 'song_008']
    },
    {
      _id: 'playlist_002',
      name: 'Nhạc thư giãn',
      userId: 'user_001',
      description: 'Thả lỏng tinh thần cùng các thanh âm Lo-Fi và Ambient nhẹ nhàng.',
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      visibility: 'public',
      songIds: ['song_002', 'song_004', 'song_005', 'song_006']
    },
    {
      _id: 'playlist_fav',
      name: 'Nhạc yêu thích',
      userId: 'user_001',
      description: 'Những bài hát mình thường nghe mỗi ngày khi làm việc và thư giãn. Tuyển tập âm hưởng lo-fi, synthwave và indie pop lắng đọng.',
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      visibility: 'public',
      songIds: ['song_001', 'song_002', 'song_004', 'song_005', 'song_006', 'song_003']
    }
  ];
  await playlistModel.insertMany(playlists);

  // 7. Favorites
  console.log('[Seed 7/12] Đồng bộ Favorites...');
  const favorites = [
    { _id: 'fav_001', userId: 'user_001', songId: 'song_001' },
    { _id: 'fav_002', userId: 'user_001', songId: 'song_002' },
    { _id: 'fav_003', userId: 'user_001', songId: 'song_003' },
    { _id: 'fav_004', userId: 'user_001', songId: 'song_004' }
  ];
  await favoriteModel.insertMany(favorites);

  // 8. Listening History
  console.log('[Seed 8/12] Đồng bộ Listening History...');
  const history = [
    { _id: 'hist_001', userId: 'user_001', songId: 'song_001', progressSeconds: 195, completed: true },
    { _id: 'hist_002', userId: 'user_001', songId: 'song_002', progressSeconds: 100, completed: false },
    { _id: 'hist_003', userId: 'user_001', songId: 'song_003', progressSeconds: 188, completed: true }
  ];
  await listeningHistoryModel.insertMany(history);

  // 9. Lyrics
  console.log('[Seed 9/12] Đồng bộ Lyrics...');
  const lyricsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'webnhac_mongodb_data/lyrics.json'), 'utf8'));
  await lyricsModel.insertMany(lyricsData);

  // 10. Comments
  console.log('[Seed 10/12] Đồng bộ Comments...');
  const comments = [
    {
      _id: 'comment_001',
      userId: 'user_001',
      songId: 'song_001',
      content: 'Chất lượng âm thanh 24-bit 192kHz nghe bằng tai nghe kiểm âm thực sự quá đỉnh!',
      status: 'visible'
    }
  ];
  await commentModel.insertMany(comments);

  // 11. Subscriptions
  console.log('[Seed 11/12] Đồng bộ Subscriptions...');
  const subscriptions = [
    {
      _id: 'subscription_001',
      userId: 'user_001',
      plan: 'premium',
      status: 'active',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      provider: 'melodix_vip'
    }
  ];
  await subscriptionModel.insertMany(subscriptions);

  // 12. Playback Stats
  console.log('[Seed 12/12] Đồng bộ Playback Stats...');
  const stats = [
    {
      _id: 'stat_001',
      songId: 'song_001',
      date: new Date().toISOString().split('T')[0],
      playCount: 2458,
      uniqueListeners: 1820
    }
  ];
  await playbackStatsModel.insertMany(stats);

  // Banners
  console.log('[Seed Extra] Tạo Banners...');
  const banners = [
    {
      _id: 'banner_001',
      title: 'Ánh Đèn & Thanh Âm Đô Thị',
      subtitle: 'Album Đêm Thành Phố / KAI - Master Hi-Res 24-bit 192kHz',
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1400&q=80',
      link: '/bai-hat/song_001',
      order: 1,
      isActive: true
    }
  ];
  await bannerModel.insertMany(banners);

  console.log('\n======================================================');
  console.log('🎉 ĐỒNG BỘ 100% MELODIX AUDIOPHILE STUDIO THÀNH CÔNG!');
  console.log('======================================================');
  console.log(`👤 Users: ${users.length} tài khoản (Minh Nguyễn PRO & Admin)`);
  console.log(`🎤 Artists: KAI (Synthwave), Minh Anh (Pop), Linh Chi (Ballad)`);
  console.log(`💿 Albums: Đêm Thành Phố, Thanh Xuân, Khoảng Lặng`);
  console.log(`🎵 Songs: ${songs.length} bài hát (Ánh Đèn, Ngày Mới, Nhịp Đêm, Mưa Đêm...)`);
  console.log(`📑 Playlists: Nhạc yêu thích, Nhịp điệu điện tử, Nhạc thư giãn`);
  console.log('======================================================\n');

  await mongoose.disconnect();
  process.exit(0);
};

seedDB().catch((err) => {
  console.error('❌ [Seed Error]:', err);
  process.exit(1);
});
