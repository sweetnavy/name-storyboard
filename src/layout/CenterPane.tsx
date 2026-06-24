import { SpreadCanvas } from '../features/canvas/SpreadCanvas'
import type { Project } from '../types/storyboard'

type CenterPaneProps = {
  project: Project
  onSelectPage: (pageNumber: number) => void
}

export function CenterPane({ onSelectPage, project }: CenterPaneProps) {
  return (
    <section className="pane pane-center" aria-label="見開き漫画ページ">
      <SpreadCanvas onSelectPage={onSelectPage} project={project} />
    </section>
  )
}
