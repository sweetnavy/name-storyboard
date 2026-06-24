import { ScriptBeatItem } from './ScriptBeatItem'
import type { Character, Project } from '../../types/storyboard'
import { getCurrentSpread } from '../../utils/pageOperations'

type ScriptBlockProps = {
  project: Project
  characters: Character[]
  onAddBeat: () => void
  onUpdateBeatText: (beatId: string, text: string) => void
  onDeleteBeat: (beatId: string) => void
}

export function ScriptBlock({
  characters,
  onAddBeat,
  onDeleteBeat,
  onUpdateBeatText,
  project,
}: ScriptBlockProps) {
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
      <div className="check-row is-checked">
        <span className="check-mark" aria-hidden="true" />
        <span>コマ番号自動入力</span>
      </div>
      <div className="beat-list">
        {visibleBeats.map((beat) => (
          <ScriptBeatItem
            beat={beat}
            characters={characters}
            key={beat.id}
            onDeleteBeat={onDeleteBeat}
            onUpdateBeatText={onUpdateBeatText}
          />
        ))}
        {visibleBeats.length === 0 && <p className="text-muted">このページのコマ内容はまだありません。</p>}
      </div>
    </section>
  )
}
