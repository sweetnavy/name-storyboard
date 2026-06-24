import type { Beat, Character } from '../../types/storyboard'

type ScriptBeatItemProps = {
  beat: Beat
  characters: Character[]
  onUpdateBeatText: (beatId: string, text: string) => void
  onDeleteBeat: (beatId: string) => void
}

export function ScriptBeatItem({
  beat,
  characters,
  onDeleteBeat,
  onUpdateBeatText,
}: ScriptBeatItemProps) {
  const characterNames = beat.characterIds
    .map((characterId) => characters.find((character) => character.id === characterId)?.name)
    .filter(Boolean)
    .join(' / ')

  return (
    <article className="beat-card">
      <div className="beat-card-header">
        <span className="panel-no">No. {String(beat.no).padStart(3, '0')}</span>
        <span className="text-caption">{characterNames || `page ${beat.pageNumber}`}</span>
      </div>
      <textarea
        className="beat-textarea"
        onChange={(event) => onUpdateBeatText(beat.id, event.target.value)}
        placeholder="コマ内容"
        value={beat.text}
      />
      <div className="beat-card-footer">
        <span className="text-caption">{beat.pageNumber}ページ</span>
        <button
          aria-label={`No. ${String(beat.no).padStart(3, '0')}を削除`}
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
