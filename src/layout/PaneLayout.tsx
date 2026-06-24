import { CenterPane } from './CenterPane'
import { LeftPane } from './LeftPane'
import { RightPane } from './RightPane'
import { SubPane } from './SubPane'

export function PaneLayout() {
  return (
    <main className="pane-layout">
      <LeftPane />
      <SubPane />
      <CenterPane />
      <RightPane />
    </main>
  )
}
