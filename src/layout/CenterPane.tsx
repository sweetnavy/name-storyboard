import { SpreadCanvas } from '../features/canvas/SpreadCanvas'

export function CenterPane() {
  return (
    <section className="pane pane-center" aria-label="見開き漫画ページ">
      <SpreadCanvas />
    </section>
  )
}
