import { useEffect, useState } from 'react'

const LAYOUT_STORAGE_KEY = 'name-storyboard-layout-v1'

type PaneWidths = {
  leftPaneWidth: number
  rightPaneWidth: number
}

const defaultWidths: PaneWidths = {
  leftPaneWidth: 236,
  rightPaneWidth: 288,
}

export function usePaneWidths() {
  const [paneWidths, setPaneWidths] = useState<PaneWidths>(() => {
    try {
      const savedValue = window.localStorage.getItem(LAYOUT_STORAGE_KEY)
      if (!savedValue) {
        return defaultWidths
      }

      const parsedValue = JSON.parse(savedValue) as Partial<PaneWidths>
      return {
        leftPaneWidth: clamp(parsedValue.leftPaneWidth ?? defaultWidths.leftPaneWidth, 200, 340),
        rightPaneWidth: clamp(parsedValue.rightPaneWidth ?? defaultWidths.rightPaneWidth, 240, 420),
      }
    } catch {
      return defaultWidths
    }
  })

  useEffect(() => {
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(paneWidths))
  }, [paneWidths])

  const resizePane = (side: 'left' | 'right', deltaX: number, startWidth: number) => {
    setPaneWidths((currentWidths) => ({
      ...currentWidths,
      [side === 'left' ? 'leftPaneWidth' : 'rightPaneWidth']:
        side === 'left'
          ? clamp(startWidth + deltaX, 200, 340)
          : clamp(startWidth - deltaX, 240, 420),
    }))
  }

  return { paneWidths, resizePane }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
