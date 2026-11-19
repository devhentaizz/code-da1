'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAudio, getFallbackLyrics } from '../../context/AudioContext';
import { useAuth } from '../../context/AuthContext';
import { PlayIcon, PauseIcon, ChatBubbleLeftRightIcon, MusicalNoteIcon, QueueListIcon, CheckIcon } from '@heroicons/react/24/solid';
import { PlusCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import FavoriteSongButton from '../../components/FavoriteSongButton';
import SongRow from '../../components/SongRow';

export default function SongDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { currentSong, isPlaying, playSong, togglePlay } = useAudio();
  const { user, token } = useAuth();

  const [song, setSong] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [relatedSongs, setRelatedSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Playlist Modal State
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlistMessage, setPlaylistMessage] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [songRes, commentsRes] = await Promise.all([
          fetch(`${apiUrl}/songs/${id}`),
          fetch(`${apiUrl}/comments/song/${id}`)
        ]);

        if (songRes.ok) {
          const songData = await songRes.json();
          songData.lyrics = songData.lyrics || getFallbackLyrics(songData.title, songData._id);
          setSong(songData);

          // Fetch related songs by same genre or artist
          if (songData.genre?._id) {
            const relRes = await fetch(`${apiUrl}/songs?genre=${songData.genre._id}&limit=5`);
            if (relRes.ok) {
              const relData = await relRes.json();
              setRelatedSongs((relData.songs || []).filter((s: any) => s._id !== songData._id));
            }
          }
        }

        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(commentsData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const isCurrent = currentSong?._id === song?._id;

  const handlePlay = () => {
    if (!song) return;
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, [song, ...relatedSongs]);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Vui lòng đăng nhập để bình luận');
      return;
    }
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`${apiUrl}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ songId: song._id, content: newComment.trim() })
      });

      if (res.ok) {
        const createdComment = await res.json();
        setComments([createdComment, ...comments]);
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenPlaylistModal = async () => {
    if (!token) {
      alert('Vui lòng đăng nhập để thêm bài hát vào danh sách phát!');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/playlists`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserPlaylists(data);
        setShowPlaylistModal(true);
        setPlaylistMessage('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      const res = await fetch(`${apiUrl}/playlists/${playlistId}/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ songId: song._id })
      });

      if (res.ok) {
        setPlaylistMessage('Đã thêm bài hát vào playlist thành công!');
        setTimeout(() => setShowPlaylistModal(false), 1200);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-slate-400">Đang tải thông tin bài hát...</div>;
  }

  if (!song) {
    return <div className="text-center py-24 text-slate-400">Không tìm thấy bài hát này.</div>;
  }

  const artistName = typeof song.artist === 'object' ? song.artist?.name : song.artist;
  const artistId = typeof song.artist === 'object' ? song.artist?._id : '';

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* 1. Header Banner Bài Hát */}
      <div className="relative rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8 shadow-2xl overflow-hidden">
        {/* Background Blur */}
        <div
          className="absolute inset-0 opacity-15 filter blur-3xl"
          style={{ backgroundImage: `url(${song.coverImage})`, backgroundSize: 'cover' }}
        />

        {/* Artwork */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 group ring-4 ring-slate-800/80">
          <img
            src={song.coverImage || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80'}
            alt={song.title}
            className={`w-full h-full object-cover transition duration-500 ${isCurrent && isPlaying ? 'scale-105' : ''}`}
          />
        </div>

        {/* Info */}
        <div className="relative z-10 flex-1 text-center md:text-left space-y-3">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider border border-emerald-500/30">
            {song.genre?.name || 'Bài Hát'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white">{song.title}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-300">
            <Link
              href={artistId ? `/nghe-si/${artistId}` : '#'}
              className="text-emerald-400 hover:underline font-bold text-base"
            >
              {artistName || 'Đang cập nhật'}
            </Link>
            <span>•</span>
            <span>{song.listens?.toLocaleString() || 0} lượt nghe</span>
            <span>•</span>
            <span>{song.likes?.toLocaleString() || 0} lượt thích</span>
            {song.albumId && (
              <>
                <span>•</span>
                <Link
                  href={`/album/${typeof song.albumId === 'object' ? song.albumId._id : song.albumId}`}
                  className="text-teal-300 hover:underline font-semibold"
                >
                  Album: {typeof song.albumId === 'object' ? song.albumId.title : 'Xem Album'}
                </Link>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-4">
            <button
              onClick={handlePlay}
              className="px-8 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition transform hover:scale-105 active:scale-95"
            >
              {isCurrent && isPlaying ? (
                <>
                  <PauseIcon className="w-5 h-5" />
                  Tạm Dừng
                </>
              ) : (
                <>
                  <PlayIcon className="w-5 h-5 ml-0.5" />
                  Phát Nhạc
                </>
              )}
            </button>

            <FavoriteSongButton
              song={song}
              className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-red-500 transition border border-slate-700"
              iconClassName="w-6 h-6"
              activeClassName="text-red-500"
            />

            <button
              onClick={handleOpenPlaylistModal}
              title="Thêm vào Playlist"
              className="px-5 py-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition border border-slate-700 text-xs font-bold flex items-center gap-2"
            >
              <QueueListIcon className="w-4 h-4 text-emerald-400" />
              + Thêm Vào Playlist
            </button>
          </div>
        </div>
      </div>

      {/* 2. Lời Bài Hát & Ca khúc liên quan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lời bài hát */}
        <div className="lg:col-span-2 bg-[#10161f] border border-[#1b2533] rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5 text-lg font-black text-white">
              <MusicalNoteIcon className="w-6 h-6 text-[#0df580]" />
              Lời Bài Hát (Lyrics)
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0df580]/15 text-[#0df580] border border-[#0df580]/30">
              Chính xác • Đã xác minh
            </span>
          </div>

          {(song.lyrics || getFallbackLyrics(song.title, song._id)) ? (
            <div className="text-base sm:text-lg leading-loose text-slate-200 font-semibold whitespace-pre-line bg-[#090d11]/80 p-6 rounded-2xl border border-[#1b2533] shadow-inner">
              {song.lyrics || getFallbackLyrics(song.title, song._id)}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-12">
              Lời bài hát đang được cập nhật...
            </p>
          )}
        </div>

        {/* Bài hát cùng thể loại */}
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Gợi Ý Cùng Thể Loại</h3>
          <div className="divide-y divide-slate-800/40">
            {relatedSongs.map((rel: any) => (
              <SongRow key={rel._id} song={rel} queue={[song, ...relatedSongs]} />
            ))}
            {relatedSongs.length === 0 && (
              <p className="text-xs text-slate-500 py-6 text-center">Không có bài hát liên quan</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Phần Bình Luận */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2.5 text-xl font-black text-white">
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-emerald-400" />
          Bình Luận ({comments.length})
        </div>

        {/* Form viết bình luận */}
        <form onSubmit={handleAddComment} className="flex gap-4">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? "Chia sẻ cảm xúc của bạn về bài hát này..." : "Đăng nhập để để lại bình luận..."}
            disabled={!user}
            className="flex-1 bg-slate-800/60 border border-slate-700 rounded-2xl px-5 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!user || !newComment.trim()}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-sm transition"
          >
            Gửi
          </button>
        </form>

        {/* Danh sách bình luận */}
        <div className="space-y-4 pt-2">
          {comments.map((cm: any) => (
            <div key={cm._id} className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-800/30 border border-slate-800/50">
              <img
                src={cm.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                alt={cm.user?.name || 'User'}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{cm.user?.name || 'Thành viên'}</span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(cm.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mt-1">{cm.content}</p>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-center py-8 text-slate-500 text-sm">
              Chưa có bình luận nào. Hãy là người đầu tiên nêu cảm nghĩ!
            </p>
          )}
        </div>
      </div>

      {/* Modal Chọn Playlist */}
      {showPlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <QueueListIcon className="w-5 h-5 text-emerald-400" />
                Thêm Vào Danh Sách Phát
              </h3>
              <button
                onClick={() => setShowPlaylistModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {playlistMessage && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold text-center">
                {playlistMessage}
              </div>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {userPlaylists.map((pl) => (
                <button
                  key={pl._id}
                  onClick={() => handleAddToPlaylist(pl._id)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 transition text-left group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <img
                      src={pl.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=100&q=80'}
                      alt={pl.name}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition truncate">{pl.name}</p>
                      <p className="text-xs text-slate-400">{pl.songIds ? pl.songIds.length : 0} bài hát</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 shrink-0 ml-2">+ Thêm</span>
                </button>
              ))}

              {userPlaylists.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs space-y-3">
                  <p>Bạn chưa có danh sách phát nào.</p>
                  <Link
                    href="/thu-vien"
                    className="inline-block px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
                  >
                    Tạo Playlist trong Thư Viện
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

