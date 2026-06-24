const characters = [
  { name: '澪', tone: 'blue' },
  { name: '奏', tone: 'green' },
  { name: '先生', tone: 'amber' },
  { name: 'クラスメイト', tone: 'rose' },
]

export function CharacterBlock() {
  return (
    <section className="section-block">
      <div className="section-heading">
        <h2 className="section-title">登場人物</h2>
      </div>
      <div className="chip-list">
        {characters.map((character) => (
          <span className={`character-chip chip-${character.tone}`} key={character.name}>
            {character.name}
          </span>
        ))}
      </div>
    </section>
  )
}
