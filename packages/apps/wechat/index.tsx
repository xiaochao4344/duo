// WeChat, rebuilt as a baked app for this device: the four-tab shell, a
// working conversation list and thread, and the system keyboard driving
// the composer. Conversations live in this component's state - one flat
// copy is the production surface - and a send earns a short scripted reply
// so a thread can be played back and forth while filming.

import type { Os } from '@doan-labs/duo-sdk'
import { useState } from 'react'
import * as stylex from '@stylexjs/stylex'
import { type WxConv, seedConvs } from './data.ts'
import { ConvList } from './list.tsx'
import { ContactsPage, DiscoverPage, MePage } from './pages.tsx'
import { styles } from './styles.ts'
import { Thread } from './thread.tsx'

const TABS = [
  { key: 'chat', name: '微信', glyph: '💬' },
  { key: 'contacts', name: '通讯录', glyph: '👥' },
  { key: 'discover', name: '发现', glyph: '🧭' },
  { key: 'me', name: '我', glyph: '👤' }
] as const

type TabKey = (typeof TABS)[number]['key']

export const WeChat = ({ os }: { os: Os }) => {
  void os
  const [tab, setTab] = useState<TabKey>('chat')
  const [openId, setOpenId] = useState<string | null>(null)
  const [convs, setConvs] = useState<WxConv[]>(() => seedConvs())
  const unread = convs.reduce((n, c) => n + c.unread, 0)
  const open = convs.find((c) => c.id === openId)

  const send = (convId: string, text: string, me: boolean, from?: string) => {
    setConvs((all) =>
      all.map((c) =>
        c.id === convId
          ? {
              ...c,
              messages: [...c.messages, { id: `m${Date.now()}${me ? 'a' : 'b'}`, at: Date.now(), me, text, from }]
            }
          : c
      )
    )
  }

  if (open) {
    return (
      <Thread
        conv={open}
        onBack={() => {
          setOpenId(null)
          setConvs((all) => all.map((c) => (c.id === open.id ? { ...c, unread: 0 } : c)))
        }}
        onSend={send}
      />
    )
  }

  return (
    <div {...stylex.props(styles.root)}>
      {tab === 'chat' && (
        <ConvList
          convs={convs}
          onOpen={(id) => {
            setOpenId(id)
            setConvs((all) => all.map((c) => (c.id === id ? { ...c, unread: 0 } : c)))
          }}
        />
      )}
      {tab === 'contacts' && <ContactsPage />}
      {tab === 'discover' && <DiscoverPage />}
      {tab === 'me' && <MePage />}
      <div {...stylex.props(styles.tabbar)}>
        {TABS.map((t) => (
          <button
            type="button"
            key={t.key}
            {...stylex.props(styles.tab, tab === t.key && styles.tabOn)}
            onClick={() => setTab(t.key)}
          >
            <span {...stylex.props(styles.tabGlyph)}>{t.glyph}</span>
            <span>{t.name}</span>
            {t.key === 'chat' && !!unread && <span {...stylex.props(styles.tabBadge)}>{unread}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
