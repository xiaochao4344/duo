// Flat single-display harness (temp test): mounts the Duo OS at iPhone 16
// logical size (393x852) in a plain 2D page - no Three.js device scene,
// no fold, no cover display. The OS root starts display:none because the
// CSS3DRenderer normally owns its visibility; here we show it directly.
import { os } from '../packages/shell/os.tsx'

const stage = document.getElementById('stage')!
const deep = new URLSearchParams(location.search)
const root = os(393, 852, stage, deep.get('app'), deep.get('arg'))
root.style.display = 'block'
