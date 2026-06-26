import { CharacterBlock } from '../features/characters/CharacterBlock'
import { ProjectInfoBlock } from '../features/project/ProjectInfoBlock'
import { PageControlBlock } from '../features/tools/PageControlBlock'
import type { Project, Spread } from '../types/storyboard'

type LeftPaneProps = {
  project: Project
  projects: Project[]
  currentSpread: Spread
  onInsertPages: (input: string) => void
  onDeletePages: (input: string) => void
  onUpdateProjectTitle: (title: string) => void
  onNormalizeProjectTitle: () => void
  onAddProject: () => void
  onSelectProject: (projectId: string) => void
  onDeleteCurrentProject: () => void
  onToggleCoverPage: () => void
  onUpdateBinding: (binding: Project['binding']) => void
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
  onInsertPages,
  onSelectCharacter,
  onUpdateCharacterColor,
  onUpdateProjectTitle,
  onNormalizeProjectTitle,
  onAddProject,
  onSelectProject,
  onDeleteCurrentProject,
  onToggleCoverPage,
  onUpdateBinding,
  project,
  projects,
}: LeftPaneProps) {
  return (
    <aside className="pane pane-left" aria-label="作品情報とツール">
      <ProjectInfoBlock
        onToggleCoverPage={onToggleCoverPage}
        onAddProject={onAddProject}
        onDeleteCurrentProject={onDeleteCurrentProject}
        onNormalizeTitle={onNormalizeProjectTitle}
        onSelectProject={onSelectProject}
        onUpdateBinding={onUpdateBinding}
        onUpdateTitle={onUpdateProjectTitle}
        project={project}
        projects={projects}
      />
      <PageControlBlock
        currentPageNumber={project.selectedPageNumber}
        currentSpread={currentSpread}
        onDeletePages={onDeletePages}
        onInsertPages={onInsertPages}
      />
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
