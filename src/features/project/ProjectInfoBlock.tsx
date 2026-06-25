import type { Project } from '../../types/storyboard'

type ProjectInfoBlockProps = {
  project: Project
  onUpdateTitle: (title: string) => void
  onToggleCoverPage: () => void
  onUpdateBinding: (binding: Project['binding']) => void
}

export function ProjectInfoBlock({
  onToggleCoverPage,
  onUpdateBinding,
  onUpdateTitle,
  project,
}: ProjectInfoBlockProps) {
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
        <button
          className={`check-row check-button ${project.coverPage ? 'is-checked' : ''}`}
          onClick={onToggleCoverPage}
          type="button"
        >
          <span className="check-mark" aria-hidden="true" />
          <span>1ページ目を扉にする</span>
        </button>
        <div className="segmented-control" aria-label="綴じ方向">
          <button
            className={project.binding === 'rtl' ? 'is-active' : ''}
            onClick={() => onUpdateBinding('rtl')}
            type="button"
          >
            右綴じ
          </button>
          <button
            className={project.binding === 'ltr' ? 'is-active' : ''}
            onClick={() => onUpdateBinding('ltr')}
            type="button"
          >
            左綴じ
          </button>
        </div>
      </div>
    </section>
  )
}
