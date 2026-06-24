import { PageFrame } from './PageFrame'

type MangaPageProps = {
  pageNumber: number
  side: 'left' | 'right'
  variant?: 'cover'
}

export function MangaPage({ pageNumber, side, variant }: MangaPageProps) {
  return (
    <article className={`manga-page page-${side}`}>
      <PageFrame />
      {variant === 'cover' && (
        <span className="cover-badge">扉</span>
      )}
      <span className="page-number">{pageNumber}</span>
    </article>
  )
}
