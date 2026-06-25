import { useEffect, useRef } from 'react'
import type { Beat, Character } from '../../types/storyboard'

type ScriptBeatItemProps = {
  beat: Beat
  characters: Character[]
  onUpdateBeatText: (beatId: string, text: string) => void
  onUpdateBeatNo: (beatId: string, no: number | null) => void
  onUpdateDialogueLine: (beatId: string, dialogueId: string, text: string) => void
  onToggleDialogueShape: (beatId: string, dialogueId: string) => void
  onDeleteDialogueLine: (beatId: string, dialogueId: string) => void
  onAddDialogueLine: (beatId: string) => void
  onDeleteBeat: (beatId: string) => void
  onReorderBeat: (dragBeatId: string, targetBeatId: string, placement: 'before' | 'after') => void
  onDragReorderOver: (targetBeatId: string, placement: 'before' | 'after') => void
  onClearReorderMarker: () => void
  onSelectBeat: (beatId: string) => void
  onSelectDialogueBubble: (bubbleId: string) => void
  onAddCharacterToBeat: (beatId: string, characterId: string) => void
  onRemoveCharacterFromBeat: (beatId: string, characterId: string) => void
  isSelected: boolean
  autoNumberPanels: boolean
  reorderMarker?: 'before' | 'after'
}

export function ScriptBeatItem({
  beat,
  autoNumberPanels,
  characters,
  isSelected,
  onAddCharacterToBeat,
  onAddDialogueLine,
  onDeleteBeat,
  onDeleteDialogueLine,
  onClearReorderMarker,
  onDragReorderOver,
  onRemoveCharacterFromBeat,
  onReorderBeat,
  onSelectBeat,
  onSelectDialogueBubble,
  onUpdateBeatText,
  onUpdateBeatNo,
  onUpdateDialogueLine,
  onToggleDialogueShape,
  reorderMarker,
}: ScriptBeatItemProps) {
  const cardRef = useRef<HTMLElement>(null)
  const beatCharacters = beat.characterIds
    .map((characterId) => characters.find((character) => character.id === characterId))
    .filter((character): character is Character => Boolean(character))

  useEffect(() => {
    if (isSelected) {
      cardRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [isSelected])

  return (
    <article
      className={`beat-card ${beat.panelId ? 'is-placed' : ''} ${isSelected ? 'is-selected' : ''} ${
        reorderMarker ? `has-insert-line-${reorderMarker}` : ''
      }`}
      draggable
      ref={cardRef}
      onClick={() => onSelectBeat(beat.id)}
      onDragStart={(event) => {
        event.dataTransfer.setData('application/x-storyboard-beat', beat.id)
        event.dataTransfer.setData('application/x-storyboard-beat-reorder', beat.id)
        event.dataTransfer.effectAllowed = 'copyMove'
      }}
      onDrop={(event) => {
        const characterId = event.dataTransfer.getData('application/x-storyboard-character')
        if (characterId) {
          event.preventDefault()
          event.stopPropagation()
          onAddCharacterToBeat(beat.id, characterId)
          return
        }

        const dragBeatId = event.dataTransfer.getData('application/x-storyboard-beat-reorder')
        if (!dragBeatId) {
          return
        }

        event.preventDefault()
        event.stopPropagation()
        onReorderBeat(dragBeatId, beat.id, getDropPlacement(event.currentTarget, event.clientY))
        onClearReorderMarker()
      }}
      onDragOver={(event) => {
        if (
          event.dataTransfer.types.includes('application/x-storyboard-beat-reorder') ||
          event.dataTransfer.types.includes('application/x-storyboard-character')
        ) {
          event.preventDefault()
          event.dataTransfer.dropEffect = event.dataTransfer.types.includes('application/x-storyboard-character')
            ? 'copy'
            : 'move'
          if (event.dataTransfer.types.includes('application/x-storyboard-beat-reorder')) {
            onDragReorderOver(beat.id, getDropPlacement(event.currentTarget, event.clientY))
          }
        }
      }}
      onDragLeave={() => onClearReorderMarker()}
      onDragEnd={onClearReorderMarker}
    >
      <div className="beat-card-header">
        {autoNumberPanels ? (
          <span className="panel-no">No.{String(beat.no ?? '').padStart(3, '0')}</span>
        ) : (
          <label className="manual-no-field">
            <span>No.</span>
            <input
              inputMode="numeric"
              onBlur={(event) => {
                const value = event.currentTarget.value.trim()
                const parsedNo = Number.parseInt(value, 10)
                onUpdateBeatNo(beat.id, Number.isFinite(parsedNo) ? parsedNo : null)
              }}
              defaultValue={beat.no ?? ''}
            />
          </label>
        )}
        <span className="text-caption">p{beat.pageNumber}</span>
      </div>
      <textarea
        className="beat-textarea"
        onChange={(event) => onUpdateBeatText(beat.id, event.target.value)}
        placeholder="コマ内容"
        value={beat.text}
      />
      <div className="dialogue-list">
        <div className="dialogue-heading">
          <span className="text-caption">セリフ</span>
          <button className="mini-button dialogue-add-button" type="button" onClick={() => onAddDialogueLine(beat.id)}>
            ＋
          </button>
        </div>
        {beat.dialogues
          .slice()
          .sort((first, second) => first.order - second.order)
          .map((dialogue) => (
            <label className="dialogue-row" key={dialogue.id}>
              <button
                aria-label={dialogue.bubbleId ? '配置済み吹き出しを選択' : 'セリフをドラッグして吹き出し配置'}
                className={`dialogue-status ${dialogue.bubbleId ? 'is-placed' : ''}`}
                draggable
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  if (dialogue.bubbleId) {
                    onSelectDialogueBubble(dialogue.bubbleId)
                  }
                }}
                onDragStart={(event) => {
                  event.stopPropagation()
                  event.dataTransfer.setData(
                    'application/x-storyboard-dialogue',
                    JSON.stringify({ beatId: beat.id, dialogueId: dialogue.id }),
                  )
                  event.dataTransfer.effectAllowed = 'copyMove'
                }}
                type="button"
              >
                {dialogue.bubbleId ? '●' : '○'}
              </button>
              <textarea
                className="dialogue-textarea"
                onChange={(event) => onUpdateDialogueLine(beat.id, dialogue.id, event.target.value)}
                placeholder="セリフ"
                rows={1}
                value={dialogue.text}
              />
              <button
                aria-label={dialogue.shape === 'rect' ? 'モノローグ' : '楕円形セリフ'}
                className="dialogue-shape-button"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  onToggleDialogueShape(beat.id, dialogue.id)
                }}
                type="button"
              >
                {dialogue.shape === 'rect' ? <MonologueIcon /> : <BubbleIcon />}
              </button>
              <button
                aria-label="セリフ行を削除"
                className="dialogue-delete-button"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  onDeleteDialogueLine(beat.id, dialogue.id)
                }}
                type="button"
              >
                ×
              </button>
            </label>
          ))}
      </div>
      <div className="beat-card-footer">
        <div className="beat-character-row">
          {beatCharacters.map((character) => (
            <button
              className="beat-character-chip"
              key={character.id}
              onClick={(event) => {
                event.stopPropagation()
                onRemoveCharacterFromBeat(beat.id, character.id)
              }}
              style={{ backgroundColor: character.color }}
              type="button"
            >
              {character.name} ×
            </button>
          ))}
        </div>
        <button
          aria-label={`No. ${String(beat.no ?? '').padStart(3, '0')}を削除`}
          className="trash-button"
          onClick={() => onDeleteBeat(beat.id)}
          type="button"
        >
          🗑
        </button>
      </div>
    </article>
  )
}

function BubbleIcon() {
  return (
    <svg aria-hidden="true" className="button-icon" viewBox="0 0 24 24">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
    </svg>
  )
}

function MonologueIcon() {
  return (
    <svg aria-hidden="true" className="button-icon" viewBox="0 0 24 24">
      <g>
        <rect fill="none" height="24" width="24" />
        <g>
          <path d="M19,5v14H5V5H19 M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3L19,3z" />
        </g>
        <path d="M14,17H7v-2h7V17z M17,13H7v-2h10V13z M17,9H7V7h10V9z" />
      </g>
    </svg>
  )
}

function getDropPlacement(element: HTMLElement, clientY: number): 'before' | 'after' {
  const rect = element.getBoundingClientRect()
  return clientY < rect.top + rect.height / 2 ? 'before' : 'after'
}
