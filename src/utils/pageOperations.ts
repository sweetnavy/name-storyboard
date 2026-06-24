import type { Page, Project, Spread } from '../types/storyboard'

const createBlankPage = (pageNumber: number): Page => ({
  id: `page-${Date.now()}-${pageNumber}`,
  pageNumber,
  isCover: false,
  panels: [],
})

export function renumberPages(pages: Page[], coverPage: boolean): Page[] {
  return pages.map((page, index) => ({
    ...page,
    pageNumber: index + 1,
    isCover: coverPage && index === 0,
  }))
}

export function getSpreads(project: Project): Spread[] {
  const pageNumbers = project.pages.map((page) => page.pageNumber)

  if (project.coverPage) {
    const spreads: Spread[] = []
    if (pageNumbers[0] !== undefined) {
      spreads.push({ id: 'spread-1', label: '1', pageNumbers: [1] })
    }

    for (let pageNumber = 2; pageNumber <= project.pages.length; pageNumber += 2) {
      const pair = [pageNumber, pageNumber + 1].filter((number) => number <= project.pages.length)
      spreads.push({
        id: `spread-${pair.join('-')}`,
        label: pair.join('-'),
        pageNumbers: pair,
      })
    }

    return spreads
  }

  const spreads: Spread[] = []
  for (let pageNumber = 1; pageNumber <= project.pages.length; pageNumber += 2) {
    const pair = [pageNumber, pageNumber + 1].filter((number) => number <= project.pages.length)
    spreads.push({
      id: `spread-${pair.join('-')}`,
      label: pair.join('-'),
      pageNumbers: pair,
    })
  }
  return spreads
}

export function getCurrentSpread(project: Project): Spread {
  const spreads = getSpreads(project)
  return (
    spreads.find((spread) => spread.pageNumbers.includes(project.currentPageNumber)) ??
    spreads[0] ?? { id: 'spread-empty', label: '1', pageNumbers: [1] }
  )
}

export function getVisiblePages(project: Project): Page[] {
  const currentSpread = getCurrentSpread(project)
  const pages = currentSpread.pageNumbers
    .map((pageNumber) => project.pages.find((page) => page.pageNumber === pageNumber))
    .filter((page): page is Page => Boolean(page))

  if (pages.length <= 1) {
    return pages
  }

  return project.binding === 'rtl' ? [...pages].reverse() : pages
}

export function moveBySpread(project: Project, direction: -1 | 1): Project {
  const spreads = getSpreads(project)
  const currentSpread = getCurrentSpread(project)
  const currentIndex = spreads.findIndex((spread) => spread.id === currentSpread.id)
  const nextSpread = spreads[currentIndex + direction]

  if (!nextSpread) {
    return project
  }

  return {
    ...project,
    currentPageNumber: nextSpread.pageNumbers[0],
    selectedPageNumber: nextSpread.pageNumbers[0],
  }
}

export function parsePageRange(input: string, maxPageNumber: number, allowEndInsert = false) {
  const normalizedInput = input.trim()
  const match = normalizedInput.match(/^(\d+)(?:-(\d+))?$/)
  const upperBound = allowEndInsert ? maxPageNumber + 1 : maxPageNumber

  if (!match) {
    return null
  }

  const start = Number.parseInt(match[1], 10)
  const end = match[2] ? Number.parseInt(match[2], 10) : start

  if (start < 1 || end < 1 || start > end || start > upperBound || end > upperBound) {
    return null
  }

  return {
    start,
    end,
    count: end - start + 1,
    label: start === end ? `${start}` : `${start}〜${end}`,
  }
}

export function insertPages(project: Project, insertAt: number, count: number): Project {
  const safeInsertAt = Math.min(Math.max(Math.trunc(insertAt), 1), project.pages.length + 1)
  const safeCount = Math.max(Math.trunc(count), 1)
  const insertedPages = Array.from({ length: safeCount }, (_, index) =>
    createBlankPage(safeInsertAt + index),
  )
  const nextPages = [
    ...project.pages.slice(0, safeInsertAt - 1),
    ...insertedPages,
    ...project.pages.slice(safeInsertAt - 1),
  ]

  return {
    ...project,
    currentPageNumber: safeInsertAt,
    selectedPageNumber: safeInsertAt,
    pages: renumberPages(nextPages, project.coverPage),
    beats: project.beats.map((beat) => ({
      ...beat,
      pageNumber: beat.pageNumber >= safeInsertAt ? beat.pageNumber + safeCount : beat.pageNumber,
    })),
  }
}

export function deletePages(project: Project, startPageNumber: number, endPageNumber: number): Project {
  if (project.pages.length <= 1) {
    return project
  }

  const safeStart = Math.min(Math.max(Math.trunc(startPageNumber), 1), project.pages.length)
  const safeEnd = Math.min(Math.max(Math.trunc(endPageNumber), safeStart), project.pages.length)
  const deleteCount = safeEnd - safeStart + 1
  const keepAtLeastOneCount = Math.min(deleteCount, project.pages.length - 1)
  const actualEnd = safeStart + keepAtLeastOneCount - 1
  const nextPages = project.pages.filter(
    (page) => page.pageNumber < safeStart || page.pageNumber > actualEnd,
  )
  const nextCurrentPageNumber = Math.min(safeStart, nextPages.length)
  const deletedPageNumbers = new Set(
    Array.from({ length: actualEnd - safeStart + 1 }, (_, index) => safeStart + index),
  )
  const shiftedBeats = project.beats
    .filter((beat) => !deletedPageNumbers.has(beat.pageNumber))
    .map((beat) => ({
      ...beat,
      pageNumber:
        beat.pageNumber > actualEnd ? beat.pageNumber - deletedPageNumbers.size : beat.pageNumber,
    }))

  return {
    ...project,
    currentPageNumber: nextCurrentPageNumber,
    selectedPageNumber: nextCurrentPageNumber,
    pages: renumberPages(nextPages, project.coverPage),
    beats: shiftedBeats,
  }
}
