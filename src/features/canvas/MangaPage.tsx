import { PageFrame } from './PageFrame'

type MangaPageProps = {
  pageNumber: number
  side: 'left' | 'right'
  isSelected: boolean
  onSelectPage: (pageNumber: number) => void
  variant?: 'cover'
}

export function MangaPage({ isSelected, onSelectPage, pageNumber, side, variant }: MangaPageProps) {
  return (
    <button
      className={`manga-page page-${side} ${isSelected ? 'is-selected' : ''}`}
      onClick={() => onSelectPage(pageNumber)}
      type="button"
    >
      <PageFrame />
      {variant === 'cover' && (
        <span className="cover-badge">扉</span>
      )}
      <span className="page-number">{pageNumber}</span>
    </button>
  )
}
