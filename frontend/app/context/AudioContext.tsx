'use client';

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';

export interface Artist {
  _id: string;
  name: string;
  stageName?: string;
  avatar?: string;
  bio?: string;
}

export interface Genre {
  _id: string;
  name: string;
  slug: string;
  color?: string;
}

export interface Song {
  _id: string;
  title: string;
  artist: Artist | string | any;
  genre?: Genre | string | any;
  audioUrl?: string;
  youtubeId?: string;
  coverImage: string;
  duration?: number;
  lyrics?: string;
  listens?: number;
  likes?: number;
  albumTitle?: string;
  badge?: string;
  [key: string]: any;
}

interface AudioContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  loopMode: 'off' | 'one' | 'all';
  isShuffle: boolean;
  queue: Song[];
  showLyrics: boolean;
  showQueue: boolean;
  playSong: (song: Song, newQueue?: Song[], startAtSeconds?: number) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seek: (time: number) => void;
  changeVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  setShowLyrics: (show: boolean) => void;
  setShowQueue: (show: boolean) => void;
  toggleQueue: () => void;
  addToQueue: (song: Song) => void;
  playNextInQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  clearQueue: () => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// ─── Fallback Lyrics Map by Keyword or ID ──────────────────────────────────
export const getFallbackLyrics = (title?: string, id?: string): string => {
  const t = (title || '').toLowerCase();
  const sId = (id || '').toLowerCase();

  if (t.includes('tương lai') || sId.includes('007') || sId.includes('009')) {
    return `Liệu mai sau phai màu, cầm tay nhau qua bể dâu?\nTình yêu đó vẫn mãi đong đầy như ngày đầu.\nHình bóng ấy dẫu xa vời, lòng anh vẫn khắc ghi ngàn lời.\nDù tháng năm có cuốn trôi, ta mãi thuộc về nhau...\n\nChúng ta của tương lai, dẫu muôn trùng sóng gió\nNguyện cùng em bước tiếp con đường thênh thang\nÁnh mắt ấy vẫn ấm nồng như thuở ban đầu\nLời yêu thương gửi trọn vào ngàn khúc ca.`;
  }
  if (t.includes('trái tim anh đau') || sId.includes('008') || sId.includes('010')) {
    return `Đừng làm trái tim anh đau, đừng để nỗi nhớ hằn sâu.\nTừng nụ cười ánh mắt em trao, làm tim anh rộn ràng xao xuyến.\nDù mai này bão tố phong ba, nguyện bên em trọn vẹn yêu thương.\nHãy để anh chở che cho em suốt cuộc đời này...\n\nEm là tia nắng sớm mai dịu dàng\nXua tan bóng đêm giá lạnh trong anh\nHãy cùng anh viết tiếp câu chuyện tình\nNgọt ngào và đong đầy hạnh phúc mai sau.`;
  }
  if (t.includes('lạc trôi') || sId.includes('011')) {
    return `Người theo hương hoa mây mù giăng lối\nLàn sương khói phôi pha đưa bước ai xa rồi\nĐơn côi mình ta vấn vương hồi ức trong men say\nLời thề xưa người trao nay hóa thành tro tàn...\n\nLạc trôi giữa dòng đời nghiệt ngã\nTìm đâu ánh mắt nụ cười năm xưa\nTình như cánh hoa rơi rụng tàn phai\nChôn vùi ngàn nỗi niềm theo gió mây.`;
  }
  if (t.includes('nơi này có anh') || sId.includes('012')) {
    return `Khăn choàng ấm áp trao em ngày đông lạnh\nNụ cười rạng rỡ xua tan băng giá cuộc đời\nCầm tay nhau đi qua ngàn con phố nhỏ\nNơi này có anh luôn chở che em suốt đời...\n\nÁnh mắt đong đầy ngàn lời yêu thương\nTrái tim rộn ràng từng nhịp cùng em\nDù cho bão giông hay nắng ấm chan hòa\nNơi này có anh mãi không đổi dời.`;
  }
  if (t.includes('yêu là đây') || sId.includes('013')) {
    return `Thấp thoáng bóng em qua từng góc phố quen\nTrái tim rộn ràng từng nhịp đập xuyến xao\nCó chắc yêu là đây hay chỉ là mơ?\nNụ cười em như ánh dương sưởi ấm tâm hồn...\n\nTừng dòng tin nhắn trao nhau mỗi đêm\nLời thì thầm ngọt ngào ngập tràn hạnh phúc\nCó chắc yêu là đây rồi em hỡi\nNguyện trao em trọn vẹn trái tim này.`;
  }
  if (t.includes('ánh đèn') || sId.includes('001') || sId.includes('003')) {
    return `Đêm thành phố lên đèn rực rỡ\nNhững bước chân ai đang vội vã qua từng con phố quen\nÁnh đèn neon phản chiếu nhịp bass vang rền\nTa hòa mình vào không gian âm nhạc vị lai\nSynthwave cuộn trào trong từng hơi thở...\n\nÂm thanh ảo diệu nâng bước ta bay\nQuên hết âu lo của một ngày dài\nCháy hết đam mê cùng nhịp điệu đêm nay\nMelodix đưa ta đến miền vô tận.`;
  }
  if (t.includes('nhịp đêm') || sId.includes('006')) {
    return `Nhịp điệu điện tử vang vọng trong đêm vắng\nTiếng bass sâu thẳm rung chuyển từng giác quan\nHòa vào giai điệu mê hoặc của màn đêm\nQuên hết mọi ưu phiền của thế gian...\n\nThành phố chìm vào giấc mộng say\nChỉ còn đôi ta cùng giai điệu này\nBùng cháy năng lượng không ngừng nghỉ\nĐêm nay thuộc về những kẻ mộng mơ.`;
  }
  if (t.includes('thành thị') || sId.includes('007') || sId.includes('006b')) {
    return `Bước xuống phố khi hoàng hôn dần buông\nÂm vang náo nhiệt của nhịp sống thành thị\nĐiệu nhảy tự do đưa ta phiêu lãng\nCháy hết mình cùng thanh âm rực rỡ...\n\nĐèn hoa giăng lối đón chào\nTiếng cười vang rộn rã khắp nơi\nHòa nhịp cùng âm thanh đô hội\nTa tìm thấy chính mình tự do.`;
  }
  if (t.includes('cyber') || sId.includes('008') || sId.includes('006c')) {
    return `Ánh sáng cyber lung linh huyền ảo\nKhông gian số hóa mở ra chân trời mới\nGiai điệu synthwave dẫn lối tâm hồn\nBùng nổ năng lượng giữa đêm vô tận...\n\nThế giới tương lai rực rỡ sắc màu\nNhịp đập âm nhạc kết nối muôn nơi\nPhiêu lưu qua từng chiều không gian mới\nNăng lượng bùng cháy ngập tràn đam mê.`;
  }
  if (t.includes('ngày mới') || sId.includes('002')) {
    return `Nắng sớm mai len lỏi qua ô cửa sổ\nTiếng chim hót ríu rít chào ngày mới tươi vui\nHít một hơi thật sâu đón nhận hy vọng\nNgày hôm nay sẽ là một ngày tuyệt vời...\n\nBước chân ra phố thênh thang\nGặp lại nụ cười rạng rỡ của em\nMọi âu lo muộn phiền tan biến\nChỉ còn niềm tin và khát khao vươn xa.`;
  }
  if (t.includes('mưa đêm') || sId.includes('004')) {
    return `Từng giọt mưa rơi tí tách ngoài hiên vắng\nGợi nhớ bao kỷ niệm xưa êm đềm\nNhững tháng năm ngọt ngào ta từng có\nDù xa xôi lòng vẫn mãi hướng về nhau...\n\nMưa rơi như khóc cho cuộc tình lỡ\nLặng thầm bóng đêm chỉ có mình ta\nNguyện ước một mai bình yên trở lại\nNụ cười em luôn mãi sáng soi tim anh.`;
  }
  if (t.includes('chưa nói') || sId.includes('005')) {
    return `Có những lời yêu thương chưa kịp trao\nĐành giữ lại sâu kín trong tim này\nMỗi lần nhớ em giọt lệ lại rơi\nƯớc gì thời gian có thể quay trở lại...\n\nBiết bao điều muốn nói cùng em\nNhưng khoảng cách giờ quá xa vời\nChúc em luôn bình yên và hạnh phúc\nNơi này anh vẫn mãi dõi theo em.`;
  }
  if (t.includes('đường về') || sId.includes('006')) {
    return `Đường về hôm nay sao bỗng dài thênh thang\nBóng ai khuất xa sau hàng cây đứng lặng\nMong một ngày nắng ấm lại tràn về\nĐể trái tim thôi cô đơn lạnh giá...\n\nTìm lại dấu chân xưa trên lối cũ\nKỷ niệm đong đầy từng góc phố quen\nThời gian trôi đi chẳng thể níu giữ\nChỉ còn tiếng lòng vang vọng giữa đêm.`;
  }

  return `Giai điệu du dương hòa theo từng nhịp thở\nĐưa ta phiêu lãng qua miền ký ức ngọt ngào\nNhững ca từ đong đầy cảm xúc chân thành\nDành riêng cho những trái tim yêu âm nhạc...\n\nBao thăng trầm rồi cũng sẽ qua mau\nChỉ còn âm thanh lưu lại mãi ngàn sau\nHãy nhắm mắt lắng nghe từng giai điệu\nCảm nhận cuộc sống tươi đẹp quanh ta.`;
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [loopMode, setLoopMode] = useState<'off' | 'one' | 'all'>('all');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [showLyrics, setShowLyrics] = useState<boolean>(false);
  const [showQueue, setShowQueue] = useState<boolean>(false);

  const toggleQueue = () => setShowQueue(prev => !prev);

  const addToQueue = (song: Song) => {
    if (!song) return;
    setQueue(prev => {
      const exists = prev.some(s => s._id === song._id);
      if (exists) return prev;
      const updated = [...prev, song];
      queueRef.current = updated;
      return updated;
    });
  };

  const playNextInQueue = (song: Song) => {
    if (!song) return;
    setQueue(prev => {
      const cur = currentSongRef.current;
      const filtered = prev.filter(s => s._id !== song._id);
      if (!cur) {
        const updated = [song, ...filtered];
        queueRef.current = updated;
        return updated;
      }
      const curIdx = filtered.findIndex(s => s._id === cur._id);
      if (curIdx === -1) {
        const updated = [cur, song, ...filtered];
        queueRef.current = updated;
        return updated;
      }
      const updated = [
        ...filtered.slice(0, curIdx + 1),
        song,
        ...filtered.slice(curIdx + 1)
      ];
      queueRef.current = updated;
      return updated;
    });
  };

  const removeFromQueue = (songId: string) => {
    setQueue(prev => {
      const updated = prev.filter(s => s._id !== songId);
      queueRef.current = updated;
      return updated;
    });
  };

  const clearQueue = () => {
    const cur = currentSongRef.current;
    const updated = cur ? [cur] : [];
    setQueue(updated);
    queueRef.current = updated;
  };

  const reorderQueue = (fromIndex: number, toIndex: number) => {
    setQueue(prev => {
      if (fromIndex < 0 || fromIndex >= prev.length || toIndex < 0 || toIndex >= prev.length) {
        return prev;
      }
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      queueRef.current = updated;
      return updated;
    });
  };

  // Restore Loop and Shuffle preferences from localStorage
  useEffect(() => {
    try {
      const savedLoop = localStorage.getItem('melodix_loop_mode') as 'off' | 'one' | 'all' | null;
      if (savedLoop && ['off', 'one', 'all'].includes(savedLoop)) {
        setLoopMode(savedLoop);
        loopModeRef.current = savedLoop;
      }
      const savedShuffle = localStorage.getItem('melodix_shuffle');
      if (savedShuffle !== null) {
        const val = savedShuffle === 'true';
        setIsShuffle(val);
        isShuffleRef.current = val;
      }
    } catch (e) {}
  }, []);

  // Playback mode: 'youtube' or 'audio'
  const playbackModeRef = useRef<'youtube' | 'audio'>('audio');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const isYtReadyRef = useRef<boolean>(false);
  const pendingSongRef = useRef<Song | null>(null);
  const pendingStartTimeRef = useRef<number>(0);

  // Refs for state values needed inside callbacks
  const currentSongRef = useRef<Song | null>(null);
  currentSongRef.current = currentSong;
  const currentTimeRef = useRef<number>(0);
  currentTimeRef.current = currentTime;
  const durationRef = useRef<number>(0);
  durationRef.current = duration;
  const queueRef = useRef<Song[]>([]);
  queueRef.current = queue;
  const loopModeRef = useRef<'off' | 'one' | 'all'>('all');
  loopModeRef.current = loopMode;
  const isShuffleRef = useRef<boolean>(false);
  isShuffleRef.current = isShuffle;
  const isPlayingRef = useRef<boolean>(false);
  isPlayingRef.current = isPlaying;
  const volumeRef = useRef<number>(0.8);
  volumeRef.current = volume;
  const isMutedRef = useRef<boolean>(false);
  isMutedRef.current = isMuted;

  // ── 1. Init HTML5 Audio Element ──────────────────────────────────────────────
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => {
      if (playbackModeRef.current === 'audio') {
        setCurrentTime(audio.currentTime);
      }
    };

    const onLoadedMetadata = () => {
      if (playbackModeRef.current === 'audio') {
        setDuration(audio.duration || 0);
        if (pendingStartTimeRef.current > 0) {
          audio.currentTime = Math.min(pendingStartTimeRef.current, audio.duration || pendingStartTimeRef.current);
          setCurrentTime(audio.currentTime);
          pendingStartTimeRef.current = 0;
        }
      }
    };

    const onEnded = () => {
      if (playbackModeRef.current === 'audio') {
        handleSongEnded();
      }
    };

    const onError = (e: Event) => {
      if (playbackModeRef.current === 'audio') {
        console.warn('HTML Audio playback error:', e);
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // ── 2. Init YouTube IFrame Player ────────────────────────────────────────────
  const initYTPlayer = useCallback(() => {
    if (typeof window === 'undefined' || !window.YT || !window.YT.Player) return;
    if (ytPlayerRef.current) return;

    try {
      ytPlayerRef.current = new window.YT.Player('melodix-yt-iframe', {
        height: '200',
        width: '200',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            isYtReadyRef.current = true;
            event.target.setVolume(isMutedRef.current ? 0 : volumeRef.current * 100);

            // Play any song that was requested before player became ready
            if (pendingSongRef.current && pendingSongRef.current.youtubeId) {
              const song = pendingSongRef.current;
              pendingSongRef.current = null;
              event.target.loadVideoById({
                videoId: song.youtubeId,
                startSeconds: pendingStartTimeRef.current
              });
              pendingStartTimeRef.current = 0;
              event.target.playVideo();
            }
          },
          onStateChange: (event: any) => {
            if (playbackModeRef.current !== 'youtube') return;

            // 1: PLAYING
            if (event.data === 1) {
              setIsPlaying(true);
              try {
                const dur = event.target.getDuration();
                if (dur && dur > 0) setDuration(dur);
              } catch (e) {}
            }
            // 2: PAUSED
            else if (event.data === 2) {
              setIsPlaying(false);
            }
            // 0: ENDED
            else if (event.data === 0) {
              handleSongEnded();
            }
          },
          onError: (err: any) => {
            console.warn('YouTube Player Error:', err);
            // On error, try next song if possible
            if (playbackModeRef.current === 'youtube') {
              setIsPlaying(false);
            }
          }
        }
      });
    } catch (err) {
      console.warn('Failed to initialize YouTube Player:', err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load YouTube Iframe API script if not present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }

      window.onYouTubeIframeAPIReady = () => {
        initYTPlayer();
      };
    } else if (window.YT && window.YT.Player) {
      initYTPlayer();
    }
  }, [initYTPlayer]);

  // ── 3. Time Polling for YouTube mode ─────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      if (playbackModeRef.current === 'youtube' && isPlayingRef.current && ytPlayerRef.current) {
        try {
          if (typeof ytPlayerRef.current.getCurrentTime === 'function') {
            const cur = ytPlayerRef.current.getCurrentTime() || 0;
            setCurrentTime(cur);
          }
          if (typeof ytPlayerRef.current.getDuration === 'function') {
            const dur = ytPlayerRef.current.getDuration() || 0;
            if (dur > 0) setDuration(dur);
          }
        } catch (e) {}
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // ── 4. Song End Handler ──────────────────────────────────────────────────────
  const handleSongEnded = () => {
    if (loopModeRef.current === 'one') {
      if (playbackModeRef.current === 'youtube' && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.seekTo(0, true);
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        } catch (e) {}
        return;
      }
      if (playbackModeRef.current === 'audio' && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setIsPlaying(true);
        return;
      }
    }
    const endedSong = currentSongRef.current;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (endedSong?._id && token) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      fetch(`${apiUrl}/users/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          songId: endedSong._id,
          progressSeconds: Math.floor(durationRef.current || currentTimeRef.current),
          completed: true
        })
      }).catch((error) => console.error('Không thể cập nhật lịch sử nghe:', error));
    }
    nextSong();
  };

  // Helper full URL for audio
  const getAudioFullUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // ── 5. Main Play Song ────────────────────────────────────────────────────────
  const playSong = async (song: Song, newQueue?: Song[], startAtSeconds = 0) => {
    if (!song) return;
    const resumeAt = Math.max(0, Number(startAtSeconds) || 0);
    pendingStartTimeRef.current = resumeAt;

    // Ensure lyrics are available (use fallback immediately so lyrics button shows lyrics instantly)
    const songWithLyrics = {
      ...song,
      lyrics: song.lyrics || getFallbackLyrics(song.title, song._id)
    };

    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
      queueRef.current = newQueue;
    } else if (queueRef.current.length === 0) {
      setQueue([songWithLyrics]);
      queueRef.current = [songWithLyrics];
    }

    setCurrentSong(songWithLyrics);
    currentSongRef.current = songWithLyrics;
    setCurrentTime(resumeAt);

    // Asynchronously fetch live lyrics from backend if available
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    if (song._id) {
      fetch(`${apiUrl}/songs/${song._id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.lyrics) {
            setCurrentSong(prev => (prev && prev._id === song._id ? { ...prev, lyrics: data.lyrics } : prev));
          }
        })
        .catch(() => {});
    }

    // MODE 1: YOUTUBE PLAYBACK
    if (song.youtubeId) {
      playbackModeRef.current = 'youtube';

      // Pause HTML audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      if (isYtReadyRef.current && ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
        try {
          ytPlayerRef.current.loadVideoById({
            videoId: song.youtubeId,
            startSeconds: resumeAt
          });
          pendingStartTimeRef.current = 0;
          ytPlayerRef.current.setVolume(isMutedRef.current ? 0 : volumeRef.current * 100);
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        } catch (err) {
          console.warn('Error loading YouTube video:', err);
        }
      } else {
        // Player not ready yet, save pending
        pendingSongRef.current = song;
        setIsPlaying(true);
      }
    }
    // MODE 2: HTML5 AUDIO PLAYBACK
    else if (song.audioUrl) {
      playbackModeRef.current = 'audio';

      // Stop YouTube
      if (ytPlayerRef.current && typeof ytPlayerRef.current.stopVideo === 'function') {
        try {
          ytPlayerRef.current.stopVideo();
        } catch (e) {}
      }

      if (audioRef.current) {
        const audioSrc = getAudioFullUrl(song.audioUrl);
        audioRef.current.src = audioSrc;
        audioRef.current.volume = isMutedRef.current ? 0 : volumeRef.current;
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (err) {
          console.warn('Audio playback error:', err);
          setIsPlaying(false);
        }
      }
    } else {
      console.warn('Song has neither youtubeId nor audioUrl:', song);
      setIsPlaying(false);
    }

    // Report listen count
    if (song._id) {
      fetch(`${apiUrl}/songs/${song._id}/listen`, { method: 'POST' }).catch(() => {});
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        fetch(`${apiUrl}/users/history`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ songId: song._id, progressSeconds: resumeAt })
        }).catch((error) => console.error('Không thể lưu lịch sử nghe:', error));
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const song = currentSongRef.current;
      const progressSeconds = Math.floor(currentTimeRef.current);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!song?._id || !token || progressSeconds <= 0) return;
      const completed = durationRef.current > 0 && progressSeconds >= durationRef.current - 2;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      fetch(`${apiUrl}/users/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ songId: song._id, progressSeconds, completed })
      }).catch((error) => console.error('Không thể lưu tiến độ nghe:', error));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // ── 6. Toggle Play / Pause ───────────────────────────────────────────────────
  const togglePlay = () => {
    if (!currentSongRef.current) return;

    if (playbackModeRef.current === 'youtube' && ytPlayerRef.current) {
      try {
        if (isPlaying) {
          ytPlayerRef.current.pauseVideo();
          setIsPlaying(false);
        } else {
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        }
      } catch (e) {}
      return;
    }

    if (playbackModeRef.current === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.warn);
      }
    }
  };

  // ── 7. Next Song ─────────────────────────────────────────────────────────────
  const nextSong = () => {
    const q = queueRef.current;
    const cur = currentSongRef.current;
    if (q.length === 0 || !cur) return;

    const currentIndex = q.findIndex(s => s._id === cur._id);
    let nextIndex = 0;

    if (isShuffleRef.current && q.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * q.length);
      } while (nextIndex === currentIndex);
    } else {
      nextIndex = (currentIndex + 1) % q.length;
      if (currentIndex === q.length - 1 && loopModeRef.current === 'off') {
        setIsPlaying(false);
        return;
      }
    }

    const nextTrack = q[nextIndex];
    if (nextTrack) {
      playSong(nextTrack);
    }
  };

  // ── 8. Previous Song ─────────────────────────────────────────────────────────
  const prevSong = () => {
    const q = queueRef.current;
    const cur = currentSongRef.current;
    if (q.length === 0 || !cur) return;

    // Tua về đầu nếu đã nghe > 3s
    if (currentTime > 3) {
      seek(0);
      return;
    }

    const currentIndex = q.findIndex(s => s._id === cur._id);
    let prevIndex = 0;

    if (isShuffleRef.current && q.length > 1) {
      do {
        prevIndex = Math.floor(Math.random() * q.length);
      } while (prevIndex === currentIndex);
    } else {
      prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = q.length - 1;
      }
    }

    const prevTrack = q[prevIndex];
    if (prevTrack) {
      playSong(prevTrack);
    }
  };

  // ── 9. Seek ──────────────────────────────────────────────────────────────────
  const seek = (time: number) => {
    setCurrentTime(time);

    if (playbackModeRef.current === 'youtube' && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.seekTo(time, true);
      } catch (e) {}
      return;
    }

    if (playbackModeRef.current === 'audio' && audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // ── 10. Volume & Mute ────────────────────────────────────────────────────────
  const changeVolume = (vol: number) => {
    const safeVol = Math.max(0, Math.min(1, vol));
    setVolume(safeVol);
    volumeRef.current = safeVol;

    if (playbackModeRef.current === 'youtube' && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.setVolume(isMutedRef.current ? 0 : safeVol * 100);
      } catch (e) {}
    }

    if (playbackModeRef.current === 'audio' && audioRef.current) {
      audioRef.current.volume = isMutedRef.current ? 0 : safeVol;
    }

    if (safeVol > 0 && isMuted) {
      setIsMuted(false);
      isMutedRef.current = false;
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;

    if (playbackModeRef.current === 'youtube' && ytPlayerRef.current) {
      try {
        if (nextMuted) {
          ytPlayerRef.current.mute();
        } else {
          ytPlayerRef.current.unMute();
          ytPlayerRef.current.setVolume(volumeRef.current * 100);
        }
      } catch (e) {}
    }

    if (playbackModeRef.current === 'audio' && audioRef.current) {
      audioRef.current.volume = nextMuted ? 0 : volumeRef.current;
    }
  };

  // ── 11. Loop & Shuffle ───────────────────────────────────────────────────────
  const toggleLoop = () => {
    let next: 'off' | 'one' | 'all' = 'all';
    if (loopMode === 'off') next = 'all';
    else if (loopMode === 'all') next = 'one';
    else next = 'off';

    setLoopMode(next);
    loopModeRef.current = next;
    try {
      localStorage.setItem('melodix_loop_mode', next);
    } catch (e) {}
  };

  const toggleShuffle = () => {
    const next = !isShuffle;
    setIsShuffle(next);
    isShuffleRef.current = next;
    try {
      localStorage.setItem('melodix_shuffle', String(next));
    } catch (e) {}
  };

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        loopMode,
        isShuffle,
        queue,
        showLyrics,
        showQueue,
        playSong,
        togglePlay,
        nextSong,
        prevSong,
        seek,
        changeVolume,
        toggleMute,
        toggleLoop,
        toggleShuffle,
        setShowLyrics,
        setShowQueue,
        toggleQueue,
        addToQueue,
        playNextInQueue,
        removeFromQueue,
        clearQueue,
        reorderQueue
      }}
    >
      {/* Off-screen YouTube IFrame container so playback continues uninterrupted */}
      <div
        id="melodix-yt-container"
        style={{
          position: 'fixed',
          top: -9999,
          left: -9999,
          width: 200,
          height: 200,
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -9999
        }}
      >
        <div id="melodix-yt-iframe" />
      </div>

      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
