const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    name: 'WebNhac API - Nền tảng nghe nhạc trực tuyến',
    version: '1.0.0',
    status: 'Running'
  });
});

module.exports = router;

