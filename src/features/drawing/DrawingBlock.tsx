import type { DrawingTool } from '../../types/storyboard'
import { ClearIcon, EraserIcon, RedoIcon, UndoIcon } from './DrawingIcons'

type DrawingBlockProps = {
  drawingMode: boolean
  selectedTool: DrawingTool
  penColor: string
  penWidth: number
  eraserWidth: number
  canRedo: boolean
  onToggleDrawingMode: () => void
  onSelectTool: (tool: DrawingTool) => void
  onSelectColor: (color: string) => void
  onChangePenWidth: (width: number) => void
  onChangeEraserWidth: (width: number) => void
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
}

const DRAWING_COLORS = [
  { label: '黒', value: '#202124' },
  { label: '赤', value: '#E94738' },
  { label: '青', value: '#0078D7' },
]

export function DrawingBlock({
  canRedo,
  drawingMode,
  eraserWidth,
  onChangeEraserWidth,
  onChangePenWidth,
  onClear,
  onRedo,
  onSelectColor,
  onSelectTool,
  onToggleDrawingMode,
  onUndo,
  penColor,
  penWidth,
  selectedTool,
}: DrawingBlockProps) {
  return (
    <section className="section-block drawing-block">
      <div className="section-heading">
        <h2 className="section-title">描画</h2>
      </div>
      <div className="drawing-mode-row">
        <span className="text-label">描画モード</span>
        <button
          aria-pressed={drawingMode}
          className={`toggle-switch ${drawingMode ? 'is-on' : ''}`}
          onClick={onToggleDrawingMode}
          type="button"
        >
          <span>{drawingMode ? 'ON' : 'OFF'}</span>
        </button>
      </div>
      <div className="drawing-color-row" aria-label="描画色">
        {DRAWING_COLORS.map((color) => (
          <button
            aria-label={color.label}
            className={`color-dot-button ${penColor === color.value ? 'is-active' : ''}`}
            key={color.value}
            onClick={() => onSelectColor(color.value)}
            style={{ backgroundColor: color.value }}
            type="button"
          />
        ))}
      </div>
      <SizeControl label="ペン" value={penWidth} onChange={onChangePenWidth} min={1} max={24} />
      <SizeControl label="消しゴム" value={eraserWidth} onChange={onChangeEraserWidth} min={4} max={48} />
      <div className="drawing-tool-row">
        <button aria-label="描画Undo" className="mini-button icon-button" type="button" onClick={onUndo}>
          <UndoIcon />
        </button>
        <button aria-label="描画Redo" className="mini-button icon-button" type="button" onClick={onRedo} disabled={!canRedo}>
          <RedoIcon />
        </button>
        <button aria-label="描画を全消し" className="mini-button icon-button danger-icon-button" type="button" onClick={onClear}>
          <ClearIcon />
        </button>
        <button
          aria-label="消しゴム"
          className={`mini-button icon-button ${drawingMode && selectedTool === 'eraser' ? 'is-active' : ''}`}
          type="button"
          onClick={() => onSelectTool('eraser')}
        >
          <EraserIcon />
        </button>
      </div>
    </section>
  )
}

function SizeControl({
  label,
  max,
  min,
  onChange,
  value,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <label className="drawing-size-row">
      <span className="text-caption">{label}</span>
      <button className="mini-button icon-button" type="button" onClick={() => onChange(value - 1)}>
        −
      </button>
      <input
        className="page-text-size-input"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        type="number"
        value={value}
      />
      <button className="mini-button icon-button" type="button" onClick={() => onChange(value + 1)}>
        +
      </button>
    </label>
  )
}
