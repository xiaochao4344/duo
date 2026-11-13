// The three quieter tabs: 通讯录 with its function rows and A-Z people,
// 发现 with the familiar entry rows, and 我 with the profile card. They are
// faithful static pages - the production work happens in the chat list and
// threads - but every label, colour and row shape matches the real app.

import * as stylex from '@stylexjs/stylex'
import { CONTACTS } from './data.ts'
import { styles, WX } from './styles.ts'

function Head({ title }: { title: string }) {
  return (
    <div {...stylex.props(styles.header)}>
      <span {...stylex.props(styles.headerTitle)}>{title}</span>
      <button type="button" {...stylex.props(styles.headerPlus)} aria-label="添加朋友">
        ⊕
      </button>
    </div>
  )
}

function Cell({ glyph, tint, name, sub }: { glyph: string; tint: string; name: string; sub?: string }) {
  return (
    <div {...stylex.props(styles.row)} style={{ cursor: 'default' }}>
      <div
        {...stylex.props(styles.avatar, styles.avatarSm)}
        style={{ backgroundColor: tint, borderRadius: 4, fontSize: 17 }}
      >
        {glyph}
      </div>
      <div {...stylex.props(styles.rowMain)}>
        <div {...stylex.props(styles.rowName)}>{name}</div>
        {sub && <div {...stylex.props(styles.rowSub)}>{sub}</div>}
      </div>
      <span style={{ color: WX.faint, fontSize: 16 }}>›</span>
    </div>
  )
}

export function ContactsPage() {
  return (
    <>
      <Head title="通讯录" />
      <div {...stylex.props(styles.searchWrap)}>
        <div {...stylex.props(styles.search)}>
          <span>⌕</span>
          <span>搜索</span>
        </div>
      </div>
      <div {...stylex.props(styles.body)} style={{ backgroundColor: WX.page }}>
        <Cell glyph="新" tint="#F19E38" name="新的朋友" />
        <Cell glyph="群" tint="#F19E38" name="群聊" />
        <Cell glyph="标" tint="#3E7CC4" name="标签" />
        <Cell glyph="公" tint="#3E7CC4" name="公众号" />
        <div {...stylex.props(styles.groupHead)}>我的联系人</div>
        {CONTACTS.map((c) => (
          <div key={c.name} {...stylex.props(styles.row)} style={{ cursor: 'default' }}>
            <div {...stylex.props(styles.avatar, styles.avatarSm)} style={{ backgroundColor: c.hue }}>
              {c.avatar}
            </div>
            <div {...stylex.props(styles.rowMain)}>
              <div {...stylex.props(styles.rowName)}>{c.name}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export function DiscoverPage() {
  return (
    <>
      <Head title="发现" />
      <div {...stylex.props(styles.body)} style={{ backgroundColor: WX.page }}>
        <div style={{ marginBottom: 8 }}>
          <Cell glyph="朋" tint="#3E7CC4" name="朋友圈" />
        </div>
        <div style={{ marginBottom: 8 }}>
          <Cell glyph="视" tint="#F19E38" name="视频号" />
          <Cell glyph="直" tint="#FA5151" name="直播" />
        </div>
        <div style={{ marginBottom: 8 }}>
          <Cell glyph="扫" tint="#3E7CC4" name="扫一扫" />
          <Cell glyph="摇" tint="#3E7CC4" name="摇一摇" />
        </div>
        <Cell glyph="看" tint="#F19E38" name="看一看" />
        <Cell glyph="搜" tint="#FA5151" name="搜一搜" />
      </div>
    </>
  )
}

export function MePage() {
  return (
    <>
      <div {...stylex.props(styles.body)} style={{ backgroundColor: WX.page }}>
        <div {...stylex.props(styles.meCard)}>
          <div {...stylex.props(styles.avatar)} style={{ backgroundColor: '#5B8DEF', width: 58, height: 58, fontSize: 23 }}>
            我
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 600 }}>我</div>
            <div style={{ fontSize: 14, color: WX.sub, marginTop: 5 }}>微信号: wxid_chao2026</div>
          </div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <Cell glyph="服" tint="#3E7CC4" name="服务" />
        </div>
        <div style={{ marginBottom: 8 }}>
          <Cell glyph="藏" tint="#F19E38" name="收藏" />
          <Cell glyph="朋" tint="#3E7CC4" name="朋友圈" />
          <Cell glyph="卡" tint="#3E7CC4" name="卡包" />
          <Cell glyph="表" tint="#F19E38" name="表情" />
        </div>
        <Cell glyph="设" tint="#3E7CC4" name="设置" />
      </div>
    </>
  )
}
