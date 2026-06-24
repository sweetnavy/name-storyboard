const spreads = ['p.1 扉', 'p.2-3', 'p.4-5', 'p.6-7']

export function SpreadNavigator() {
  return (
    <section className="navigator-block">
      <div className="section-heading">
        <h2 className="section-title">見開き一覧</h2>
        <span className="text-caption">4 spreads</span>
      </div>
      <div className="spread-list">
        {spreads.map((spread, index) => (
          <article className="spread-thumb" key={spread}>
            <div className="thumb-pages" aria-hidden="true">
              <span />
              {index > 0 && <span />}
            </div>
            <strong>{spread}</strong>
          </article>
        ))}
      </div>
    </section>
  )
}
