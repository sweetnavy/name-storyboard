const tools = ['コマ追加', '選択', 'ナイフ', '削除']

export function ToolBlock() {
  return (
    <section className="section-block">
      <div className="section-heading">
        <h2 className="section-title">ツール</h2>
      </div>
      <div className="tool-grid">
        {tools.map((tool) => (
          <button className="tool-button" type="button" key={tool}>
            {tool}
          </button>
        ))}
      </div>
    </section>
  )
}
