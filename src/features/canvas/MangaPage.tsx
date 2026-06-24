import { PageFrame } from './PageFrame'

type MangaPageProps = {
  pageNumber: number
  variant?: 'cover'
}

export function MangaPage({ pageNumber, variant }: MangaPageProps) {
  return (
    <article className="manga-page">
      <PageFrame />
      {variant === 'cover' && (
        <div className="cover-placeholder">
          <span className="text-overline">Cover</span>
          <strong>扉ページ</strong>
          <span className="text-caption">タイトル・導入カット想定</span>
        </div>
      )}
      <span className="page-number">p.{pageNumber}</span>
    </article>
  )
}
