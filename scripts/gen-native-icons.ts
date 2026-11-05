/** Writes Android launcher icons + iOS AppIcon from the Tatzli SVG. Run: npx tsx --tsconfig tsconfig.app.json scripts/gen-native-icons.ts */
import React from 'react'
import { writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderToStaticMarkup } from 'react-dom/server'
import { Resvg } from '@resvg/resvg-js'
import { characterIllus } from '../src/illustrations/characters'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const inner = renderToStaticMarkup(React.createElement(characterIllus.tatzli, { pose: 'wave' }))
const png = (svg: string, size: number) => new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng()

const full = (pad: number, rounded: boolean, round = false) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
${round ? '<circle cx="50" cy="50" r="50" fill="#f6c945"/>' : `<rect width="100" height="100" rx="${rounded ? 22 : 0}" fill="#f6c945"/>`}
<circle cx="50" cy="54" r="${(100 - pad * 2) * 0.46}" fill="#fff3c4"/>
<g transform="translate(${pad} ${pad}) scale(${(100 - pad * 2) / 100})">${inner}</g></svg>`
// adaptive foreground: art inside the 66 % safe zone of a 108 dp canvas
const fg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108"><circle cx="54" cy="56" r="30" fill="#fff3c4"/><g transform="translate(21 21) scale(0.66)">${inner}</g></svg>`

const res = join(ROOT, 'android', 'app', 'src', 'main', 'res')
const dens: Record<string, number> = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 }
for (const [d, k] of Object.entries(dens)) {
  const dir = join(res, `mipmap-${d}`)
  if (!existsSync(dir)) continue
  writeFileSync(join(dir, 'ic_launcher.png'), png(full(8, true), 48 * k))
  writeFileSync(join(dir, 'ic_launcher_round.png'), png(full(10, false, true), 48 * k))
  writeFileSync(join(dir, 'ic_launcher_foreground.png'), png(fg, 108 * k))
}
const bgXml = join(res, 'values', 'ic_launcher_background.xml')
writeFileSync(bgXml, '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#F6C945</color>\n</resources>\n')
// splash drawables (Capacitor splash.png in drawable* folders)
const splash = (w: number, h: number) =>
  png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#fdebc9"/><g transform="translate(${w / 2 - 80} ${h / 2 - 80}) scale(1.6)">${inner}</g></svg>`, w)
for (const d of readdirSync(res).filter((x) => x.startsWith('drawable'))) {
  const f = join(res, d, 'splash.png')
  if (existsSync(f)) {
    const land = d.includes('land')
    writeFileSync(f, splash(land ? 960 : 540, land ? 540 : 960))
  }
}
// iOS
const ios = join(ROOT, 'ios', 'App', 'App', 'Assets.xcassets')
if (existsSync(join(ios, 'AppIcon.appiconset'))) writeFileSync(join(ios, 'AppIcon.appiconset', 'AppIcon-512@2x.png'), png(full(8, false), 1024))
const iosSplash = join(ios, 'Splash.imageset')
if (existsSync(iosSplash)) for (const f of readdirSync(iosSplash).filter((x) => x.endsWith('.png'))) writeFileSync(join(iosSplash, f), splash(2732, 2732))
console.log('native icons written')
