// Baidu Map, rebuilt as a baked app: a code-drawn street map (road casing,
// blocks, a river, named roads and POIs), the floating search pill and
// side tools the real app wears, and a route sheet - drive/transit/walk
// tabs, the polyline drawn along the roads, and the blue start button.
// Geography is invented but internally consistent: one neighborhood,
// 栖湖一带, that the other apps' stories also live in.

import type { Os } from '@doan-labs/duo-sdk'
import { useState } from 'react'
import * as stylex from '@stylexjs/stylex'

const BLUE = '#3385FF'

type Poi = { name: string; sub: string; x: number; y: number; color: string }

const POIS: Poi[] = [
  { name: '栖湖公寓', sub: '住宅 · 滨水路 88 号', x: 268, y: 468, color: '#F25C54' },
  { name: '云桥中心', sub: '商场 · 云桥路 1 号', x: 118, y: 236, color: '#F5A623' },
  { name: '市第三医院', sub: '医院 · 健康路 16 号', x: 292, y: 158, color: '#2FBF9B' },
  { name: '栖湖公园', sub: '公园 · 环湖西路', x: 66, y: 560, color: '#4CAF50' },
  { name: '地铁 2 号线 云桥站', sub: '地铁站 · B 口', x: 168, y: 348, color: '#7B61FF' }
]

// The route from 云桥中心 (118,236) to 栖湖公寓 (268,468), snapped to roads.
const ROUTE = 'M118,236 L168,236 L168,348 L216,348 L216,468 L268,468'

function MapArt({ route }: { route: boolean }) {
  return (
    <svg width="393" height="852" viewBox="0 0 393 852" style={{ position: 'absolute', inset: 0 }}>
      <rect width="393" height="852" fill="#F2F0EA" />
      {/* city blocks */}
      {[
        [20, 120, 76, 90], [110, 120, 90, 90], [214, 120, 76, 90], [304, 120, 76, 90],
        [20, 262, 76, 70], [110, 262, 90, 70], [232, 262, 62, 70], [308, 262, 72, 70],
        [20, 372, 120, 78], [232, 372, 62, 78], [308, 372, 72, 78],
        [150, 492, 52, 96], [232, 492, 62, 96], [308, 492, 72, 96],
        [20, 620, 120, 96], [160, 620, 130, 96], [308, 620, 72, 96]
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill="#E9E5DB" rx={3} />
      ))}
      {/* the river down the west side */}
      <path d="M0,852 C30,700 18,600 34,470 C46,375 26,250 44,120 C52,60 46,20 52,0 L0,0 Z" fill="#B7D9F2" />
      <rect x="150" y="492" width="52" height="96" fill="#CDE8C5" rx={3} />
      {/* minor roads */}
      {[
        'M0,258 L393,258', 'M0,368 L393,368', 'M104,96 L104,760', 'M300,96 L300,760',
        'M0,616 L393,616', 'M146,464 L393,464', 'M210,96 L210,760'
      ].map((d, i) => (
        <g key={i}>
          <path d={d} stroke="#FFFFFF" strokeWidth={9} fill="none" />
          <path d={d} stroke="#D9D4C8" strokeWidth={9.8} fill="none" opacity={0.45} />
        </g>
      ))}
      {/* arterial roads */}
      {['M0,232 L393,232', 'M168,96 L168,760', 'M0,492 L393,492'].map((d, i) => (
        <g key={i}>
          <path d={d} stroke="#FCD08A" strokeWidth={13} fill="none" />
          <path d={d} stroke="#FFFFFF" strokeWidth={1.4} strokeDasharray="10 8" fill="none" opacity={0.8} />
        </g>
      ))}
      {/* road names */}
      <text x="196" y="226" fontSize="10" fill="#8A8578">云桥路</text>
      <text x="174" y="140" fontSize="10" fill="#8A8578" transform="rotate(90 174 140)">滨水路</text>
      <text x="240" y="486" fontSize="10" fill="#8A8578">栖湖路</text>
      <text x="60" y="362" fontSize="10" fill="#8A8578">健康路</text>
      {route && (
        <>
          <path d={ROUTE} stroke="#FFFFFF" strokeWidth={9} fill="none" strokeLinejoin="round" />
          <path d={ROUTE} stroke={BLUE} strokeWidth={6} fill="none" strokeLinejoin="round" />
          <circle cx="118" cy="236" r="9" fill="#2FBF9B" stroke="#FFF" strokeWidth={2.5} />
          <circle cx="268" cy="468" r="9" fill="#F25C54" stroke="#FFF" strokeWidth={2.5} />
        </>
      )}
      {/* my location */}
      <circle cx="196" cy="560" r="26" fill={BLUE} opacity={0.16} />
      <circle cx="196" cy="560" r="8" fill={BLUE} stroke="#FFF" strokeWidth={3} />
      {/* POIs */}
      {POIS.map((p) => (
        <g key={p.name}>
          <circle cx={p.x} cy={p.y} r="8" fill={p.color} stroke="#FFF" strokeWidth={2} />
          <text x={p.x + 11} y={p.y + 3} fontSize="10.5" fill="#44403A">{p.name}</text>
        </g>
      ))}
    </svg>
  )
}

export const BaiduMap = ({ os }: { os: Os }) => {
  void os
  const [sheet, setSheet] = useState<'nearby' | 'route'>('nearby')
  const [mode, setMode] = useState<'drive' | 'bus' | 'walk'>('drive')
  const routeInfo = {
    drive: { t: '26 分钟', d: '8.6 公里 · 12 个红绿灯', cta: '开始导航' },
    bus: { t: '41 分钟', d: '地铁 2 号线 → 步行 600 米', cta: '开始导航' },
    walk: { t: '1 小时 48 分', d: '7.9 公里 · 约 10500 步', cta: '开始步行导航' }
  }[mode]
  return (
    <div {...stylex.props(s.root)}>
      <MapArt route={sheet === 'route'} />
      <div {...stylex.props(s.searchRow)}>
        <div {...stylex.props(s.search)}>
          <span style={{ color: BLUE }}>⌕</span>
          <input {...stylex.props(s.searchInput)} placeholder="搜索地点、公交、路线" />
          <span style={{ fontSize: 18 }}>🎙</span>
          <div {...stylex.props(s.meAvatar)}>我</div>
        </div>
      </div>
      <div {...stylex.props(s.tools)}>
        <button type="button" {...stylex.props(s.tool)}>路况</button>
        <button type="button" {...stylex.props(s.tool)}>图层</button>
        <button type="button" {...stylex.props(s.tool)}>⦿</button>
      </div>
      <div {...stylex.props(s.sheet)}>
        {sheet === 'nearby' ? (
          <>
            <div {...stylex.props(s.sheetHead)}>
              <b>附近</b>
              <button type="button" {...stylex.props(s.routeBtn)} onClick={() => setSheet('route')}>
                路线
              </button>
            </div>
            {POIS.map((p) => (
              <button type="button" key={p.name} {...stylex.props(s.poiRow)} onClick={() => setSheet('route')}>
                <span {...stylex.props(s.poiDot)} style={{ backgroundColor: p.color }} />
                <span {...stylex.props(s.poiMain)}>
                  <span {...stylex.props(s.poiName)}>{p.name}</span>
                  <span {...stylex.props(s.poiSub)}>{p.sub}</span>
                </span>
                <span {...stylex.props(s.poiGo)}>去这里</span>
              </button>
            ))}
          </>
        ) : (
          <>
            <div {...stylex.props(s.ends)}>
              <div {...stylex.props(s.endRow)}>
                <span {...stylex.props(s.dotStart)} /> 云桥中心东门
              </div>
              <div {...stylex.props(s.endRow)}>
                <span {...stylex.props(s.dotEnd)} /> 栖湖公寓 2 号楼
              </div>
            </div>
            <div {...stylex.props(s.modes)}>
              {(
                [
                  ['drive', '驾车'],
                  ['bus', '公交'],
                  ['walk', '步行']
                ] as const
              ).map(([k, label]) => (
                <button
                  type="button"
                  key={k}
                  {...stylex.props(s.mode, mode === k && s.modeOn)}
                  onClick={() => setMode(k)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div {...stylex.props(s.summary)}>
              <span {...stylex.props(s.summaryTime)}>{routeInfo.t}</span>
              <span {...stylex.props(s.summaryDist)}>{routeInfo.d}</span>
            </div>
            <button type="button" {...stylex.props(s.start)} onClick={() => setSheet('nearby')}>
              {routeInfo.cta}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const s = stylex.create({
  root: { position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#F2F0EA', fontFamily: '-apple-system, "PingFang SC", sans-serif' },
  searchRow: { position: 'absolute', top: 56, left: 12, right: 12 },
  search: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    height: 46,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    boxShadow: '0 2px 10px rgba(0,0,0,0.14)'
  },
  searchInput: { flex: 1, borderStyle: 'none', outline: 'none', fontSize: 15.5, backgroundColor: 'transparent' },
  meAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#5B8DEF',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13
  },
  tools: { position: 'absolute', right: 12, top: 300, display: 'flex', flexDirection: 'column', gap: 10 },
  tool: {
    width: 42,
    height: 42,
    borderRadius: 9,
    borderStyle: 'none',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 2px 8px rgba(0,0,0,0.13)',
    fontSize: 12.5,
    color: '#333',
    cursor: 'pointer'
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    boxShadow: '0 -3px 14px rgba(0,0,0,0.12)',
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 30
  },
  sheetHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 16, marginBottom: 6 },
  routeBtn: {
    borderStyle: 'none',
    backgroundColor: BLUE,
    color: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
    fontSize: 14,
    cursor: 'pointer'
  },
  poiRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    paddingVertical: 11,
    borderStyle: 'none',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left'
  },
  poiDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  poiMain: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  poiName: { fontSize: 15, color: '#222' },
  poiSub: { fontSize: 12, color: '#999' },
  poiGo: { fontSize: 13, color: BLUE },
  ends: { display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 12 },
  endRow: { display: 'flex', alignItems: 'center', gap: 9, fontSize: 15.5, color: '#222' },
  dotStart: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#2FBF9B' },
  dotEnd: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#F25C54' },
  modes: { display: 'flex', gap: 8, marginBottom: 12 },
  mode: {
    flex: 1,
    height: 34,
    borderStyle: 'none',
    borderRadius: 17,
    backgroundColor: '#F2F3F5',
    fontSize: 14.5,
    color: '#444',
    cursor: 'pointer'
  },
  modeOn: { backgroundColor: '#E3EEFF', color: BLUE, fontWeight: 600 },
  summary: { display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 },
  summaryTime: { fontSize: 22, fontWeight: 700, color: '#222' },
  summaryDist: { fontSize: 13, color: '#888' },
  start: {
    width: '100%',
    height: 46,
    borderStyle: 'none',
    borderRadius: 23,
    backgroundColor: BLUE,
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: 600,
    cursor: 'pointer'
  }
})
