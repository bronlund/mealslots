// Renders the app logo SVG into the PNG icon set the PWA manifest needs.
// Run once (npm run icons); the generated PNGs are committed.
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

function logoSvg({ padding }) {
  // A tiny slot machine face: three reels, the middle one landing a soup bowl,
  // flanked by golden stars. Bold shapes so it stays readable at 48 px.
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${padding > 0 ? 110 : 0}" fill="#F5EFDF"/>
  <g transform="translate(${padding} ${padding}) scale(${(512 - padding * 2) / 512})">
    <rect x="36" y="36" width="440" height="440" rx="88" fill="#F0B653"/>
    <rect x="36" y="36" width="440" height="440" rx="88" fill="none" stroke="#C8A05A" stroke-width="20"/>
    <rect x="76" y="150" width="360" height="212" rx="40" fill="#FBF7EC" stroke="#A37F3E" stroke-width="14"/>
    <line x1="196" y1="166" x2="196" y2="346" stroke="#C8A05A" stroke-width="10"/>
    <line x1="316" y1="166" x2="316" y2="346" stroke="#C8A05A" stroke-width="10"/>
    <path d="M 136 232 l 14 30 32 4 -23 23 5 32 -28 -15 -28 15 5 -32 -23 -23 32 -4 z" fill="#F5C542" stroke="#A37F3E" stroke-width="8" stroke-linejoin="round"/>
    <path d="M 376 232 l 14 30 32 4 -23 23 5 32 -28 -15 -28 15 5 -32 -23 -23 32 -4 z" fill="#F5C542" stroke="#A37F3E" stroke-width="8" stroke-linejoin="round"/>
    <path d="M 206 246 h 100 a 50 44 0 0 1 -100 0 z" fill="#E2574C" stroke="#5B4A32" stroke-width="10" stroke-linejoin="round"/>
    <path d="M 226 238 q 8 -18 0 -34 M 256 240 q 8 -20 0 -38 M 286 238 q 8 -18 0 -34" fill="none" stroke="#5B4A32" stroke-width="9" stroke-linecap="round" opacity="0.7"/>
    <circle cx="256" cy="420" r="26" fill="#E2574C" stroke="#A37F3E" stroke-width="10"/>
    <rect x="150" y="76" width="212" height="44" rx="22" fill="#FBF7EC" stroke="#A37F3E" stroke-width="10"/>
    <circle cx="196" cy="98" r="9" fill="#F5C542"/>
    <circle cx="256" cy="98" r="9" fill="#E2574C"/>
    <circle cx="316" cy="98" r="9" fill="#7FA65A"/>
  </g>
</svg>`
}

await mkdir('public/icons', { recursive: true })

const jobs = [
  { file: 'public/icons/icon-192.png', size: 192, padding: 0 },
  { file: 'public/icons/icon-512.png', size: 512, padding: 0 },
  // Maskable: art inside the 80% safe zone, background bleeding to the edges.
  { file: 'public/icons/icon-maskable-512.png', size: 512, padding: 56 },
  { file: 'public/icons/apple-touch-icon.png', size: 180, padding: 0 },
]

for (const { file, size, padding } of jobs) {
  await sharp(Buffer.from(logoSvg({ padding }))).resize(size, size).png().toFile(file)
  console.log('wrote', file)
}
