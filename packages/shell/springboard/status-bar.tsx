// The status bar, iPhone layout: the time on the left, the radios on the
// right, and the Dynamic Island centred between them. It is a bar, not a
// stack - this fork targets the slab iPhone form (393 pt wide), so the
// Duo's corner stack and drawn punch-hole are gone.
//
// The toggles still show through it: airplane mode replaces the cellular
// bars, and the focus moon, rotation lock and mirror marks sit with the
// radios, all from `toggles.ts`, so flipping one in Control Center shows
// here at once. Control Center spells the charge out, so `cc` adds the
// battery percentage beside the glyph.

import { Sym } from '@doan-labs/duo-uikit/sym.tsx'
import { colors, leading, radius, tracking, typeScale, weight } from '@doan-labs/duo-uikit/tokens.stylex.ts'
import * as stylex from '@stylexjs/stylex'
import { clock, useNow } from './clock.ts'
import { BATTERY, useToggles } from './toggles.ts'

/** The battery glyph: an outline, the charge as a fill, and the cap. */
const Battery = () => {
  const fill = Math.max(2, Math.min(19, (BATTERY / 100) * 19))
  return (
    <svg viewBox="0 0 27 12" width={27} height={12} fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="22" height="11" rx="3.5" stroke="currentColor" opacity="0.45" />
      <rect x="2" y="2" width={fill} height="8" rx="2" fill="currentColor" />
      <path d="M24.5 4v4a2.2 2.2 0 0 0 0-4Z" fill="currentColor" opacity="0.45" />
    </svg>
  )
}

/** The island: a black pill centred on the bar, the lens at its right end. */
const Island = () => (
  <div {...stylex.props(styles.island)}>
    <div {...stylex.props(styles.lens)}>
      <div {...stylex.props(styles.lensGlass)} />
    </div>
  </div>
)

const Time = () => <span>{clock(useNow())}</span>

/**
 * `wide` is the unfolded inner display (kept for the 3D scene; the slab
 * layout is the same bar, only wider). `light` means an app with a light
 * surface sits under the bar and Control Center is closed, so the glyphs
 * go black. `locked` hides the time: the lock screen's own clock is the
 * read there, as on iOS. The bar takes no taps at all - nothing in it is
 * a shortcut.
 */
export const StatusBar = ({
  wide,
  light,
  cc,
  locked
}: {
  wide: boolean
  light: boolean
  covered?: boolean
  cc: boolean
  locked?: boolean
  open?: (name: string, arg?: string) => void
}) => {
  const t = useToggles()
  return (
    <div {...stylex.props(styles.status, light && styles.statusLight)}>
      <div {...stylex.props(styles.side, styles.sideLeft)}>{!locked && <Time />}</div>
      <Island />
      <div {...stylex.props(styles.side, styles.sideRight)}>
        {t.rotate && <Sym name="lock" size={13} />}
        {t.focus && <Sym name="moon" size={13} />}
        {t.mirror && <Sym name="tabs" size={13} />}
        {t.airplane ? <Sym name="airplane" size={16} /> : t.cell ? <Sym name="cellular" size={17} /> : null}
        {t.wifi && <Sym name="wifi" size={16} />}
        {cc && <span {...stylex.props(styles.read)}>{BATTERY}%</span>}
        <Battery />
      </div>
    </div>
  )
}

const styles = stylex.create({
  // The bar spans the display and centres its contents on the island,
  // which sits 11 pt down with a 37 pt height: the row is 59 pt tall.
  status: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 59,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 6,
    pointerEvents: 'none',
    color: colors.white,
    fontSize: typeScale.headline,
    lineHeight: leading.headline,
    letterSpacing: tracking.headline,
    fontWeight: weight.semibold
  },
  statusLight: { color: colors.black },
  side: { flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 7 },
  sideLeft: { justifyContent: 'center', paddingRight: 60 },
  sideRight: { justifyContent: 'center', paddingLeft: 52 },
  island: {
    position: 'absolute',
    top: 11,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 126,
    height: 37,
    // Half the height, a stadium: radius.circle is 50%, which would draw
    // an ellipse on a box this wide.
    borderRadius: '19px',
    backgroundColor: colors.black
  },
  lens: {
    position: 'absolute',
    right: 11,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 12,
    height: 12,
    borderRadius: radius.circle,
    backgroundColor: '#10131a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  lensGlass: { width: 5, height: 5, borderRadius: radius.circle, backgroundColor: '#2a3f5f' },
  read: { fontSize: typeScale.subheadline }
})
