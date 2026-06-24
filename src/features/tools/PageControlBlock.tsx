export function PageControlBlock() {
  return (
    <section className="section-block">
      <div className="section-heading">
        <h2 className="section-title">ページ操作</h2>
        <span className="text-caption">1</span>
      </div>
      <div className="button-row">
        <button className="ghost-button" type="button" aria-label="前のページ">
          ◀
        </button>
        <button className="ghost-button" type="button" aria-label="次のページ">
          ▶
        </button>
      </div>
      <div className="check-row is-checked">
        <span className="check-mark" aria-hidden="true" />
        <span>現在作業中のページ番号を自動入力</span>
      </div>
      <div className="page-action-stack">
        <label className="page-action-field">
          <span className="text-label">削除するページ番号</span>
          <span className="inline-control-row">
            <input className="number-field" defaultValue="1" readOnly aria-label="削除するページ番号" />
            <button className="danger-button" type="button">
              削除
            </button>
          </span>
        </label>
        <label className="page-action-field">
          <span className="text-label">挿入するページ番号</span>
          <span className="inline-control-row">
            <input className="number-field" defaultValue="1" readOnly aria-label="挿入するページ番号" />
            <button className="ghost-button" type="button">
              挿入
            </button>
          </span>
        </label>
      </div>
    </section>
  )
}
