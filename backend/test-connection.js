require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
console.log('URI (masked):', uri.replace(/:([^@]+)@/, ':***@'));

mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 })
  .then(() => {
    console.log('✅ KẾT NỐI THÀNH CÔNG!');
    return mongoose.disconnect();
  })
  .then(() => process.exit(0))
  .catch(e => {
    console.log('❌ LỖI:', e.message);
    process.exit(1);
  });

