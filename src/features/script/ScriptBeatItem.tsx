type ScriptBeatItemProps = {
  panelNo: string
  character: string
  body: string
}

export function ScriptBeatItem({ panelNo, character, body }: ScriptBeatItemProps) {
  return (
    <article className="beat-card">
      <div className="beat-card-header">
        <span className="panel-no">No. {panelNo}</span>
        <span className="text-caption">{character}</span>
      </div>
      <p className="text-body">{body}</p>
    </article>
  )
}
