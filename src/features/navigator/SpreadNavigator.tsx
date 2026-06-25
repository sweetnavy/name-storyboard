import { useState } from 'react'
import type { Spread } from '../../types/storyboard'

type SpreadNavigatorProps = {
  spreads: Spread[]
  currentSpreadId: string
  onGoToSpread: (pageNumber: number) => void
  onMoveBeatToPage: (beatId: string, pageNumber: number) => void
  onMovePanelToPage: (panelId: string, pageNumber: number) => void
}

export function SpreadNavigator({
  currentSpreadId,
  onGoToSpread,
  onMoveBeatToPage,
  onMovePanelToPage,
  spreads,
}: SpreadNavigatorProps) {
  const [dropTargetId, setDropTargetId] = useState<string>()

  return (
    <section className="navigator-block">
      <div className="section-heading">
        <h2 className="section-title">見開き一覧</h2>
        <span className="text-caption">右綴じ</span>
      </div>
      <div className="spread-list">
        {spreads.map((spread) => (
          <button
            className={`spread-thumb ${spread.id === currentSpreadId ? 'is-active' : ''} ${
              spread.id === dropTargetId ? 'is-drop-target' : ''
            }`}
            key={spread.id}
            onDragLeave={() => setDropTargetId(undefined)}
            onDragOver={(event) => {
              if (
                event.dataTransfer.types.includes('application/x-storyboard-beat') ||
                event.dataTransfer.types.includes('application/x-storyboard-panel')
              ) {
                event.preventDefault()
                setDropTargetId(spread.id)
                event.dataTransfer.dropEffect = 'move'
              }
            }}
            onDrop={(event) => {
              const beatId = event.dataTransfer.getData('application/x-storyboard-beat')
              const panelId = event.dataTransfer.getData('application/x-storyboard-panel')
              if (!beatId && !panelId) {
                return
              }

              event.preventDefault()
              event.stopPropagation()
              setDropTargetId(undefined)
              if (panelId) {
                onMovePanelToPage(panelId, spread.pageNumbers[0])
                return
              }
              onMoveBeatToPage(beatId, spread.pageNumbers[0])
            }}
            onClick={() => onGoToSpread(spread.pageNumbers[0])}
            type="button"
          >
            <div className="thumb-pages" aria-hidden="true">
              {formatThumbnailPages(spread).map((page) => (
                <span className={page === '' ? 'is-empty-page' : undefined} key={page || 'empty'}>
                  {page}
                </span>
              ))}
            </div>
            <strong>
              {spread.label}
              {spread.pageNumbers[0] === 1 && <span className="thumb-note">扉</span>}
            </strong>
          </button>
        ))}
      </div>
    </section>
  )
}

function formatThumbnailPages(spread: Spread) {
  if (spread.pageNumbers.length === 1) {
    return [String(spread.pageNumbers[0]), '']
  }

  return [...spread.pageNumbers].reverse().map(String)
}
