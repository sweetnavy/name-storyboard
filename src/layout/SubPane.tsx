import { SpreadNavigator } from '../features/navigator/SpreadNavigator'
import type { Spread } from '../types/storyboard'

type SubPaneProps = {
  spreads: Spread[]
  currentSpread: Spread
  onGoToSpread: (pageNumber: number) => void
}

export function SubPane({ currentSpread, onGoToSpread, spreads }: SubPaneProps) {
  return (
    <aside className="pane pane-sub" aria-label="見開き一覧">
      <SpreadNavigator
        currentSpreadId={currentSpread.id}
        onGoToSpread={onGoToSpread}
        spreads={spreads}
      />
    </aside>
  )
}
