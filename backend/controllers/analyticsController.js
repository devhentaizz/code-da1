const songModel = require('../models/songModel');
const artistModel = require('../models/artistModel');
const userModel = require('../models/userModel');
const genreModel = require('../models/genreModel');

// Thống kê tổng quan cho Dashboard Admin
const getDashboardStats = async (req, res) => {
  try {
    const [totalSongs, totalArtists, totalGenres, totalUsers, playsAgg, topSongs, recentSongs] = await Promise.all([
      songModel.countDocuments({ status: { $ne: 'archived' } }),
      artistModel.countDocuments(),
      genreModel.countDocuments(),
      userModel.countDocuments(),
      songModel.aggregate([
        { $match: { status: { $ne: 'archived' } } },
        { $group: { _id: null, totalListens: { $sum: '$playCount' } } }
      ]),
      songModel.find({ status: { $ne: 'archived' } })
        .populate('artistIds', 'name slug')
        .sort({ playCount: -1 })
        .limit(5),
      songModel.find({ status: { $ne: 'archived' } })
        .populate('artistIds', 'name slug')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const totalListens = playsAgg.length > 0 ? playsAgg[0].totalListens : 0;

    const formattedTopSongs = topSongs.map(s => {
      const obj = s.toObject();
      obj.artist = obj.artistIds && obj.artistIds[0] ? obj.artistIds[0] : null;
      obj.listens = obj.playCount || 0;
      return obj;
    });

    const formattedRecentSongs = recentSongs.map(s => {
      const obj = s.toObject();
      obj.artist = obj.artistIds && obj.artistIds[0] ? obj.artistIds[0] : null;
      obj.listens = obj.playCount || 0;
      return obj;
    });

    res.json({
      totalSongs,
      totalArtists,
      totalGenres,
      totalUsers,
      totalListens,
      totalLikes: 0,
      topSongs: formattedTopSongs,
      recentSongs: formattedRecentSongs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats
};
