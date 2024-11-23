'use client'

import { Music2, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Track } from "@/types/spotify"

interface TrackCardProps {
  track: Track
  isPlaying: boolean
  onPlayPause: (previewUrl: string) => void
}

export function TrackCard({ track, isPlaying, onPlayPause }: TrackCardProps) {
  const energyHue = track.audioFeatures?.energy ? track.audioFeatures.energy * 120 : 0
  const duration = track.duration_ms ? Math.floor(track.duration_ms / 1000) : 0
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  const tempo = track.audioFeatures?.tempo ? Math.round(track.audioFeatures.tempo) : 'N/A'
  const energy = track.audioFeatures?.energy ? Math.round(track.audioFeatures.energy * 100) : 'N/A'

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-card hover:bg-accent/50 transition-colors">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPlayPause(track.preview_url)}
        disabled={!track.preview_url}
        className="h-8 w-8 shrink-0"
        title={track.preview_url ? 'Preview track' : 'No preview available'}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      {track.album?.images?.[0]?.url ? (
        <img 
          src={track.album.images[0].url}
          alt={track.name}
          className="w-12 h-12 rounded-md shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center shrink-0">
          <Music2 className="h-6 w-6" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate mb-1">{track.name}</h4>
        <p className="text-sm text-muted-foreground truncate">
          {track.artists?.map(artist => artist.name).join(', ')}
        </p>
      </div>

      <div className="flex gap-2 items-center shrink-0">
        <Badge variant="outline" className="whitespace-nowrap">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </Badge>
        <Badge variant="outline" className="whitespace-nowrap">
          {tempo === 'N/A' ? 'N/A' : `${tempo} BPM`}
        </Badge>
        {track.audioFeatures?.camelotKey && (
          <Badge 
            variant="outline" 
            className="whitespace-nowrap font-mono"
            title="Camelot Key"
          >
            {track.audioFeatures.camelotKey}
          </Badge>
        )}
        <Badge 
          variant="outline" 
          className="whitespace-nowrap"
          style={{
            backgroundColor: energy === 'N/A' ? undefined : `hsla(${energyHue}, 70%, 50%, 0.2)`,
            borderColor: energy === 'N/A' ? undefined : `hsla(${energyHue}, 70%, 50%, 0.5)`
          }}
        >
          Energy: {energy === 'N/A' ? 'N/A' : `${energy}%`}
        </Badge>
      </div>
    </div>
  )
}