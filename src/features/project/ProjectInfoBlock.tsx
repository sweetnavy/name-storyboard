import { useState } from 'react'
import type { Project } from '../../types/storyboard'

type ProjectInfoBlockProps = {
  project: Project
  projects: Project[]
  onUpdateTitle: (title: string) => void
  onNormalizeTitle: () => void
  onAddProject: () => void
  onSelectProject: (projectId: string) => void
  onDeleteCurrentProject: () => void
  onToggleCoverPage: () => void
  onUpdateBinding: (binding: Project['binding']) => void
}

export function ProjectInfoBlock({
  onAddProject,
  onDeleteCurrentProject,
  onNormalizeTitle,
  onSelectProject,
  onToggleCoverPage,
  onUpdateBinding,
  onUpdateTitle,
  project,
  projects,
}: ProjectInfoBlockProps) {
  const [isProjectListOpen, setIsProjectListOpen] = useState(false)

  return (
    <section className="section-block">
      <div className="section-heading">
        <h2 className="section-title">作品情報</h2>
        <span className="text-caption">{project.binding === 'rtl' ? '右綴じ' : '左綴じ'}</span>
      </div>
      <div className="field-stack">
        <div className="project-title-row">
          <div className="project-combobox">
            <input
              aria-label="作品タイトル"
              className="title-field"
              onBlur={onNormalizeTitle}
              onChange={(event) => onUpdateTitle(event.target.value)}
              onFocus={() => setIsProjectListOpen(true)}
              placeholder="無題_00"
              value={project.title}
            />
            <button
              aria-expanded={isProjectListOpen}
              aria-label="作品一覧を開く"
              className="project-list-toggle"
              onClick={() => setIsProjectListOpen((currentValue) => !currentValue)}
              type="button"
            >
              ▼
            </button>
            {isProjectListOpen && (
              <div className="project-option-list" role="listbox">
                {projects.map((item, index) => (
                  <button
                    className={item.id === project.id ? 'is-active' : ''}
                    key={item.id}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setIsProjectListOpen(false)
                      onSelectProject(item.id)
                    }}
                    role="option"
                    type="button"
                  >
                    <span>{item.title || '無題_00'}</span>
                    <small>{item.id === project.id ? '現在' : `作品 ${index + 1}`}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button aria-label="新しい作品を追加" className="mini-button icon-button" onClick={onAddProject} type="button">
            ＋
          </button>
        </div>
        <button className="danger-button project-delete-button" onClick={onDeleteCurrentProject} type="button">
          この作品を削除する
        </button>
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
