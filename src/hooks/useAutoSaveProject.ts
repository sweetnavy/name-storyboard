import { useEffect, useState } from 'react'
import type { AppState, SaveStatus } from '../types/storyboard'
import { saveAppState } from '../utils/storage'

export function useAutoSaveProject(appState: AppState): SaveStatus {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('保存済み')

  useEffect(() => {
    setSaveStatus('保存中...')
    const timeoutId = window.setTimeout(() => {
      saveAppState(appState)
      setSaveStatus('保存済み')
    }, 500)

    return () => window.clearTimeout(timeoutId)
  }, [appState])

  return saveStatus
}
