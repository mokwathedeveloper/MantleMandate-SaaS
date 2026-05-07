'use client'

interface SparklineProps {
  data:    number[]
  width?:  number
  height?: number
  color?:  string
  fillId?: string
}

export function Sparkline({ data, width = 120, height = 32, color = '#0066FF', fillId }: SparklineProps) {
  if (!data || data.length === 0) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = data.length > 1 ? width / (data.length - 1) : width
  const points = data.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * (height - 2) - 1
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  const id = fillId ?? `spark-${color.replace('#', '')}`
  const path = `M${points.join(' L')}`
  const lastY = parseFloat(points[points.length - 1].split(',')[1])
  const fill = `${path} L${width.toFixed(1)},${height} L0,${height} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill}  fill={`url(#${id})`} stroke="none" />
      <path d={path}  fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={lastY} r="2" fill={color} />
    </svg>
  )
}
