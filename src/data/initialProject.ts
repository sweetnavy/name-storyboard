import type { Project } from '../types/storyboard'

export const CHARACTER_COLOR_PRESETS = [
  '#D8B72A',
  '#9A611F',
  '#F3A2A0',
  '#C98598',
  '#E4007F',
  '#E94738',
  '#B46AC6',
  '#7893E6',
  '#536A7F',
  '#0078D7',
  '#73D8CF',
  '#6E9E43',
  '#00846E',
  '#8FB5A8',
]

const createPage = (pageNumber: number, isCover = false) => ({
  id: `page-${pageNumber}`,
  pageNumber,
  isCover,
  panels: [],
  bubbles: [],
})

export function createInitialProject(): Project {
  return {
    schemaVersion: 1,
    id: 'project-demo',
    title: '雨上がりの放課後',
    binding: 'rtl',
    coverPage: true,
    autoNumberPanels: true,
    swapPanelContent: true,
    defaultBubbleTextDirection: 'horizontal',
    pageTextFontSize: 13,
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
        dialogues: [{ id: 'dialogue-001', beatId: 'beat-001', text: '雨、やんだ。', shape: 'ellipse', order: 1 }],
        characterIds: ['character-mio'],
        order: 1,
      },
      {
        id: 'beat-002',
        pageNumber: 2,
        no: 2,
        text: '奏が傘を閉じながら近づく。二人の距離はまだ少し遠い。',
        dialogues: [{ id: 'dialogue-002', beatId: 'beat-002', text: '置いていかないでよ。', shape: 'ellipse', order: 1 }],
        characterIds: ['character-kanade'],
        order: 2,
      },
      {
        id: 'beat-003',
        pageNumber: 3,
        no: 3,
        text: '扉ページの余白にタイトルを置く想定。背景は薄い校舎シルエット。',
        dialogues: [{ id: 'dialogue-003', beatId: 'beat-003', text: '', shape: 'ellipse', order: 1 }],
        characterIds: ['character-mio'],
        order: 3,
      },
    ],
  }
}
