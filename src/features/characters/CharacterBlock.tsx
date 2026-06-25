import { useState } from 'react'
import { CHARACTER_COLOR_PRESETS } from '../../data/initialProject'
import type { Character } from '../../types/storyboard'

type CharacterBlockProps = {
  characters: Character[]
  selectedCharacterId?: string
  onAddCharacter: (name: string, color: string) => void
  onSelectCharacter: (characterId: string) => void
  onUpdateCharacterColor: (characterId: string, color: string) => void
  onDeleteCharacter: (characterId: string) => void
}

export function CharacterBlock({
  characters,
  onAddCharacter,
  onDeleteCharacter,
  onSelectCharacter,
  onUpdateCharacterColor,
  selectedCharacterId,
}: CharacterBlockProps) {
  const [characterName, setCharacterName] = useState('')
  const [selectedColor, setSelectedColor] = useState(CHARACTER_COLOR_PRESETS[0])

  const handleAddCharacter = () => {
    onAddCharacter(characterName, selectedColor)
    setCharacterName('')
  }

  return (
    <section className="section-block">
      <div className="section-heading">
        <h2 className="section-title">登場人物</h2>
      </div>
      <div className="chip-list">
        {characters.map((character) => (
          <span className="character-chip-wrap" key={character.id}>
            <button
              className={`character-chip chip-${character.tone} ${
                character.id === selectedCharacterId ? 'is-active' : ''
              }`}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData('application/x-storyboard-character', character.id)
                event.dataTransfer.effectAllowed = 'copy'
              }}
              onClick={() => onSelectCharacter(character.id)}
              style={{ backgroundColor: character.color }}
              type="button"
            >
              {character.name}
            </button>
            {character.id === selectedCharacterId && (
              <button
                aria-label={`${character.name}を削除`}
                className="chip-delete-button"
                onClick={() => onDeleteCharacter(character.id)}
                type="button"
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>
      <div className="character-editor">
        <div className="inline-control-row">
          <input
            className="number-field"
            onChange={(event) => setCharacterName(event.target.value)}
            placeholder="名前"
            value={characterName}
          />
          <button className="ghost-button" type="button" onClick={handleAddCharacter}>
            追加
          </button>
        </div>
        <div className="color-swatch-list" aria-label="人物カラー">
          {CHARACTER_COLOR_PRESETS.map((color) => (
            <button
              aria-label={`色 ${color}`}
              className={`color-swatch ${color === selectedColor ? 'is-active' : ''}`}
              key={color}
              onClick={() => {
                setSelectedColor(color)
                if (selectedCharacterId) {
                  onUpdateCharacterColor(selectedCharacterId, color)
                }
              }}
              style={{ backgroundColor: color }}
              type="button"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
