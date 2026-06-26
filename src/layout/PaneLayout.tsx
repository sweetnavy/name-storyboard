import { CenterPane } from './CenterPane'
import { LeftPane } from './LeftPane'
import { RightPane } from './RightPane'
import { SubPane } from './SubPane'
import type { PanelPoint, Project, Spread } from '../types/storyboard'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'

type PaneLayoutProps = {
  project: Project
  canUndo: boolean
  canRedo: boolean
  canvasZoom: {
    resetZoom: () => void
    setZoom: (zoom: number) => void
    zoom: number
    zoomIn: () => void
    zoomOut: () => void
  }
  paneWidths: { leftPaneWidth: number; rightPaneWidth: number }
  projectList: Project[]
  spreads: Spread[]
  currentSpread: Spread
  onGoToSpread: (pageNumber: number) => void
  onInsertPages: (input: string) => void
  onDeletePages: (input: string) => void
  onSelectPage: (pageNumber: number) => void
  onUpdateProjectTitle: (title: string) => void
  onNormalizeProjectTitle: () => void
  onAddProject: () => void
  onSelectProject: (projectId: string) => void
  onDeleteCurrentProject: () => void
  onToggleCoverPage: () => void
  onUpdateBinding: (binding: Project['binding']) => void
  onToggleAutoNumberPanels: () => void
  onToggleSwapPanelContent: () => void
  onAddCharacter: (name: string, color: string) => void
  onAddCharacterToPanel: (panelId: string, characterId: string) => void
  onAddCharacterToBeat: (beatId: string, characterId: string) => void
  onAddComicPanel: () => void
  onAddDialogueLine: (beatId: string) => void
  onUndoProject: () => void
  onRedoProject: () => void
  onSelectCharacter: (characterId: string) => void
  onSelectBeat: (beatId: string) => void
  onSelectDialogueBubble: (bubbleId: string) => void
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
  onDeleteSpeechBubble: (bubbleId: string) => void
  onDeleteDialogueLine: (beatId: string, dialogueId: string) => void
  onResetSelectedPanelShape: () => void
  onUpdateCharacterColor: (characterId: string, color: string) => void
  onDeleteCharacter: (characterId: string) => void
  onRemoveCharacterFromBeat: (beatId: string, characterId: string) => void
  onRemoveCharacterFromPanel: (panelId: string, characterId: string) => void
  onAddBeat: () => void
  onUpdateBeatText: (beatId: string, text: string) => void
  onUpdateBeatNo: (beatId: string, no: number | null) => void
  onUpdateDialogueLine: (beatId: string, dialogueId: string, text: string) => void
  onToggleDialogueShape: (beatId: string, dialogueId: string) => void
  onUpdatePanelBeatText: (panelId: string, text: string) => void
  onDeleteBeat: (beatId: string) => void
  onPlaceBeatOnPage: (beatId: string, pageNumber: number, position: { x: number; y: number }) => void
  onPlaceDialogueOnPage: (
    beatId: string,
    dialogueId: string,
    pageNumber: number,
    position: { x: number; y: number },
  ) => void
  onAssignBeatToPanel: (beatId: string, panelId: string) => void
  onSwapPanels: (sourcePanelId: string, targetPanelId: string) => void
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
  onReorderVisibleBeats: (
    dragBeatId: string,
    targetBeatId: string,
    pageNumbers: number[],
    placement: 'before' | 'after',
  ) => void
  onMoveBeatToPage: (beatId: string, pageNumber: number) => void
  onMovePanelToPage: (panelId: string, pageNumber: number) => void
  onResizePane: (side: 'left' | 'right', deltaX: number, startWidth: number) => void
}

export function PaneLayout({
  canvasZoom,
  canRedo,
  canUndo,
  currentSpread,
  onAddBeat,
  onAddCharacter,
  onAddCharacterToBeat,
  onAddCharacterToPanel,
  onAddComicPanel,
  onAddDialogueLine,
  onRedoProject,
  onDeleteBeat,
  onDeleteCharacter,
  onDeletePages,
  onDeletePanel,
  onDeleteSpeechBubble,
  onDeleteDialogueLine,
  onResetSelectedPanelShape,
  onGoToSpread,
  onInsertPages,
  onMoveBeatToPage,
  onMovePanelToPage,
  onRemoveCharacterFromBeat,
  onRemoveCharacterFromPanel,
  onSelectBeat,
  onSelectDialogueBubble,
  onSelectCharacter,
  onSelectPanel,
  onSelectPage,
  onAddProject,
  onDeleteCurrentProject,
  onPlaceBeatOnPage,
  onPlaceDialogueOnPage,
  onAssignBeatToPanel,
  onSwapPanels,
  onReorderVisibleBeats,
  onResizePane,
  onUndoProject,
  onUpdateBeatText,
  onUpdateBeatNo,
  onUpdateDialogueLine,
  onToggleDialogueShape,
  onUpdateCharacterColor,
  onUpdatePanel,
  onUpdatePanelBeatText,
  onUpdateSpeechBubble,
  onToggleBubbleTextDirection,
  onUpdatePageTextFontSize,
  onUpdateProjectTitle,
  onNormalizeProjectTitle,
  onSelectProject,
  onToggleCoverPage,
  onUpdateBinding,
  onToggleAutoNumberPanels,
  onToggleSwapPanelContent,
  paneWidths,
  projectList,
  project,
  spreads,
}: PaneLayoutProps) {
  const startPaneResize = (
    event: ReactPointerEvent<HTMLButtonElement>,
    side: 'left' | 'right',
    startWidth: number,
  ) => {
    event.preventDefault()
    const startX = event.clientX
    const resize = (pointerEvent: PointerEvent) => onResizePane(side, pointerEvent.clientX - startX, startWidth)
    const stopResize = () => {
      window.removeEventListener('pointermove', resize)
      window.removeEventListener('pointerup', stopResize)
    }
    window.addEventListener('pointermove', resize)
    window.addEventListener('pointerup', stopResize)
  }
  const paneStyle = {
    '--left-pane-width': `${paneWidths.leftPaneWidth}px`,
    '--right-pane-width': `${paneWidths.rightPaneWidth}px`,
  } as CSSProperties

  return (
    <main
      className="pane-layout"
      style={paneStyle}
    >
      <LeftPane
        currentSpread={currentSpread}
        onAddCharacter={onAddCharacter}
        onDeleteCharacter={onDeleteCharacter}
        onDeletePages={onDeletePages}
        onInsertPages={onInsertPages}
        onSelectCharacter={onSelectCharacter}
        onAddProject={onAddProject}
        onDeleteCurrentProject={onDeleteCurrentProject}
        onNormalizeProjectTitle={onNormalizeProjectTitle}
        onSelectProject={onSelectProject}
        onToggleCoverPage={onToggleCoverPage}
        onUpdateBinding={onUpdateBinding}
        onUpdateCharacterColor={onUpdateCharacterColor}
        onUpdateProjectTitle={onUpdateProjectTitle}
        projects={projectList}
        project={project}
      />
      <button
        aria-label="左ペイン幅を変更"
        className="pane-resizer pane-resizer-left"
        onPointerDown={(event) => startPaneResize(event, 'left', paneWidths.leftPaneWidth)}
        type="button"
      />
      <SubPane
        currentSpread={currentSpread}
        onGoToSpread={onGoToSpread}
        onMoveBeatToPage={onMoveBeatToPage}
        onMovePanelToPage={onMovePanelToPage}
        spreads={spreads}
      />
      <CenterPane
        onAddCharacterToPanel={onAddCharacterToPanel}
        onAddComicPanel={onAddComicPanel}
        canRedo={canRedo}
        canUndo={canUndo}
        onDeletePanel={onDeletePanel}
        onDeleteSpeechBubble={onDeleteSpeechBubble}
        onRedoProject={onRedoProject}
        onResetSelectedPanelShape={onResetSelectedPanelShape}
        onUndoProject={onUndoProject}
        onPlaceBeatOnPage={onPlaceBeatOnPage}
        onPlaceDialogueOnPage={onPlaceDialogueOnPage}
        onAssignBeatToPanel={onAssignBeatToPanel}
        onSwapPanels={onSwapPanels}
        onRemoveCharacterFromPanel={onRemoveCharacterFromPanel}
        onSelectPage={onSelectPage}
        onSelectPanel={onSelectPanel}
        onUpdatePanelBeatText={onUpdatePanelBeatText}
        onUpdatePanel={onUpdatePanel}
        onUpdateSpeechBubble={onUpdateSpeechBubble}
        onUpdateDialogueLine={onUpdateDialogueLine}
        onToggleBubbleTextDirection={onToggleBubbleTextDirection}
        onUpdatePageTextFontSize={onUpdatePageTextFontSize}
        project={project}
        zoomControls={canvasZoom}
      />
      <button
        aria-label="右ペイン幅を変更"
        className="pane-resizer pane-resizer-right"
        onPointerDown={(event) => startPaneResize(event, 'right', paneWidths.rightPaneWidth)}
        type="button"
      />
      <RightPane
        selectedBeatId={
          project.pages.flatMap((page) => page.panels).find((panel) => panel.id === project.selectedPanelId)
            ?.beatId
        }
        onAddBeat={onAddBeat}
        onAddCharacterToBeat={onAddCharacterToBeat}
        onAddDialogueLine={onAddDialogueLine}
        onDeleteBeat={onDeleteBeat}
        onDeleteDialogueLine={onDeleteDialogueLine}
        onRemoveCharacterFromBeat={onRemoveCharacterFromBeat}
        onReorderVisibleBeats={onReorderVisibleBeats}
        onSelectBeat={onSelectBeat}
        onSelectDialogueBubble={onSelectDialogueBubble}
        onUpdateBeatText={onUpdateBeatText}
        onUpdateBeatNo={onUpdateBeatNo}
        onUpdateDialogueLine={onUpdateDialogueLine}
        onToggleDialogueShape={onToggleDialogueShape}
        onToggleAutoNumberPanels={onToggleAutoNumberPanels}
        onToggleSwapPanelContent={onToggleSwapPanelContent}
        project={project}
      />
    </main>
  )
}
