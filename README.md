# WEBNHAC - NỀN TẢNG NGHE NHẠC TRỰC TUYẾN HIỆN ĐẠI

> **Được thiết kế và kế thừa kiến trúc chuyên nghiệp từ Dự án tốt nghiệp (`D-N-T-T-NGHI-P-main`), chuyển đổi sang hệ thống Nghe nhạc trực tuyến chuẩn mực Fullstack.**

---

## 1. Bảng So Sánh Kiến Trúc (Project 1 vs Project 2)

| Thành Phần | Dự Án 1 (`D-N-T-T-NGHI-P-main`) | Dự Án 2 (`webnhac`) |
| :--- | :--- | :--- |
| **Lĩnh vực** | Sàn thương mại điện tử (KaiduSmart) | Nền tảng Streaming Âm nhạc trực tuyến |
| **Backend Tech** | Node.js + Express + Mongoose (MVC) | Node.js + Express + Mongoose (MVC) |
| **Frontend Tech** | Next.js (App Router) + Tailwind CSS + TypeScript | Next.js (App Router) + Tailwind CSS + TypeScript |
| **Thực thể Danh mục** | `categories` (Điện thoại, Laptop, Phụ kiện) | `genres` (V-Pop, Rap Việt, Indie, Ballad, EDM...) |
| **Thực thể Cốt lõi** | `products` (Tên, giá, ảnh, mô tả, tồn kho) | `songs` (Tên bài hát, file mp3, ảnh bìa, ca sĩ, lời, lượt nghe) |
| **Thương hiệu / Tác giả** | Thương hiệu Apple | `artists` (Ca sĩ, nghệ sĩ, tiểu sử, avatar, người theo dõi) |
| **Bộ sưu tập** | Danh mục / Flash Sale | `albums` & `playlists` (Danh sách phát cá nhân, tuyển tập) |
| **Giỏ hàng / Đơn hàng** | `orders` (Mua hàng, thanh toán VNPAY) | `favorites` & `history` (Yêu thích, lịch sử nghe) |
| **Đánh giá** | `reviews` (Đánh giá sao sản phẩm) | `comments` (Bình luận bài hát thời gian thực) |
| **Trình phát** | Chi tiết xem sản phẩm | Trình phát nhạc toàn cục (`AudioPlayer`) phát nhạc liên tục không ngắt quãng |
| **Trang Quản Trị** | Admin quản lý sản phẩm, đơn hàng, người dùng | Admin quản lý bài hát (upload mp3/ảnh), ca sĩ, thể loại, thống kê |

---

## 2. Cấu Trúc Thư Mục Dự Án

```
webnhac/
├── backend/
│   ├── bin/
│   │   └── www                     # Script khởi chạy HTTP server cổng 5000
│   ├── config/
│   │   └── db.js                   # Cấu hình kết nối MongoDB (Atlas + Local fallback)
│   ├── controllers/                # Xử lý logic nghiệp vụ MVC
│   │   ├── analyticsController.js  # Thống kê số liệu Dashboard
│   │   ├── artistController.js     # CRUD Nghệ sĩ / Ca sĩ
│   │   ├── bannerController.js     # Banner quảng bá bài hát
│   │   ├── commentController.js    # Bình luận bài hát
│   │   ├── genreController.js      # CRUD Thể loại nhạc
│   │   ├── songController.js       # CRUD Bài hát, tăng lượt nghe, like
│   │   └── userController.js       # Đăng ký, đăng nhập JWT, yêu thích, lịch sử
│   ├── middleware/
│   │   ├── auth.js                 # Middleware xác thực JWT & phân quyền Admin
│   │   └── upload.js               # Multer upload file Audio (.mp3) và Ảnh (.jpg/.png)
│   ├── models/                     # Mongoose Schema
│   │   ├── albumModel.js
│   │   ├── artistModel.js
│   │   ├── bannerModel.js
│   │   ├── commentModel.js
│   │   ├── genreModel.js
│   │   ├── playlistModel.js
│   │   ├── songModel.js
│   │   └── userModel.js
│   ├── public/uploads/             # Thư mục lưu trữ nhạc và ảnh upload
│   ├── routes/                     # Định tuyến API
│   │   ├── analytics.js
│   │   ├── artists.js
│   │   ├── banners.js
│   │   ├── comments.js
│   │   ├── genres.js
│   │   ├── index.js
│   │   ├── songs.js
│   │   └── users.js
│   ├── .env                        # Biến môi trường Backend
│   ├── app.js                      # Cấu hình Express app & đăng ký routes
│   ├── package.json
│   └── seedDatabase.js             # Dữ liệu mẫu bài hát, ca sĩ, thể loại, user
│
└── frontend/
    ├── app/
    │   ├── admin/                  # Khu vực Quản trị viên
    │   │   ├── bai-hat/page.tsx    # Quản lý bài hát (Thêm với upload mp3, sửa, xóa)
    │   │   ├── nghe-si/page.tsx    # Quản lý ca sĩ
    │   │   ├── the-loai/page.tsx   # Quản lý thể loại
    │   │   ├── layout.tsx          # Thanh điều hướng riêng của Admin
    │   │   └── page.tsx            # Dashboard thống kê
    │   ├── bai-hat/
    │   │   ├── [id]/page.tsx       # Chi tiết bài hát, đĩa phát, lời bài hát, bình luận
    │   │   └── page.tsx            # Danh sách bài hát với bộ lọc thể loại & tìm kiếm
    │   ├── bxh/page.tsx            # Bảng xếp hạng Top 50 thịnh hành
    │   ├── components/             # Các component giao diện dùng chung
    │   │   ├── ArtistCard.tsx      # Thẻ đại diện ca sĩ tròn
    │   │   ├── AudioPlayer.tsx     # Trình phát nhạc thanh đáy (Play, Next, Seek, Volume)
    │   │   ├── BannerSlider.tsx    # Slider biểu ngữ bài hát hot
    │   │   ├── Header.tsx          # Tìm kiếm realtime, user profile dropdown
    │   │   ├── LyricsModal.tsx     # Cửa sổ xem toàn màn hình lời bài hát
    │   │   ├── Sidebar.tsx         # Menu điều hướng cố định bên trái
    │   │   ├── SongCard.tsx        # Card bài hát hiển thị dạng lưới
    │   │   └── SongRow.tsx         # Dòng bài hát (rank, tên, ca sĩ, time, like)
    │   ├── context/
    │   │   ├── AudioContext.tsx    # Quản lý trạng thái phát nhạc toàn ứng dụng
    │   │   └── AuthContext.tsx     # Quản lý đăng nhập, Token, phân quyền
    │   ├── login/page.tsx          # Trang Đăng nhập
    │   ├── register/page.tsx       # Trang Đăng ký
    │   ├── nghe-si/                # Danh sách & Trang nghệ sĩ
    │   ├── the-loai/               # Danh sách & Trang thể loại
    │   ├── thu-vien/page.tsx       # Bài hát yêu thích & Lịch sử nghe nhạc
    │   ├── globals.css             # Giao diện Dark Mode lấy cảm hứng Spotify
    │   ├── layout.tsx              # Root layout chứa AudioProvider, Sidebar, Player
    │   └── page.tsx                # Trang chủ trực quan
    ├── .env.local                  # NEXT_PUBLIC_API_URL=http://localhost:5000
    ├── next.config.mjs
    ├── package.json
    ├── tailwind.config.js
    └── tsconfig.json
```

---

## 3. Các Tính Năng Nổi Bật

1. **Trình phát nhạc toàn cục (`AudioPlayer`):**
   - Chạy nền xuyên suốt mọi thao tác chuyển trang, không làm gián đoạn bài hát đang nghe.
   - Hỗ trợ đầy đủ: Play/Pause, Next/Previous, Tua nhạc (Seekbar), Âm lượng (Volume & Mute), Lặp 1 bài / Lặp tất cả / Xáo trộn (Shuffle).
   - Tự động chuyển bài khi hết nhạc.
   - Xem Lời bài hát (`LyricsModal`) với hiệu ứng hiển thị hiện đại.
   - Tự động cộng lượt nghe (`listens`) và lưu vào lịch sử nghe nhạc của người dùng.

2. **Bảng Xếp Hạng & Khám Phá:**
   - Bảng xếp hạng Top bài hát theo lượt nghe thời gian thực (Huy hiệu Top 1, Top 2, Top 3 vàng/bạc/đồng).
   - Bộ lọc bài hát linh hoạt theo Thể loại, Ca sĩ, Tìm kiếm theo từ khóa.
   - Trang chi tiết bài hát có phần Bình luận trực tiếp.

3. **Cá nhân hóa người dùng:**
   - Đăng ký, đăng nhập bảo mật với JWT và mã hóa mật khẩu bcrypt.
   - Thả tim lưu bài hát yêu thích.
   - Theo dõi lịch sử nghe nhạc gần đây (lên đến 50 bài hát).

4. **Trang Quản Trị Viên (Admin):**
   - Dashboard báo cáo thống kê: Tổng bài hát, Ca sĩ, Thể loại, Thành viên, Lượt nghe.
   - Thêm bài hát mới hỗ trợ **tải lên trực tiếp file nhạc MP3** và **ảnh bìa** hoặc nhập link URL.
   - Quản lý danh mục Thể loại và Ca sĩ nghệ sĩ.

---

## 4. Hướng Dẫn Cài Đặt & Khởi Chạy

### Bước 1: Khởi động Backend
```bash
cd backend

# Cài đặt các thư viện cần thiết
npm install

# Khởi tạo dữ liệu bài hát & ca sĩ mẫu ban đầu
npm run seed

# Khởi chạy server Backend (chạy ở cổng 5000)
npm start
```
> Server API sẽ chạy tại: `http://localhost:5000`

### Bước 2: Khởi động Frontend
Mở một cửa sổ Terminal mới:
```bash
cd frontend

# Cài đặt các thư viện
npm install

# Chạy ứng dụng giao diện Next.js
npm run dev
```
> Truy cập website tại: `http://localhost:3000`

---

## 5. Tài Khoản Thử Nghiệm

- **Tài khoản Quản trị (Admin):**
  - Email: `admin@webnhac.com`
  - Mật khẩu: `123456`
  - Quyền hạn: Toàn quyền truy cập Bảng quản trị `/admin`, thêm/sửa/xóa bài hát, ca sĩ, thể loại.

- **Tài khoản Người dùng (User):**
  - Email: `user@webnhac.com`
  - Mật khẩu: `123456`
  - Quyền hạn: Nghe nhạc, thả tim yêu thích, bình luận, xem thư viện cá nhân.

