require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const connectDB = require('./config/db');

// Khởi chạy kết nối Database
connectDB();

// Khởi tạo router
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const songsRouter = require('./routes/songs');
const artistsRouter = require('./routes/artists');
const genresRouter = require('./routes/genres');
const albumsRouter = require('./routes/albums');
const playlistsRouter = require('./routes/playlists');
const commentsRouter = require('./routes/comments');
const bannersRouter = require('./routes/banners');
const analyticsRouter = require('./routes/analytics');
const subscriptionsRouter = require('./routes/subscriptions');

const app = express();

// Middlewares cơ bản
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// Phục vụ thư mục public (đặc biệt là public/uploads cho nhạc và ảnh)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Đăng ký các endpoints
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/songs', songsRouter);
app.use('/artists', artistsRouter);
app.use('/genres', genresRouter);
app.use('/albums', albumsRouter);
app.use('/playlists', playlistsRouter);
app.use('/comments', commentsRouter);
app.use('/banners', bannersRouter);
app.use('/analytics', analyticsRouter);
app.use('/subscriptions', subscriptionsRouter);

// Bắt lỗi 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Không tìm thấy API endpoint này' });
});

// Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.error('[Error Handler]:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Lỗi máy chủ nội bộ',
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;

