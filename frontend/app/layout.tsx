import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AudioPlayer from './components/AudioPlayer';
import LyricsModal from './components/LyricsModal';
import QueueDrawer from './components/QueueDrawer';

export const metadata: Metadata = {
  title: 'WebNhac - Nền Tảng Nghe Nhạc Trực Tuyến Đỉnh Cao',
  description: 'Trải nghiệm nghe nhạc trực tuyến chất lượng cao, cập nhật bảng xếp hạng hot nhất và những ca khúc mới nhất từ nghệ sĩ yêu thích của bạn.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="bg-[#090d16] text-slate-100 antialiased min-h-screen">
        <AuthProvider>
          <AudioProvider>
            <div className="flex">
              {/* Cột trái cố định: Sidebar */}
              <Sidebar />

              {/* Khu vực nội dung chính */}
              <div className="flex-1 ml-64 flex flex-col min-h-screen pb-28">
                <Header />
                <main className="p-8 max-w-7xl w-full mx-auto">
                  {children}
                </main>
              </div>

              {/* Trình phát nhạc toàn cục cố định dưới cùng */}
              <AudioPlayer />

              {/* Popup xem lời bài hát */}
              <LyricsModal />

              {/* Ngăn kéo hàng đợi phát nhạc */}
              <QueueDrawer />
            </div>
          </AudioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

