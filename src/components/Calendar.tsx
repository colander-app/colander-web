import { useEffect, useRef } from 'react'

interface Props {
  width: number
  height: number
  cellWidth: number
  startDate: Date
  data: Array<Record<string, any>>
}

export const Calendar = ({ data }: Props) => {
  const drawCalendar = (context: CanvasRenderingContext2D) => {
    // Draw the calendar grid rows first
    context.strokeStyle = 'rgb(0,0,0)'
    data.forEach((row) => {})

    // Layer the events for each row after
  }

  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!canvasRef.current) {
      return
    }
    const context = canvasRef.current.getContext('2d')
    if (!context) {
      return
    }
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    drawCalendar(context)
  }, [canvasRef.current])

  return <canvas ref={canvasRef} />
}
