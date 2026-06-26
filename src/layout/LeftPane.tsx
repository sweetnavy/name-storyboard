import { CharacterBlock } from '../features/characters/CharacterBlock'
import { DrawingBlock } from '../features/drawing/DrawingBlock'
import { ProjectInfoBlock } from '../features/project/ProjectInfoBlock'
import type { DrawingTool, Project } from '../types/storyboard'

type LeftPaneProps = {
  project: Project
  projects: Project[]
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
  drawingControls: {
    drawingMode: boolean
    selectedTool: DrawingTool
    penColor: string
    penWidth: number
    eraserWidth: number
    canRedo: boolean
    onToggleDrawingMode: () => void
    onSelectTool: (tool: DrawingTool) => void
    onSelectColor: (color: string) => void
    onChangePenWidth: (width: number) => void
    onChangeEraserWidth: (width: number) => void
    onUndo: () => void
    onRedo: () => void
    onClear: () => void
  }
}

export function LeftPane({
  drawingControls,
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
        currentPageNumber={project.selectedPageNumber}
        onDeletePages={onDeletePages}
        onInsertPages={onInsertPages}
        onNormalizeTitle={onNormalizeProjectTitle}
        onSelectProject={onSelectProject}
        onUpdateBinding={onUpdateBinding}
        onUpdateTitle={onUpdateProjectTitle}
        project={project}
        projects={projects}
      />
      <CharacterBlock
        characters={project.characters}
        onAddCharacter={onAddCharacter}
        onDeleteCharacter={onDeleteCharacter}
        onSelectCharacter={onSelectCharacter}
        onUpdateCharacterColor={onUpdateCharacterColor}
        selectedCharacterId={project.selectedCharacterId}
      />
      <DrawingBlock {...drawingControls} />
    </aside>
  )
}
