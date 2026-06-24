import { MangaPage } from './MangaPage'
import type { Project } from '../../types/storyboard'
import { getCurrentSpread, getVisiblePages } from '../../utils/pageOperations'

type SpreadCanvasProps = {
  project: Project
  onSelectPage: (pageNumber: number) => void
}

export function SpreadCanvas({ onSelectPage, project }: SpreadCanvasProps) {
  const currentSpread = getCurrentSpread(project)
  const visiblePages = getVisiblePages(project)
  const isSinglePage = visiblePages.length === 1

  return (
    <div className="canvas-wrap">
      <div className="canvas-toolbar">
        <div>
          <p className="text-overline">Spread</p>
          <h2 className="section-title">{currentSpread.label}</h2>
        </div>
        <span className="text-muted">日本式・右綴じ</span>
      </div>
      <div className={`spread-canvas ${isSinglePage ? 'spread-canvas-single' : ''}`}>
        {visiblePages.map((page, index) => (
          <MangaPage
            key={page.id}
            isSelected={page.pageNumber === project.selectedPageNumber}
            onSelectPage={onSelectPage}
            pageNumber={page.pageNumber}
            side={isSinglePage || index === 0 ? 'left' : 'right'}
            variant={page.isCover ? 'cover' : undefined}
          />
        ))}
      </div>
    </div>
  )
}
