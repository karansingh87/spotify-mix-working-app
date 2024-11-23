'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { spotifyApi, getPlaylistTracks } from "@/lib/spotify"
import { useQuery } from '@tanstack/react-query'
import { Loader2, Music2, Wand2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TrackCard } from "@/components/TrackCard"
import { Track } from "@/types/spotify"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAudioPlayer } from "@/hooks/useAudioPlayer"
import { MixSettingsDialog } from "@/components/MixSettingsDialog"
import { ProgressionCharts } from "@/components/ProgressionCharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function PlaylistSelector() {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null)
  const [mixTracks, setMixTracks] = useState<Track[] | null>(null)
  const { playing, play } = useAudioPlayer()

  const { data: playlists, isLoading: isLoadingPlaylists, error: playlistsError } = useQuery({
    queryKey: ['playlists'],
    queryFn: async () => {
      const response = await spotifyApi.getUserPlaylists()
      return response.body.items
    }
  })

  const { data: tracks, isLoading: isLoadingTracks, error: tracksError } = useQuery({
    queryKey: ['playlist-tracks', selectedPlaylistId],
    queryFn: async () => {
      if (!selectedPlaylistId) return null
      return getPlaylistTracks(selectedPlaylistId)
    },
    enabled: !!selectedPlaylistId
  })

  const handleMixGenerated = (newMixTracks: Track[]) => {
    setMixTracks(newMixTracks)
  }

  if (playlistsError || tracksError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {playlistsError ? 'Failed to load playlists' : 'Failed to load tracks'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Select a Playlist</h2>
        <Select
          value={selectedPlaylistId || ""}
          onValueChange={setSelectedPlaylistId}
          disabled={isLoadingPlaylists}
        >
          <SelectTrigger className="w-full">
            {isLoadingPlaylists ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading playlists...</span>
              </div>
            ) : (
              <SelectValue placeholder="Select a playlist" />
            )}
          </SelectTrigger>
          <SelectContent>
            {playlists?.map((playlist: any) => (
              <SelectItem key={playlist.id} value={playlist.id}>
                <div className="flex items-center space-x-3">
                  {playlist.images?.[0]?.url ? (
                    <img 
                      src={playlist.images[0].url} 
                      alt={playlist.name}
                      className="w-6 h-6 rounded"
                    />
                  ) : (
                    <Music2 className="h-6 w-6" />
                  )}
                  <span>{playlist.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPlaylistId && (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {mixTracks ? 'Generated Mix' : 'Playlist Tracks'}
              </h3>
              <MixSettingsDialog 
                tracks={tracks || []}
                onMixGenerated={handleMixGenerated}
              />
            </div>
            
            {isLoadingTracks ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    Loading tracks...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {mixTracks && <ProgressionCharts tracks={mixTracks} />}
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-3">
                    {(mixTracks || tracks)?.map((track: Track) => (
                      <TrackCard
                        key={`${track.id}-${track.uri}`}
                        track={track}
                        isPlaying={playing === track.preview_url}
                        onPlayPause={play}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}