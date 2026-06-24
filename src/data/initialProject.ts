import type { Project } from '../types/storyboard'

export const CHARACTER_COLOR_PRESETS = [
  '#dceaff',
  '#dff0df',
  '#f3e4bd',
  '#f3dce4',
  '#dcefee',
  '#eadff4',
  '#f0e7d8',
  '#dfe6f3',
  '#e7f0dc',
  '#f5dddd',
  '#d9edf7',
  '#eee2cf',
  '#e5e0f3',
  '#dff1ea',
  '#f2e0c9',
]

const createPage = (pageNumber: number, isCover = false) => ({
  id: `page-${pageNumber}`,
  pageNumber,
  isCover,
  panels: [],
})

export function createInitialProject(): Project {
  return {
    schemaVersion: 1,
    id: 'project-demo',
    title: '雨上がりの放課後',
    binding: 'rtl',
    coverPage: true,
    currentPageNumber: 1,
    selectedPageNumber: 1,
    pages: Array.from({ length: 7 }, (_, index) => createPage(index + 1, index === 0)),
    characters: [
      { id: 'character-mio', name: '澪', tone: 'blue', color: CHARACTER_COLOR_PRESETS[0] },
      { id: 'character-kanade', name: '奏', tone: 'green', color: CHARACTER_COLOR_PRESETS[1] },
      { id: 'character-teacher', name: '先生', tone: 'amber', color: CHARACTER_COLOR_PRESETS[2] },
      {
        id: 'character-classmate',
        name: 'クラスメイト',
        tone: 'rose',
        color: CHARACTER_COLOR_PRESETS[3],
      },
    ],
    beats: [
      {
        id: 'beat-001',
        pageNumber: 1,
        no: 1,
        text: '雨の上がった校門前。澪が空を見上げ、少しだけ笑う。',
        characterIds: ['character-mio'],
        order: 1,
      },
      {
        id: 'beat-002',
        pageNumber: 2,
        no: 2,
        text: '奏が傘を閉じながら近づく。二人の距離はまだ少し遠い。',
        characterIds: ['character-kanade'],
        order: 2,
      },
      {
        id: 'beat-003',
        pageNumber: 3,
        no: 3,
        text: '扉ページの余白にタイトルを置く想定。背景は薄い校舎シルエット。',
        characterIds: ['character-mio'],
        order: 3,
      },
    ],
  }
}
