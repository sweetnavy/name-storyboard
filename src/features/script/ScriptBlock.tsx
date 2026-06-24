import { ScriptBeatItem } from './ScriptBeatItem'

const beats = [
  {
    panelNo: '001',
    character: '澪',
    body: '雨の上がった校門前。澪が空を見上げ、少しだけ笑う。',
  },
  {
    panelNo: '002',
    character: '奏',
    body: '奏が傘を閉じながら近づく。二人の距離はまだ少し遠い。',
  },
  {
    panelNo: '003',
    character: '澪',
    body: '扉ページの余白にタイトルを置く想定。背景は薄い校舎シルエット。',
  },
]

export function ScriptBlock() {
  return (
    <section className="section-block script-block">
      <div className="section-heading">
        <h2 className="section-title">コマ内容</h2>
        <span className="text-caption">2ページ分</span>
      </div>
      <div className="check-row is-checked">
        <span className="check-mark" aria-hidden="true" />
        <span>コマ番号自動入力</span>
      </div>
      <div className="beat-list">
        {beats.map((beat) => (
          <ScriptBeatItem
            body={beat.body}
            character={beat.character}
            key={beat.panelNo}
            panelNo={beat.panelNo}
          />
        ))}
      </div>
    </section>
  )
}
