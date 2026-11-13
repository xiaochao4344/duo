// The conversation list: header with the total unread count, the search
// pill, then rows - avatar with its red badge, name, one-line preview with
// the group sender prefix, and the quiet gray time stamp at the right.

import * as stylex from '@stylexjs/stylex'
import { type WxConv, wxWhen } from './data.ts'
import { styles } from './styles.ts'

export function ConvList({ convs, onOpen }: { convs: WxConv[]; onOpen: (id: string) => void }) {
  const unread = convs.reduce((n, c) => n + (c.mute ? 0 : c.unread), 0)
  const sorted = [...convs].sort((a, b) => (b.messages.at(-1)?.at ?? 0) - (a.messages.at(-1)?.at ?? 0))
  return (
    <>
      <div {...stylex.props(styles.header)}>
        <span {...stylex.props(styles.headerTitle)}>微信{unread ? ` (${unread})` : ''}</span>
        <button type="button" {...stylex.props(styles.headerPlus)} aria-label="发起">
          ⊕
        </button>
      </div>
      <div {...stylex.props(styles.searchWrap)}>
        <div {...stylex.props(styles.search)}>
          <span>⌕</span>
          <span>搜索</span>
        </div>
      </div>
      <div {...stylex.props(styles.body)}>
        {sorted.map((c) => {
          const last = c.messages.at(-1)
          const preview = last ? (c.group && !last.me && last.from ? `${last.from}: ${last.text}` : last.text) : ''
          return (
            <button type="button" key={c.id} {...stylex.props(styles.row)} onClick={() => onOpen(c.id)}>
              <div {...stylex.props(styles.avatar)} style={{ backgroundColor: c.hue }}>
                {c.avatar}
                {!!c.unread && <span {...stylex.props(styles.badge)}>{c.unread}</span>}
              </div>
              <div {...stylex.props(styles.rowMain)}>
                <div {...stylex.props(styles.rowName)}>{c.name}</div>
                <div {...stylex.props(styles.rowSub)}>{preview}</div>
              </div>
              {last && <span {...stylex.props(styles.rowTime)}>{wxWhen(last.at)}</span>}
            </button>
          )
        })}
      </div>
    </>
  )
}
