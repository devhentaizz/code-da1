const songModel = require('../models/songModel');
const artistModel = require('../models/artistModel');
const lyricsModel = require('../models/lyricsModel');
const playbackStatsModel = require('../models/playbackStatsModel');
const slugify = require('slugify');

// Format bài hát để tương thích hoàn hảo cả 2 dạng: artistIds và artist
const formatSong = (s) => {
  const songObj = s.toObject ? s.toObject() : { ...s };
  songObj.artist = songObj.artistIds && songObj.artistIds.length > 0
    ? songObj.artistIds[0]
    : songObj.artist || null;
  songObj.genre = songObj.genreIds && songObj.genreIds.length > 0 ? songObj.genreIds[0] : null;
  songObj.listens = songObj.playCount || 0;
  songObj.likes = songObj.likes || 0;
  return songObj;
};

const getYouTubeId = (value) => {
  const source = String(value || '').trim();
  if (/^[\w-]{11}$/.test(source)) return source;

  try {
    const url = new URL(source);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] || '';
    }
    if (['youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(host)) {
      const videoId = url.searchParams.get('v');
      if (videoId) return videoId;
      const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/);
      return match?.[1] || '';
    }
  } catch {
    return '';
  }
  return '';
};

// Lấy danh sách bài hát (có lọc thể loại, nghệ sĩ, tìm kiếm, sắp xếp)
const getAllSongs = async (req, res) => {
  try {
    const { keyword, genre, artist, sort, limit = 50, page = 1 } = req.query;
    const filter = { status: { $ne: 'archived' } };

    if (genre) {
      filter.genreIds = genre;
    }

    if (artist) {
      filter.artistIds = artist;
    }

    if (keyword && String(keyword).trim()) {
      const searchTerm = String(keyword).trim();
      const normalizedSlug = slugify(searchTerm, { lower: true, locale: 'vi' });
      const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matchingArtists = normalizedSlug
        ? await artistModel.find({
            slug: { $regex: escapeRegex(normalizedSlug), $options: 'i' }
          }).select('_id').lean()
        : [];

      filter.$or = [
        ...(searchTerm
          ? [{ title: { $regex: escapeRegex(searchTerm), $options: 'i' } }]
          : []),
        ...(normalizedSlug
          ? [{ slug: { $regex: escapeRegex(normalizedSlug), $options: 'i' } }]
          : []),
        ...(matchingArtists.length
          ? [{ artistIds: { $in: matchingArtists.map((matchingArtist) => matchingArtist._id) } }]
          : [])
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'listens' || sort === 'playCount') {
      sortOptions = { playCount: -1 };
    } else if (sort === 'title') {
      sortOptions = { title: 1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [songs, total] = await Promise.all([
      songModel.find(filter)
        .populate('artistIds', 'name slug avatar country')
        .populate('genreIds', 'name slug coverImage')
        .populate('albumId', 'title slug coverImage')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      songModel.countDocuments(filter)
    ]);

    res.json({
      songs: songs.map(formatSong),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Chi tiết 1 bài hát (kèm lời bài hát từ collection lyrics)
const getSongById = async (req, res) => {
  try {
    const song = await songModel.findById(req.params.id)
      .populate('artistIds', 'name slug avatar bio country isVerified')
      .populate('genreIds', 'name slug description coverImage')
      .populate('albumId', 'title slug coverImage releaseDate description');

    if (!song) {
      return res.status(404).json({ message: 'Không tìm thấy bài hát' });
    }

    const formatted = formatSong(song);

    // Tìm lời bài hát từ collection lyrics
    const lyricDoc = await lyricsModel.findOne({ songId: song._id });
    if (lyricDoc) {
      formatted.lyrics = lyricDoc.content || (lyricDoc.lines ? lyricDoc.lines.map(l => l.text).join('\n') : '');
      formatted.lyricsData = lyricDoc;
    } else {
      formatted.lyrics = '';
    }

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy Top bài hát thịnh hành (Trending / BXH)
const getTrendingSongs = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const songs = await songModel.find({ status: { $ne: 'archived' } })
      .populate('artistIds', 'name slug avatar')
      .populate('genreIds', 'name slug')
      .sort({ playCount: -1 })
      .limit(limit);

    res.json(songs.map(formatSong));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy bài hát mới / nổi bật
const getFeaturedSongs = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const songs = await songModel.find({ status: { $ne: 'archived' } })
      .populate('artistIds', 'name slug avatar')
      .populate('genreIds', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(songs.map(formatSong));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo bài hát mới (Hỗ trợ upload audio & ảnh bìa)
const createSong = async (req, res) => {
  try {
    const { title, artist, genre, album, duration, lyrics, audioUrl, coverImage } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Tên bài hát là bắt buộc' });
    }

    let finalAudioUrl = audioUrl || '';
    let youtubeId = getYouTubeId(audioUrl);
    let finalCoverImage = coverImage;

    if (req.files) {
      if (req.files.audio && req.files.audio[0]) {
        finalAudioUrl = `/uploads/${req.files.audio[0].filename}`;
        youtubeId = '';
      }
      if (req.files.image && req.files.image[0]) {
        finalCoverImage = `/uploads/${req.files.image[0].filename}`;
      }
    }

    if (!finalAudioUrl && !youtubeId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp link audio hoặc tải lên file âm thanh' });
    }
    if (youtubeId) finalAudioUrl = '';

    const songId = `song_${Date.now()}`;
    const slug = slugify(title, { lower: true, locale: 'vi', remove: /[*+~.()'"!:@]/g });

    const newSong = new songModel({
      _id: songId,
      title,
      slug,
      artistIds: artist ? [artist] : [],
      albumId: album || null,
      genreIds: genre ? [genre] : [],
      audioUrl: finalAudioUrl,
      youtubeId,
      coverImage: finalCoverImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
      duration: Number(duration) || 200,
      playCount: 0,
      status: 'published'
    });

    const savedSong = await newSong.save();

    // Lưu lời bài hát nếu có
    if (lyrics) {
      await lyricsModel.create({
        _id: `lyrics_${Date.now()}`,
        songId: savedSong._id,
        language: 'vi',
        synced: false,
        content: lyrics
      });
    }

    const populated = await songModel.findById(savedSong._id)
      .populate('artistIds', 'name slug avatar')
      .populate('genreIds', 'name slug');

    res.status(201).json(formatSong(populated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật bài hát
const updateSong = async (req, res) => {
  try {
    const { title, artist, genre, album, duration, lyrics, status } = req.body;
    const updateData = {};

    if (title) {
      updateData.title = title;
      updateData.slug = slugify(title, { lower: true, locale: 'vi', remove: /[*+~.()'"!:@]/g });
    }
    if (artist) updateData.artistIds = [artist];
    if (genre) updateData.genreIds = [genre];
    if (album !== undefined) updateData.albumId = album || null;
    if (duration !== undefined) updateData.duration = Number(duration);
    if (status) updateData.status = status;
    if (req.body.audioUrl !== undefined) {
      const youtubeId = getYouTubeId(req.body.audioUrl);
      updateData.audioUrl = youtubeId ? '' : req.body.audioUrl.trim();
      updateData.youtubeId = youtubeId;
    }
    if (req.body.coverImage) updateData.coverImage = req.body.coverImage;

    if (req.files) {
      if (req.files.audio && req.files.audio[0]) {
        updateData.audioUrl = `/uploads/${req.files.audio[0].filename}`;
        updateData.youtubeId = '';
      }
      if (req.files.image && req.files.image[0]) {
        updateData.coverImage = `/uploads/${req.files.image[0].filename}`;
      }
    }

    const updated = await songModel.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate('artistIds', 'name slug avatar')
     .populate('genreIds', 'name slug')
     .populate('albumId', 'title slug coverImage');

    // Cập nhật lời bài hát
    if (lyrics !== undefined) {
      await lyricsModel.findOneAndUpdate(
        { songId: req.params.id },
        { $set: { content: lyrics } },
        { upsert: true }
      );
    }

    res.json(formatSong(updated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa bài hát
const deleteSong = async (req, res) => {
  try {
    await Promise.all([
      songModel.findByIdAndDelete(req.params.id),
      lyricsModel.deleteMany({ songId: req.params.id })
    ]);
    res.json({ message: 'Xóa bài hát thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tăng số lượt nghe khi phát nhạc & lưu vào playback_stats
const incrementListen = async (req, res) => {
  try {
    const song = await songModel.findByIdAndUpdate(
      req.params.id,
      { $inc: { playCount: 1 } },
      { new: true }
    );

    // Đồng bộ vào bảng playback_stats theo ngày
    const today = new Date().toISOString().split('T')[0];
    const statId = `stat_${req.params.id}_${today}`;
    await playbackStatsModel.findByIdAndUpdate(
      statId,
      {
        $setOnInsert: { _id: statId, songId: req.params.id, date: today },
        $inc: { playCount: 1, uniqueListeners: 1 }
      },
      { upsert: true, new: true }
    ).catch(() => {});

    res.json({ playCount: song ? song.playCount : 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like bài hát (tương thích)
const toggleLike = async (req, res) => {
  try {
    const { action } = req.body;
    const inc = action === 'unlike' ? -1 : 1;
    const song = await songModel.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: inc } },
      { new: true }
    );
    res.json({ likes: song ? Math.max(0, song.likes || 0) : 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllSongs,
  getSongById,
  getTrendingSongs,
  getFeaturedSongs,
  createSong,
  updateSong,
  deleteSong,
  incrementListen,
  toggleLike
};
