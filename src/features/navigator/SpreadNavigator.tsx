const spreads = [
  { label: '1', pages: ['1', ''], tone: 'cover' },
  { label: '2-3', pages: ['3', '2'] },
  { label: '4-5', pages: ['5', '4'] },
  { label: '6-7', pages: ['7', '6'] },
]

export function SpreadNavigator() {
  return (
    <section className="navigator-block">
      <div className="section-heading">
        <h2 className="section-title">見開き一覧</h2>
        <span className="text-caption">右綴じ</span>
      </div>
      <div className="spread-list">
        {spreads.map((spread) => (
          <article className="spread-thumb" key={spread.label}>
            <div className="thumb-pages" aria-hidden="true">
              {spread.pages.map((page) => (
                <span className={page === '' ? 'is-empty-page' : undefined} key={page || 'empty'}>
                  {page}
                </span>
              ))}
            </div>
            <strong>
              {spread.label}
              {spread.tone === 'cover' && <span className="thumb-note">扉</span>}
            </strong>
          </article>
        ))}
      </div>
    </section>
  )
}
