// The system on-screen keyboard: an iOS-layout board the shell slides up
// when a text field inside an app takes focus, and whose taps are routed
// into that field. Three modes - pinyin with a candidate bar, English, and
// numbers/symbols. In pinyin mode the typed letters stay in the composing
// buffer (the candidate bar shows the segmented run, like the real IME
// shows it over the keys) until a candidate or space commits them into the
// field; nothing reaches the field half-composed.

import { useMemo, useState } from 'react'
import * as stylex from '@stylexjs/stylex'
import { candidates } from './pinyin.ts'

export type KbField = HTMLInputElement | HTMLTextAreaElement

/** The board's full height in points, candidate bar included. */
export const KB_HEIGHT = 278

type Mode = 'pin' | 'en' | 'num'

const ROW1 = 'qwertyuiop'.split('')
const ROW2 = 'asdfghjkl'.split('')
const ROW3 = 'zxcvbnm'.split('')
const NUM1 = '1234567890'.split('')
const NUM2 = ['-', '/', ':', ';', '(', ')', '¥', '&', '@', '"']
const NUM3 = ['.', ',', '?', '!', "'"]

// ---------- field plumbing ----------

const nativeSetter = (field: KbField) =>
  Object.getOwnPropertyDescriptor(Object.getPrototypeOf(field), 'value')?.set

/** Replace the field's selection with text, the way a real key would. */
function insertText(field: KbField, text: string) {
  const start = field.selectionStart ?? field.value.length
  const end = field.selectionEnd ?? start
  const next = field.value.slice(0, start) + text + field.value.slice(end)
  nativeSetter(field)?.call(field, next)
  const caret = start + text.length
  field.setSelectionRange(caret, caret)
  field.dispatchEvent(new Event('input', { bubbles: true }))
}

function deleteBackward(field: KbField) {
  const start = field.selectionStart ?? field.value.length
  const end = field.selectionEnd ?? start
  if (start === end && start === 0) return
  const from = start === end ? start - 1 : start
  const next = field.value.slice(0, from) + field.value.slice(end)
  nativeSetter(field)?.call(field, next)
  field.setSelectionRange(from, from)
  field.dispatchEvent(new Event('input', { bubbles: true }))
}

function pressEnter(field: KbField) {
  if (field instanceof HTMLTextAreaElement) {
    insertText(field, '\n')
    return
  }
  // An input's Enter is a key event its owner handles (Messages sends).
  field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
}

// ---------- the board ----------

export function Keyboard({ field, onClose }: { field: KbField; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>('pin')
  const [composing, setComposing] = useState('')
  const [shift, setShift] = useState(false)

  const cands = useMemo(() => (composing ? candidates(composing) : null), [composing])

  const commit = (text: string, take: number) => {
    insertText(field, text)
    setComposing((c) => c.slice(take))
  }

  const letter = (ch: string) => {
    if (mode === 'pin') {
      setComposing((c) => (c + ch).slice(0, 24))
    } else if (mode === 'en') {
      insertText(field, shift ? ch.toUpperCase() : ch)
      if (shift) setShift(false)
    }
  }

  const space = () => {
    if (mode === 'pin' && composing && cands?.list[0]) {
      const first = cands.list[0]
      commit(first.text, first.take)
    } else {
      insertText(field, ' ')
    }
  }

  const backspace = () => {
    if (mode === 'pin' && composing) setComposing((c) => c.slice(0, -1))
    else deleteBackward(field)
  }

  const key = (label: React.ReactNode, onTap: () => void, xstyle?: stylex.StyleXStyles, wide = false) => (
    <button
      type="button"
      key={typeof label === 'string' ? label : undefined}
      {...stylex.props(styles.key, wide && styles.keyWide, xstyle)}
      onPointerDown={(e) => {
        e.preventDefault()
        onTap()
      }}
    >
      {label}
    </button>
  )

  return (
    <div {...stylex.props(styles.board)} onPointerDown={(e) => e.preventDefault()}>
      {/* The candidate bar: composing run on the left when composing, the
          candidate strip across the rest; a hide chevron at the right end. */}
      <div {...stylex.props(styles.bar)}>
        {mode === 'pin' && cands ? (
          <>
            <span {...stylex.props(styles.composing)}>{cands.parts.join("'")}</span>
            <div {...stylex.props(styles.strip)}>
              {cands.list.map((c) => (
                <button
                  type="button"
                  key={c.text + c.take}
                  {...stylex.props(styles.cand)}
                  onPointerDown={(e) => {
                    e.preventDefault()
                    commit(c.text, c.take)
                  }}
                >
                  {c.text}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div {...stylex.props(styles.strip)} />
        )}
        <button
          type="button"
          {...stylex.props(styles.hide)}
          aria-label="收起键盘"
          onPointerDown={(e) => {
            e.preventDefault()
            onClose()
          }}
        >
          ⌄
        </button>
      </div>

      {mode === 'num' ? (
        <div {...stylex.props(styles.rows)}>
          <div {...stylex.props(styles.row)}>{NUM1.map((d) => key(d, () => insertText(field, d)))}</div>
          <div {...stylex.props(styles.row)}>{NUM2.map((d) => key(d, () => insertText(field, d)))}</div>
          <div {...stylex.props(styles.row)}>
            {key('拼音', () => setMode('pin'), styles.special)}
            {NUM3.map((d) => key(d, () => insertText(field, d)))}
            {key('⌫', backspace, styles.special)}
          </div>
        </div>
      ) : (
        <div {...stylex.props(styles.rows)}>
          <div {...stylex.props(styles.row)}>
            {ROW1.map((d) => key(mode === 'en' && shift ? d.toUpperCase() : d, () => letter(d)))}
          </div>
          <div {...stylex.props(styles.rowPad)}>{ROW2.map((d) => key(mode === 'en' && shift ? d.toUpperCase() : d, () => letter(d)))}</div>
          <div {...stylex.props(styles.row)}>
            {key('⇧', () => (mode === 'pin' ? setMode('en') : setShift((s) => !s)), styles.special)}
            {ROW3.map((d) => key(mode === 'en' && shift ? d.toUpperCase() : d, () => letter(d)))}
            {key('⌫', backspace, styles.special)}
          </div>
        </div>
      )}

      <div {...stylex.props(styles.row, styles.bottomRow)}>
        {key('123', () => setMode('num'), styles.special)}
        {key('🌐', () => setMode(mode === 'pin' ? 'en' : 'pin'), styles.special)}
        <button
          type="button"
          {...stylex.props(styles.key, styles.space)}
          onPointerDown={(e) => {
            e.preventDefault()
            space()
          }}
        >
          {mode === 'pin' ? '空格' : 'space'}
        </button>
        <button
          type="button"
          {...stylex.props(styles.key, styles.special, styles.returnKey)}
          onPointerDown={(e) => {
            e.preventDefault()
            if (mode === 'pin' && composing && cands?.list[0]) commit(cands.list[0].text, cands.list[0].take)
            pressEnter(field)
          }}
        >
          换行
        </button>
      </div>
    </div>
  )
}

const styles = stylex.create({
  board: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: KB_HEIGHT,
    backgroundColor: '#D3D6DC',
    paddingTop: 0,
    paddingHorizontal: 3,
    paddingBottom: 18,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 40,
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'none'
  },
  bar: {
    height: 42,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'rgba(0,0,0,0.08)'
  },
  composing: { fontSize: 15, color: '#111', whiteSpace: 'nowrap', fontWeight: 500 },
  strip: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    overflowX: 'hidden',
    whiteSpace: 'nowrap'
  },
  cand: {
    borderStyle: 'none',
    backgroundColor: 'transparent',
    fontSize: 17,
    color: '#111',
    paddingVertical: 4,
    paddingHorizontal: 9,
    cursor: 'pointer'
  },
  hide: {
    borderStyle: 'none',
    backgroundColor: 'transparent',
    fontSize: 20,
    color: '#555',
    width: 30,
    cursor: 'pointer'
  },
  rows: { display: 'flex', flexDirection: 'column', gap: 11, paddingTop: 8 },
  row: { display: 'flex', gap: 6, justifyContent: 'center', paddingHorizontal: 3 },
  rowPad: { display: 'flex', gap: 6, justifyContent: 'center', paddingHorizontal: 22 },
  bottomRow: { marginTop: 11 },
  key: {
    flex: 1,
    height: 42,
    borderStyle: 'none',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    boxShadow: '0 1px 0 rgba(0,0,0,0.35)',
    fontSize: 21,
    color: '#111',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0
  },
  keyWide: { flex: 1.4 },
  special: { backgroundColor: '#ABB0BA', fontSize: 16, flex: 1.4 },
  space: { flex: 5, fontSize: 15, color: '#333' },
  returnKey: { flex: 1.8 }
})
