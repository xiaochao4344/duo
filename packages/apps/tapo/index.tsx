// TP-Link Tapo, rebuilt as a baked app: the home page's camera cards with
// drawn live snapshots, the live player with its timestamp overlay and
// control row, the pan-tilt pad, and the detection event list. Scenes are
// code-drawn rooms (sofa living room, entry hall) in the flat, slightly
// desaturated palette a real camera feed has, IR specks included.

import type { Os } from '@doan-labs/duo-sdk'
import { useState } from 'react'
import * as stylex from '@stylexjs/stylex'

const TEAL = '#00B4A2'

type Cam = { id: string; name: string; model: string; online: boolean; room: 'living' | 'entry' }

const CAMS: Cam[] = [
  { id: 'c1', name: '客厅摄像头', model: 'Tapo C210', online: true, room: 'living' },
  { id: 'c2', name: '玄关摄像头', model: 'Tapo C110', online: true, room: 'entry' }
]

const EVENTS = [
  { at: '03:07:12', kind: '移动侦测', cam: '玄关摄像头', dur: '0:24' },
  { at: '01:42:53', kind: '移动侦测', cam: '客厅摄像头', dur: '0:11' },
  { at: '昨天 23:18:04', kind: '人物侦测', cam: '玄关摄像头', dur: '0:37' },
  { at: '昨天 21:05:49', kind: '移动侦测', cam: '客厅摄像头', dur: '0:08' }
]

function Scene({ room, w = 361, h = 203 }: { room: 'living' | 'entry'; w?: number; h?: number }) {
  return (
    <svg width={w} height={h} viewBox="0 0 361 203" preserveAspectRatio="xMidYMid slice">
      <rect width="361" height="203" fill={room === 'living' ? '#8E97A3' : '#7E8894'} />
      <rect width="361" height="130" fill={room === 'living' ? '#A8B0BA' : '#99A2AD'} />
      <rect y="130" width="361" height="73" fill="#6E777F" />
      {room === 'living' ? (
        <>
          <rect x="30" y="42" width="86" height="66" fill="#C7CDD4" />
          <rect x="36" y="48" width="74" height="54" fill="#D9DEE4" />
          <rect x="238" y="30" width="92" height="80" fill="#B9C1CA" />
          <rect x="150" y="118" width="130" height="34" rx="6" fill="#5D666F" />
          <rect x="142" y="104" width="146" height="20" rx="6" fill="#68727C" />
          <rect x="52" y="128" width="52" height="26" rx="3" fill="#57606A" />
        </>
      ) : (
        <>
          <rect x="238" y="18" width="74" height="150" fill="#5F686F" />
          <rect x="246" y="26" width="58" height="134" fill="#69727A" />
          <circle cx="296" cy="96" r="3.5" fill="#C9CFD6" />
          <rect x="252" y="34" width="46" height="30" fill="#7A838C" />
          <rect x="34" y="86" width="96" height="82" fill="#626B73" />
          <rect x="42" y="94" width="80" height="12" fill="#78818A" />
          <rect x="42" y="114" width="80" height="12" fill="#78818A" />
          <rect x="30" y="168" width="180" height="10" fill="#565F68" />
        </>
      )}
      {/* sensor noise */}
      {Array.from({ length: 60 }, (_, i) => (
        <circle key={i} cx={(i * 67) % 361} cy={(i * 41) % 203} r="0.8" fill="#FFFFFF" opacity={0.13} />
      ))}
    </svg>
  )
}

export const Tapo = ({ os }: { os: Os }) => {
  void os
  const [view, setView] = useState<'home' | 'live' | 'events'>('home')
  const [cam, setCam] = useState<Cam>(CAMS[0]!)
  const stamp = '2026-11-13 03:07:12'

  if (view === 'live') {
    return (
      <div {...stylex.props(s.root)}>
        <div {...stylex.props(s.head)}>
          <button type="button" {...stylex.props(s.back)} onClick={() => setView('home')}>
            ‹
          </button>
          <span {...stylex.props(s.headTitle)}>{cam.name}</span>
          <span style={{ width: 30 }} />
        </div>
        <div {...stylex.props(s.player)}>
          <Scene room={cam.room} w={393} h={221} />
          <span {...stylex.props(s.osdTime)}>{stamp}</span>
          <span {...stylex.props(s.osdLive)}>● 直播</span>
          <span {...stylex.props(s.osdRes)}>2K QHD</span>
        </div>
        <div {...stylex.props(s.ctlRow)}>
          {[
            ['回放', () => setView('events')],
            ['截图', undefined],
            ['录制', undefined],
            ['对讲', undefined],
            ['报警', undefined]
          ].map(([label, fn]) => (
            <button type="button" key={label as string} {...stylex.props(s.ctl)} onClick={fn as (() => void) | undefined}>
              <span {...stylex.props(s.ctlGlyph)}>◉</span>
              <span>{label as string}</span>
            </button>
          ))}
        </div>
        <div {...stylex.props(s.ptzWrap)}>
          <div {...stylex.props(s.ptz)}>
            <span {...stylex.props(s.ptzBtn, s.ptzUp)}>▲</span>
            <span {...stylex.props(s.ptzBtn, s.ptzLeft)}>◀</span>
            <span {...stylex.props(s.ptzCore)}>云台</span>
            <span {...stylex.props(s.ptzBtn, s.ptzRight)}>▶</span>
            <span {...stylex.props(s.ptzBtn, s.ptzDown)}>▼</span>
          </div>
          <div {...stylex.props(s.ptzNote)}>
            移动侦测: 开启
            <br />
            夜视: 自动
            <br />
            本地存储: 118 GB 可用
          </div>
        </div>
      </div>
    )
  }

  if (view === 'events') {
    return (
      <div {...stylex.props(s.root)}>
        <div {...stylex.props(s.head)}>
          <button type="button" {...stylex.props(s.back)} onClick={() => setView('live')}>
            ‹
          </button>
          <span {...stylex.props(s.headTitle)}>回放 · 侦测事件</span>
          <span style={{ width: 30 }} />
        </div>
        <div {...stylex.props(s.list)}>
          {EVENTS.map((e) => (
            <div key={e.at} {...stylex.props(s.event)}>
              <div {...stylex.props(s.thumb)}>
                <Scene room={e.cam.includes('玄关') ? 'entry' : 'living'} w={104} h={62} />
              </div>
              <div {...stylex.props(s.eventMain)}>
                <span {...stylex.props(s.eventKind)}>{e.kind}</span>
                <span {...stylex.props(s.eventSub)}>
                  {e.cam} · 时长 {e.dur}
                </span>
              </div>
              <span {...stylex.props(s.eventAt)}>{e.at}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div {...stylex.props(s.root)}>
      <div {...stylex.props(s.homeHead)}>
        <div>
          <div {...stylex.props(s.homeTitle)}>我的家</div>
          <div {...stylex.props(s.homeSub)}>Tapo 智能家居</div>
        </div>
        <span style={{ fontSize: 22 }}>+</span>
      </div>
      <div {...stylex.props(s.list)}>
        {CAMS.map((c) => (
          <button type="button" key={c.id} {...stylex.props(s.card)} onClick={() => { setCam(c); setView('live') }}>
            <div {...stylex.props(s.cardImg)}>
              <Scene room={c.room} />
              <span {...stylex.props(s.cardLive)}>● 直播</span>
            </div>
            <div {...stylex.props(s.cardBar)}>
              <div>
                <div {...stylex.props(s.cardName)}>{c.name}</div>
                <div {...stylex.props(s.cardSub)}>{c.model}</div>
              </div>
              <span {...stylex.props(s.online)}>
                <span {...stylex.props(s.onlineDot)} />
                在线
              </span>
            </div>
          </button>
        ))}
        <button type="button" {...stylex.props(s.eventsEntry)} onClick={() => setView('events')}>
          查看全部侦测事件 ›
        </button>
      </div>
    </div>
  )
}

const s = stylex.create({
  root: { position: 'absolute', inset: 0, backgroundColor: '#F4F5F7', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, "PingFang SC", sans-serif', color: '#1A1A1A' },
  homeHead: { paddingTop: 60, paddingHorizontal: 18, paddingBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  homeTitle: { fontSize: 24, fontWeight: 700 },
  homeSub: { fontSize: 12.5, color: '#8A8F98', marginTop: 3 },
  head: { paddingTop: 54, paddingHorizontal: 10, paddingBottom: 10, display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF' },
  back: { borderStyle: 'none', backgroundColor: 'transparent', fontSize: 24, width: 30, cursor: 'pointer' },
  headTitle: { flex: 1, textAlign: 'center', fontSize: 16.5, fontWeight: 600 },
  list: { flex: 1, overflowY: 'auto', paddingHorizontal: 14, paddingBottom: 30, display: 'flex', flexDirection: 'column', gap: 14 },
  card: { borderStyle: 'none', backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', padding: 0, cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 5px rgba(0,0,0,0.07)' },
  cardImg: { position: 'relative', height: 190, overflow: 'hidden' },
  cardLive: { position: 'absolute', top: 8, left: 10, fontSize: 11, color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6 },
  cardBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 13 },
  cardName: { fontSize: 15.5, fontWeight: 600 },
  cardSub: { fontSize: 12, color: '#9AA0A8', marginTop: 2 },
  online: { fontSize: 12, color: TEAL, display: 'flex', alignItems: 'center', gap: 5 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: TEAL },
  eventsEntry: { borderStyle: 'none', backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 14, fontSize: 14.5, color: TEAL, cursor: 'pointer' },
  player: { position: 'relative', height: 221, backgroundColor: '#000' },
  osdTime: { position: 'absolute', top: 8, right: 10, fontSize: 12, color: '#FFFFFF', fontFamily: 'monospace', textShadow: '0 1px 2px rgba(0,0,0,0.8)' },
  osdLive: { position: 'absolute', top: 8, left: 10, fontSize: 11.5, color: '#FF5A52' },
  osdRes: { position: 'absolute', bottom: 8, right: 10, fontSize: 11, color: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6 },
  ctlRow: { display: 'flex', backgroundColor: '#FFFFFF', paddingVertical: 12, marginBottom: 10 },
  ctl: { flex: 1, borderStyle: 'none', backgroundColor: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, fontSize: 12, color: '#333', cursor: 'pointer' },
  ctlGlyph: { fontSize: 19, color: TEAL },
  ptzWrap: { backgroundColor: '#FFFFFF', flex: 1, display: 'flex', alignItems: 'center', paddingHorizontal: 26, gap: 26 },
  ptz: { width: 168, height: 168, borderRadius: 84, backgroundColor: '#EFF1F4', position: 'relative', flexShrink: 0 },
  ptzBtn: { position: 'absolute', fontSize: 15, color: '#6B7280' },
  ptzUp: { top: 12, left: '50%', marginLeft: -8 },
  ptzDown: { bottom: 12, left: '50%', marginLeft: -8 },
  ptzLeft: { left: 12, top: '50%', marginTop: -9 },
  ptzRight: { right: 12, top: '50%', marginTop: -9 },
  ptzCore: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 13.5, color: '#374151', backgroundColor: '#FFFFFF', borderRadius: 26, width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' },
  ptzNote: { fontSize: 13, color: '#6B7280', lineHeight: 1.9 },
  event: { display: 'flex', gap: 11, backgroundColor: '#FFFFFF', borderRadius: 10, padding: 10, alignItems: 'center' },
  thumb: { width: 104, height: 62, borderRadius: 6, overflow: 'hidden', flexShrink: 0 },
  eventMain: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  eventKind: { fontSize: 14.5, fontWeight: 600 },
  eventSub: { fontSize: 12, color: '#9AA0A8' },
  eventAt: { fontSize: 12, color: '#6B7280', fontFamily: 'monospace' }
})
