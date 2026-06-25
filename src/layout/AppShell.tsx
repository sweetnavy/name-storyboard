import { useEffect, useRef, useState } from 'react'
import { useAutoSaveProject } from '../hooks/useAutoSaveProject'
import { useCanvasZoom } from '../hooks/useCanvasZoom'
import { usePaneWidths } from '../hooks/usePaneWidths'
import type { PanelPoint, Project } from '../types/storyboard'
import {
  deletePages,
  createComicPanel,
  getCurrentSpread,
  getSpreads,
  insertPages,
  parsePageRange,
} from '../utils/pageOperations'
import { loadProject, parseProjectJson, saveProject } from '../utils/storage'
import { PaneLayout } from './PaneLayout'

export function AppShell() {
  const [project, setProject] = useState(loadProject)
  const [projectHistory, setProjectHistory] = useState<{ past: Project[]; future: Project[] }>({
    past: [],
    future: [],
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previousProjectRef = useRef(project)
  const skipHistoryRef = useRef(false)
  const saveStatus = useAutoSaveProject(project)
  const canvasZoom = useCanvasZoom()
  const { paneWidths, resizePane } = usePaneWidths()
  const spreads = getSpreads(project)
  const currentSpread = getCurrentSpread(project)

  useEffect(() => {
    if (previousProjectRef.current === project) {
      return
    }

    if (skipHistoryRef.current) {
      skipHistoryRef.current = false
      previousProjectRef.current = project
      return
    }

    setProjectHistory((currentHistory) => ({
      past: [...currentHistory.past.slice(-49), previousProjectRef.current],
      future: [],
    }))
    previousProjectRef.current = project
  }, [project])

  const undoProject = () => {
    setProjectHistory((currentHistory) => {
      const previousProject = currentHistory.past.at(-1)
      if (!previousProject) {
        return currentHistory
      }

      skipHistoryRef.current = true
      previousProjectRef.current = previousProject
      setProject(previousProject)
      return {
        past: currentHistory.past.slice(0, -1),
        future: [project, ...currentHistory.future].slice(0, 50),
      }
    })
  }

  const redoProject = () => {
    setProjectHistory((currentHistory) => {
      const nextProject = currentHistory.future[0]
      if (!nextProject) {
        return currentHistory
      }

      skipHistoryRef.current = true
      previousProjectRef.current = nextProject
      setProject(nextProject)
      return {
        past: [...currentHistory.past.slice(-49), project],
        future: currentHistory.future.slice(1),
      }
    })
  }

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

  const selectPage = (pageNumber: number) => {
    setProject((currentProject) => ({
      ...currentProject,
      currentPageNumber: pageNumber,
      selectedPageNumber: pageNumber,
      selectedPanelId: undefined,
      selectedBubbleId: undefined,
    }))
  }

  const toggleCoverPage = () => {
    setProject((currentProject) => ({
      ...currentProject,
      coverPage: !currentProject.coverPage,
      currentPageNumber: Math.min(currentProject.currentPageNumber, currentProject.pages.length),
      selectedPageNumber: Math.min(currentProject.selectedPageNumber, currentProject.pages.length),
    }))
  }

  const updateBinding = (binding: Project['binding']) => {
    setProject((currentProject) => ({ ...currentProject, binding }))
  }

  const toggleAutoNumberPanels = () => {
    setProject((currentProject) =>
      applyAutoNumbering({ ...currentProject, autoNumberPanels: !currentProject.autoNumberPanels }),
    )
  }

  const toggleSwapPanelContent = () => {
    setProject((currentProject) => ({
      ...currentProject,
      swapPanelContent: !currentProject.swapPanelContent,
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

    setProject((currentProject) => applyAutoNumbering(deletePages(currentProject, range.start, range.end)))
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
      beats: currentProject.beats.map((beat) => ({
        ...beat,
        characterIds: beat.characterIds.filter((id) => id !== characterId),
      })),
      pages: currentProject.pages.map((page) => ({
        ...page,
        panels: page.panels.map((panel) => ({
          ...panel,
          characterIds: panel.characterIds.filter((id) => id !== characterId),
        })),
      })),
    }))
  }

  const addBeat = () => {
    setProject((currentProject) => {
      const pageNumber = currentProject.selectedPageNumber || currentProject.currentPageNumber
      const pageBeatCount = currentProject.beats.filter((beat) => beat.pageNumber === pageNumber).length
      const beatId = `beat-${Date.now()}`
      return applyAutoNumbering({
        ...currentProject,
        beats: [
          ...currentProject.beats,
          {
            id: beatId,
            pageNumber,
            no: currentProject.autoNumberPanels ? pageBeatCount + 1 : null,
            text: '',
            dialogues: [{ id: `dialogue-${Date.now()}`, beatId, text: '', shape: 'ellipse', order: 1 }],
            characterIds: [],
            order: pageBeatCount + 1,
          },
        ],
      })
    })
  }

  const updateBeatText = (beatId: string, text: string) => {
    setProject((currentProject) => ({
      ...currentProject,
      beats: currentProject.beats.map((beat) => (beat.id === beatId ? { ...beat, text } : beat)),
    }))
  }

  const updateBeatNo = (beatId: string, no: number | null) => {
    setProject((currentProject) => ({
      ...currentProject,
      beats: currentProject.beats.map((beat) => (beat.id === beatId ? { ...beat, no } : beat)),
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
      pages: currentProject.pages.map((page) => ({
        ...page,
        panels: page.panels.map((panel) =>
          panel.beatId === beatId ? { ...panel, beatId: undefined } : panel,
        ),
        bubbles: page.bubbles.filter((bubble) => bubble.beatId !== beatId),
      })),
    }))
  }

  const selectPanel = (pageNumber: number, panelId: string) => {
    setProject((currentProject) => ({
      ...currentProject,
      currentPageNumber: pageNumber,
      selectedPageNumber: pageNumber,
      selectedPanelId: panelId,
      selectedBubbleId: undefined,
    }))
  }

  const selectBeat = (beatId: string) => {
    const beat = project.beats.find((item) => item.id === beatId)
    if (!beat) {
      return
    }

    setProject((currentProject) => ({
      ...currentProject,
      currentPageNumber: beat.pageNumber,
      selectedPageNumber: beat.pageNumber,
      selectedPanelId: beat.panelId,
      selectedBubbleId: undefined,
    }))
  }

  const addComicPanel = () => {
    setProject((currentProject) => {
      const pageNumber = currentProject.selectedPageNumber || currentProject.currentPageNumber
      const pageBeatCount = currentProject.beats.filter((beat) => beat.pageNumber === pageNumber).length
      const beatId = `beat-${Date.now()}`
      const panel = createComicPanel(pageNumber, beatId)

      return applyAutoNumbering({
        ...currentProject,
        currentPageNumber: pageNumber,
        selectedPageNumber: pageNumber,
        selectedPanelId: panel.id,
        selectedBubbleId: undefined,
        beats: [
          ...currentProject.beats,
          {
            id: beatId,
            pageNumber,
            panelId: panel.id,
            no: currentProject.autoNumberPanels ? pageBeatCount + 1 : null,
            text: '',
            dialogues: [{ id: `dialogue-${Date.now()}`, beatId, text: '', shape: 'ellipse', order: 1 }],
            characterIds: [],
            order: pageBeatCount + 1,
          },
        ],
        pages: currentProject.pages.map((page) =>
          page.pageNumber === pageNumber ? { ...page, panels: [...page.panels, panel] } : page,
        ),
      })
    })
  }

  const placeBeatOnPage = (
    beatId: string,
    pageNumber: number,
    position: { x: number; y: number },
  ) => {
    setProject((currentProject) => {
      const beat = currentProject.beats.find((item) => item.id === beatId)
      if (!beat) {
        return currentProject
      }

      const existingPanel = beat.panelId
        ? currentProject.pages.flatMap((page) => page.panels).find((panel) => panel.id === beat.panelId)
        : undefined
      const panel = existingPanel ?? createComicPanel(pageNumber, beatId, position)
      const nextPanel = {
        ...panel,
        pageNumber,
        beatId,
        x: position.x,
        y: position.y,
        characterIds: beat.characterIds,
      }

      const destinationOrder =
        currentProject.beats.filter((item) => item.pageNumber === pageNumber && item.id !== beatId).length + 1

      return applyAutoNumbering({
        ...currentProject,
        currentPageNumber: pageNumber,
        selectedPageNumber: pageNumber,
        selectedPanelId: nextPanel.id,
        selectedBubbleId: undefined,
        beats: currentProject.beats.map((item) =>
          item.id === beatId ? { ...item, pageNumber, panelId: nextPanel.id, order: destinationOrder } : item,
        ),
        pages: currentProject.pages.map((page) => {
          const panelsWithoutMoved = page.panels.filter((item) => item.id !== nextPanel.id)
          if (page.pageNumber !== pageNumber) {
            return { ...page, panels: panelsWithoutMoved }
          }

          return { ...page, panels: [...panelsWithoutMoved, nextPanel] }
        }),
      })
    })
  }

  const assignBeatToPanel = (beatId: string, panelId: string) => {
    setProject((currentProject) => {
      const draggedBeat = currentProject.beats.find((beat) => beat.id === beatId)
      const targetPanel = currentProject.pages.flatMap((page) => page.panels).find((panel) => panel.id === panelId)
      if (!draggedBeat || !targetPanel) {
        return currentProject
      }

      const targetBeatId = targetPanel.beatId
      const sourcePanelId = draggedBeat.panelId

      return applyAutoNumbering({
        ...currentProject,
        selectedPanelId: panelId,
        selectedBubbleId: undefined,
        currentPageNumber: targetPanel.pageNumber,
        selectedPageNumber: targetPanel.pageNumber,
        beats: currentProject.beats.map((beat) => {
          if (beat.id === beatId) {
            return { ...beat, pageNumber: targetPanel.pageNumber, panelId }
          }
          if (beat.id === targetBeatId) {
            const sourcePanel = currentProject.pages
              .flatMap((page) => page.panels)
              .find((panel) => panel.id === sourcePanelId)
            return sourcePanel
              ? { ...beat, pageNumber: sourcePanel.pageNumber, panelId: sourcePanel.id }
              : { ...beat, panelId: undefined }
          }
          return beat
        }),
        pages: currentProject.pages.map((page) => ({
          ...page,
          panels: page.panels.map((panel) => {
            if (panel.id === panelId) {
              return { ...panel, beatId }
            }
            if (panel.id === sourcePanelId) {
              return { ...panel, beatId: targetBeatId }
            }
            return panel
          }),
        })),
      })
    })
  }

  const swapComicPanels = (sourcePanelId: string, targetPanelId: string) => {
    if (sourcePanelId === targetPanelId) {
      return
    }

    setProject((currentProject) => {
      const allPanels = currentProject.pages.flatMap((page) => page.panels)
      const sourcePanel = allPanels.find((panel) => panel.id === sourcePanelId)
      const targetPanel = allPanels.find((panel) => panel.id === targetPanelId)
      if (!sourcePanel || !targetPanel || sourcePanel.pageNumber !== targetPanel.pageNumber) {
        return currentProject
      }

      const sourceGeometry = pickPanelGeometry(sourcePanel)
      const targetGeometry = pickPanelGeometry(targetPanel)
      const shouldKeepContentWithFrame = currentProject.swapPanelContent

      return applyAutoNumbering({
        ...currentProject,
        selectedPanelId: sourcePanelId,
        selectedBubbleId: undefined,
        beats: currentProject.beats.map((beat) => {
          if (shouldKeepContentWithFrame) {
            return beat
          }
          if (beat.panelId === sourcePanelId) {
            return { ...beat, panelId: targetPanelId }
          }
          if (beat.panelId === targetPanelId) {
            return { ...beat, panelId: sourcePanelId }
          }
          return beat
        }),
        pages: currentProject.pages.map((page) => ({
          ...page,
          panels: page.panels.map((panel) => {
            if (panel.id === sourcePanelId) {
              return {
                ...panel,
                ...targetGeometry,
                beatId: shouldKeepContentWithFrame ? panel.beatId : targetPanel.beatId,
              }
            }
            if (panel.id === targetPanelId) {
              return {
                ...panel,
                ...sourceGeometry,
                beatId: shouldKeepContentWithFrame ? panel.beatId : sourcePanel.beatId,
              }
            }
            return panel
          }),
        })),
      })
    })
  }

  const updateComicPanel = (
    pageNumber: number,
    panelId: string,
    updates: {
      x?: number
      y?: number
      width?: number
      height?: number
      textFontSize?: number
      points?: PanelPoint[] | null
    },
  ) => {
    setProject((currentProject) => ({
      ...currentProject,
      currentPageNumber: pageNumber,
      selectedPageNumber: pageNumber,
      selectedPanelId: panelId,
      selectedBubbleId: undefined,
      pages: currentProject.pages.map((page) =>
        page.pageNumber === pageNumber
          ? {
              ...page,
              panels: page.panels.map((panel) =>
                panel.id === panelId
                  ? {
                      ...panel,
                      ...updates,
                      points: updates.points === null ? undefined : updates.points ?? panel.points,
                    }
                  : panel,
              ),
            }
          : page,
      ),
    }))
  }

  const resetSelectedPanelShape = () => {
    setProject((currentProject) => {
      const selectedPanelId = currentProject.selectedPanelId
      if (!selectedPanelId) {
        return currentProject
      }

      return {
        ...currentProject,
        pages: currentProject.pages.map((page) => ({
          ...page,
          panels: page.panels.map((panel) => {
            if (panel.id !== selectedPanelId || !panel.points?.length) {
              return panel
            }

            const bounds = getPointBounds(panel.points)
            return { ...panel, ...bounds, points: undefined }
          }),
        })),
      }
    })
  }

  const addDialogueLine = (beatId: string) => {
    setProject((currentProject) => ({
      ...currentProject,
      beats: currentProject.beats.map((beat) => {
        if (beat.id !== beatId) {
          return beat
        }

        return {
          ...beat,
          dialogues: [
            ...(beat.dialogues ?? []),
            {
              id: `dialogue-${Date.now()}-${Math.round(Math.random() * 10000)}`,
              beatId,
              text: '',
              shape: 'ellipse',
              order: (beat.dialogues ?? []).length + 1,
            },
          ],
        }
      }),
    }))
  }

  const updateDialogueLine = (beatId: string, dialogueId: string, text: string) => {
    setProject((currentProject) => ({
      ...currentProject,
      beats: currentProject.beats.map((beat) =>
        beat.id === beatId
          ? {
              ...beat,
              dialogues: beat.dialogues.map((dialogue) =>
                dialogue.id === dialogueId ? { ...dialogue, text } : dialogue,
              ),
            }
          : beat,
      ),
    }))
  }

  const toggleDialogueShape = (beatId: string, dialogueId: string) => {
    setProject((currentProject) => {
      const beat = currentProject.beats.find((item) => item.id === beatId)
      const dialogue = beat?.dialogues.find((item) => item.id === dialogueId)
      const nextShape = dialogue?.shape === 'rect' ? 'ellipse' : 'rect'

      return {
        ...currentProject,
        beats: currentProject.beats.map((item) =>
          item.id === beatId
            ? {
                ...item,
                dialogues: item.dialogues.map((line) =>
                  line.id === dialogueId ? { ...line, shape: nextShape } : line,
                ),
              }
            : item,
        ),
        pages: currentProject.pages.map((page) => ({
          ...page,
          bubbles: page.bubbles.map((bubble) =>
            bubble.id === dialogue?.bubbleId ? { ...bubble, shape: nextShape } : bubble,
          ),
        })),
      }
    })
  }

  const deleteDialogueLine = (beatId: string, dialogueId: string) => {
    setProject((currentProject) => {
      const beat = currentProject.beats.find((item) => item.id === beatId)
      const dialogue = beat?.dialogues.find((item) => item.id === dialogueId)

      return {
        ...currentProject,
        selectedBubbleId:
          dialogue?.bubbleId && currentProject.selectedBubbleId === dialogue.bubbleId
            ? undefined
            : currentProject.selectedBubbleId,
        beats: currentProject.beats.map((item) =>
          item.id === beatId
            ? { ...item, dialogues: item.dialogues.filter((line) => line.id !== dialogueId) }
            : item,
        ),
        pages: currentProject.pages.map((page) => ({
          ...page,
          bubbles: dialogue?.bubbleId
            ? page.bubbles.filter((bubble) => bubble.id !== dialogue.bubbleId)
            : page.bubbles,
        })),
      }
    })
  }

  const selectDialogueBubble = (bubbleId: string) => {
    const bubble = project.pages.flatMap((page) => page.bubbles).find((item) => item.id === bubbleId)
    if (!bubble) {
      return
    }

    setProject((currentProject) => ({
      ...currentProject,
      currentPageNumber: bubble.pageNumber,
      selectedPageNumber: bubble.pageNumber,
      selectedPanelId: undefined,
      selectedBubbleId: bubbleId,
    }))
  }

  const placeDialogueOnPage = (
    beatId: string,
    dialogueId: string,
    pageNumber: number,
    position: { x: number; y: number },
  ) => {
    setProject((currentProject) => {
      const beat = currentProject.beats.find((item) => item.id === beatId)
      const dialogue = beat?.dialogues.find((item) => item.id === dialogueId)
      if (!beat || !dialogue) {
        return currentProject
      }

      const existingBubble = dialogue.bubbleId
        ? currentProject.pages.flatMap((page) => page.bubbles).find((bubble) => bubble.id === dialogue.bubbleId)
        : undefined
      const bubbleShape = dialogue.shape ?? 'ellipse'
      const bubble = existingBubble ?? {
        id: `bubble-${Date.now()}-${Math.round(Math.random() * 10000)}`,
        pageNumber,
        beatId,
        dialogueId,
        shape: bubbleShape,
        textDirection: currentProject.defaultBubbleTextDirection,
        textBox:
          bubbleShape === 'rect'
            ? { x: 10, y: 10, width: 80, height: 80 }
            : { x: 14, y: 12, width: 72, height: 76 },
        x: position.x,
        y: position.y,
        width: 24,
        height: 12,
      }
      const nextBubble = {
        ...bubble,
        pageNumber,
        beatId,
        dialogueId,
        shape: bubbleShape,
        x: position.x,
        y: position.y,
      }

      return {
        ...currentProject,
        currentPageNumber: pageNumber,
        selectedPageNumber: pageNumber,
        selectedPanelId: undefined,
        selectedBubbleId: nextBubble.id,
        beats: currentProject.beats.map((item) =>
          item.id === beatId
            ? {
                ...item,
                dialogues: item.dialogues.map((line) =>
                  line.id === dialogueId ? { ...line, bubbleId: nextBubble.id } : line,
                ),
              }
            : item,
        ),
        pages: currentProject.pages.map((page) => {
          const bubblesWithoutMoved = page.bubbles.filter((item) => item.id !== nextBubble.id)
          if (page.pageNumber !== pageNumber) {
            return { ...page, bubbles: bubblesWithoutMoved }
          }

          return { ...page, bubbles: [...bubblesWithoutMoved, nextBubble] }
        }),
      }
    })
  }

  const updateSpeechBubble = (
    bubbleId: string,
    updates: {
      x?: number
      y?: number
      width?: number
      height?: number
      shape?: 'ellipse' | 'rect'
      textDirection?: 'horizontal' | 'vertical'
      textFontSize?: number
      textBox?: {
        x: number
        y: number
        width: number
        height: number
      }
    },
  ) => {
    setProject((currentProject) => ({
      ...currentProject,
      selectedPanelId: undefined,
      selectedBubbleId: bubbleId,
      pages: currentProject.pages.map((page) => ({
        ...page,
        bubbles: page.bubbles.map((bubble) => (bubble.id === bubbleId ? { ...bubble, ...updates } : bubble)),
      })),
    }))
  }

  const toggleBubbleTextDirection = () => {
    setProject((currentProject) => {
      if (!currentProject.selectedBubbleId) {
        return {
          ...currentProject,
          defaultBubbleTextDirection:
            currentProject.defaultBubbleTextDirection === 'vertical' ? 'horizontal' : 'vertical',
        }
      }

      return {
        ...currentProject,
        pages: currentProject.pages.map((page) => ({
          ...page,
          bubbles: page.bubbles.map((bubble) =>
            bubble.id === currentProject.selectedBubbleId
              ? {
                  ...bubble,
                  textDirection: bubble.textDirection === 'vertical' ? 'horizontal' : 'vertical',
                }
              : bubble,
          ),
        })),
      }
    })
  }

  const updatePageTextFontSize = (fontSize: number) => {
    if (!Number.isFinite(fontSize)) {
      return
    }
    const nextFontSize = Math.min(Math.max(Math.round(fontSize), 8), 32)
    setProject((currentProject) => ({
      ...currentProject,
      pageTextFontSize:
        currentProject.selectedPanelId || currentProject.selectedBubbleId
          ? currentProject.pageTextFontSize
          : nextFontSize,
      pages: currentProject.pages.map((page) => ({
        ...page,
        panels: page.panels.map((panel) =>
          panel.id === currentProject.selectedPanelId ? { ...panel, textFontSize: nextFontSize } : panel,
        ),
        bubbles: page.bubbles.map((bubble) =>
          bubble.id === currentProject.selectedBubbleId ? { ...bubble, textFontSize: nextFontSize } : bubble,
        ),
      })),
    }))
  }

  const deleteSpeechBubble = (bubbleId: string) => {
    setProject((currentProject) => ({
      ...currentProject,
      selectedBubbleId: currentProject.selectedBubbleId === bubbleId ? undefined : currentProject.selectedBubbleId,
      beats: currentProject.beats.map((beat) => ({
        ...beat,
        dialogues: beat.dialogues.map((dialogue) =>
          dialogue.bubbleId === bubbleId ? { ...dialogue, bubbleId: undefined } : dialogue,
        ),
      })),
      pages: currentProject.pages.map((page) => ({
        ...page,
        bubbles: page.bubbles.filter((bubble) => bubble.id !== bubbleId),
      })),
    }))
  }

  const deleteComicPanel = (panelId: string) => {
    const panel = project.pages.flatMap((page) => page.panels).find((item) => item.id === panelId)
    if (!panel) {
      return
    }

    if (!window.confirm('このコマを削除します。よろしいですか？')) {
      return
    }

    setProject((currentProject) => ({
      ...currentProject,
      selectedPanelId: currentProject.selectedPanelId === panelId ? undefined : currentProject.selectedPanelId,
      beats: currentProject.beats.map((beat) =>
        beat.panelId === panelId ? { ...beat, panelId: undefined } : beat,
      ),
      pages: currentProject.pages.map((page) => ({
        ...page,
        panels: page.panels.filter((item) => item.id !== panelId),
      })),
    }))
  }

  const reorderVisibleBeats = (
    dragBeatId: string,
    targetBeatId: string,
    pageNumbers: number[],
    placement: 'before' | 'after',
  ) => {
    if (dragBeatId === targetBeatId) {
      return
    }

    setProject((currentProject) => {
      const visibleBeats = currentProject.beats
        .filter((beat) => pageNumbers.includes(beat.pageNumber))
        .sort((firstBeat, secondBeat) => firstBeat.order - secondBeat.order)
      const fromIndex = visibleBeats.findIndex((beat) => beat.id === dragBeatId)
      const toIndex = visibleBeats.findIndex((beat) => beat.id === targetBeatId)

      if (fromIndex < 0 || toIndex < 0) {
        return currentProject
      }

      const reorderedBeats = [...visibleBeats]
      const [movedBeat] = reorderedBeats.splice(fromIndex, 1)
      const targetIndexAfterRemoval = reorderedBeats.findIndex((beat) => beat.id === targetBeatId)
      const insertIndex = targetIndexAfterRemoval + (placement === 'after' ? 1 : 0)
      reorderedBeats.splice(insertIndex, 0, movedBeat)
      const visibleBeatMap = new Map(
        reorderedBeats.map((beat, index) => [
          beat.id,
          {
            order: index + 1,
            no: currentProject.autoNumberPanels ? index + 1 : beat.no,
          },
        ]),
      )

      return applyAutoNumbering({
        ...currentProject,
        beats: currentProject.beats.map((beat) => {
          const visibleBeat = visibleBeatMap.get(beat.id)
          return visibleBeat ? { ...beat, ...visibleBeat } : beat
        }),
      })
    })
  }

  const moveBeatToPage = (beatId: string, pageNumber: number) => {
    setProject((currentProject) => {
      const beat = currentProject.beats.find((item) => item.id === beatId)
      if (!beat) {
        return currentProject
      }

      const linkedPanel = currentProject.pages
        .flatMap((page) => page.panels)
        .find((panel) => panel.id === beat.panelId)

      const destinationOrder =
        currentProject.beats.filter((item) => item.pageNumber === pageNumber && item.id !== beatId).length + 1

      return applyAutoNumbering({
        ...currentProject,
        beats: currentProject.beats.map((item) =>
          item.id === beatId ? { ...item, pageNumber, order: destinationOrder } : item,
        ),
        pages: currentProject.pages.map((page) => {
          const panelsWithoutMoved = page.panels.filter((panel) => panel.id !== beat.panelId)
          if (!linkedPanel || page.pageNumber !== pageNumber) {
            return { ...page, panels: panelsWithoutMoved }
          }

          return {
            ...page,
            panels: [
              ...panelsWithoutMoved,
              {
                ...linkedPanel,
                pageNumber,
                x: Math.min(Math.max(linkedPanel.x, 8), 58),
                y: Math.min(Math.max(linkedPanel.y, 12), 70),
              },
            ],
          }
        }),
      })
    })
  }

  const movePanelToPage = (panelId: string, pageNumber: number) => {
    setProject((currentProject) => {
      const panel = currentProject.pages.flatMap((page) => page.panels).find((item) => item.id === panelId)
      if (!panel) {
        return currentProject
      }

      return applyAutoNumbering({
        ...currentProject,
        currentPageNumber: pageNumber,
        selectedPageNumber: pageNumber,
        selectedPanelId: panelId,
        beats: currentProject.beats.map((beat) =>
          beat.id === panel.beatId ? { ...beat, pageNumber, panelId } : beat,
        ),
        pages: currentProject.pages.map((page) => {
          const panelsWithoutMoved = page.panels.filter((item) => item.id !== panelId)
          if (page.pageNumber !== pageNumber) {
            return { ...page, panels: panelsWithoutMoved }
          }

          return {
            ...page,
            panels: [
              ...panelsWithoutMoved,
              {
                ...panel,
                pageNumber,
                x: Math.min(Math.max(panel.x, 8), 58),
                y: Math.min(Math.max(panel.y, 12), 70),
              },
            ],
          }
        }),
      })
    })
  }

  const addCharacterToPanel = (panelId: string, characterId: string) => {
    setProject((currentProject) => {
      const panel = currentProject.pages.flatMap((page) => page.panels).find((item) => item.id === panelId)
      if (!panel) {
        return currentProject
      }

      return {
        ...currentProject,
        beats: currentProject.beats.map((beat) =>
          beat.id === panel.beatId && !beat.characterIds.includes(characterId)
            ? { ...beat, characterIds: [...beat.characterIds, characterId] }
            : beat,
        ),
        pages: currentProject.pages.map((page) => ({
          ...page,
          panels: page.panels.map((item) =>
            item.id === panelId && !item.characterIds.includes(characterId)
              ? { ...item, characterIds: [...item.characterIds, characterId] }
              : item,
          ),
        })),
      }
    })
  }

  const addCharacterToBeat = (beatId: string, characterId: string) => {
    setProject((currentProject) => {
      const beat = currentProject.beats.find((item) => item.id === beatId)
      return {
        ...currentProject,
        beats: currentProject.beats.map((item) =>
          item.id === beatId && !item.characterIds.includes(characterId)
            ? { ...item, characterIds: [...item.characterIds, characterId] }
            : item,
        ),
        pages: currentProject.pages.map((page) => ({
          ...page,
          panels: page.panels.map((panel) =>
            beat?.panelId === panel.id && !panel.characterIds.includes(characterId)
              ? { ...panel, characterIds: [...panel.characterIds, characterId] }
              : panel,
          ),
        })),
      }
    })
  }

  const removeCharacterFromBeat = (beatId: string, characterId: string) => {
    setProject((currentProject) => {
      const beat = currentProject.beats.find((item) => item.id === beatId)
      return {
        ...currentProject,
        beats: currentProject.beats.map((item) =>
          item.id === beatId
            ? { ...item, characterIds: item.characterIds.filter((id) => id !== characterId) }
            : item,
        ),
        pages: currentProject.pages.map((page) => ({
          ...page,
          panels: page.panels.map((panel) =>
            beat?.panelId === panel.id
              ? { ...panel, characterIds: panel.characterIds.filter((id) => id !== characterId) }
              : panel,
          ),
        })),
      }
    })
  }

  const removeCharacterFromPanel = (panelId: string, characterId: string) => {
    setProject((currentProject) => {
      const panel = currentProject.pages.flatMap((page) => page.panels).find((item) => item.id === panelId)
      return {
        ...currentProject,
        beats: currentProject.beats.map((beat) =>
          beat.id === panel?.beatId
            ? { ...beat, characterIds: beat.characterIds.filter((id) => id !== characterId) }
            : beat,
        ),
        pages: currentProject.pages.map((page) => ({
          ...page,
          panels: page.panels.map((item) =>
            item.id === panelId
              ? { ...item, characterIds: item.characterIds.filter((id) => id !== characterId) }
              : item,
          ),
        })),
      }
    })
  }

  const updatePanelBeatText = (panelId: string, text: string) => {
    setProject((currentProject) => {
      const panel = currentProject.pages.flatMap((page) => page.panels).find((item) => item.id === panelId)
      if (!panel) {
        return currentProject
      }

      if (panel.beatId) {
        return {
          ...currentProject,
          beats: currentProject.beats.map((beat) => (beat.id === panel.beatId ? { ...beat, text } : beat)),
        }
      }

      const beatId = `beat-${Date.now()}`
      const pageBeatCount = currentProject.beats.filter((beat) => beat.pageNumber === panel.pageNumber).length
      return applyAutoNumbering({
        ...currentProject,
        beats: [
          ...currentProject.beats,
          {
            id: beatId,
            pageNumber: panel.pageNumber,
            panelId,
            no: currentProject.autoNumberPanels ? pageBeatCount + 1 : null,
            text,
            dialogues: [{ id: `dialogue-${Date.now()}`, beatId, text: '', shape: 'ellipse', order: 1 }],
            characterIds: panel.characterIds,
            order: pageBeatCount + 1,
          },
        ],
        pages: currentProject.pages.map((page) => ({
          ...page,
          panels: page.panels.map((item) => (item.id === panelId ? { ...item, beatId } : item)),
        })),
      })
    })
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && project.selectedPanelId) {
        const target = event.target as HTMLElement | null
        if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') {
          return
        }

        event.preventDefault()
        deleteComicPanel(project.selectedPanelId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [project.selectedPanelId])

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
    skipHistoryRef.current = true
    previousProjectRef.current = loadedProject
    setProjectHistory({ past: [], future: [] })
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
        canRedo={projectHistory.future.length > 0}
        canUndo={projectHistory.past.length > 0}
        onAddBeat={addBeat}
        onAddCharacter={addCharacter}
        onAddCharacterToPanel={addCharacterToPanel}
        onAddCharacterToBeat={addCharacterToBeat}
        onAddComicPanel={addComicPanel}
        onAddDialogueLine={addDialogueLine}
        onRedoProject={redoProject}
        onDeleteBeat={deleteBeat}
        onDeleteCharacter={deleteCharacter}
        onDeletePages={handleDeletePages}
        onDeletePanel={deleteComicPanel}
        onDeleteSpeechBubble={deleteSpeechBubble}
        onDeleteDialogueLine={deleteDialogueLine}
        onGoToSpread={goToSpread}
        onInsertPages={handleInsertPages}
        onMoveBeatToPage={moveBeatToPage}
        onMovePanelToPage={movePanelToPage}
        onRemoveCharacterFromBeat={removeCharacterFromBeat}
        onRemoveCharacterFromPanel={removeCharacterFromPanel}
        onSelectCharacter={selectCharacter}
        onSelectBeat={selectBeat}
        onSelectDialogueBubble={selectDialogueBubble}
        onSelectPanel={selectPanel}
        onSelectPage={selectPage}
        onPlaceBeatOnPage={placeBeatOnPage}
        onPlaceDialogueOnPage={placeDialogueOnPage}
        onAssignBeatToPanel={assignBeatToPanel}
        onSwapPanels={swapComicPanels}
        onReorderVisibleBeats={reorderVisibleBeats}
        onUpdatePanel={updateComicPanel}
        onUpdateSpeechBubble={updateSpeechBubble}
        onResetSelectedPanelShape={resetSelectedPanelShape}
        onUpdateBeatText={updateBeatText}
        onUpdateBeatNo={updateBeatNo}
        onUpdateDialogueLine={updateDialogueLine}
        onToggleDialogueShape={toggleDialogueShape}
        onUpdatePanelBeatText={updatePanelBeatText}
        onUpdateCharacterColor={updateCharacterColor}
        onUpdateProjectTitle={updateProjectTitle}
        onToggleCoverPage={toggleCoverPage}
        onUpdateBinding={updateBinding}
        onToggleAutoNumberPanels={toggleAutoNumberPanels}
        onToggleSwapPanelContent={toggleSwapPanelContent}
        onToggleBubbleTextDirection={toggleBubbleTextDirection}
        onUpdatePageTextFontSize={updatePageTextFontSize}
        onUndoProject={undoProject}
        onResizePane={resizePane}
        canvasZoom={canvasZoom}
        paneWidths={paneWidths}
        project={project}
        spreads={spreads}
      />
    </div>
  )
}

function sanitizeFileName(value: string) {
  return value.trim().replace(/[\\/:*?"<>|]/g, '_') || 'storyboard'
}

function confirmBeatDelete(no: number | null) {
  return window.confirm(`No.${String(no ?? '').padStart(3, '0')}を削除します。よろしいですか？`)
}

function pickPanelGeometry(panel: { x: number; y: number; width: number; height: number }) {
  return {
    x: panel.x,
    y: panel.y,
    width: panel.width,
    height: panel.height,
  }
}

function getPointBounds(points: PanelPoint[]) {
  const xValues = points.map((point) => point.x)
  const yValues = points.map((point) => point.y)
  const x = Math.min(...xValues)
  const y = Math.min(...yValues)
  const width = Math.max(...xValues) - x
  const height = Math.max(...yValues) - y

  return {
    x,
    y,
    width: Math.max(width, 8),
    height: Math.max(height, 6),
  }
}

function applyAutoNumbering(project: Project): Project {
  if (!project.autoNumberPanels) {
    return project
  }

  const numberedBeats = project.beats.map((beat) => ({ ...beat }))

  for (const page of project.pages) {
    const pageBeats = numberedBeats
      .filter((beat) => beat.pageNumber === page.pageNumber)
      .sort((firstBeat, secondBeat) => firstBeat.order - secondBeat.order)

    pageBeats.forEach((beat, index) => {
      beat.no = index + 1
      beat.order = index + 1
    })
  }

  return { ...project, beats: numberedBeats }
}
