import { PageFrame } from './PageFrame'
import { useState } from 'react'
import type { CSSProperties, DragEvent, PointerEvent as ReactPointerEvent } from 'react'
import type { Beat, Character, ComicPanel, Page, PanelPoint, SpeechBubble } from '../../types/storyboard'

type MangaPageProps = {
  page: Page
  side: 'left' | 'right'
  isSelected: boolean
  onSelectPage: (pageNumber: number) => void
  onSelectPanel: (pageNumber: number, panelId: string) => void
  onPlaceBeatOnPage: (beatId: string, pageNumber: number, position: { x: number; y: number }) => void
  onPlaceDialogueOnPage: (
    beatId: string,
    dialogueId: string,
    pageNumber: number,
    position: { x: number; y: number },
  ) => void
  onAssignBeatToPanel: (beatId: string, panelId: string) => void
  onSwapPanels: (sourcePanelId: string, targetPanelId: string) => void
  freeTransformMode: boolean
  onAddCharacterToPanel: (panelId: string, characterId: string) => void
  onRemoveCharacterFromPanel: (panelId: string, characterId: string) => void
  onUpdatePanelBeatText: (panelId: string, text: string) => void
  onUpdateDialogueLine: (beatId: string, dialogueId: string, text: string) => void
  onUpdatePanel: (
    pageNumber: number,
    panelId: string,
    updates: {
      x?: number
      y?: number
      width?: number
      height?: number
      textFontSize?: number
      textBox?: {
        x: number
        y: number
        width: number
        height: number
      }
      points?: PanelPoint[] | null
    },
  ) => void
  onDeletePanel: (panelId: string) => void
  onDeleteSpeechBubble: (bubbleId: string) => void
  onUpdateSpeechBubble: (
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
  ) => void
  selectedPanelId?: string
  selectedBubbleId?: string
  beats: Beat[]
  characters: Character[]
  variant?: 'cover'
}

export function MangaPage({
  beats,
  characters,
  isSelected,
  onPlaceBeatOnPage,
  onPlaceDialogueOnPage,
  onAssignBeatToPanel,
  onSwapPanels,
  freeTransformMode,
  onSelectPage,
  onSelectPanel,
  onUpdatePanel,
  onUpdatePanelBeatText,
  onUpdateDialogueLine,
  onDeletePanel,
  onDeleteSpeechBubble,
  onUpdateSpeechBubble,
  onAddCharacterToPanel,
  onRemoveCharacterFromPanel,
  page,
  selectedPanelId,
  selectedBubbleId,
  side,
  variant,
}: MangaPageProps) {
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuides>({ horizontal: [], vertical: [] })
  const [diagonalGuide, setDiagonalGuide] = useState<DiagonalGuide>()
  const [swapTargetId, setSwapTargetId] = useState<string>()

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()

    const rect = event.currentTarget.getBoundingClientRect()
    const dialogueData = event.dataTransfer.getData('application/x-storyboard-dialogue')
    if (dialogueData) {
      const payload = parseDialogueDragData(dialogueData)
      if (!payload) {
        return
      }
      const x = clamp(((event.clientX - rect.left) / rect.width) * 100 - 12, 4, 72)
      const y = clamp(((event.clientY - rect.top) / rect.height) * 100 - 6, 4, 82)
      onPlaceDialogueOnPage(payload.beatId, payload.dialogueId, page.pageNumber, { x, y })
      return
    }

    const beatId = event.dataTransfer.getData('application/x-storyboard-beat')
    if (!beatId) {
      return
    }

    const x = clamp(((event.clientX - rect.left) / rect.width) * 100 - 17, 8, 58)
    const y = clamp(((event.clientY - rect.top) / rect.height) * 100 - 9, 12, 70)
    onPlaceBeatOnPage(beatId, page.pageNumber, { x, y })
  }

  return (
    <article
      className={`manga-page page-${side} ${isSelected ? 'is-selected' : ''}`}
      onClick={() => onSelectPage(page.pageNumber)}
      onDragOver={(event) => {
        if (
          event.dataTransfer.types.includes('application/x-storyboard-beat') ||
          event.dataTransfer.types.includes('application/x-storyboard-dialogue')
        ) {
          event.preventDefault()
        }
      }}
      onDrop={handleDrop}
    >
      <PageFrame />
      {variant === 'cover' && (
        <span className="cover-badge">扉</span>
      )}
      <div className="comic-panel-layer">
        {alignmentGuides.vertical.map((x) => (
          <span className="alignment-guide alignment-guide-vertical" key={`v-${x}`} style={{ left: `${x}%` }} />
        ))}
        {alignmentGuides.horizontal.map((y) => (
          <span className="alignment-guide alignment-guide-horizontal" key={`h-${y}`} style={{ top: `${y}%` }} />
        ))}
        {diagonalGuide && (
          <span
            className="diagonal-guide"
            style={{
              left: `${diagonalGuide.x}%`,
              top: `${diagonalGuide.y}%`,
              width: `${diagonalGuide.length}%`,
              transform: `rotate(${diagonalGuide.angle}deg)`,
            }}
          />
        )}
        {page.panels.map((panel) => (
          <ComicPanelView
            allPanels={page.panels}
            beat={beats.find((item) => item.id === panel.beatId)}
            characters={characters}
            isSelected={panel.id === selectedPanelId}
            isSwapTarget={panel.id === swapTargetId}
            freeTransformMode={freeTransformMode}
            key={panel.id}
            onAssignBeatToPanel={onAssignBeatToPanel}
            onDeletePanel={onDeletePanel}
            onAddCharacterToPanel={onAddCharacterToPanel}
            onRemoveCharacterFromPanel={onRemoveCharacterFromPanel}
            onSelectPanel={onSelectPanel}
            onSetAlignmentGuides={setAlignmentGuides}
            onSetDiagonalGuide={setDiagonalGuide}
            onSetSwapTarget={setSwapTargetId}
            onSwapPanels={onSwapPanels}
            onUpdatePanelBeatText={onUpdatePanelBeatText}
            onUpdatePanel={onUpdatePanel}
            panel={panel}
          />
        ))}
        {page.bubbles.map((bubble) => (
          <SpeechBubbleView
            bubble={bubble}
            isSelected={bubble.id === selectedBubbleId}
            key={bubble.id}
            onDeleteSpeechBubble={onDeleteSpeechBubble}
            onUpdateDialogueLine={onUpdateDialogueLine}
            onUpdateSpeechBubble={onUpdateSpeechBubble}
            text={getDialogueText(beats, bubble.beatId, bubble.dialogueId)}
          />
        ))}
      </div>
      <span className="page-number">{page.pageNumber}</span>
    </article>
  )
}

type ComicPanelViewProps = {
  panel: ComicPanel
  allPanels: ComicPanel[]
  beat?: Beat
  characters: Character[]
  isSelected: boolean
  isSwapTarget: boolean
  freeTransformMode: boolean
  onAssignBeatToPanel: (beatId: string, panelId: string) => void
  onSelectPanel: (pageNumber: number, panelId: string) => void
  onUpdatePanel: (
    pageNumber: number,
    panelId: string,
    updates: {
      x?: number
      y?: number
      width?: number
      height?: number
      textFontSize?: number
      textBox?: {
        x: number
        y: number
        width: number
        height: number
      }
      points?: PanelPoint[] | null
    },
  ) => void
  onDeletePanel: (panelId: string) => void
  onAddCharacterToPanel: (panelId: string, characterId: string) => void
  onRemoveCharacterFromPanel: (panelId: string, characterId: string) => void
  onUpdatePanelBeatText: (panelId: string, text: string) => void
  onSetAlignmentGuides: (guides: AlignmentGuides) => void
  onSetDiagonalGuide: (guide?: DiagonalGuide) => void
  onSetSwapTarget: (panelId?: string) => void
  onSwapPanels: (sourcePanelId: string, targetPanelId: string) => void
}

function ComicPanelView({
  allPanels,
  beat,
  characters,
  isSelected,
  isSwapTarget,
  freeTransformMode,
  onAssignBeatToPanel,
  onDeletePanel,
  onAddCharacterToPanel,
  onRemoveCharacterFromPanel,
  onSelectPanel,
  onSetAlignmentGuides,
  onSetDiagonalGuide,
  onSetSwapTarget,
  onSwapPanels,
  onUpdatePanelBeatText,
  onUpdatePanel,
  panel,
}: ComicPanelViewProps) {
  const panelCharacterIds = Array.from(new Set([...(beat?.characterIds ?? []), ...panel.characterIds]))
  const panelCharacters = panelCharacterIds
    .map((characterId) => characters.find((character) => character.id === characterId))
    .filter((character): character is Character => Boolean(character))

  const startMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (
      target.closest('.comic-panel-control, .comic-panel-edit, .free-transform-handle') ||
      (isSelected && target.closest('.comic-panel-textbox'))
    ) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    onSelectPanel(panel.pageNumber, panel.id)
    const pageElement = event.currentTarget.closest('.manga-page')
    if (!pageElement) {
      return
    }

    const rect = pageElement.getBoundingClientRect()
    const startX = event.clientX
    const startY = event.clientY
    const startPanel = { ...panel }
    let nextSwapTargetId: string | undefined

    const movePanel = (pointerEvent: PointerEvent) => {
      const rawX = clamp(startPanel.x + ((pointerEvent.clientX - startX) / rect.width) * 100, 0, 100 - startPanel.width)
      const rawY = clamp(
        startPanel.y + ((pointerEvent.clientY - startY) / rect.height) * 100,
        0,
        100 - startPanel.height,
      )
      const snapped = snapPanelToGuides(
        { ...startPanel, x: rawX, y: rawY },
        allPanels.filter((item) => item.id !== panel.id),
      )
      const x = clamp(snapped.x, 0, 100 - startPanel.width)
      const y = clamp(snapped.y, 0, 100 - startPanel.height)
      const deltaX = x - startPanel.x
      const deltaY = y - startPanel.y
      nextSwapTargetId = findPanelAtPoint(
        allPanels.filter((item) => item.id !== panel.id),
        ((pointerEvent.clientX - rect.left) / rect.width) * 100,
        ((pointerEvent.clientY - rect.top) / rect.height) * 100,
      )
      onSetAlignmentGuides(snapped.guides)
      onSetSwapTarget(nextSwapTargetId)
      onUpdatePanel(panel.pageNumber, panel.id, {
        x,
        y,
        points: startPanel.points?.map((point) => ({ x: point.x + deltaX, y: point.y + deltaY })),
      })
    }

    const stopMove = () => {
      window.removeEventListener('pointermove', movePanel)
      window.removeEventListener('pointerup', stopMove)
      onSetAlignmentGuides({ horizontal: [], vertical: [] })
      onSetDiagonalGuide(undefined)
      onSetSwapTarget(undefined)
      if (nextSwapTargetId) {
        onSwapPanels(panel.id, nextSwapTargetId)
      }
    }

    window.addEventListener('pointermove', movePanel)
    window.addEventListener('pointerup', stopMove)
  }

  const startResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    onSelectPanel(panel.pageNumber, panel.id)
    const pageElement = event.currentTarget.closest('.manga-page')
    if (!pageElement) {
      return
    }

    const rect = pageElement.getBoundingClientRect()
    const startX = event.clientX
    const startY = event.clientY
    const startPanel = { ...panel }

    const resizePanel = (pointerEvent: PointerEvent) => {
      const rawWidth = clamp(
        startPanel.width + ((pointerEvent.clientX - startX) / rect.width) * 100,
        8,
        100 - startPanel.x,
      )
      const rawHeight = clamp(
        startPanel.height + ((pointerEvent.clientY - startY) / rect.height) * 100,
        6,
        100 - startPanel.y,
      )
      const snapped = snapPanelToGuides(
        { ...startPanel, width: rawWidth, height: rawHeight },
        allPanels.filter((item) => item.id !== panel.id),
      )
      const width = clamp(snapped.width, 8, 100 - startPanel.x)
      const height = clamp(snapped.height, 6, 100 - startPanel.y)
      const points = startPanel.points
        ? scalePointsToBox(startPanel.points, startPanel, { ...startPanel, width, height })
        : undefined
      onSetAlignmentGuides(snapped.guides)
      onUpdatePanel(panel.pageNumber, panel.id, { width, height, points })
    }

    const stopResize = () => {
      window.removeEventListener('pointermove', resizePanel)
      window.removeEventListener('pointerup', stopResize)
      onSetAlignmentGuides({ horizontal: [], vertical: [] })
      onSetDiagonalGuide(undefined)
    }

    window.addEventListener('pointermove', resizePanel)
    window.addEventListener('pointerup', stopResize)
  }

  const startFreeTransform = (event: ReactPointerEvent<HTMLButtonElement>, pointIndex: number) => {
    event.preventDefault()
    event.stopPropagation()
    onSelectPanel(panel.pageNumber, panel.id)
    const pageElement = event.currentTarget.closest('.manga-page')
    if (!pageElement) {
      return
    }

    const rect = pageElement.getBoundingClientRect()
    const startPoints = panel.points ?? rectToPoints(panel)

    const movePoint = (pointerEvent: PointerEvent) => {
      const nextPoints = startPoints.map((point, index) =>
        index === pointIndex
          ? {
              x: clamp(((pointerEvent.clientX - rect.left) / rect.width) * 100, 0, 100),
              y: clamp(((pointerEvent.clientY - rect.top) / rect.height) * 100, 0, 100),
            }
          : point,
      )
      const bounds = getPointBounds(nextPoints)
      onSetAlignmentGuides(
        getPointAlignmentGuides(
          nextPoints[pointIndex],
          [
            ...nextPoints.filter((_, index) => index !== pointIndex),
            ...allPanels
              .filter((item) => item.id !== panel.id)
              .flatMap((item) => item.points ?? rectToPoints(item)),
          ],
        ),
      )
      onSetDiagonalGuide(getParallelGuide(nextPoints, pointIndex))
      onUpdatePanel(panel.pageNumber, panel.id, { ...bounds, points: nextPoints })
    }

    const stopPointMove = () => {
      window.removeEventListener('pointermove', movePoint)
      window.removeEventListener('pointerup', stopPointMove)
      onSetAlignmentGuides({ horizontal: [], vertical: [] })
      onSetDiagonalGuide(undefined)
    }

    window.addEventListener('pointermove', movePoint)
    window.addEventListener('pointerup', stopPointMove)
  }

  const startPanelTextBoxMove = (event: ReactPointerEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
    onSelectPanel(panel.pageNumber, panel.id)
    const panelElement = event.currentTarget.closest('.comic-panel')
    if (!panelElement) {
      return
    }

    const rect = panelElement.getBoundingClientRect()
    const startX = event.clientX
    const startY = event.clientY
    const startTextBox = { ...panel.textBox }

    const moveTextBox = (pointerEvent: PointerEvent) => {
      pointerEvent.preventDefault()
      const x = clamp(
        startTextBox.x + ((pointerEvent.clientX - startX) / rect.width) * 100,
        0,
        100 - startTextBox.width,
      )
      const y = clamp(
        startTextBox.y + ((pointerEvent.clientY - startY) / rect.height) * 100,
        0,
        100 - startTextBox.height,
      )
      onUpdatePanel(panel.pageNumber, panel.id, { textBox: { ...startTextBox, x, y } })
    }

    const stopTextBoxMove = () => {
      window.removeEventListener('pointermove', moveTextBox)
      window.removeEventListener('pointerup', stopTextBoxMove)
    }

    window.addEventListener('pointermove', moveTextBox)
    window.addEventListener('pointerup', stopTextBoxMove)
  }

  const startPanelTextBoxResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    onSelectPanel(panel.pageNumber, panel.id)
    const panelElement = event.currentTarget.closest('.comic-panel')
    if (!panelElement) {
      return
    }

    const rect = panelElement.getBoundingClientRect()
    const startX = event.clientX
    const startY = event.clientY
    const startTextBox = { ...panel.textBox }

    const resizeTextBox = (pointerEvent: PointerEvent) => {
      const width = clamp(
        startTextBox.width + ((pointerEvent.clientX - startX) / rect.width) * 100,
        12,
        100 - startTextBox.x,
      )
      const height = clamp(
        startTextBox.height + ((pointerEvent.clientY - startY) / rect.height) * 100,
        12,
        100 - startTextBox.y,
      )
      onUpdatePanel(panel.pageNumber, panel.id, { textBox: { ...startTextBox, width, height } })
    }

    const stopTextBoxResize = () => {
      window.removeEventListener('pointermove', resizeTextBox)
      window.removeEventListener('pointerup', stopTextBoxResize)
    }

    window.addEventListener('pointermove', resizeTextBox)
    window.addEventListener('pointerup', stopTextBoxResize)
  }

  const panelPoints = panel.points ?? rectToPoints(panel)
  const shouldShowFreeHandles = isSelected && (freeTransformMode || panel.points)
  const clipPath = panel.points ? pointsToClipPath(panel.points, panel) : undefined
  const polygonPoints = panel.points ? pointsToSvgPolygon(panel.points, panel) : undefined
  const panelStyle = {
    left: `${panel.x}%`,
    top: `${panel.y}%`,
    width: `${panel.width}%`,
    height: `${panel.height}%`,
    clipPath,
    '--panel-text-font-size': panel.textFontSize ? `${panel.textFontSize}px` : undefined,
  } as CSSProperties & { '--panel-text-font-size'?: string }
  const panelTextBoxStyle = {
    left: `${panel.textBox.x}%`,
    top: `${panel.textBox.y}%`,
    width: `${panel.textBox.width}%`,
    height: `${panel.textBox.height}%`,
  }

  return (
    <div
      className={`comic-panel ${panel.points ? 'has-points' : ''} ${isSelected ? 'is-selected' : ''} ${
        isSwapTarget ? 'is-swap-target' : ''
      }`}
      data-panel-id={panel.id}
      onClick={(event) => {
        event.stopPropagation()
        onSelectPanel(panel.pageNumber, panel.id)
      }}
      onDragOver={(event) => {
        if (
          event.dataTransfer.types.includes('application/x-storyboard-character') ||
          event.dataTransfer.types.includes('application/x-storyboard-beat')
        ) {
          event.preventDefault()
          event.dataTransfer.dropEffect = event.dataTransfer.types.includes('application/x-storyboard-beat')
            ? 'move'
            : 'copy'
        }
      }}
      onDrop={(event) => {
        const beatId = event.dataTransfer.getData('application/x-storyboard-beat')
        if (beatId) {
          event.preventDefault()
          event.stopPropagation()
          onAssignBeatToPanel(beatId, panel.id)
          return
        }

        const characterId = event.dataTransfer.getData('application/x-storyboard-character')
        if (!characterId) {
          return
        }
        event.preventDefault()
        event.stopPropagation()
        onAddCharacterToPanel(panel.id, characterId)
      }}
      onPointerDown={startMove}
      role="button"
      style={panelStyle}
      tabIndex={0}
    >
      {polygonPoints && (
        <svg className="comic-panel-outline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polygon points={polygonPoints} />
        </svg>
      )}
      <span className="comic-panel-no">
        {beat ? `No.${beat.no ? String(beat.no).padStart(3, '0') : ''}` : 'No.'}
      </span>
      <div
        className={`comic-panel-textbox ${isSelected ? 'is-selected' : ''}`}
        onPointerDown={(event) => {
          const target = event.target as HTMLElement
          if (!isSelected || target.closest('.comic-panel-control, .comic-panel-edit')) {
            return
          }
          startPanelTextBoxMove(event)
        }}
        style={panelTextBoxStyle}
      >
        <textarea
          className="comic-panel-edit"
          onChange={(event) => onUpdatePanelBeatText(panel.id, event.target.value)}
          onClick={(event) => {
            event.stopPropagation()
            onSelectPanel(panel.pageNumber, panel.id)
          }}
          onPointerDown={(event) => event.stopPropagation()}
          placeholder="コマ内容"
          value={beat?.text ?? ''}
        />
        {isSelected && (
          <>
            <button
              aria-label="コマ本文領域を移動"
              className="comic-panel-textbox-drag comic-panel-control"
              onPointerDown={startPanelTextBoxMove}
              type="button"
            >
              ⊹
            </button>
            <button
              aria-label="コマ本文領域をリサイズ"
              className="comic-panel-textbox-resize comic-panel-control"
              onPointerDown={startPanelTextBoxResize}
              type="button"
            >
              ⊿
            </button>
          </>
        )}
      </div>
      {panelCharacters.length > 0 && (
        <span className="comic-panel-character-row">
          {panelCharacters.map((character) => (
            <button
              className="comic-panel-character"
              key={character.id}
              onClick={(event) => {
                event.stopPropagation()
                onRemoveCharacterFromPanel(panel.id, character.id)
              }}
              style={{ backgroundColor: character.color }}
              type="button"
            >
              {character.name} ×
            </button>
          ))}
        </span>
      )}
      {shouldShowFreeHandles && (
        <>
          {panelPoints.map((point, index) => (
            <button
              aria-label={`自由変形ハンドル ${index + 1}`}
              className={`free-transform-handle free-transform-handle-${index}`}
              key={`${panel.id}-point-${index}`}
              onPointerDown={(event) => startFreeTransform(event, index)}
              style={{
                left: `${toLocalPoint(point.x, panel.x, panel.width)}%`,
                top: `${toLocalPoint(point.y, panel.y, panel.height)}%`,
              }}
              type="button"
            />
          ))}
        </>
      )}
      {isSelected && (
        <>
          <button
            aria-label="このコマを削除"
            className="comic-panel-delete comic-panel-control"
            onClick={(event) => {
              event.stopPropagation()
              onDeletePanel(panel.id)
            }}
            type="button"
          >
            ×
          </button>
          <button
            aria-label="このコマを別ページへ移動"
            className="comic-panel-page-drag comic-panel-control"
            draggable
            onDragStart={(event) => {
              event.stopPropagation()
              event.dataTransfer.setData('application/x-storyboard-panel', panel.id)
              event.dataTransfer.effectAllowed = 'move'
            }}
            type="button"
          >
            ↗
          </button>
          <button
            aria-label="このコマのサイズを変更"
            className="comic-panel-resize comic-panel-control"
            onPointerDown={startResize}
            type="button"
          />
        </>
      )}
    </div>
  )
}

type SpeechBubbleViewProps = {
  bubble: SpeechBubble
  text: string
  isSelected: boolean
  onUpdateSpeechBubble: (
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
  ) => void
  onUpdateDialogueLine: (beatId: string, dialogueId: string, text: string) => void
  onDeleteSpeechBubble: (bubbleId: string) => void
}

function SpeechBubbleView({
  bubble,
  isSelected,
  onDeleteSpeechBubble,
  onUpdateDialogueLine,
  onUpdateSpeechBubble,
  text,
}: SpeechBubbleViewProps) {
  const startMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest('.speech-bubble-control') || (isSelected && target.closest('.speech-bubble-textbox'))) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    const pageElement = event.currentTarget.closest('.manga-page')
    if (!pageElement) {
      return
    }

    const rect = pageElement.getBoundingClientRect()
    const startX = event.clientX
    const startY = event.clientY
    const startBubble = { ...bubble }

    const moveBubble = (pointerEvent: PointerEvent) => {
      const x = clamp(startBubble.x + ((pointerEvent.clientX - startX) / rect.width) * 100, 0, 100 - startBubble.width)
      const y = clamp(startBubble.y + ((pointerEvent.clientY - startY) / rect.height) * 100, 0, 100 - startBubble.height)
      onUpdateSpeechBubble(bubble.id, { x, y })
    }

    const stopMove = () => {
      window.removeEventListener('pointermove', moveBubble)
      window.removeEventListener('pointerup', stopMove)
    }

    window.addEventListener('pointermove', moveBubble)
    window.addEventListener('pointerup', stopMove)
  }

  const startResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const pageElement = event.currentTarget.closest('.manga-page')
    if (!pageElement) {
      return
    }

    const rect = pageElement.getBoundingClientRect()
    const startX = event.clientX
    const startY = event.clientY
    const startBubble = { ...bubble }

    const resizeBubble = (pointerEvent: PointerEvent) => {
      const width = clamp(startBubble.width + ((pointerEvent.clientX - startX) / rect.width) * 100, 7, 100 - bubble.x)
      const height = clamp(startBubble.height + ((pointerEvent.clientY - startY) / rect.height) * 100, 5, 100 - bubble.y)
      onUpdateSpeechBubble(bubble.id, { width, height })
    }

    const stopResize = () => {
      window.removeEventListener('pointermove', resizeBubble)
      window.removeEventListener('pointerup', stopResize)
    }

    window.addEventListener('pointermove', resizeBubble)
    window.addEventListener('pointerup', stopResize)
  }
  const startTextBoxMove = (event: ReactPointerEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const bubbleElement = event.currentTarget.closest('.speech-bubble')
    if (!bubbleElement) {
      return
    }

    const rect = bubbleElement.getBoundingClientRect()
    const startX = event.clientX
    const startY = event.clientY
    const startTextBox = { ...bubble.textBox }

    const moveTextBox = (pointerEvent: PointerEvent) => {
      pointerEvent.preventDefault()
      const x = clamp(
        startTextBox.x + ((pointerEvent.clientX - startX) / rect.width) * 100,
        0,
        100 - startTextBox.width,
      )
      const y = clamp(
        startTextBox.y + ((pointerEvent.clientY - startY) / rect.height) * 100,
        0,
        100 - startTextBox.height,
      )
      onUpdateSpeechBubble(bubble.id, { textBox: { ...startTextBox, x, y } })
    }

    const stopTextBoxMove = () => {
      window.removeEventListener('pointermove', moveTextBox)
      window.removeEventListener('pointerup', stopTextBoxMove)
    }

    window.addEventListener('pointermove', moveTextBox)
    window.addEventListener('pointerup', stopTextBoxMove)
  }
  const startTextBoxResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const bubbleElement = event.currentTarget.closest('.speech-bubble')
    if (!bubbleElement) {
      return
    }

    const rect = bubbleElement.getBoundingClientRect()
    const startX = event.clientX
    const startY = event.clientY
    const startTextBox = { ...bubble.textBox }

    const resizeTextBox = (pointerEvent: PointerEvent) => {
      const width = clamp(
        startTextBox.width + ((pointerEvent.clientX - startX) / rect.width) * 100,
        12,
        100 - startTextBox.x,
      )
      const height = clamp(
        startTextBox.height + ((pointerEvent.clientY - startY) / rect.height) * 100,
        12,
        100 - startTextBox.y,
      )
      onUpdateSpeechBubble(bubble.id, { textBox: { ...startTextBox, width, height } })
    }

    const stopTextBoxResize = () => {
      window.removeEventListener('pointermove', resizeTextBox)
      window.removeEventListener('pointerup', stopTextBoxResize)
    }

    window.addEventListener('pointermove', resizeTextBox)
    window.addEventListener('pointerup', stopTextBoxResize)
  }
  const bubbleStyle = {
    left: `${bubble.x}%`,
    top: `${bubble.y}%`,
    width: `${bubble.width}%`,
    height: `${bubble.height}%`,
    '--bubble-text-font-size': bubble.textFontSize ? `${bubble.textFontSize}px` : undefined,
  } as CSSProperties & { '--bubble-text-font-size'?: string }
  const textBoxStyle = {
    left: `${bubble.textBox.x}%`,
    top: `${bubble.textBox.y}%`,
    width: `${bubble.textBox.width}%`,
    height: `${bubble.textBox.height}%`,
  }

  return (
    <div
      className={`speech-bubble speech-bubble-${bubble.shape} speech-bubble-${bubble.textDirection} ${
        isSelected ? 'is-selected' : ''
      }`}
      onClick={(event) => {
        event.stopPropagation()
        onUpdateSpeechBubble(bubble.id, {})
      }}
      onPointerDown={startMove}
      role="button"
      style={bubbleStyle}
      tabIndex={0}
    >
      <div
        className={`speech-bubble-textbox ${isSelected ? 'is-selected' : ''}`}
        onPointerDown={(event) => {
          const target = event.target as HTMLElement
          if (!isSelected || target.closest('.speech-bubble-control, .speech-bubble-textarea')) {
            return
          }
          startTextBoxMove(event)
        }}
        style={textBoxStyle}
      >
        <textarea
          className="speech-bubble-text speech-bubble-textarea"
          onChange={(event) => onUpdateDialogueLine(bubble.beatId, bubble.dialogueId, event.target.value)}
          onClick={(event) => {
            event.stopPropagation()
            onUpdateSpeechBubble(bubble.id, {})
          }}
          onFocus={() => onUpdateSpeechBubble(bubble.id, {})}
          onPointerDown={(event) => {
            event.stopPropagation()
            onUpdateSpeechBubble(bubble.id, {})
          }}
          placeholder="セリフ"
          rows={1}
          value={text}
        />
        {isSelected && (
          <>
            <button
              aria-label="セリフ領域を移動"
              className="speech-bubble-textbox-drag speech-bubble-control"
              onPointerDown={startTextBoxMove}
              type="button"
            >
              ⊹
            </button>
            <button
              aria-label="セリフ領域をリサイズ"
              className="speech-bubble-textbox-resize speech-bubble-control"
              onPointerDown={startTextBoxResize}
              type="button"
            >
              ⊿
            </button>
          </>
        )}
      </div>
      {isSelected && (
        <>
          <button
            aria-label="吹き出しを削除"
            className="speech-bubble-delete speech-bubble-control"
            onClick={(event) => {
              event.stopPropagation()
              onDeleteSpeechBubble(bubble.id)
            }}
            type="button"
          >
            ×
          </button>
          <button
            aria-label="吹き出しのサイズを変更"
            className="speech-bubble-resize speech-bubble-control"
            onPointerDown={startResize}
            type="button"
          >
            ⊿
          </button>
        </>
      )}
    </div>
  )
}

type AlignmentGuides = {
  horizontal: number[]
  vertical: number[]
}

type DiagonalGuide = {
  x: number
  y: number
  length: number
  angle: number
}

type PanelBox = Pick<ComicPanel, 'id' | 'x' | 'y' | 'width' | 'height'>

function snapPanelToGuides(panel: PanelBox, otherPanels: PanelBox[]) {
  const threshold = 1.25
  let nextX = panel.x
  let nextY = panel.y
  let nextWidth = panel.width
  let nextHeight = panel.height
  const guides: AlignmentGuides = { horizontal: [], vertical: [] }

  const movingVertical = [
    { key: 'left', value: panel.x },
    { key: 'center', value: panel.x + panel.width / 2 },
    { key: 'right', value: panel.x + panel.width },
  ]
  const movingHorizontal = [
    { key: 'top', value: panel.y },
    { key: 'middle', value: panel.y + panel.height / 2 },
    { key: 'bottom', value: panel.y + panel.height },
  ]

  for (const otherPanel of otherPanels) {
    const targetVertical = [otherPanel.x, otherPanel.x + otherPanel.width / 2, otherPanel.x + otherPanel.width]
    const targetHorizontal = [otherPanel.y, otherPanel.y + otherPanel.height / 2, otherPanel.y + otherPanel.height]

    for (const movingLine of movingVertical) {
      const targetLine = targetVertical.find((line) => Math.abs(line - movingLine.value) <= threshold)
      if (targetLine === undefined) {
        continue
      }
      guides.vertical.push(targetLine)
      if (movingLine.key === 'left') nextX = targetLine
      if (movingLine.key === 'center') nextX = targetLine - panel.width / 2
      if (movingLine.key === 'right') {
        if (panel.x === nextX) {
          nextWidth = targetLine - panel.x
        } else {
          nextX = targetLine - panel.width
        }
      }
    }

    for (const movingLine of movingHorizontal) {
      const targetLine = targetHorizontal.find((line) => Math.abs(line - movingLine.value) <= threshold)
      if (targetLine === undefined) {
        continue
      }
      guides.horizontal.push(targetLine)
      if (movingLine.key === 'top') nextY = targetLine
      if (movingLine.key === 'middle') nextY = targetLine - panel.height / 2
      if (movingLine.key === 'bottom') {
        if (panel.y === nextY) {
          nextHeight = targetLine - panel.y
        } else {
          nextY = targetLine - panel.height
        }
      }
    }
  }

  return {
    x: nextX,
    y: nextY,
    width: nextWidth,
    height: nextHeight,
    guides: {
      horizontal: Array.from(new Set(guides.horizontal.map((line) => Number(line.toFixed(2))))),
      vertical: Array.from(new Set(guides.vertical.map((line) => Number(line.toFixed(2))))),
    },
  }
}

function findPanelAtPoint(panels: PanelBox[], x: number, y: number) {
  return panels.find(
    (panel) =>
      x >= panel.x &&
      x <= panel.x + panel.width &&
      y >= panel.y &&
      y <= panel.y + panel.height,
  )?.id
}

function parseDialogueDragData(value: string) {
  try {
    const parsedValue = JSON.parse(value) as { beatId?: unknown; dialogueId?: unknown }
    if (typeof parsedValue.beatId === 'string' && typeof parsedValue.dialogueId === 'string') {
      return { beatId: parsedValue.beatId, dialogueId: parsedValue.dialogueId }
    }
  } catch {
    return null
  }

  return null
}

function getDialogueText(beats: Beat[], beatId: string, dialogueId: string) {
  return beats.find((beat) => beat.id === beatId)?.dialogues.find((dialogue) => dialogue.id === dialogueId)?.text ?? ''
}

function getPointAlignmentGuides(movingPoint: PanelPoint, targetPoints: PanelPoint[]) {
  const threshold = 1.25
  const guides: AlignmentGuides = { horizontal: [], vertical: [] }

  for (const targetPoint of targetPoints) {
    if (Math.abs(movingPoint.x - targetPoint.x) <= threshold) {
      guides.vertical.push(targetPoint.x)
    }
    if (Math.abs(movingPoint.y - targetPoint.y) <= threshold) {
      guides.horizontal.push(targetPoint.y)
    }
  }

  return {
    horizontal: Array.from(new Set(guides.horizontal.map((line) => Number(line.toFixed(2))))),
    vertical: Array.from(new Set(guides.vertical.map((line) => Number(line.toFixed(2))))),
  }
}

function rectToPoints(panel: PanelBox): PanelPoint[] {
  return [
    { x: panel.x, y: panel.y },
    { x: panel.x + panel.width, y: panel.y },
    { x: panel.x + panel.width, y: panel.y + panel.height },
    { x: panel.x, y: panel.y + panel.height },
  ]
}

function pointsToClipPath(points: PanelPoint[], panel: PanelBox) {
  return `polygon(${points
    .map((point) => `${toLocalPoint(point.x, panel.x, panel.width)}% ${toLocalPoint(point.y, panel.y, panel.height)}%`)
    .join(', ')})`
}

function pointsToSvgPolygon(points: PanelPoint[], panel: PanelBox) {
  return points
    .map((point) => `${toLocalPoint(point.x, panel.x, panel.width)},${toLocalPoint(point.y, panel.y, panel.height)}`)
    .join(' ')
}

function toLocalPoint(value: number, origin: number, size: number) {
  if (size <= 0) {
    return 0
  }

  return clamp(((value - origin) / size) * 100, 0, 100)
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

function scalePointsToBox(points: PanelPoint[], fromBox: PanelBox, toBox: PanelBox) {
  return points.map((point) => ({
    x: toBox.x + ((point.x - fromBox.x) / fromBox.width) * toBox.width,
    y: toBox.y + ((point.y - fromBox.y) / fromBox.height) * toBox.height,
  }))
}

function getParallelGuide(points: PanelPoint[], movingIndex: number): DiagonalGuide | undefined {
  const previousIndex = (movingIndex + 3) % 4
  const nextIndex = (movingIndex + 1) % 4
  const oppositePreviousIndex = (movingIndex + 2) % 4
  const oppositeNextIndex = (movingIndex + 2) % 4
  const guideCandidates = [
    [points[previousIndex], points[movingIndex], points[nextIndex], points[oppositeNextIndex]],
    [points[movingIndex], points[nextIndex], points[previousIndex], points[oppositePreviousIndex]],
  ]

  for (const [lineStart, lineEnd, compareStart, compareEnd] of guideCandidates) {
    const angle = getLineAngle(lineStart, lineEnd)
    const compareAngle = getLineAngle(compareStart, compareEnd)
    if (Math.abs(normalizeAngle(angle - compareAngle)) <= 7) {
      return lineToGuide(lineStart, lineEnd)
    }
  }

  return undefined
}

function getLineAngle(start: PanelPoint, end: PanelPoint) {
  return (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI
}

function normalizeAngle(angle: number) {
  const normalized = Math.abs(((angle + 90) % 180) - 90)
  return normalized > 90 ? 180 - normalized : normalized
}

function lineToGuide(start: PanelPoint, end: PanelPoint): DiagonalGuide {
  const xDelta = end.x - start.x
  const yDelta = end.y - start.y
  return {
    x: start.x,
    y: start.y,
    length: Math.sqrt(xDelta * xDelta + yDelta * yDelta),
    angle: getLineAngle(start, end),
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
