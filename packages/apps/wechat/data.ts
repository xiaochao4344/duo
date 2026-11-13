// WeChat's own cast and seed threads, in the shape the real app keeps them:
// conversations sort by last activity, groups carry a member count and a
// sender prefix on the preview, and the service accounts sit in the same
// list as people. Names match the system cast where they overlap.

export type WxMessage = {
  id: string
  at: number
  me: boolean
  /** Group sender display name; absent in one-to-one threads. */
  from?: string
  text: string
}

export type WxConv = {
  id: string
  name: string
  /** Single-letter avatar text and its tile colour, like the real generated avatars. */
  avatar: string
  hue: string
  group?: boolean
  mute?: boolean
  unread: number
  messages: WxMessage[]
}

const H = 3600000
const D = 24 * H
const say = (id: string, at: number, text: string, me = false, from?: string): WxMessage => ({ id, at, me, text, from })

export function seedConvs(now = Date.now()): WxConv[] {
  return [
    {
      id: 'w-mum',
      name: '妈妈',
      avatar: '妈',
      hue: '#C2654F',
      unread: 2,
      messages: [
        say('wm1', now - 3 * H, '天冷了，把厚外套找出来穿上'),
        say('wm2', now - 2 * H, '你姑姑周四到上海，我炖了汤，你们回来吃'),
        say('wm3', now - 26 * 60000, '落地了给我回个消息')
      ]
    },
    {
      id: 'w-group',
      name: '栖湖公寓业主群',
      avatar: '栖',
      hue: '#4E7CB5',
      group: true,
      unread: 5,
      messages: [
        say('wg1', now - 5 * H, '今晚八点到九点停水检修，大家提前存点水', false, '物业小刘'),
        say('wg2', now - 40 * 60000, '收到', false, '3号楼老陈'),
        say('wg3', now - 34 * 60000, '2号楼电梯刚有人被困了一下，已经救出来了，大家当心', false, '保安队长')
      ]
    },
    {
      id: 'w-wang',
      name: '王磊',
      avatar: '王',
      hue: '#6C5CE7',
      unread: 0,
      messages: [
        say('ww1', now - D - 3 * H, '方案我改完了，刚发你邮箱', false),
        say('ww2', now - D - 3 * H + 5 * 60000, '收到，明早例会我带着', true),
        say('ww3', now - D - 2 * H, '明早九点，别迟到')
      ]
    },
    {
      id: 'w-file',
      name: '文件传输助手',
      avatar: '文',
      hue: '#3FA34D',
      unread: 0,
      messages: [say('wf1', now - 2 * D, '[文件] 简报-v3.pdf', true)]
    },
    {
      id: 'w-lin',
      name: '林小雨',
      avatar: '林',
      hue: '#B5657D',
      unread: 0,
      messages: [
        say('wl1', now - 3 * D, '图我渲染好了，就是还有点噪点', true),
        say('wl2', now - 3 * D + 12 * 60000, '发我看看，这次效果应该不错')
      ]
    },
    {
      id: 'w-team',
      name: '微信团队',
      avatar: '微',
      hue: '#07C160',
      unread: 0,
      messages: [say('wt1', now - 6 * D, '欢迎使用微信。谨防诈骗，切勿向陌生人转账。')]
    }
  ]
}

export const CONTACTS: { name: string; avatar: string; hue: string }[] = [
  { name: '陈静', avatar: '陈', hue: '#7D8C5C' },
  { name: '丁总', avatar: '丁', hue: '#5C7C8A' },
  { name: '高敏', avatar: '高', hue: '#8A6D5C' },
  { name: '刘建国', avatar: '刘', hue: '#5C8A6D' },
  { name: '林小雨', avatar: '林', hue: '#B5657D' },
  { name: '妈妈', avatar: '妈', hue: '#C2654F' },
  { name: '沈佳怡', avatar: '沈', hue: '#7D5C8C' },
  { name: '王磊', avatar: '王', hue: '#6C5CE7' },
  { name: '吴秀英', avatar: '吴', hue: '#8C7D5C' },
  { name: '徐天成', avatar: '徐', hue: '#5C6D8C' },
  { name: '郑文博', avatar: '郑', hue: '#6D8C5C' },
  { name: '周子昂', avatar: '周', hue: '#8C5C6D' }
]

/** The list stamp: today a time, this week a weekday, else a date. */
export function wxWhen(at: number, now = new Date()) {
  const d = new Date(at)
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return d.toLocaleTimeString('zh-CN', { hour: 'numeric', minute: '2-digit', hour12: false })
  const week = new Date(now)
  week.setDate(now.getDate() - 6)
  if (d > week) return d.toLocaleDateString('zh-CN', { weekday: 'long' })
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' })
}

/** The in-thread divider stamp. */
export function wxStamp(at: number, now = new Date()) {
  const d = new Date(at)
  const time = d.toLocaleTimeString('zh-CN', { hour: 'numeric', minute: '2-digit', hour12: false })
  if (d.toDateString() === now.toDateString()) return time
  const week = new Date(now)
  week.setDate(now.getDate() - 6)
  if (d > week) return `${d.toLocaleDateString('zh-CN', { weekday: 'long' })} ${time}`
  return `${d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })} ${time}`
}
