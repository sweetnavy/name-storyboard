import { PaneLayout } from './PaneLayout'

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="text-overline">Name Storyboard</p>
          <h1 className="app-title">漫画ネーム作成</h1>
        </div>
        <div className="header-meta">
          <span className="status-pill">Draft</span>
          <span className="text-muted">全 12 ページ</span>
        </div>
      </header>
      <PaneLayout />
    </div>
  )
}
