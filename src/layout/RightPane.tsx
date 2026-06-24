import { ScriptBlock } from '../features/script/ScriptBlock'
import type { Project } from '../types/storyboard'

type RightPaneProps = {
  project: Project
  onAddBeat: () => void
  onUpdateBeatText: (beatId: string, text: string) => void
  onDeleteBeat: (beatId: string) => void
}

export function RightPane({ onAddBeat, onDeleteBeat, onUpdateBeatText, project }: RightPaneProps) {
  return (
    <aside className="pane pane-right" aria-label="コマ内容">
      <ScriptBlock
        characters={project.characters}
        onAddBeat={onAddBeat}
        onDeleteBeat={onDeleteBeat}
        onUpdateBeatText={onUpdateBeatText}
        project={project}
      />
    </aside>
  )
}
