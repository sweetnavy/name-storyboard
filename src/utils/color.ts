import type { CSSProperties } from 'react'

export function getCharacterChipStyle(color: string): CSSProperties {
  return {
    '--character-color': color,
    backgroundColor: mixHex(color, '#ffffff', 0.58),
    borderColor: mixHex(color, '#ffffff', 0.22),
  } as CSSProperties
}

function mixHex(source: string, target: string, amount: number) {
  const sourceRgb = parseHex(source)
  const targetRgb = parseHex(target)
  if (!sourceRgb || !targetRgb) {
    return source
  }
  const mix = (sourceValue: number, targetValue: number) =>
    Math.round(sourceValue + (targetValue - sourceValue) * amount)
  return `#${toHex(mix(sourceRgb.r, targetRgb.r))}${toHex(mix(sourceRgb.g, targetRgb.g))}${toHex(
    mix(sourceRgb.b, targetRgb.b),
  )}`
}

function parseHex(value: string) {
  const normalizedValue = value.trim().replace('#', '')
  if (!/^[\da-f]{6}$/i.test(normalizedValue)) {
    return undefined
  }
  return {
    r: Number.parseInt(normalizedValue.slice(0, 2), 16),
    g: Number.parseInt(normalizedValue.slice(2, 4), 16),
    b: Number.parseInt(normalizedValue.slice(4, 6), 16),
  }
}

function toHex(value: number) {
  return value.toString(16).padStart(2, '0')
}
