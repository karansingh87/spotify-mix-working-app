'use client'

import { useState, useEffect } from 'react'
import { spotifyApi, openSpotifyLogin } from '@/lib/spotify'

export function useSpotifyAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SPOTIFY_TOKEN') {
        const { token } = event.data;
        try {
          localStorage.setItem('spotify_access_token', token);
          spotifyApi.setAccessToken(token);
          setIsAuthenticated(true);
          setError(null);
        } catch (err) {
          console.error('Error setting token:', err);
          setError('Failed to store authentication token');
        }
      } else if (event.data?.type === 'SPOTIFY_ERROR') {
        setError(event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Check for existing token
    try {
      const token = localStorage.getItem('spotify_access_token');
      if (token) {
        spotifyApi.setAccessToken(token);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Error reading token:', err);
      setError('Failed to restore previous session');
    }
    
    setIsLoading(false);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const login = () => {
    openSpotifyLogin();
  };

  const logout = () => {
    try {
      localStorage.removeItem('spotify_access_token');
      spotifyApi.setAccessToken('');
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      console.error('Error during logout:', err);
      setError('Failed to logout properly');
    }
  };

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    logout
  };
}