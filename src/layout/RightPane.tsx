import { ScriptBlock } from '../features/script/ScriptBlock'
import type { Project } from '../types/storyboard'

type RightPaneProps = {
  project: Project
  onAddBeat: () => void
  onAddDialogueLine: (beatId: string) => void
  onUpdateBeatText: (beatId: string, text: string) => void
  onUpdateBeatNo: (beatId: string, no: number | null) => void
  onUpdateDialogueLine: (beatId: string, dialogueId: string, text: string) => void
  onToggleDialogueShape: (beatId: string, dialogueId: string) => void
  onDeleteDialogueLine: (beatId: string, dialogueId: string) => void
  onDeleteBeat: (beatId: string) => void
  onReorderVisibleBeats: (
    dragBeatId: string,
    targetBeatId: string,
    pageNumbers: number[],
    placement: 'before' | 'after',
  ) => void
  onSelectBeat: (beatId: string) => void
  onSelectDialogueBubble: (bubbleId: string) => void
  onAddCharacterToBeat: (beatId: string, characterId: string) => void
  onRemoveCharacterFromBeat: (beatId: string, characterId: string) => void
  onToggleAutoNumberPanels: () => void
  onToggleSwapPanelContent: () => void
  selectedBeatId?: string
}

export function RightPane({
  onAddBeat,
  onAddDialogueLine,
  onDeleteBeat,
  onDeleteDialogueLine,
  onAddCharacterToBeat,
  onRemoveCharacterFromBeat,
  onReorderVisibleBeats,
  onSelectBeat,
  onSelectDialogueBubble,
  onToggleAutoNumberPanels,
  onToggleSwapPanelContent,
  onUpdateBeatText,
  onUpdateBeatNo,
  onUpdateDialogueLine,
  onToggleDialogueShape,
  selectedBeatId,
  project,
}: RightPaneProps) {
  return (
    <aside className="pane pane-right" aria-label="コマ内容">
      <ScriptBlock
        characters={project.characters}
        onAddBeat={onAddBeat}
        onAddDialogueLine={onAddDialogueLine}
        onAddCharacterToBeat={onAddCharacterToBeat}
        onDeleteBeat={onDeleteBeat}
        onDeleteDialogueLine={onDeleteDialogueLine}
        onRemoveCharacterFromBeat={onRemoveCharacterFromBeat}
        onReorderVisibleBeats={onReorderVisibleBeats}
        onSelectBeat={onSelectBeat}
        onSelectDialogueBubble={onSelectDialogueBubble}
        onToggleAutoNumberPanels={onToggleAutoNumberPanels}
        onToggleSwapPanelContent={onToggleSwapPanelContent}
        onUpdateBeatText={onUpdateBeatText}
        onUpdateBeatNo={onUpdateBeatNo}
        onUpdateDialogueLine={onUpdateDialogueLine}
        onToggleDialogueShape={onToggleDialogueShape}
        project={project}
        selectedBeatId={selectedBeatId}
      />
    </aside>
  )
}
