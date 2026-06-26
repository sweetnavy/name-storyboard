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
  no: number | null
  text: string
  dialogues: DialogueLine[]
  characterIds: string[]
  order: number
}

export type DialogueLine = {
  id: string
  beatId: string
  text: string
  bubbleId?: string
  shape: SpeechBubbleShape
  order: number
}

export type PanelPoint = {
  x: number
  y: number
}

export type TextBox = {
  x: number
  y: number
  width: number
  height: number
}

export type DrawingTool = 'pen' | 'eraser'

export type DrawingPoint = {
  x: number
  y: number
  pressure?: number
}

export type DrawingStroke = {
  id: string
  pageNumber: number
  pageNumbers?: number[]
  coordinateScope?: 'page' | 'spread'
  color: string
  width: number
  points: DrawingPoint[]
}

export type SpeechBubbleShape = 'ellipse' | 'rect'

export type SpeechBubble = {
  id: string
  pageNumber: number
  beatId: string
  dialogueId: string
  shape: SpeechBubbleShape
  textDirection: 'horizontal' | 'vertical'
  textFontSize?: number
  textBox: TextBox
  x: number
  y: number
  width: number
  height: number
}

export type ComicPanel = {
  id: string
  pageNumber: number
  beatId?: string
  x: number
  y: number
  width: number
  height: number
  textFontSize?: number
  textBox: TextBox
  points?: PanelPoint[]
  characterIds: string[]
  memo?: string
  order?: number
}

export type Page = {
  id: string
  pageNumber: number
  isCover: boolean
  panels: ComicPanel[]
  bubbles: SpeechBubble[]
  drawingStrokes: DrawingStroke[]
}

export type Project = {
  schemaVersion: 1
  id: string
  title: string
  binding: Binding
  coverPage: boolean
  autoNumberPanels: boolean
  swapPanelContent: boolean
  defaultBubbleTextDirection: 'horizontal' | 'vertical'
  pageTextFontSize: number
  currentPageNumber: number
  selectedPageNumber: number
  selectedPanelId?: string
  selectedBubbleId?: string
  selectedCharacterId?: string
  pages: Page[]
  characters: Character[]
  beats: Beat[]
}

export type AppState = {
  schemaVersion: 1
  currentProjectId: string
  projects: Project[]
}

export type Spread = {
  id: string
  label: string
  pageNumbers: number[]
}

export type SaveStatus = '保存中...' | '保存済み'
