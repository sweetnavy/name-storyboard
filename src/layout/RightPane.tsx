import { ScriptBlock } from '../features/script/ScriptBlock'

export function RightPane() {
  return (
    <aside className="pane pane-right" aria-label="コマ内容">
      <ScriptBlock />
    </aside>
  )
}
