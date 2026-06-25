import { SpreadNavigator } from '../features/navigator/SpreadNavigator'
import type { Spread } from '../types/storyboard'

type SubPaneProps = {
  spreads: Spread[]
  currentSpread: Spread
  onGoToSpread: (pageNumber: number) => void
  onMoveBeatToPage: (beatId: string, pageNumber: number) => void
  onMovePanelToPage: (panelId: string, pageNumber: number) => void
}

export function SubPane({
  currentSpread,
  onGoToSpread,
  onMoveBeatToPage,
  onMovePanelToPage,
  spreads,
}: SubPaneProps) {
  return (
    <aside className="pane pane-sub" aria-label="見開き一覧">
      <SpreadNavigator
        currentSpreadId={currentSpread.id}
        onGoToSpread={onGoToSpread}
        onMoveBeatToPage={onMoveBeatToPage}
        onMovePanelToPage={onMovePanelToPage}
        spreads={spreads}
      />
    </aside>
  )
}
