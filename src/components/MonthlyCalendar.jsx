import './MonthlyCalendar.css'

function toDate(s) {
  if (!s) return null
  if (s.toDate) return s.toDate()
  if (s.seconds) return new Date(s.seconds * 1000)
  return new Date(s)
}

function colorForScore(v){
  if (v == null) return '#e5e7eb'
  if (v >= 4.5) return '#10B981'
  if (v >= 3.5) return '#84cc16'
  if (v >= 2.5) return '#f59e0b'
  if (v >= 1.5) return '#f97316'
  return '#ef4444'
}

export default function MonthlyCalendar({ sessions, year, month, onDayClick }){
  // month: 0-11
  const first = new Date(year, month, 1)
  const startDay = new Date(first); 
  // Monday is day 1, so we adjust: if Monday (1), offset is 1; if Tuesday (2), offset is 2, ..., if Sunday (0), offset is 6
  const dayOffset = first.getDay() === 0 ? 6 : first.getDay() - 1
  startDay.setDate(first.getDate() - dayOffset)

  // compute last visible day for the month (end of week that contains last day)
  const lastOfMonth = new Date(year, month + 1, 0)
  // adapt end-of-week calculation to Monday-first weeks
  const lastDayIndexMonday = (lastOfMonth.getDay() + 6) % 7 // Mon=0 .. Sun=6
  const daysToAdd = 6 - lastDayIndexMonday
  const lastVisible = new Date(lastOfMonth); lastVisible.setDate(lastOfMonth.getDate() + daysToAdd)
  const totalDays = Math.round((lastVisible - startDay) / (1000 * 60 * 60 * 24)) + 1
  const numWeeks = Math.ceil(totalDays / 7)

  const weeks = []
  for (let w = 0; w < numWeeks; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const cur = new Date(startDay); cur.setDate(startDay.getDate() + w * 7 + d)
      week.push(cur)
    }
    weeks.push(week)
  }

  // aggregate ratings by date
  const map = {}
  ;(sessions||[]).forEach(s => {
    const dt = toDate(s.createdAt) || (s.completedAt ? new Date(s.completedAt) : null)
    if (!dt || s.rating == null) return
    const key = dt.getFullYear()+'-'+(dt.getMonth()+1)+'-'+dt.getDate()
    if (!map[key]) map[key] = []
    map[key].push(s.rating)
  })

  function avgFor(d){
    const key = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()
    const arr = map[key]
    if (!arr || arr.length===0) return null
    return arr.reduce((a,c)=>a+c,0)/arr.length
  }

  return (
    <div className="month-grid">
      <div className="weekdays">{['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(x=> <div key={x} className="wd">{x}</div>)}</div>
      {weeks.map((week,i)=> (
        <div className="week-row" key={i}>
          {week.map(d => {
            const isCurrentMonth = d.getMonth() === month
            const avg = avgFor(d)
            return (
              <div key={d.toISOString()} className={`day-cell ${isCurrentMonth?'' : 'muted'}`} onClick={() => onDayClick && onDayClick(new Date(d))}>
                  <div className={`day-circle ${avg == null ? 'no-data' : ''}`} style={{background: colorForScore(avg)}} title={avg?`Puntuación media: ${avg.toFixed(2)}`:'Sin datos'}>
                    <span className="day-num">{d.getDate()}</span>
                  </div>
                </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
