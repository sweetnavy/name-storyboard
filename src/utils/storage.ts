import { CHARACTER_COLOR_PRESETS, createInitialProject } from '../data/initialProject'
import type { AppState, Beat, Character, Page, Project } from '../types/storyboard'
import { renumberPages } from './pageOperations'

export const PROJECT_STORAGE_KEY = 'name-storyboard-project-v1'
export const APP_STATE_STORAGE_KEY = 'name-storyboard-app-state-v1'
const DEFAULT_TEXT_FONT_SIZE = 13
const DEFAULT_PROJECT_TITLE = '無題_00'

function normalizeFontSize(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(Math.max(Math.round(value), 8), 32)
    : undefined
}

function getDefaultBubbleTextBox(shape: 'ellipse' | 'rect') {
  return shape === 'rect'
    ? { x: 10, y: 10, width: 80, height: 80 }
    : { x: 14, y: 12, width: 72, height: 76 }
}

function normalizeTextBox(
  value: unknown,
  fallback: { x: number; y: number; width: number; height: number },
) {
  if (!value || typeof value !== 'object') {
    return fallback
  }

  const textBox = value as Partial<typeof fallback>
  const width = typeof textBox.width === 'number' && Number.isFinite(textBox.width)
    ? Math.min(Math.max(textBox.width, 12), 100)
    : fallback.width
  const height = typeof textBox.height === 'number' && Number.isFinite(textBox.height)
    ? Math.min(Math.max(textBox.height, 12), 100)
    : fallback.height

  return {
    x: typeof textBox.x === 'number' && Number.isFinite(textBox.x)
      ? Math.min(Math.max(textBox.x, 0), 100 - width)
      : fallback.x,
    y: typeof textBox.y === 'number' && Number.isFinite(textBox.y)
      ? Math.min(Math.max(textBox.y, 0), 100 - height)
      : fallback.y,
    width,
    height,
  }
}

function isProject(value: unknown): value is Project {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<Project>
  return candidate.schemaVersion === 1 && Array.isArray(candidate.pages)
}

function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<AppState>
  return candidate.schemaVersion === 1 && Array.isArray(candidate.projects)
}

export function createUntitledProject(title = DEFAULT_PROJECT_TITLE): Project {
  const initialProject = createInitialProject()
  return normalizeProject({
    ...initialProject,
    id: `project-${Date.now()}-${Math.round(Math.random() * 10000)}`,
    title,
    currentPageNumber: 1,
    selectedPageNumber: 1,
    selectedPanelId: undefined,
    selectedBubbleId: undefined,
    pages: initialProject.pages.map((page) => ({
      ...page,
      panels: [],
      bubbles: [],
    })),
    beats: [],
  })
}

function normalizeCharacters(project: Project): Character[] {
  const initialProject = createInitialProject()
  return (project.characters?.length ? project.characters : initialProject.characters).map(
    (character, index) => ({
      ...character,
      tone: character.tone ?? initialProject.characters[index % initialProject.characters.length].tone,
      color: character.color ?? CHARACTER_COLOR_PRESETS[index % CHARACTER_COLOR_PRESETS.length],
    }),
  )
}

function normalizeBeats(project: Project, characters: Character[], bubbleIds: Set<string>): Beat[] {
  return (project.beats ?? []).map((beat, index) => {
    const legacyBeat = beat as Beat & { body?: string; panelNo?: string; character?: string }
    const characterId = characters.find((character) => character.name === legacyBeat.character)?.id
    const beatId = legacyBeat.id ?? `beat-${index + 1}`

    return {
      id: beatId,
      pageNumber: legacyBeat.pageNumber ?? Math.min(index + 1, project.pages.length || 1),
      panelId: legacyBeat.panelId,
      no: legacyBeat.no ?? Number.parseInt(legacyBeat.panelNo ?? `${index + 1}`, 10),
      text: legacyBeat.text ?? legacyBeat.body ?? '',
      dialogues: (legacyBeat.dialogues?.length
        ? legacyBeat.dialogues
        : [{ id: `dialogue-${beatId}-1`, beatId, text: '', shape: 'ellipse' as const, order: 1 }]
      ).map((dialogue, dialogueIndex) => ({
        id: dialogue.id ?? `dialogue-${beatId}-${dialogueIndex + 1}`,
        beatId,
        text: dialogue.text ?? '',
        bubbleId: dialogue.bubbleId && bubbleIds.has(dialogue.bubbleId) ? dialogue.bubbleId : undefined,
        shape: dialogue.shape ?? 'ellipse',
        order: dialogue.order ?? dialogueIndex + 1,
      })),
      characterIds: legacyBeat.characterIds ?? (characterId ? [characterId] : []),
      order: legacyBeat.order ?? index + 1,
    }
  })
}

export function normalizeProject(project: Project): Project {
  const characters = normalizeCharacters(project)
  const sourcePages = project.pages?.length ? project.pages : createInitialProject().pages
  const pages = renumberPages(
    sourcePages.map((page: Page) => ({
      ...page,
      panels: (page.panels ?? []).map((panel) => ({
        ...panel,
        pageNumber: panel.pageNumber ?? page.pageNumber,
        x: panel.x ?? 32,
        y: panel.y ?? 34,
        width: panel.width ?? 34,
        height: panel.height ?? 18,
        textFontSize: normalizeFontSize(panel.textFontSize),
        textBox: normalizeTextBox(panel.textBox, { x: 8, y: 18, width: 84, height: 64 }),
        points: Array.isArray(panel.points) && panel.points.length === 4
          ? panel.points.map((point) => ({
              x: Math.min(Math.max(point.x, 0), 100),
              y: Math.min(Math.max(point.y, 0), 100),
            }))
          : undefined,
        characterIds: panel.characterIds ?? [],
      })),
      bubbles: (page.bubbles ?? []).map((bubble) => ({
        ...bubble,
        pageNumber: bubble.pageNumber ?? page.pageNumber,
        shape: bubble.shape ?? 'ellipse',
        textDirection: bubble.textDirection ?? 'horizontal',
        textFontSize: normalizeFontSize(bubble.textFontSize),
        textBox: normalizeTextBox(bubble.textBox, getDefaultBubbleTextBox(bubble.shape ?? 'ellipse')),
        x: bubble.x ?? 40,
        y: bubble.y ?? 36,
        width: bubble.width ?? 24,
        height: bubble.height ?? 12,
      })),
      drawingStrokes: (page.drawingStrokes ?? []).map((stroke) => ({
        ...stroke,
        pageNumber: stroke.pageNumber ?? page.pageNumber,
        pageNumbers: Array.isArray(stroke.pageNumbers)
          ? stroke.pageNumbers.filter((pageNumber) => Number.isFinite(pageNumber))
          : undefined,
        coordinateScope: stroke.coordinateScope === 'spread' ? 'spread' : 'page',
        color: stroke.color ?? '#202124',
        width: typeof stroke.width === 'number' ? Math.min(Math.max(stroke.width, 1), 48) : 4,
        points: (stroke.points ?? []).map((point) => ({
          x: Math.min(Math.max(point.x, 0), 100),
          y: Math.min(Math.max(point.y, 0), 100),
          pressure: typeof point.pressure === 'number' ? point.pressure : undefined,
        })),
      })),
    })),
    project.coverPage,
  )
  const maxPageNumber = pages.length || 1
  const currentPageNumber = Math.min(Math.max(project.currentPageNumber || 1, 1), maxPageNumber)
  const selectedPageNumber = Math.min(
    Math.max(project.selectedPageNumber || currentPageNumber, 1),
    maxPageNumber,
  )
  const panelIds = new Set(pages.flatMap((page) => page.panels.map((panel) => panel.id)))
  const bubbleIds = new Set(pages.flatMap((page) => page.bubbles.map((bubble) => bubble.id)))

  const normalizedProject = {
    ...project,
    binding: project.binding ?? 'rtl',
    coverPage: project.coverPage ?? true,
    autoNumberPanels: project.autoNumberPanels ?? true,
    swapPanelContent: project.swapPanelContent ?? true,
    defaultBubbleTextDirection: project.defaultBubbleTextDirection ?? 'horizontal',
    pageTextFontSize: normalizeFontSize(project.pageTextFontSize) ?? DEFAULT_TEXT_FONT_SIZE,
    currentPageNumber,
    selectedPageNumber,
    selectedPanelId: project.selectedPanelId && panelIds.has(project.selectedPanelId)
      ? project.selectedPanelId
      : undefined,
    selectedBubbleId: project.selectedBubbleId && bubbleIds.has(project.selectedBubbleId)
      ? project.selectedBubbleId
      : undefined,
    pages,
    characters,
    selectedCharacterId: project.selectedCharacterId,
    beats: normalizeBeats({ ...project, pages }, characters, bubbleIds),
  }

  if (!normalizedProject.autoNumberPanels) {
    return normalizedProject
  }

  const numberedBeats = normalizedProject.beats.map((beat) => ({ ...beat }))
  for (const page of normalizedProject.pages) {
    numberedBeats
      .filter((beat) => beat.pageNumber === page.pageNumber)
      .sort((firstBeat, secondBeat) => firstBeat.order - secondBeat.order)
      .forEach((beat, index) => {
        beat.no = index + 1
        beat.order = index + 1
      })
  }

  return { ...normalizedProject, beats: numberedBeats }
}

export function loadProject(): Project {
  try {
    const storedValue = window.localStorage.getItem(PROJECT_STORAGE_KEY)
    if (!storedValue) {
      return createInitialProject()
    }

    const parsedValue: unknown = JSON.parse(storedValue)
    if (!isProject(parsedValue)) {
      return createInitialProject()
    }

    return normalizeProject(parsedValue)
  } catch {
    return createInitialProject()
  }
}

export function saveProject(project: Project) {
  window.localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(project))
}

export function normalizeAppState(appState: AppState): AppState {
  const projects = (appState.projects?.length ? appState.projects : [createUntitledProject()])
    .map((project) => normalizeProject({
      ...project,
      title: project.title?.trim() || DEFAULT_PROJECT_TITLE,
    }))
  const currentProjectId = projects.some((project) => project.id === appState.currentProjectId)
    ? appState.currentProjectId
    : projects[0].id

  return {
    schemaVersion: 1,
    currentProjectId,
    projects,
  }
}

export function loadAppState(): AppState {
  try {
    const storedAppState = window.localStorage.getItem(APP_STATE_STORAGE_KEY)
    if (storedAppState) {
      const parsedValue: unknown = JSON.parse(storedAppState)
      if (isAppState(parsedValue)) {
        return normalizeAppState(parsedValue)
      }
    }

    const storedProject = window.localStorage.getItem(PROJECT_STORAGE_KEY)
    if (storedProject) {
      const parsedValue: unknown = JSON.parse(storedProject)
      if (isProject(parsedValue)) {
        const project = normalizeProject(parsedValue)
        return normalizeAppState({
          schemaVersion: 1,
          currentProjectId: project.id,
          projects: [project],
        })
      }
    }
  } catch {
    // Fall back below.
  }

  const project = createUntitledProject()
  return {
    schemaVersion: 1,
    currentProjectId: project.id,
    projects: [project],
  }
}

export function saveAppState(appState: AppState) {
  window.localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(appState))
  const currentProject = appState.projects.find((project) => project.id === appState.currentProjectId)
  if (currentProject) {
    saveProject(currentProject)
  }
}

export function parseProjectJson(text: string): Project | null {
  try {
    const parsedValue: unknown = JSON.parse(text)
    if (!isProject(parsedValue)) {
      return null
    }

    return normalizeProject(parsedValue)
  } catch {
    return null
  }
}
