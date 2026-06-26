import { SpreadCanvas } from '../features/canvas/SpreadCanvas'
import type { PanelPoint, Project } from '../types/storyboard'

type CenterPaneProps = {
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
  onResetSelectedPanelShape: () => void
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
  zoomControls: {
    resetZoom: () => void
    setZoom: (zoom: number) => void
    zoom: number
    zoomIn: () => void
    zoomOut: () => void
  }
}

export function CenterPane({
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
}: CenterPaneProps) {
  return (
    <section className="pane pane-center" aria-label="見開き漫画ページ">
      <SpreadCanvas
        onDeletePanel={onDeletePanel}
        onDeleteSpeechBubble={onDeleteSpeechBubble}
        onResetSelectedPanelShape={onResetSelectedPanelShape}
        onAddCharacterToPanel={onAddCharacterToPanel}
        onAddComicPanel={onAddComicPanel}
        canRedo={canRedo}
        canUndo={canUndo}
        onPlaceBeatOnPage={onPlaceBeatOnPage}
        onPlaceDialogueOnPage={onPlaceDialogueOnPage}
        onRedoProject={onRedoProject}
        onAssignBeatToPanel={onAssignBeatToPanel}
        onSwapPanels={onSwapPanels}
        onRemoveCharacterFromPanel={onRemoveCharacterFromPanel}
        onSelectPage={onSelectPage}
        onSelectPanel={onSelectPanel}
        onUpdatePanelBeatText={onUpdatePanelBeatText}
        onUpdateDialogueLine={onUpdateDialogueLine}
        onUpdatePanel={onUpdatePanel}
        onUpdateSpeechBubble={onUpdateSpeechBubble}
        onToggleBubbleTextDirection={onToggleBubbleTextDirection}
        onUpdatePageTextFontSize={onUpdatePageTextFontSize}
        onUndoProject={onUndoProject}
        project={project}
        zoomControls={zoomControls}
      />
    </section>
  )
}
