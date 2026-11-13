// One conversation: gray page, square avatars, white bubbles for them and
// #95EC69 for me, gray time pills, and the composer bar - voice circle,
// field, emoji and plus, with the green send button taking the plus's place
// while the field holds text. Enter sends, like the real app with a
// hardware or system keyboard attached.

import { useEffect, useRef, useState } from 'react'
import * as stylex from '@stylexjs/stylex'
import { type WxConv, wxStamp } from './data.ts'
import { styles, WX } from './styles.ts'

const REPLIES: Record<string, string[]> = {
  'w-mum': ['知道了就好，早点休息', '嗯，妈知道了', '路上慢点'],
  'w-wang': ['行，我看看', '收到', '明天当面说'],
  'w-lin': ['好，我调一下再发你', '这次噪点确实少多了'],
  'w-group': ['收到', '好的，谢谢通知']
}

export function Thread({
  conv,
  onBack,
  onSend
}: {
  conv: WxConv
  onBack: () => void
  onSend: (convId: string, text: string, me: boolean, from?: string) => void
}) {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [conv.messages.length])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    setDraft('')
    onSend(conv.id, text, true)
    const pool = REPLIES[conv.id]
    if (pool) {
      const reply = pool[conv.messages.length % pool.length]!
      const from = conv.group ? '物业小刘' : undefined
      setTimeout(() => onSend(conv.id, reply, false, from), 2600)
    }
  }

  let lastAt = 0
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.threadHead)}>
        <button type="button" {...stylex.props(styles.back)} onClick={onBack} aria-label="返回">
          ‹
        </button>
        <div {...stylex.props(styles.threadTitle)}>
          {conv.name}
          {conv.group ? ' (128)' : ''}
        </div>
        <span style={{ width: 28, textAlign: 'center', fontSize: 17 }}>···</span>
      </div>

      <div ref={scrollRef} {...stylex.props(styles.threadBody)}>
        {conv.messages.map((m) => {
          const divider = m.at - lastAt > 5 * 60000
          lastAt = m.at
          return (
            <div key={m.id}>
              {divider && <div {...stylex.props(styles.stamp)}>{wxStamp(m.at)}</div>}
              <div {...stylex.props(styles.msgRow, m.me && styles.msgRowMe)}>
                <div
                  {...stylex.props(styles.avatar, styles.avatarSm)}
                  style={{ backgroundColor: m.me ? '#5B8DEF' : conv.hue }}
                >
                  {m.me ? '我' : conv.avatar}
                </div>
                <div style={{ maxWidth: '72%' }}>
                  {conv.group && !m.me && m.from && <div {...stylex.props(styles.sender)}>{m.from}</div>}
                  <div {...stylex.props(styles.bubble, m.me && styles.bubbleMe)} style={{ maxWidth: '100%' }}>
                    {m.text}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div {...stylex.props(styles.composer)}>
        <button type="button" {...stylex.props(styles.roundBtn)} aria-label="语音">
          ◎
        </button>
        <input
          {...stylex.props(styles.field)}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) send()
          }}
        />
        <button type="button" {...stylex.props(styles.roundBtn)} aria-label="表情">
          ☺
        </button>
        {draft.trim() ? (
          <button type="button" {...stylex.props(styles.send)} onClick={send}>
            发送
          </button>
        ) : (
          <button type="button" {...stylex.props(styles.roundBtn)} aria-label="更多">
            ⊕
          </button>
        )}
      </div>
      {/* The composer keeps the system keyboard's height free below the
          thread when the shell raises it: the shell pads the app itself. */}
      <div style={{ backgroundColor: WX.page, height: 0 }} />
    </div>
  )
}
