// The Messages model: the people the demo reaches, the seed a first launch
// starts with, the stamps rows and threads share, and the deterministic demo
// reply model. Apps read SDK and kit exports, never another app's data
// (docs/working.md), so this is Messages' own copy of the cast Phone and
// Contacts carry - same ids, names and numbers, so a thread opened from Phone
// by `os.open('Messages', name)` finds its person.

import { hue } from '@doan-labs/duo-fixtures'

export type Person = {
  id: string
  name: string
  number: string
}

export type Message = {
  id: string
  /** Epoch ms. */
  at: number
  me: boolean
  text: string
  /** Set on lines the demo reply model landed; flags them as simulated. */
  demo?: true
}

export type Pending = {
  /** The reply text, already chosen when scheduled. */
  text: string
  /** When the typing dots appear. */
  typeAt: number
  /** When the reply lands as a message. */
  at: number
}

export type Conversation = {
  id: string
  /** Local recipient model id; absent for a raw address typed into New Message. */
  personId?: string
  /** Display label of an unmatched recipient: the name or the formatted number. */
  to?: string
  messages: Message[]
  unread: number
  draft: string
  pending?: Pending
}

// The cast is Chinese in this fork: same ids as Phone and Contacts carry,
// so a thread opened from Phone by `os.open('Messages', name)` still finds
// its person - the names and numbers match across all three copies.
export const PEOPLE: Person[] = [
  { id: 'jony', name: '王磊', number: '+86 138 0217 4451' },
  { id: 'ada', name: '林小雨', number: '+86 150 2671 8890' },
  { id: 'mum', name: '妈妈', number: '+86 139 1882 3304' },
  { id: 'kim', name: '陈静', number: '+86 136 3639 5521' },
  { id: 'blender', name: '快递驿站', number: '+86 95338' },
  { id: 'alan', name: '刘建国', number: '+86 137 8890 2214' },
  { id: 'apple-park', name: '小区物业', number: '+86 21 5555 0166' },
  { id: 'grace', name: '赵阿姨', number: '+86 135 2480 7719' },
  { id: 'hideo', name: '周子昂', number: '+86 188 0176 3342' },
  { id: 'katherine', name: '吴秀英', number: '+86 133 9102 6687' },
  { id: 'thanh', name: '徐天成', number: '+86 159 0098 4413' },
  { id: 'radia', name: '沈佳怡', number: '+86 152 2130 9058' },
  { id: 'susan', name: '高敏', number: '+86 131 2267 1185' },
  { id: 'tim', name: '丁总', number: '+86 138 1755 9026' },
  { id: 'vera', name: '郑文博', number: '+86 186 2190 7734' }
]

const say = (id: string, at: number, text: string, me = false): Message => ({ id, at, me, text })

const H = 3600000
const D = 24 * H

/** The conversations a first launch starts with; only written when no store exists yet. */
export function seedConversations(now = Date.now()): Conversation[] {
  return [
    {
      id: 'c-jony',
      personId: 'jony',
      unread: 2,
      draft: '',
      messages: [
        say('m-j1', now - 40 * 60000, '方案我改完了，刚发你邮箱'),
        say('m-j2', now - 2 * 60000, '明早九点例会，别迟到')
      ]
    },
    {
      id: 'c-mum',
      personId: 'mum',
      unread: 0,
      draft: '',
      messages: [
        say('m-m1', now - D - 2 * H, '你姑姑周四到上海，记得去接一下'),
        say('m-m2', now - D - H, '落地了给我打个电话 ❤️')
      ]
    },
    {
      id: 'c-ada',
      personId: 'ada',
      unread: 1,
      draft: '',
      messages: [
        say('m-a1', now - 4 * D, '图我渲染好了，就是还有点噪点', true),
        say('m-a2', now - 4 * D + 12 * 60000, '发我看看，这次效果应该不错')
      ]
    },
    {
      id: 'c-kim',
      personId: 'kim',
      unread: 0,
      draft: '',
      messages: [say('m-k1', now - 6 * D, '晚上八点，老地方'), say('m-k2', now - 6 * D + 5 * 60000, '记得带电脑')]
    },
    {
      id: 'c-blender',
      personId: 'blender',
      unread: 0,
      draft: '',
      messages: [say('m-b1', now - 12 * D, '您的快递已放入 3 号柜，取件码 4821')]
    }
  ]
}

export const personById = (id?: string) => PEOPLE.find((p) => p.id === id)

/** Who a conversation is with: the person's name, else the raw address label. */
export const convName = (c: Conversation) => personById(c.personId)?.name ?? c.to ?? 'Unknown'

/** The activity a conversation sorts by in the inbox. */
export const lastAt = (c: Conversation) => Math.max(c.messages.at(-1)?.at ?? 0, c.pending?.at ?? 0)

/** A conversation worth listing: it has a message, a reply in flight, or a draft. */
export const visible = (c: Conversation) => !!c.messages.length || !!c.pending || !!c.draft.trim()

// ---------- recipients ----------

/**
 * Who free text names: a person on a name or number match, else the trimmed
 * text itself when it looks like an address. Returns the raw string so a New
 * Message can always land somewhere honest.
 */
export function resolveRecipient(raw: string): { person?: Person; to: string } | null {
  const s = raw.trim()
  if (!s) return null
  const n = s.toLowerCase()
  const person = PEOPLE.find(
    (p) =>
      p.name.toLowerCase() === n ||
      p.name.toLowerCase().startsWith(n) ||
      (digits(s).replace(/^\+/, '').length > 3 && matchNumber(p.number, s))
  )
  if (person) return { person, to: person.name }
  return { to: formatNumber(s) || s }
}

/** The `os.arg` Phone sends: a contact's display name. Resolve it to a person when it is one. */
export const personByName = (name: string) => {
  const n = name.trim().toLowerCase()
  return PEOPLE.find((p) => p.name.toLowerCase() === n) ?? PEOPLE.find((p) => p.name.toLowerCase().startsWith(n))
}

// ---------- numbers ----------

/** The address stripped to digits and a leading +, for matching and display. */
export const digits = (s: string) => {
  const d = s.replace(/[^\d]/g, '')
  return s.trim().startsWith('+') ? `+${d}` : d
}

/** A typed string dials like the keypad does: 138 0217 4451, or +86 138 0217 4451. */
export function formatNumber(raw: string) {
  const d = digits(raw)
  if (!d) return ''
  if (d.startsWith('+')) {
    const rest = d.slice(1)
    // A Chinese mobile under +86 groups 3-4-4 after the country code.
    if (rest.startsWith('86') && rest.length === 13) return `+86 ${rest.slice(2, 5)} ${rest.slice(5, 9)} ${rest.slice(9)}`
    const groups: string[] = []
    if (rest.length > 2) groups.push(rest.slice(0, 2), ...rest.slice(2).match(/.{1,3}/g)!)
    else groups.push(rest)
    return `+${groups.filter(Boolean).join(' ')}`
  }
  // A domestic 11-digit mobile groups 3-4-4, not the US pattern.
  if (d.length === 11 && d.startsWith('1')) return `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7)}`
  const n = d.length === 11 && d.startsWith('1') ? d.slice(1) : d
  if (n.length > 10) return n.match(/.{1,3}/g)!.join(' ')
  const parts = [n.slice(0, 3), n.slice(3, 6), n.slice(6, 10)]
  if (n.length <= 3) return n
  if (n.length <= 6) return `(${parts[0]}) ${parts[1]}`
  const head = `(${parts[0]}) ${parts[1]}-${parts[2]}`
  return d.length > 10 ? `1 ${head}` : head
}

/** Trailing-digit match, the same rule the Phone book uses. */
export const matchNumber = (stored: string, raw: string) => {
  const d = digits(raw).replace(/^\+/, '')
  const s = digits(stored).replace(/^\+/, '')
  return s.replace(/^1(?=\d{10}$)/, '') === d.replace(/^1(?=\d{10}$)/, '') || s.endsWith(d)
}

/** True when free text can be an address: mostly digits, or an email shape. */
export const looksLikeAddress = (raw: string) => {
  const s = raw.trim()
  return digits(s).replace(/^\+/, '').length > 3 || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)
}

/** Monogram for a display name: letters only, so a bare number renders none. */
export const nameInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[\p{L}]/u.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

// ---------- timestamps ----------

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

/** The inbox stamp: today reads as a time, this week as a day, else the date. */
export function when(at: number, now = new Date()) {
  const d = new Date(at)
  if (sameDay(d, now)) return d.toLocaleTimeString('zh-CN', { hour: 'numeric', minute: '2-digit', hour12: false })
  const week = new Date(now)
  week.setDate(now.getDate() - 6)
  if (d > week) return d.toLocaleDateString('zh-CN', { weekday: 'long' })
  return d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
}

/** The stamp a bubble group break shows inside a thread. */
export function threadStamp(at: number, now = new Date()) {
  const d = new Date(at)
  const time = d.toLocaleTimeString('zh-CN', { hour: 'numeric', minute: '2-digit', hour12: false })
  if (sameDay(d, now)) return time
  const week = new Date(now)
  week.setDate(now.getDate() - 6)
  if (d > week) return `${d.toLocaleDateString('zh-CN', { weekday: 'long' })} ${time}`
  return `${d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} ${time}`
}

/** Two bubbles share a group when the same sender wrote them inside four minutes. */
export const sameBurst = (a: Message, b: Message) => a.me === b.me && b.at - a.at < 4 * 60000

// ---------- the demo reply model ----------

/**
 * Explicit demo behavior: a send to a known person composes a reply at once and
 * stores it on the conversation, and the store lands it after the typing pause.
 * Pools are per persona so a reply sounds like who sent it; `q` answers a
 * question, `g` a greeting, `s` everything else. The pick is deterministic -
 * same person, same text, same thread position gives the same line - so a
 * pending reply survives a reload unchanged.
 */
const PERSONA: Record<string, { q: string[]; g: string[]; s: string[] }> = {
  jony: {
    q: ['发了，今早刚寄出去。', '明天吧，服务器还在跑。'],
    g: ['好久没联系了，最近怎么样'],
    s: ['可以，就这么定。', '截图发我看看。', '好，边缘再磨一下就行。']
  },
  mum: {
    q: ['当然行，晚上七点吃饭。', '对，你姑姑改周四到了。'],
    g: ['正想给你打电话呢。'],
    s: ['落地了给我打个电话 ❤️', '好。你爸问你好。', '别太累着了。']
  },
  ada: {
    q: ['按你说的那版织出来了，图发你？', '周四吧，今天排满了。'],
    g: ['好久不见，数据都正常。'],
    s: ['这版我觉得很稳。', '渲染完发你看看？', '就按这个走。']
  },
  kim: {
    q: ['八点，老地方。', '带，我记着呢。'],
    g: ['在呢，说'],
    s: ['好 👍', '别忘了带电脑', '八点见']
  },
  blender: {
    q: ['在 3 号柜，取件码 4821。', '单号我帮您查一下。'],
    g: ['您好，这里是快递驿站。'],
    s: ['已入库，请及时取件。', '驿站营业到晚上十点。', '有问题随时找我。']
  },
  tim: {
    q: ['周四可以，把邀请发我。', '问王磊，样机在他那儿。'],
    g: ['早，这周事不少。'],
    s: ['看着不错。', '收到了，谢谢。']
  }
}

const GENERIC = {
  q: ['我确认一下再回你。', '行，没问题。'],
  g: ['你好，好久不见。'],
  s: ['收到 👍', '好的。', '这就发你。', '同意。']
}

/**
 * The reply a send earns, or undefined: a raw address is someone the demo does
 * not know, and honest local state means nobody answers. Deterministic by
 * person, text and thread position.
 */
export function replyFor(person: Person | undefined, conv: Conversation, sent: string): string | undefined {
  if (!person) return undefined
  const p = PERSONA[person.id] ?? GENERIC
  const s = sent.trim()
  const pool = /[?？]/.test(s) || s.includes('吗')
    ? p.q
    : s.length < 40 && /^(hi|hey|hello|yo|你好|您好|在吗|早上好|早)/i.test(s)
      ? p.g
      : p.s
  return pool[(hue(`${person.id}:${s}`) + conv.messages.length) % pool.length]!
}
