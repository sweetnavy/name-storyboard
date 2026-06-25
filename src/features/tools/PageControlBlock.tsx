import { useEffect, useState } from 'react'
import type { Spread } from '../../types/storyboard'

type PageControlBlockProps = {
  currentPageNumber: number
  currentSpread: Spread
  onInsertPages: (input: string) => void
  onDeletePages: (input: string) => void
}

export function PageControlBlock({
  currentPageNumber,
  currentSpread,
  onDeletePages,
  onInsertPages,
}: PageControlBlockProps) {
  const [pageNumberInput, setPageNumberInput] = useState(String(currentPageNumber))

  useEffect(() => {
    setPageNumberInput(String(currentPageNumber))
  }, [currentPageNumber])

  return (
    <section className="section-block">
      <div className="section-heading">
        <h2 className="section-title">ページ操作</h2>
        <span className="text-caption">{currentSpread.label}</span>
      </div>
      <label className="page-action-field">
        <span className="text-label">ページ番号</span>
        <input
          className="number-field"
          inputMode="numeric"
          min="1"
          onChange={(event) => setPageNumberInput(event.target.value)}
          type="number"
          value={pageNumberInput}
        />
      </label>
      <div className="button-row">
        <button className="ghost-button" type="button" onClick={() => onInsertPages(pageNumberInput)}>
          挿入
        </button>
        <button className="danger-button" type="button" onClick={() => onDeletePages(pageNumberInput)}>
          削除
        </button>
      </div>
    </section>
  )
}
