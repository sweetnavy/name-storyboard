import { useEffect, useState } from 'react'

const CANVAS_ZOOM_STORAGE_KEY = 'name-storyboard-canvas-zoom-v1'

export function useCanvasZoom() {
  const [zoom, setZoom] = useState(() => {
    const savedValue = window.localStorage.getItem(CANVAS_ZOOM_STORAGE_KEY)
    const parsedValue = savedValue ? Number.parseFloat(savedValue) : 1
    return clamp(Number.isFinite(parsedValue) ? parsedValue : 1, 0.5, 2)
  })

  useEffect(() => {
    window.localStorage.setItem(CANVAS_ZOOM_STORAGE_KEY, String(zoom))
  }, [zoom])

  const updateZoom = (nextZoom: number) => setZoom(clamp(nextZoom, 0.5, 2))
  const zoomIn = () => updateZoom(zoom + 0.1)
  const zoomOut = () => updateZoom(zoom - 0.1)
  const resetZoom = () => updateZoom(1)

  return { resetZoom, setZoom: updateZoom, zoom, zoomIn, zoomOut }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
