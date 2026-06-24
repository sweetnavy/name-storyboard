import { CharacterBlock } from '../features/characters/CharacterBlock'
import { ProjectInfoBlock } from '../features/project/ProjectInfoBlock'
import { PageControlBlock } from '../features/tools/PageControlBlock'
import { ToolBlock } from '../features/tools/ToolBlock'

export function LeftPane() {
  return (
    <aside className="pane pane-left" aria-label="作品情報とツール">
      <ProjectInfoBlock />
      <PageControlBlock />
      <ToolBlock />
      <CharacterBlock />
    </aside>
  )
}
