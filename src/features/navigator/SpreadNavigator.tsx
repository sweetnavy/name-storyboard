import type { Spread } from '../../types/storyboard'

type SpreadNavigatorProps = {
  spreads: Spread[]
  currentSpreadId: string
  onGoToSpread: (pageNumber: number) => void
}

export function SpreadNavigator({ currentSpreadId, onGoToSpread, spreads }: SpreadNavigatorProps) {
  return (
    <section className="navigator-block">
      <div className="section-heading">
        <h2 className="section-title">見開き一覧</h2>
        <span className="text-caption">右綴じ</span>
      </div>
      <div className="spread-list">
        {spreads.map((spread) => (
          <button
            className={`spread-thumb ${spread.id === currentSpreadId ? 'is-active' : ''}`}
            key={spread.id}
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
