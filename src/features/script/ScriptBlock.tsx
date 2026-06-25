import { ScriptBeatItem } from './ScriptBeatItem'
import { useState } from 'react'
import type { Character, Project } from '../../types/storyboard'
import { getCurrentSpread } from '../../utils/pageOperations'

type ScriptBlockProps = {
  project: Project
  characters: Character[]
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

export function ScriptBlock({
  characters,
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
  project,
  selectedBeatId,
}: ScriptBlockProps) {
  const [reorderMarker, setReorderMarker] = useState<{ beatId: string; placement: 'before' | 'after' }>()
  const currentSpread = getCurrentSpread(project)
  const visiblePageNumbers = currentSpread.pageNumbers
  const visibleBeats = project.beats
    .filter((beat) => visiblePageNumbers.includes(beat.pageNumber))
    .sort((firstBeat, secondBeat) => firstBeat.order - secondBeat.order)

  return (
    <section className="section-block script-block">
      <div className="section-heading">
        <h2 className="section-title">コマ内容</h2>
        <button className="mini-button" type="button" onClick={onAddBeat}>
          ＋
        </button>
      </div>
      <button
        className={`check-row check-button ${project.autoNumberPanels ? 'is-checked' : ''}`}
        onClick={onToggleAutoNumberPanels}
        type="button"
      >
        <span className="check-mark" aria-hidden="true" />
        <span>コマ番号自動入力</span>
      </button>
      <button
        className={`check-row check-button ${project.swapPanelContent ? 'is-checked' : ''}`}
        onClick={onToggleSwapPanelContent}
        type="button"
      >
        <span className="check-mark" aria-hidden="true" />
        <span>コマ内容も一緒に入れ替える</span>
      </button>
      <div className="beat-list">
        {visibleBeats.map((beat) => (
          <ScriptBeatItem
            beat={beat}
            characters={characters}
            isSelected={beat.id === selectedBeatId}
            autoNumberPanels={project.autoNumberPanels}
            reorderMarker={reorderMarker?.beatId === beat.id ? reorderMarker.placement : undefined}
            onAddCharacterToBeat={onAddCharacterToBeat}
            onAddDialogueLine={onAddDialogueLine}
            key={beat.id}
            onClearReorderMarker={() => setReorderMarker(undefined)}
            onDeleteBeat={onDeleteBeat}
            onDeleteDialogueLine={onDeleteDialogueLine}
            onDragReorderOver={(targetBeatId, placement) => setReorderMarker({ beatId: targetBeatId, placement })}
            onRemoveCharacterFromBeat={onRemoveCharacterFromBeat}
            onReorderBeat={(dragBeatId, targetBeatId, placement) =>
              onReorderVisibleBeats(
                dragBeatId,
                targetBeatId,
                visiblePageNumbers,
                placement,
              )
            }
            onSelectBeat={onSelectBeat}
            onSelectDialogueBubble={onSelectDialogueBubble}
            onUpdateBeatText={onUpdateBeatText}
            onUpdateBeatNo={onUpdateBeatNo}
            onUpdateDialogueLine={onUpdateDialogueLine}
            onToggleDialogueShape={onToggleDialogueShape}
          />
        ))}
        {visibleBeats.length === 0 && <p className="text-muted">このページのコマ内容はまだありません。</p>}
      </div>
    </section>
  )
}
