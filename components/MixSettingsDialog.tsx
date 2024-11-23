'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Loader2, Wand2 } from "lucide-react"
import { TEMPLATE_SETTINGS } from '@/lib/mixGeneration/templates'
import { generateMix } from '@/lib/mixGeneration/mixGeneration'
import { convertSpotifyTrackToMixTrack } from '@/lib/mixGeneration/trackMapping'
import type { Track } from '@/types/spotify'

interface MixSettingsDialogProps {
  tracks: Track[]
  onMixGenerated: (tracks: Track[]) => void
}

export function MixSettingsDialog({ tracks, onMixGenerated }: MixSettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [template, setTemplate] = useState<string>('Warm Up (Opening Set)')
  const [durationType, setDurationType] = useState<'tracks' | 'time'>('tracks')
  const [targetTracks, setTargetTracks] = useState<number>(15)
  const [targetDuration, setTargetDuration] = useState<number>(60)

  const handleGenerateMix = async () => {
    setIsGenerating(true)
    try {
      const mixTracks = tracks
        .map(track => convertSpotifyTrackToMixTrack(track))
        .filter((track): track is NonNullable<typeof track> => track !== null);

      const result = generateMix({
        tracks: mixTracks,
        templateName: template,
        durationType,
        targetTracks,
        targetDuration
      });

      const resultTracks = result.tracks.map(mixTrack => 
        tracks.find(t => t.id === mixTrack.id)!
      );

      onMixGenerated(resultTracks);
      setIsOpen(false);
    } catch (error) {
      console.error('Error generating mix:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={isGenerating || !tracks?.length}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Mix...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Mix
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Mix</DialogTitle>
          <DialogDescription>
            Configure your mix settings and preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="template">Mix Template</Label>
            <Select
              value={template}
              onValueChange={setTemplate}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TEMPLATE_SETTINGS).map(([key, settings]) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {TEMPLATE_SETTINGS[template].description}
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Mix Length</Label>
            <Tabs value={durationType} onValueChange={(v) => setDurationType(v as 'tracks' | 'time')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tracks">Track Count</TabsTrigger>
                <TabsTrigger value="time">Duration</TabsTrigger>
              </TabsList>
              <TabsContent value="tracks">
                <div className="pt-2">
                  <Slider
                    value={[targetTracks]}
                    onValueChange={([value]) => setTargetTracks(value)}
                    min={5}
                    max={30}
                    step={1}
                    className="py-4"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    {targetTracks} tracks
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="time">
                <div className="pt-2">
                  <Slider
                    value={[targetDuration]}
                    onValueChange={([value]) => setTargetDuration(value)}
                    min={30}
                    max={180}
                    step={15}
                    className="py-4"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    {formatDuration(targetDuration)}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Button 
          onClick={handleGenerateMix}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Mix'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}