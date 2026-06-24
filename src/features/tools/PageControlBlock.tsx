export function PageControlBlock() {
  return (
    <section className="section-block">
      <div className="section-heading">
        <h2 className="section-title">ページ操作</h2>
        <span className="text-caption">p.1-2</span>
      </div>
      <div className="button-row">
        <button className="ghost-button" type="button" aria-label="前のページ">
          ◀
        </button>
        <button className="ghost-button" type="button" aria-label="次のページ">
          ▶
        </button>
      </div>
      <div className="display-field danger-field">
        <span className="text-label">ページ削除</span>
        <span className="text-muted">削除するページ番号</span>
      </div>
    </section>
  )
}
