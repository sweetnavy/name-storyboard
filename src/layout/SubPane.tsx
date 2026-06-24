import { SpreadNavigator } from '../features/navigator/SpreadNavigator'

export function SubPane() {
  return (
    <aside className="pane pane-sub" aria-label="見開き一覧">
      <SpreadNavigator />
    </aside>
  )
}
