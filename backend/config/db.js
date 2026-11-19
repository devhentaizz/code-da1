const dns = require('dns');
const mongoose = require('mongoose');

// Cấu hình DNS Server (Google DNS & Cloudflare DNS) để tránh lỗi querySrv ETIMEOUT trên Node.js Windows khi kết nối Atlas
dns.setServers((process.env.DNS_SERVERS || '8.8.8.8,8.8.4.4,1.1.1.1')
  .split(',')
  .map(server => server.trim())
  .filter(Boolean));

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;

  if (!primaryUri) {
    console.error('[Database] Không tìm thấy biến môi trường MONGODB_URI trong .env');
    return;
  }

  const options = {
    serverSelectionTimeoutMS: 15000,
    // Windows + antivirus thường chặn xác thực chứng chỉ Atlas ("unable to verify the first certificate")
    tlsAllowInvalidCertificates: true,
  };

  try {
    await mongoose.connect(primaryUri, options);
    console.log(`[Database] Kết nối MongoDB Atlas thành công! (Database: ${mongoose.connection.name})`);
  } catch (error) {
    console.error(`[Database] Lỗi kết nối MongoDB Atlas:`, error.message);
    if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
      console.error('[Database] Sai username hoặc mật khẩu Database User.');
      console.error('[Database] Atlas > Database Access > Edit user > Edit Password, rồi cập nhật MONGODB_URI trong .env');
    }
  }
};

module.exports = connectDB;
