'use client';

import React, { useEffect, useState } from 'react';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartFilledIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

interface FavoriteSong {
  _id: string;
  title?: string;
}

interface FavoriteSongButtonProps {
  song: FavoriteSong;
  className?: string;
  iconClassName?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  addLabel?: string;
  removeLabel?: string;
  onFavoriteChange?: (isFavorite: boolean) => void;
}

const FavoriteSongButton: React.FC<FavoriteSongButtonProps> = ({
  song,
  className = 'p-2 text-slate-400 hover:text-red-500 transition',
  iconClassName = 'h-4 w-4',
  activeClassName = 'text-red-500',
  inactiveClassName = '',
  addLabel,
  removeLabel,
  onFavoriteChange
}) => {
  const { user, token, updateFavorites } = useAuth();
  const [isFavorite, setIsFavorite] = useState(Boolean(user?.favorites?.includes(song._id)));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsFavorite(Boolean(user?.favorites?.includes(song._id)));
  }, [song._id, user?.favorites]);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!token) {
      alert('Vui lòng đăng nhập để lưu bài hát yêu thích');
      return;
    }
    if (isLoading) return;

    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      };
      const parseResponse = async (response: Response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Không thể cập nhật bài hát yêu thích');
        }
        return data;
      };

      const playlistsResponse = await fetch(`${apiUrl}/playlists`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const playlists = await parseResponse(playlistsResponse);
      let favoritePlaylist = Array.isArray(playlists)
        ? playlists.find((playlist: any) =>
            playlist.name?.trim().toLocaleLowerCase('vi') === 'nhạc yêu thích'
          )
        : null;
      const isInFavoritePlaylist = favoritePlaylist?.songIds?.some((item: any) =>
        (typeof item === 'object' ? item?._id : item) === song._id
      ) || false;
      const nextFavoriteState = !isInFavoritePlaylist;

      if (!favoritePlaylist && nextFavoriteState) {
        favoritePlaylist = await parseResponse(await fetch(`${apiUrl}/playlists`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: 'Nhạc yêu thích',
            description: 'Danh sách những bài hát bạn yêu thích.',
            visibility: 'private'
          })
        }));
      }

      if (favoritePlaylist) {
        const playlistResponse = await fetch(
          `${apiUrl}/playlists/${favoritePlaylist._id}/songs`,
          {
            method: nextFavoriteState ? 'POST' : 'DELETE',
            headers,
            body: JSON.stringify({ songId: song._id })
          }
        );
        await parseResponse(playlistResponse);
      }

      setIsFavorite(nextFavoriteState);
      onFavoriteChange?.(nextFavoriteState);
      const currentFavorites = user?.favorites || [];
      updateFavorites(nextFavoriteState
        ? Array.from(new Set([...currentFavorites, song._id]))
        : currentFavorites.filter((id) => id !== song._id));

      if (currentFavorites.includes(song._id) !== nextFavoriteState) {
        const favoriteResponse = await fetch(`${apiUrl}/users/favorite`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ songId: song._id, isFavorite: nextFavoriteState })
        });
        await parseResponse(favoriteResponse);
      }
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Không thể cập nhật bài hát yêu thích');
    } finally {
      setIsLoading(false);
    }
  };

  const ariaLabel = isFavorite
    ? removeLabel || `Bỏ yêu thích ${song.title || 'bài hát'}`
    : addLabel || `Yêu thích ${song.title || 'bài hát'}`;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-label={ariaLabel}
      aria-pressed={isFavorite}
      title={ariaLabel}
      className={`${className} ${isFavorite ? activeClassName : inactiveClassName} disabled:opacity-50`}
    >
      {isFavorite
        ? <HeartFilledIcon className={iconClassName} />
        : <HeartOutlineIcon className={iconClassName} />}
      {addLabel && <span>{isFavorite ? (removeLabel || 'ĐÃ THÊM VÀO YÊU THÍCH') : addLabel}</span>}
    </button>
  );
};

export default FavoriteSongButton;
