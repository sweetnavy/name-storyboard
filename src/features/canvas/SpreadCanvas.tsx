import { MangaPage } from './MangaPage'
import { useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { ClearIcon, EraserIcon, PenIcon, RedoIcon, UndoIcon } from '../drawing/DrawingIcons'
import type { DrawingStroke, DrawingTool, PanelPoint, Project } from '../../types/storyboard'
import { getCurrentSpread, getVisiblePages } from '../../utils/pageOperations'

const DRAWING_STROKE_SCALE = 0.15
const DRAWING_ERASER_SCALE = 0.22

type SpreadCanvasProps = {
  project: Project
  canUndo: boolean
  canRedo: boolean
  onAddComicPanel: () => void
  onUndoProject: () => void
  onRedoProject: () => void
  onSelectPage: (pageNumber: number) => void
  onSelectPanel: (pageNumber: number, panelId: string) => void
  onPlaceBeatOnPage: (beatId: string, pageNumber: number, position: { x: number; y: number }) => void
  onPlaceDialogueOnPage: (
    beatId: string,
    dialogueId: string,
    pageNumber: number,
    position: { x: number; y: number },
  ) => void
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
  onAssignBeatToPanel: (beatId: string, panelId: string) => void
  onSwapPanels: (sourcePanelId: string, targetPanelId: string) => void
  onResetSelectedPanelShape: () => void
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
  onToggleBubbleTextDirection: () => void
  onUpdatePageTextFontSize: (fontSize: number) => void
  drawingControls: {
    drawingMode: boolean
    selectedTool: DrawingTool
    penColor: string
    penWidth: number
    eraserWidth: number
    onToggleDrawingMode: () => void
    onSelectTool: (tool: DrawingTool) => void
    onClear: () => void
    onAddStroke: (pageNumber: number, stroke: DrawingStroke) => void
    onEraseAtPoint: (pageNumber: number, point: { x: number; y: number }) => void
    onEraseStrokes: (strokeIds: string[]) => void
  }
  zoomControls: {
    resetZoom: () => void
    setZoom: (zoom: number) => void
    zoom: number
    zoomIn: () => void
    zoomOut: () => void
  }
}

export function SpreadCanvas({
  onAddComicPanel,
  canRedo,
  canUndo,
  onDeletePanel,
  onDeleteSpeechBubble,
  onRedoProject,
  onResetSelectedPanelShape,
  onAddCharacterToPanel,
  onPlaceBeatOnPage,
  onPlaceDialogueOnPage,
  onAssignBeatToPanel,
  onSwapPanels,
  onRemoveCharacterFromPanel,
  onSelectPage,
  onSelectPanel,
  onUpdatePanelBeatText,
  onUpdateDialogueLine,
  onUpdatePanel,
  onUpdateSpeechBubble,
  onToggleBubbleTextDirection,
  onUpdatePageTextFontSize,
  onUndoProject,
  project,
  drawingControls,
  zoomControls,
}: SpreadCanvasProps) {
  const [freeTransformMode, setFreeTransformMode] = useState(false)
  const pageGroupRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const panStateRef = useRef<
    { x: number; y: number; scrollLeft: number; scrollTop: number } | undefined
  >(undefined)
  const [pageBoxes, setPageBoxes] = useState<Record<number, PageBox>>({})
  const [isPanKeyPressed, setIsPanKeyPressed] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const currentSpread = getCurrentSpread(project)
  const visiblePages = getVisiblePages(project)
  const isSinglePage = visiblePages.length === 1
  const pageBaseWidth = 360
  const pageBaseHeight = pageBaseWidth / 0.707
  const spreadGap = isSinglePage ? 0 : 16
  const stageBaseWidth = visiblePages.length * pageBaseWidth + Math.max(visiblePages.length - 1, 0) * spreadGap
  const stageBaseHeight = pageBaseHeight
  const canvasStyle = {
    '--canvas-zoom': zoomControls.zoom,
    '--page-width': `${pageBaseWidth}px`,
    '--page-min-width': `${pageBaseWidth}px`,
    '--page-text-font-size': `${project.pageTextFontSize}px`,
  } as CSSProperties
  const scaledStageWidth = stageBaseWidth * zoomControls.zoom
  const scaledStageHeight = stageBaseHeight * zoomControls.zoom
  const stageStyle = {
    '--stage-width': `${scaledStageWidth}px`,
    '--stage-height': `${scaledStageHeight}px`,
    width: `max(100%, ${scaledStageWidth}px)`,
    height: `max(100%, ${scaledStageHeight}px)`,
  } as CSSProperties

  useLayoutEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return
      }
      if (event.code === 'Space') {
        event.preventDefault()
        setIsPanKeyPressed(true)
      }
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setIsPanKeyPressed(false)
      }
    }
    const handleBlur = () => setIsPanKeyPressed(false)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
      setIsPanKeyPressed(false)
    }
  }, [])

  useLayoutEffect(() => {
    const pageGroup = pageGroupRef.current
    if (!pageGroup) {
      return
    }

    const updatePageBoxes = () => {
      const groupRect = pageGroup.getBoundingClientRect()
      if (!groupRect.width || !groupRect.height) {
        return
      }
      const nextPageBoxes: Record<number, PageBox> = {}
      pageGroup.querySelectorAll<HTMLElement>('.manga-page[data-page-number]').forEach((pageElement) => {
        const pageNumber = Number(pageElement.dataset.pageNumber)
        const pageRect = pageElement.getBoundingClientRect()
        nextPageBoxes[pageNumber] = {
          x: ((pageRect.left - groupRect.left) / groupRect.width) * 100,
          y: ((pageRect.top - groupRect.top) / groupRect.height) * 100,
          width: (pageRect.width / groupRect.width) * 100,
          height: (pageRect.height / groupRect.height) * 100,
        }
      })
      setPageBoxes(nextPageBoxes)
    }

    updatePageBoxes()
    const resizeObserver = new ResizeObserver(updatePageBoxes)
    resizeObserver.observe(pageGroup)
    pageGroup.querySelectorAll('.manga-page').forEach((pageElement) => resizeObserver.observe(pageElement))
    window.addEventListener('resize', updatePageBoxes)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updatePageBoxes)
    }
  }, [visiblePages.length, zoomControls.zoom, currentSpread.id])
  const selectedBubble = project.pages
    .flatMap((page) => page.bubbles)
    .find((bubble) => bubble.id === project.selectedBubbleId)
  const selectedPanel = project.pages
    .flatMap((page) => page.panels)
    .find((panel) => panel.id === project.selectedPanelId)
  const currentBubbleDirection = selectedBubble?.textDirection ?? project.defaultBubbleTextDirection
  const activeTextFontSize =
    selectedBubble?.textFontSize ?? selectedPanel?.textFontSize ?? project.pageTextFontSize
  const fitToViewport = () => {
    const canvasElement = canvasRef.current
    if (!canvasElement) {
      return
    }
    const usableWidth = Math.max(canvasElement.clientWidth - 72, 120)
    const usableHeight = Math.max(canvasElement.clientHeight - 72, 120)
    zoomControls.setZoom(Math.min(usableWidth / stageBaseWidth, usableHeight / stageBaseHeight, 3))
  }
  const startPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.ctrlKey && !isPanKeyPressed) {
      return
    }
    if (isEditableTarget(event.target)) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    const canvasElement = event.currentTarget
    panStateRef.current = {
      x: event.clientX,
      y: event.clientY,
      scrollLeft: canvasElement.scrollLeft,
      scrollTop: canvasElement.scrollTop,
    }
    canvasElement.setPointerCapture(event.pointerId)
    setIsPanning(true)
  }
  const movePan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isPanning || !panStateRef.current) {
      return
    }
    event.preventDefault()
    event.currentTarget.scrollLeft = panStateRef.current.scrollLeft - (event.clientX - panStateRef.current.x)
    event.currentTarget.scrollTop = panStateRef.current.scrollTop - (event.clientY - panStateRef.current.y)
  }
  const finishPan = () => {
    panStateRef.current = undefined
    setIsPanning(false)
  }

  return (
    <div className="canvas-wrap">
      <div className="canvas-toolbar">
        <div>
          <p className="text-overline">Spread</p>
          <div className="spread-title-row">
            <h2 className="section-title">{currentSpread.label}</h2>
            <div className="history-controls" aria-label="編集履歴">
              <button
                aria-label="Undo"
                className="mini-button icon-button"
                disabled={!canUndo}
                onClick={onUndoProject}
                type="button"
              >
                <UndoIcon />
              </button>
              <button
                aria-label="Redo"
                className="mini-button icon-button"
                disabled={!canRedo}
                onClick={onRedoProject}
                type="button"
              >
                <RedoIcon />
              </button>
            </div>
          </div>
        </div>
        <div className="zoom-controls">
          <button className="mini-button" type="button" onClick={zoomControls.zoomOut}>
            −
          </button>
          <span className="zoom-value">{Math.round(zoomControls.zoom * 100)}%</span>
          <button className="mini-button" type="button" onClick={zoomControls.zoomIn}>
            +
          </button>
          <button className="mini-button" type="button" onClick={zoomControls.resetZoom}>
            リセット
          </button>
          <button className="mini-button" type="button" onClick={fitToViewport}>
            フィット
          </button>
          <span className="bubble-direction-control">
            <span className="text-caption">セリフ:</span>
            <button
              aria-label={currentBubbleDirection === 'vertical' ? '縦書き' : '横書き'}
              className="mini-button icon-button bubble-direction-button"
              type="button"
              onClick={onToggleBubbleTextDirection}
            >
              {currentBubbleDirection === 'vertical' ? <VerticalTextIcon /> : <HorizontalTextIcon />}
            </button>
          </span>
          <span className="page-text-size-control" aria-label="本文フォントサイズ">
            <span className="text-caption">本文</span>
            <button
              aria-label="本文サイズを小さく"
              className="mini-button icon-button"
              type="button"
              onClick={() => onUpdatePageTextFontSize(activeTextFontSize - 1)}
            >
              −
            </button>
            <input
              aria-label="本文サイズ"
              className="page-text-size-input"
              max={32}
              min={8}
              onBlur={(event) => onUpdatePageTextFontSize(Number(event.currentTarget.value))}
              onChange={(event) => {
                if (event.currentTarget.value) {
                  onUpdatePageTextFontSize(Number(event.currentTarget.value))
                }
              }}
              type="number"
              value={activeTextFontSize}
            />
            <button
              aria-label="本文サイズを大きく"
              className="mini-button icon-button"
              type="button"
              onClick={() => onUpdatePageTextFontSize(activeTextFontSize + 1)}
            >
              +
            </button>
          </span>
          <button className="mini-button" type="button" onClick={onAddComicPanel}>
            コマ追加
          </button>
          <button
            className={`mini-button ${freeTransformMode ? 'is-active' : ''}`}
            type="button"
            onClick={() => setFreeTransformMode((currentMode) => !currentMode)}
          >
            自由変形
          </button>
          <button
            className="mini-button"
            type="button"
            disabled={!project.selectedPanelId}
            onClick={onResetSelectedPanelShape}
          >
            長方形に戻す
          </button>
          <button
            aria-label="ペン"
            className={`mini-button icon-button ${drawingControls.drawingMode && drawingControls.selectedTool === 'pen' ? 'is-active' : ''}`}
            type="button"
            onClick={() => {
              if (drawingControls.drawingMode && drawingControls.selectedTool === 'pen') {
                drawingControls.onToggleDrawingMode()
                return
              }
              drawingControls.onSelectTool('pen')
            }}
          >
            <PenIcon />
          </button>
          <button
            aria-label="消しゴム"
            className={`mini-button icon-button ${drawingControls.drawingMode && drawingControls.selectedTool === 'eraser' ? 'is-active' : ''}`}
            type="button"
            onClick={() => drawingControls.onSelectTool('eraser')}
          >
            <EraserIcon />
          </button>
          <button aria-label="全消し" className="mini-button icon-button" type="button" onClick={drawingControls.onClear}>
            <ClearIcon />
          </button>
        </div>
      </div>
      <div
        className={`spread-canvas ${isSinglePage ? 'spread-canvas-single' : ''} ${
          isPanning ? 'is-panning' : isPanKeyPressed ? 'is-pan-ready' : ''
        }`}
        onPointerCancel={finishPan}
        onPointerDown={startPan}
        onPointerMove={movePan}
        onPointerUp={finishPan}
        ref={canvasRef}
        onWheel={(event) => {
          if (!event.ctrlKey) {
            return
          }
          event.preventDefault()
          zoomControls.setZoom(zoomControls.zoom + (event.deltaY < 0 ? 0.08 : -0.08))
        }}
        style={canvasStyle}
      >
        <div className="spread-stage-size" style={stageStyle}>
          <div className="spread-page-group" ref={pageGroupRef}>
            {visiblePages.map((page, index) => (
              <MangaPage
                key={page.id}
                beats={project.beats}
                characters={project.characters}
                isSelected={page.pageNumber === project.selectedPageNumber}
                onDeletePanel={onDeletePanel}
                onDeleteSpeechBubble={onDeleteSpeechBubble}
                onAddCharacterToPanel={onAddCharacterToPanel}
                onPlaceBeatOnPage={onPlaceBeatOnPage}
                onPlaceDialogueOnPage={onPlaceDialogueOnPage}
                onAssignBeatToPanel={onAssignBeatToPanel}
                onSwapPanels={onSwapPanels}
                freeTransformMode={freeTransformMode}
                onRemoveCharacterFromPanel={onRemoveCharacterFromPanel}
                onSelectPage={onSelectPage}
                onSelectPanel={onSelectPanel}
                onUpdatePanelBeatText={onUpdatePanelBeatText}
                onUpdateDialogueLine={onUpdateDialogueLine}
                onUpdatePanel={onUpdatePanel}
                onUpdateSpeechBubble={onUpdateSpeechBubble}
                page={page}
                side={isSinglePage || index === 0 ? 'left' : 'right'}
                selectedPanelId={project.selectedPanelId}
                selectedBubbleId={project.selectedBubbleId}
                variant={page.isCover ? 'cover' : undefined}
              />
            ))}
            <SpreadDrawingLayer
              drawingControls={drawingControls}
              isPanKeyPressed={isPanKeyPressed}
              pageBoxes={pageBoxes}
              pageNumbers={visiblePages.map((page) => page.pageNumber)}
              pages={visiblePages}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

type PageBox = {
  x: number
  y: number
  width: number
  height: number
}

function SpreadDrawingLayer({
  drawingControls,
  pageBoxes,
  pageNumbers,
  pages,
  isPanKeyPressed,
}: {
  pages: Project['pages']
  pageNumbers: number[]
  pageBoxes: Record<number, PageBox>
  isPanKeyPressed: boolean
  drawingControls: SpreadCanvasProps['drawingControls']
}) {
  const draftStrokeRef = useRef<DrawingStroke | undefined>(undefined)
  const frameRef = useRef<number | undefined>(undefined)
  const [draftStroke, setDraftStroke] = useState<DrawingStroke>()
  const ownerPageNumber = pageNumbers[0] ?? pages[0]?.pageNumber ?? 1
  const visibleStrokes = pages.flatMap((page) =>
    page.drawingStrokes.map((stroke) => ({
      original: stroke,
      points: toSpreadPoints(stroke, pageBoxes[page.pageNumber]),
    })),
  )

  const syncDraftStroke = () => {
    if (frameRef.current) {
      return
    }
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = undefined
      setDraftStroke(draftStrokeRef.current ? { ...draftStrokeRef.current } : undefined)
    })
  }

  const getPoint = (event: ReactPointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100),
      pressure: event.pressure || undefined,
    }
  }

  const collectPoints = (event: ReactPointerEvent<SVGSVGElement>) => {
    const nativeEvent = event.nativeEvent as PointerEvent & { getCoalescedEvents?: () => PointerEvent[] }
    const coalescedEvents = nativeEvent.getCoalescedEvents?.() ?? [nativeEvent]
    const rect = event.currentTarget.getBoundingClientRect()
    return coalescedEvents.map((pointerEvent) => ({
      x: clamp(((pointerEvent.clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((pointerEvent.clientY - rect.top) / rect.height) * 100, 0, 100),
      pressure: pointerEvent.pressure || undefined,
    }))
  }

  const eraseAtPoint = (point: { x: number; y: number }) => {
    const threshold = Math.max(drawingControls.eraserWidth * DRAWING_ERASER_SCALE, 0.9)
    const hitStrokeIds = visibleStrokes
      .filter((stroke) => stroke.points.some((strokePoint) => getPointDistance(strokePoint, point) <= threshold))
      .map((stroke) => stroke.original.id)
    drawingControls.onEraseStrokes(hitStrokeIds)
  }

  const startDrawing = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!drawingControls.drawingMode || event.ctrlKey || isPanKeyPressed) {
      return
    }
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = getPoint(event)
    if (drawingControls.selectedTool === 'eraser') {
      eraseAtPoint(point)
      return
    }
    draftStrokeRef.current = {
      id: `stroke-${Date.now()}-${Math.round(Math.random() * 10000)}`,
      pageNumber: ownerPageNumber,
      pageNumbers,
      coordinateScope: 'spread',
      color: drawingControls.penColor,
      width: drawingControls.penWidth,
      points: [point],
    }
    syncDraftStroke()
  }

  const moveDrawing = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!drawingControls.drawingMode || event.ctrlKey || isPanKeyPressed) {
      return
    }
    event.preventDefault()
    if (drawingControls.selectedTool === 'eraser') {
      eraseAtPoint(getPoint(event))
      return
    }
    const points = collectPoints(event)
    if (draftStrokeRef.current) {
      draftStrokeRef.current = {
        ...draftStrokeRef.current,
        points: [...draftStrokeRef.current.points, ...points],
      }
      syncDraftStroke()
    }
  }

  const finishDrawing = () => {
    if (draftStrokeRef.current && draftStrokeRef.current.points.length > 1) {
      drawingControls.onAddStroke(ownerPageNumber, draftStrokeRef.current)
    }
    draftStrokeRef.current = undefined
    setDraftStroke(undefined)
  }

  return (
    <svg
      className={`drawing-layer spread-drawing-layer ${drawingControls.drawingMode ? 'is-active' : ''}`}
      onPointerCancel={finishDrawing}
      onPointerDown={startDrawing}
      onPointerMove={moveDrawing}
      onPointerUp={finishDrawing}
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      {[...visibleStrokes, ...(draftStroke ? [{ original: draftStroke, points: draftStroke.points }] : [])].map(
        (stroke) => (
          <polyline
            fill="none"
            key={stroke.original.id}
            points={stroke.points.map((point) => `${point.x},${point.y}`).join(' ')}
            stroke={stroke.original.color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={Math.max(stroke.original.width * DRAWING_STROKE_SCALE, 0.12)}
          />
        ),
      )}
    </svg>
  )
}

function toSpreadPoints(stroke: DrawingStroke, pageBox?: PageBox) {
  if (stroke.coordinateScope === 'spread') {
    return stroke.points
  }
  if (!pageBox) {
    return []
  }
  return stroke.points.map((point) => ({
    ...point,
    x: pageBox.x + (point.x / 100) * pageBox.width,
    y: pageBox.y + (point.y / 100) * pageBox.height,
  }))
}

function getPointDistance(firstPoint: { x: number; y: number }, secondPoint: { x: number; y: number }) {
  const xDelta = firstPoint.x - secondPoint.x
  const yDelta = firstPoint.y - secondPoint.y
  return Math.sqrt(xDelta * xDelta + yDelta * yDelta)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
}

function HorizontalTextIcon() {
  return (
    <svg aria-hidden="true" className="button-icon" viewBox="0 -960 960 960">
      <path
        fill="currentColor"
        d="M160-200v-80h528l-42-42 56-56 138 138-138 138-56-56 42-42H160Zm116-200 164-440h80l164 440h-76l-38-112H392l-40 112h-76Zm138-176h132l-64-182h-4l-64 182Z"
      />
    </svg>
  )
}

function VerticalTextIcon() {
  return (
    <svg aria-hidden="true" className="button-icon" viewBox="0 -960 960 960">
      <path
        fill="currentColor"
        d="m436-320 164-440h80l164 440h-76l-40-112H552l-40 112h-76Zm138-176h132l-64-182h-4l-64 182ZM240-160 100-300l56-56 44 42v-526h80v526l44-42 56 56-140 140Z"
      />
    </svg>
  )
}
