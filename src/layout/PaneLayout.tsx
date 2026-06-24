import { CenterPane } from './CenterPane'
import { LeftPane } from './LeftPane'
import { RightPane } from './RightPane'
import { SubPane } from './SubPane'
import type { Project, Spread } from '../types/storyboard'

type PaneLayoutProps = {
  project: Project
  spreads: Spread[]
  currentSpread: Spread
  onGoToSpread: (pageNumber: number) => void
  onGoToPreviousSpread: () => void
  onGoToNextSpread: () => void
  onInsertPages: (input: string) => void
  onDeletePages: (input: string) => void
  onSelectPage: (pageNumber: number) => void
  onUpdateProjectTitle: (title: string) => void
  onAddCharacter: (name: string, color: string) => void
  onSelectCharacter: (characterId: string) => void
  onUpdateCharacterColor: (characterId: string, color: string) => void
  onDeleteCharacter: (characterId: string) => void
  onAddBeat: () => void
  onUpdateBeatText: (beatId: string, text: string) => void
  onDeleteBeat: (beatId: string) => void
}

export function PaneLayout({
  currentSpread,
  onAddBeat,
  onAddCharacter,
  onDeleteBeat,
  onDeleteCharacter,
  onDeletePages,
  onGoToNextSpread,
  onGoToPreviousSpread,
  onGoToSpread,
  onInsertPages,
  onSelectCharacter,
  onSelectPage,
  onUpdateBeatText,
  onUpdateCharacterColor,
  onUpdateProjectTitle,
  project,
  spreads,
}: PaneLayoutProps) {
  return (
    <main className="pane-layout">
      <LeftPane
        currentSpread={currentSpread}
        onAddCharacter={onAddCharacter}
        onDeleteCharacter={onDeleteCharacter}
        onDeletePages={onDeletePages}
        onGoToNextSpread={onGoToNextSpread}
        onGoToPreviousSpread={onGoToPreviousSpread}
        onInsertPages={onInsertPages}
        onSelectCharacter={onSelectCharacter}
        onUpdateCharacterColor={onUpdateCharacterColor}
        onUpdateProjectTitle={onUpdateProjectTitle}
        project={project}
      />
      <SubPane currentSpread={currentSpread} onGoToSpread={onGoToSpread} spreads={spreads} />
      <CenterPane onSelectPage={onSelectPage} project={project} />
      <RightPane
        onAddBeat={onAddBeat}
        onDeleteBeat={onDeleteBeat}
        onUpdateBeatText={onUpdateBeatText}
        project={project}
      />
    </main>
  )
}
