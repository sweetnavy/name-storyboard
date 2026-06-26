import { MangaPage } from './MangaPage'
import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { PanelPoint, Project } from '../../types/storyboard'
import { getCurrentSpread, getVisiblePages } from '../../utils/pageOperations'

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
  zoomControls,
}: SpreadCanvasProps) {
  const [freeTransformMode, setFreeTransformMode] = useState(false)
  const currentSpread = getCurrentSpread(project)
  const visiblePages = getVisiblePages(project)
  const isSinglePage = visiblePages.length === 1
  const canvasStyle = {
    '--canvas-zoom': zoomControls.zoom,
    '--page-width': `${360 * zoomControls.zoom}px`,
    '--page-min-width': `${220 * zoomControls.zoom}px`,
    '--page-text-font-size': `${project.pageTextFontSize}px`,
  } as CSSProperties
  const selectedBubble = project.pages
    .flatMap((page) => page.bubbles)
    .find((bubble) => bubble.id === project.selectedBubbleId)
  const selectedPanel = project.pages
    .flatMap((page) => page.panels)
    .find((panel) => panel.id === project.selectedPanelId)
  const currentBubbleDirection = selectedBubble?.textDirection ?? project.defaultBubbleTextDirection
  const activeTextFontSize =
    selectedBubble?.textFontSize ?? selectedPanel?.textFontSize ?? project.pageTextFontSize
  const textSizeScopeLabel = selectedBubble || selectedPanel ? '本文（選択中）' : '本文（全体）'

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
                ↶
              </button>
              <button
                aria-label="Redo"
                className="mini-button icon-button"
                disabled={!canRedo}
                onClick={onRedoProject}
                type="button"
              >
                ↷
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
            <span className="text-caption">{textSizeScopeLabel}</span>
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
          <button className="mini-button is-disabled" type="button" disabled>
            ナイフ
          </button>
        </div>
      </div>
      <div
        className={`spread-canvas ${isSinglePage ? 'spread-canvas-single' : ''}`}
        onWheel={(event) => {
          if (!event.ctrlKey) {
            return
          }
          event.preventDefault()
          zoomControls.setZoom(zoomControls.zoom + (event.deltaY < 0 ? 0.08 : -0.08))
        }}
        style={canvasStyle}
      >
        <div className="spread-page-group">
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
        </div>
      </div>
    </div>
  )
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
