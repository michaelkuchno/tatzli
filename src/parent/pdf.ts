import { PDFDocument, rgb, type PDFFont, type PDFPage, type Color } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Lang } from '@content/types'
import { WORD_BY_ID, TOPICS } from '@/lib/content'
import { Illustration } from '@/illustrations/registry'
import type { Profile } from '@/lib/db'
import { saveFile } from './files'

const COLORS: Record<Lang, [number, number, number]> = { be: [0.7, 0.15, 0.12], de: [0.48, 0.32, 0], pl: [0.12, 0.56, 0.5], en: [0.15, 0.28, 0.66] }

async function svgToPng(name: string, px = 160): Promise<Uint8Array> {
  const markup = renderToStaticMarkup(createElement(Illustration, { name })).replace('<svg ', `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" `)
  const img = new Image()
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`
  await img.decode()
  const c = document.createElement('canvas')
  c.width = px
  c.height = px
  c.getContext('2d')!.drawImage(img, 0, 0, px, px)
  const blob = await new Promise<Blob>((r) => c.toBlob((b) => r(b!), 'image/png'))
  return new Uint8Array(await blob.arrayBuffer())
}

/** A printable "fridge" word list: picture + the word in the displayed languages, grouped by topic. */
export async function exportWordsPdf(profile: Profile, wordIds: string[]) {
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)
  const load = async (f: string) => (await fetch(`${import.meta.env.BASE_URL}fonts/${f}`)).arrayBuffer()
  const font = await doc.embedFont(await load('Nunito-Bold-latin.ttf'), { subset: true })
  const fontExt = await doc.embedFont(await load('Nunito-Bold-latin-ext.ttf'), { subset: true })
  const latin = new Set(font.getCharacterSet())
  /** draw text switching between the latin and latin-ext font per character run */
  const draw = (p: PDFPage, text: string, x: number, y: number, size: number, color: Color) => {
    let cx = x
    const runs: { f: PDFFont; s: string }[] = []
    for (const ch of text) {
      const f = latin.has(ch.codePointAt(0)!) ? font : fontExt
      const last = runs[runs.length - 1]
      if (last && last.f === f) last.s += ch
      else runs.push({ f, s: ch })
    }
    for (const r of runs) {
      p.drawText(r.s, { x: cx, y, size, font: r.f, color })
      cx += r.f.widthOfTextAtSize(r.s, size)
    }
  }
  const langs = profile.langs
  const ids = wordIds.length ? wordIds : TOPICS.filter((t) => t.level === profile.level).flatMap((t) => t.words).slice(0, 24)
  const unique = [...new Set(ids)].filter((id) => WORD_BY_ID[id])
  const W = 595
  const H = 842
  const cols = 3
  const cellW = (W - 60) / cols
  const cellH = 120
  let page = doc.addPage([W, H])
  let i = 0
  const header = (p: typeof page) => {
    draw(p, `Tatzli – ${profile.nickname}`, 30, H - 40, 20, rgb(0.55, 0.33, 0.1))
  }
  header(page)
  for (const id of unique) {
    const row = Math.floor(i / cols)
    const col = i % cols
    let y = H - 70 - (row + 1) * cellH
    if (y < 30) {
      page = doc.addPage([W, H])
      header(page)
      i = 0
      y = H - 70 - cellH
    }
    const x = 30 + (i % cols) * cellW
    const png = await doc.embedPng(await svgToPng(WORD_BY_ID[id].illu))
    page.drawRectangle({ x: x + 2, y: y + 2, width: cellW - 4, height: cellH - 4, borderColor: rgb(0.9, 0.8, 0.6), borderWidth: 1, color: rgb(1, 0.98, 0.93) })
    page.drawImage(png, { x: x + 8, y: y + cellH - 62, width: 54, height: 54 })
    langs.forEach((l, k) => {
      const [r, g, b] = COLORS[l]
      draw(page, `${l.toUpperCase()}  ${WORD_BY_ID[id].text[l]}`, x + 68, y + cellH - 22 - k * 16, l === 'be' ? 12 : 10, rgb(r, g, b))
    })
    i++
    void col
  }
  const bytes = await doc.save()
  await saveFile(`tatzli-${profile.nickname}.pdf`, new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }))
}
