// The wall clock. Its own file because two unrelated pieces of the shell read the
// same minute: the status stack beside the camera and the lock screen.

import { useEffect, useState } from 'react'

/** The wall clock, re-read every ten seconds so the minute is never more than that late. */
export function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10_000)
    return () => clearInterval(t)
  }, [])
  return now
}
// The system language of this fork is Chinese: a 24-hour clock, and the
// lock-screen date spelled the way iOS does in Chinese (month, day, weekday).
export const clock = (d: Date) =>
  d.toLocaleTimeString('zh-CN', { hour: 'numeric', minute: '2-digit', hour12: false })
export const dateOf = (d: Date) => d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })
