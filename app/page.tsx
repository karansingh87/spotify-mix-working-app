'use client'

import { SpotifyAuth } from "@/components/SpotifyAuth"
import { PlaylistSelector } from "@/components/PlaylistSelector"
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth"
import { Music4 } from "lucide-react"

export default function Home() {
  const { isAuthenticated, isLoading } = useSpotifyAuth()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Music4 className="h-10 w-10" />
            <h1 className="text-4xl font-bold">Mix Master Pro</h1>
          </div>
          <p className="text-lg text-muted-foreground">Create amazing mixes with intelligent track analysis</p>
        </div>

        {isAuthenticated ? (
          <PlaylistSelector />
        ) : (
          <SpotifyAuth />
        )}
      </div>
    </div>
  )
}