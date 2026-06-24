import { MangaPage } from './MangaPage'

export function SpreadCanvas() {
  return (
    <div className="canvas-wrap">
      <div className="canvas-toolbar">
        <div>
          <p className="text-overline">Spread</p>
          <h2 className="section-title">p.1 / p.2</h2>
        </div>
        <span className="text-muted">白紙ネーム</span>
      </div>
      <div className="spread-canvas">
        <MangaPage pageNumber={1} variant="cover" />
        <MangaPage pageNumber={2} />
      </div>
    </div>
  )
}
