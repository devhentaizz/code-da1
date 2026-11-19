/**
 * Script test kết nối MongoDB Atlas
 * Chạy: node test-atlas.js
 * Hoặc: node test-atlas.js "mongodb+srv://user:pass@cluster.mongodb.net/webnhac"
 */
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
const mongoose = require('mongoose');

// Dùng URI từ argument hoặc từ .env
const uri = process.argv[2] || process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ Không có URI. Dùng: node test-atlas.js "mongodb+srv://..."');
  process.exit(1);
}

console.log('🔌 Đang kết nối...');
console.log('URI (masked):', uri.replace(/:([^@:]+)@/, ':***@'));

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 20000,
  tlsAllowInvalidCertificates: true,
})
  .then(async () => {
    console.log('✅ KẾT NỐI THÀNH CÔNG!');
    console.log('📂 Database:', mongoose.connection.name);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📦 Database có ${collections.length} collections:`);
    collections.forEach(c => console.log(`   - ${c.name}`));
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(e => {
    console.log('❌ LỖI KẾT NỐI:', e.message);
    if (e.message.includes('bad auth') || e.message.includes('authentication failed')) {
      console.log('\n💡 Sai username hoặc password (ô Description trên Atlas không phải mật khẩu).');
      console.log('   → Database Access > Edit user > Edit Password');
      console.log('   → Copy mật khẩu mới vào MONGODB_URI trong file .env');
    } else if (e.message.includes('ETIMEOUT') || e.message.includes('querySrv')) {
      console.log('\n💡 Timeout DNS hoặc firewall chặn port 27017');
      console.log('   → Network Access > thêm 0.0.0.0/0');
    } else if (e.message.includes('ENOTFOUND')) {
      console.log('\n💡 Không phân giải được hostname Atlas');
    }
    process.exit(1);
  });

