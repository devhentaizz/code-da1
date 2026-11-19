const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập để thực hiện chức năng này' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'webnhac_secret_key_2026_super_secure_token');
    
    const user = await userModel.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'Tài khoản không tồn tại' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' });
  }
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Bạn không có quyền quản trị viên' });
    }
  });
};

module.exports = {
  verifyToken,
  verifyAdmin
};

