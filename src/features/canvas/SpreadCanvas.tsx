import { MangaPage } from './MangaPage'

export function SpreadCanvas() {
  return (
    <div className="canvas-wrap">
      <div className="canvas-toolbar">
        <div>
          <p className="text-overline">Spread</p>
          <h2 className="section-title">1</h2>
        </div>
        <span className="text-muted">日本式・右綴じ</span>
      </div>
      <div className="spread-canvas spread-canvas-single">
        <MangaPage pageNumber={1} side="left" variant="cover" />
      </div>
    </div>
  )
}
