import { CharacterBlock } from '../features/characters/CharacterBlock'
import { ProjectInfoBlock } from '../features/project/ProjectInfoBlock'
import { PageControlBlock } from '../features/tools/PageControlBlock'
import { ToolBlock } from '../features/tools/ToolBlock'
import type { Project, Spread } from '../types/storyboard'

type LeftPaneProps = {
  project: Project
  currentSpread: Spread
  onGoToPreviousSpread: () => void
  onGoToNextSpread: () => void
  onInsertPages: (input: string) => void
  onDeletePages: (input: string) => void
  onUpdateProjectTitle: (title: string) => void
  onAddCharacter: (name: string, color: string) => void
  onSelectCharacter: (characterId: string) => void
  onUpdateCharacterColor: (characterId: string, color: string) => void
  onDeleteCharacter: (characterId: string) => void
}

export function LeftPane({
  currentSpread,
  onAddCharacter,
  onDeleteCharacter,
  onDeletePages,
  onGoToNextSpread,
  onGoToPreviousSpread,
  onInsertPages,
  onSelectCharacter,
  onUpdateCharacterColor,
  onUpdateProjectTitle,
  project,
}: LeftPaneProps) {
  return (
    <aside className="pane pane-left" aria-label="作品情報とツール">
      <ProjectInfoBlock onUpdateTitle={onUpdateProjectTitle} project={project} />
      <PageControlBlock
        currentPageNumber={project.selectedPageNumber}
        currentSpread={currentSpread}
        onDeletePages={onDeletePages}
        onGoToNextSpread={onGoToNextSpread}
        onGoToPreviousSpread={onGoToPreviousSpread}
        onInsertPages={onInsertPages}
      />
      <ToolBlock />
      <CharacterBlock
        characters={project.characters}
        onAddCharacter={onAddCharacter}
        onDeleteCharacter={onDeleteCharacter}
        onSelectCharacter={onSelectCharacter}
        onUpdateCharacterColor={onUpdateCharacterColor}
        selectedCharacterId={project.selectedCharacterId}
      />
    </aside>
  )
}
