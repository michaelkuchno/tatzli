/** Renders the app icons (PWA + Android) from the original Tatzli SVG. Run: npx tsx scripts/gen-icons.tsx */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Resvg } from '@resvg/resvg-js'
import { characterIllus } from '../src/illustrations/characters'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(ROOT, 'public', 'icons')
mkdirSync(out, { recursive: true })

const Tz = characterIllus.tatzli
const inner = renderToStaticMarkup(React.createElement(Tz, { pose: 'wave' }))

function svg(padding: number, bg = '#f6c945') {
  const s = 100 - padding * 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
<rect width="100" height="100" rx="${padding > 10 ? 0 : 22}" fill="${bg}"/>
<circle cx="50" cy="54" r="${s * 0.46}" fill="#fff3c4"/>
<g transform="translate(${padding} ${padding}) scale(${s / 100})">${inner}</g></svg>`
}

writeFileSync(join(out, 'icon.svg'), svg(6))
const render = (markup: string, size: number, name: string) => {
  const png = new Resvg(markup, { fitTo: { mode: 'width', value: size } }).render().asPng()
  writeFileSync(join(out, name), png)
}
render(svg(6), 192, 'icon-192.png')
render(svg(6), 512, 'icon-512.png')
render(svg(14), 512, 'icon-maskable-512.png')
render(svg(6), 180, 'apple-touch-icon.png')
render(svg(14), 1024, 'icon-1024.png')
console.log('icons written to', out)
