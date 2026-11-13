// Chinese display labels for the apps, keyed by their English `name`.
// The name stays the identity everywhere - grid order, deep links, the
// registry - because saved state and the preinstalled manifests are
// written against it. Only what the person reads is Chinese: the home
// screen tile, Spotlight, and anything else that prints an app's name
// goes through `labelOf`.

import type { App } from '@doan-labs/duo-uikit/app.ts'

export const LABELS: Record<string, string> = {
  WeChat: '微信',
  BaiduMap: '百度地图',
  Tapo: 'Tapo',
  FaceTime: 'FaceTime 通话',
  Calendar: '日历',
  Photos: '照片',
  Camera: '相机',
  Mail: '邮件',
  Clock: '时钟',
  Notes: '备忘录',
  Maps: '地图',
  TV: 'TV',
  News: 'News',
  Health: '健康',
  Wallet: '钱包',
  Siri: 'Siri',
  Settings: '设置',
  Weather: '天气',
  Stocks: '股市',
  Home: '家庭',
  Fitness: '健身',
  Reminders: '提醒事项',
  Files: '文件',
  Preview: '预览',
  Utilities: '实用工具',
  Contacts: '通讯录',
  Freeform: '无边记',
  Tips: '提示',
  Phone: '电话',
  Safari: 'Safari',
  Messages: '信息',
  Music: '音乐',
  'App Store': 'App Store',
  Calculator: '计算器',
  'Voice Memos': '语音备忘录',
  Shortcuts: '快捷指令',
  Podcasts: '播客',
  Books: '图书'
}

/** The name to show for an app: its own label, else the table, else its name. */
export const labelOf = (a: Pick<App, 'name' | 'label'>): string => a.label ?? LABELS[a.name] ?? a.name
