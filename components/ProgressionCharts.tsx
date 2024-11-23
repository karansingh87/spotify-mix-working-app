'use client'

import { Track } from "@/types/spotify"
import { Card } from "@/components/ui/card"

interface Point {
  x: number
  y: number
}

function createSmoothPath(points: Point[]): string {
  if (points.length < 2) return ''

  const path = []
  path.push(`M ${points[0].x} ${points[0].y}`)

  for (let i = 1; i < points.length; i++) {
    const prevPoint = points[i - 1]
    const currentPoint = points[i]
    
    // Control points for smooth curve
    const cp1x = prevPoint.x + (currentPoint.x - prevPoint.x) / 3
    const cp1y = prevPoint.y
    const cp2x = prevPoint.x + 2 * (currentPoint.x - prevPoint.x) / 3
    const cp2y = currentPoint.y
    
    path.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currentPoint.x} ${currentPoint.y}`)
  }

  return path.join(' ')
}

interface ChartProps {
  data: number[]
  min: number
  max: number
  label: string
  color?: string
}

function Chart({ data, min, max, label, color = "hsl(var(--primary))" }: ChartProps) {
  const width = 400
  const height = 200
  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2

  const points: Point[] = data.map((value, index) => ({
    x: padding + (index / (data.length - 1)) * chartWidth,
    y: padding + chartHeight - ((value - min) / (max - min)) * chartHeight
  }))

  const path = createSmoothPath(points)

  return (
    <div className="relative">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const y = padding + chartHeight * (1 - tick)
          return (
            <g key={tick}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="hsl(var(--muted-foreground) / 0.2)"
                strokeDasharray="4 4"
              />
              <text
                x={padding - 8}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-[10px] fill-muted-foreground"
              >
                {Math.round(min + (max - min) * tick)}
              </text>
            </g>
          )
        })}

        {/* X-axis labels */}
        {data.map((_, index) => (
          <text
            key={index}
            x={padding + (index / (data.length - 1)) * chartWidth}
            y={height - padding + 16}
            textAnchor="middle"
            className="text-[10px] fill-muted-foreground"
          >
            {index + 1}
          </text>
        ))}

        {/* Line */}
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute top-2 left-4 text-sm font-medium">{label}</div>
    </div>
  )
}

interface ProgressionChartsProps {
  tracks: Track[]
}

export function ProgressionCharts({ tracks }: ProgressionChartsProps) {
  const bpmData = tracks.map(track => track.audioFeatures?.tempo || 0)
  const energyData = tracks.map(track => 
    track.audioFeatures?.energy ? Math.round(track.audioFeatures.energy * 100) : 0
  )

  const minBpm = Math.floor(Math.min(...bpmData) - 5)
  const maxBpm = Math.ceil(Math.max(...bpmData) + 5)

  return (
    <div className="grid grid-cols-2 gap-6 mb-6">
      <Card className="p-4">
        <Chart
          data={bpmData}
          min={minBpm}
          max={maxBpm}
          label="BPM Progression"
        />
      </Card>

      <Card className="p-4">
        <Chart
          data={energyData}
          min={0}
          max={100}
          label="Energy Progression"
        />
      </Card>
    </div>
  )
}