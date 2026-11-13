// Temp test server for the flat harness. Mirrors serve.ts: the shell page at
// '/', real files from public/, and /cdn + /preinstalled from dist/.
import index from './flat/flat.html'
import { buildPreinstalled } from './scripts/build-preinstalled.ts'

await buildPreinstalled()

const port = Number(process.env.FLAT_PORT ?? 3001)
Bun.serve({
  port,
  routes: { '/': index },
  development: { hmr: true, console: true },
  async fetch(req) {
    const path = decodeURIComponent(new URL(req.url).pathname)
    const file = Bun.file(
      `${path.startsWith('/cdn/') || path.startsWith('/preinstalled/') ? './dist' : './public'}${path}`
    )
    if (!path.includes('..') && (await file.exists())) return new Response(file)
    return new Response('Not found', { status: 404 })
  }
})
console.log(`http://localhost:${port}/`)
