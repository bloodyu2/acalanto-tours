/**
 * Parses an iCal string and returns an array of date strings ("YYYY-MM-DD")
 * representing every night within each VEVENT date range.
 * DTEND is exclusive (standard iCal all-day convention).
 */
export function parseICalDates(icalText: string): string[] {
  const dates: string[] = []
  const lines = icalText.replace(/\r\n/g, '\n').split('\n')
  let inEvent = false
  let dtstart: string | null = null
  let dtend: string | null = null

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { inEvent = true; dtstart = null; dtend = null }
    if (!inEvent) continue

    if (line.startsWith('DTSTART') && !dtstart) {
      const val = line.split(':').slice(1).join(':').replace(/\D/g, '').slice(0, 8)
      if (val.length === 8)
        dtstart = `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6, 8)}`
    }
    if (line.startsWith('DTEND') && !dtend) {
      const val = line.split(':').slice(1).join(':').replace(/\D/g, '').slice(0, 8)
      if (val.length === 8)
        dtend = `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6, 8)}`
    }
    if (line === 'END:VEVENT' && dtstart) {
      const start = new Date(dtstart)
      const end = dtend ? new Date(dtend) : new Date(dtstart)
      const d = new Date(start)
      while (d < end) {
        dates.push(d.toISOString().split('T')[0])
        d.setDate(d.getDate() + 1)
      }
      if (!dtend) dates.push(dtstart)
      inEvent = false
    }
  }
  return dates
}
