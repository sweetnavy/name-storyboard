import { useEffect, useState } from 'react'
import type { Project, SaveStatus } from '../types/storyboard'
import { saveProject } from '../utils/storage'

export function useAutoSaveProject(project: Project): SaveStatus {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('保存済み')

  useEffect(() => {
    setSaveStatus('保存中...')
    const timeoutId = window.setTimeout(() => {
      saveProject(project)
      setSaveStatus('保存済み')
    }, 500)

    return () => window.clearTimeout(timeoutId)
  }, [project])

  return saveStatus
}
