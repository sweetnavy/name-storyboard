export type Binding = 'rtl' | 'ltr'

export type CharacterTone = 'blue' | 'green' | 'amber' | 'rose'

export type Character = {
  id: string
  name: string
  tone: CharacterTone
  color: string
}

export type Beat = {
  id: string
  pageNumber: number
  panelId?: string
  no: number
  text: string
  characterIds: string[]
  order: number
}

export type Panel = {
  id: string
}

export type Page = {
  id: string
  pageNumber: number
  isCover: boolean
  panels: Panel[]
}

export type Project = {
  schemaVersion: 1
  id: string
  title: string
  binding: Binding
  coverPage: boolean
  currentPageNumber: number
  selectedPageNumber: number
  selectedCharacterId?: string
  pages: Page[]
  characters: Character[]
  beats: Beat[]
}

export type Spread = {
  id: string
  label: string
  pageNumbers: number[]
}

export type SaveStatus = '保存中...' | '保存済み'
