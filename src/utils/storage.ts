import { CHARACTER_COLOR_PRESETS, createInitialProject } from '../data/initialProject'
import type { Beat, Character, Project } from '../types/storyboard'
import { renumberPages } from './pageOperations'

export const PROJECT_STORAGE_KEY = 'name-storyboard-project-v1'

function isProject(value: unknown): value is Project {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<Project>
  return candidate.schemaVersion === 1 && Array.isArray(candidate.pages)
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

function normalizeBeats(project: Project, characters: Character[]): Beat[] {
  return (project.beats ?? []).map((beat, index) => {
    const legacyBeat = beat as Beat & { body?: string; panelNo?: string; character?: string }
    const characterId = characters.find((character) => character.name === legacyBeat.character)?.id

    return {
      id: legacyBeat.id ?? `beat-${index + 1}`,
      pageNumber: legacyBeat.pageNumber ?? Math.min(index + 1, project.pages.length || 1),
      panelId: legacyBeat.panelId,
      no: legacyBeat.no ?? Number.parseInt(legacyBeat.panelNo ?? `${index + 1}`, 10),
      text: legacyBeat.text ?? legacyBeat.body ?? '',
      characterIds: legacyBeat.characterIds ?? (characterId ? [characterId] : []),
      order: legacyBeat.order ?? index + 1,
    }
  })
}

export function normalizeProject(project: Project): Project {
  const characters = normalizeCharacters(project)
  const pages = renumberPages(project.pages?.length ? project.pages : createInitialProject().pages, project.coverPage)
  const maxPageNumber = pages.length || 1
  const currentPageNumber = Math.min(Math.max(project.currentPageNumber || 1, 1), maxPageNumber)
  const selectedPageNumber = Math.min(
    Math.max(project.selectedPageNumber || currentPageNumber, 1),
    maxPageNumber,
  )

  return {
    ...project,
    binding: project.binding ?? 'rtl',
    coverPage: project.coverPage ?? true,
    currentPageNumber,
    selectedPageNumber,
    pages,
    characters,
    selectedCharacterId: project.selectedCharacterId,
    beats: normalizeBeats({ ...project, pages }, characters),
  }
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
