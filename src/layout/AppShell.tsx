import { useRef, useState } from 'react'
import { useAutoSaveProject } from '../hooks/useAutoSaveProject'
import {
  deletePages,
  getCurrentSpread,
  getSpreads,
  insertPages,
  moveBySpread,
  parsePageRange,
} from '../utils/pageOperations'
import { loadProject, parseProjectJson, saveProject } from '../utils/storage'
import { PaneLayout } from './PaneLayout'

export function AppShell() {
  const [project, setProject] = useState(loadProject)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const saveStatus = useAutoSaveProject(project)
  const spreads = getSpreads(project)
  const currentSpread = getCurrentSpread(project)

  const updateProjectTitle = (title: string) => {
    setProject((currentProject) => ({ ...currentProject, title }))
  }

  const goToSpread = (pageNumber: number) => {
    setProject((currentProject) => ({
      ...currentProject,
      currentPageNumber: pageNumber,
      selectedPageNumber: pageNumber,
    }))
  }

  const goToPreviousSpread = () => {
    setProject((currentProject) => moveBySpread(currentProject, -1))
  }

  const goToNextSpread = () => {
    setProject((currentProject) => moveBySpread(currentProject, 1))
  }

  const selectPage = (pageNumber: number) => {
    setProject((currentProject) => ({
      ...currentProject,
      currentPageNumber: pageNumber,
      selectedPageNumber: pageNumber,
    }))
  }

  const handleInsertPages = (input: string) => {
    const range = parsePageRange(input, project.pages.length, true)
    if (!range) {
      window.alert('ページ番号を正しく入力してください。例: 3 または 2-4')
      return
    }

    setProject((currentProject) => insertPages(currentProject, range.start, range.count))
  }

  const handleDeletePages = (input: string) => {
    if (project.pages.length <= 1) {
      window.alert('最低1ページは残してください。')
      return
    }

    const range = parsePageRange(input, project.pages.length)
    if (!range) {
      window.alert('ページ番号を正しく入力してください。例: 3 または 2-4')
      return
    }

    if (range.count >= project.pages.length) {
      window.alert('最低1ページは残してください。')
      return
    }

    const confirmed = window.confirm(`${range.label}ページを削除します。よろしいですか？`)

    if (!confirmed) {
      return
    }

    setProject((currentProject) => deletePages(currentProject, range.start, range.end))
  }

  const addCharacter = (name: string, color: string) => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      return
    }

    if (project.characters.some((character) => character.name === trimmedName)) {
      window.alert('同じ名前の登場人物がすでにあります。')
      return
    }

    const id = `character-${Date.now()}`
    setProject((currentProject) => ({
      ...currentProject,
      selectedCharacterId: id,
      characters: [
        ...currentProject.characters,
        { id, name: trimmedName, tone: 'blue', color },
      ],
    }))
  }

  const selectCharacter = (characterId: string) => {
    setProject((currentProject) => ({ ...currentProject, selectedCharacterId: characterId }))
  }

  const updateCharacterColor = (characterId: string, color: string) => {
    setProject((currentProject) => ({
      ...currentProject,
      characters: currentProject.characters.map((character) =>
        character.id === characterId ? { ...character, color } : character,
      ),
    }))
  }

  const deleteCharacter = (characterId: string) => {
    const character = project.characters.find((item) => item.id === characterId)
    if (!character) {
      return
    }

    if (!window.confirm(`${character.name}を削除します。よろしいですか？`)) {
      return
    }

    setProject((currentProject) => ({
      ...currentProject,
      selectedCharacterId:
        currentProject.selectedCharacterId === characterId ? undefined : currentProject.selectedCharacterId,
      characters: currentProject.characters.filter((item) => item.id !== characterId),
    }))
  }

  const addBeat = () => {
    setProject((currentProject) => {
      const nextNo = currentProject.beats.reduce((maxNo, beat) => Math.max(maxNo, beat.no), 0) + 1
      const pageNumber = currentProject.selectedPageNumber || currentProject.currentPageNumber
      return {
        ...currentProject,
        beats: [
          ...currentProject.beats,
          {
            id: `beat-${Date.now()}`,
            pageNumber,
            no: nextNo,
            text: '',
            characterIds: [],
            order: currentProject.beats.length + 1,
          },
        ],
      }
    })
  }

  const updateBeatText = (beatId: string, text: string) => {
    setProject((currentProject) => ({
      ...currentProject,
      beats: currentProject.beats.map((beat) => (beat.id === beatId ? { ...beat, text } : beat)),
    }))
  }

  const deleteBeat = (beatId: string) => {
    const beat = project.beats.find((item) => item.id === beatId)
    if (!beat || !confirmBeatDelete(beat.no)) {
      return
    }

    setProject((currentProject) => ({
      ...currentProject,
      beats: currentProject.beats.filter((item) => item.id !== beatId),
    }))
  }

  const saveJson = () => {
    const fileName = `${sanitizeFileName(project.title || 'storyboard')}.storyboard.json`
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const loadJson = async (file: File | undefined) => {
    if (!file) {
      return
    }

    const text = await file.text()
    const loadedProject = parseProjectJson(text)
    if (!loadedProject) {
      window.alert('読み込めないJSONです。schemaVersionや必要なプロパティを確認してください。')
      return
    }

    saveProject(loadedProject)
    setProject(loadedProject)
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="text-overline">Name Storyboard</p>
          <div className="header-title-row">
            <h1 className="app-title">漫画ネーム作成</h1>
            <button className="mini-button" type="button" onClick={saveJson}>
              SAVE
            </button>
            <button className="mini-button" type="button" onClick={() => fileInputRef.current?.click()}>
              LOAD
            </button>
            <input
              accept="application/json,.json"
              hidden
              onChange={(event) => {
                void loadJson(event.target.files?.[0])
                event.target.value = ''
              }}
              ref={fileInputRef}
              type="file"
            />
          </div>
        </div>
        <div className="header-meta">
          <span className="status-pill">{saveStatus}</span>
          <span className="text-muted">全 {project.pages.length} ページ</span>
        </div>
      </header>
      <PaneLayout
        currentSpread={currentSpread}
        onAddBeat={addBeat}
        onAddCharacter={addCharacter}
        onDeleteBeat={deleteBeat}
        onDeleteCharacter={deleteCharacter}
        onDeletePages={handleDeletePages}
        onGoToNextSpread={goToNextSpread}
        onGoToPreviousSpread={goToPreviousSpread}
        onGoToSpread={goToSpread}
        onInsertPages={handleInsertPages}
        onSelectCharacter={selectCharacter}
        onSelectPage={selectPage}
        onUpdateBeatText={updateBeatText}
        onUpdateCharacterColor={updateCharacterColor}
        onUpdateProjectTitle={updateProjectTitle}
        project={project}
        spreads={spreads}
      />
    </div>
  )
}

function sanitizeFileName(value: string) {
  return value.trim().replace(/[\\/:*?"<>|]/g, '_') || 'storyboard'
}

function confirmBeatDelete(no: number) {
  return window.confirm(`No. ${String(no).padStart(3, '0')}を削除します。よろしいですか？`)
}
