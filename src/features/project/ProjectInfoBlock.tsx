import type { Project } from '../../types/storyboard'

type ProjectInfoBlockProps = {
  project: Project
  onUpdateTitle: (title: string) => void
}

export function ProjectInfoBlock({ onUpdateTitle, project }: ProjectInfoBlockProps) {
  return (
    <section className="section-block">
      <div className="section-heading">
        <h2 className="section-title">作品情報</h2>
        <span className="text-caption">{project.binding === 'rtl' ? '右綴じ' : '左綴じ'}</span>
      </div>
      <div className="field-stack">
        <div className="display-field">
          <span className="text-label">プロジェクト名</span>
          <input
            className="title-field"
            onChange={(event) => onUpdateTitle(event.target.value)}
            value={project.title}
          />
        </div>
        <div className={`check-row ${project.coverPage ? 'is-checked' : ''}`}>
          <span className="check-mark" aria-hidden="true" />
          <span>1ページ目を扉にする</span>
        </div>
      </div>
    </section>
  )
}
