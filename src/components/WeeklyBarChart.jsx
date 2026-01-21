import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

function toDate(s) {
  if (!s) return null
  if (s.toDate) return s.toDate()
  if (s.seconds) return new Date(s.seconds * 1000)
  return new Date(s)
}

export default function WeeklyBarChart({ sessions, weekStart }) {
  const start = new Date(weekStart); start.setHours(0,0,0,0)
  const days = Array.from({length:7}).map((_,i)=>{ const d=new Date(start); d.setDate(start.getDate()+i); return d })

  const dayBuckets = days.map(d => ({ date:d, ratings:[] }))

  ;(sessions||[]).forEach(s => {
    const d = toDate(s.createdAt) || (s.completedAt ? new Date(s.completedAt) : null)
    if (!d || s.rating == null) return
    for (let i=0;i<dayBuckets.length;i++){
      const b = dayBuckets[i]
      const dayEnd = new Date(b.date.getFullYear(), b.date.getMonth(), b.date.getDate()+1)
      if (d >= b.date && d < dayEnd) {
        b.ratings.push(s.rating)
        break
      }
    }
  })

  const labels = dayBuckets.map(b => {
    try {
      return b.date.toLocaleDateString('es-ES',{weekday:'short'}).replace('.', '')
    } catch (e) {
      return b.date.toLocaleDateString(undefined,{weekday:'short'})
    }
  })
  const averages = dayBuckets.map(b => b.ratings.length ? (b.ratings.reduce((a,c)=>a+c,0)/b.ratings.length) : null)

  const data = { labels, datasets:[{ label:'Media diaria', data:averages, backgroundColor:'#3B82F6' }] }
  const options = { responsive:true, maintainAspectRatio:false, scales:{ y:{ min:0, max:5, ticks:{stepSize:1} } }, plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label: (ctx) => `Media: ${ctx.parsed.y != null ? ctx.parsed.y.toFixed(2) : '—'}` } } } }

  return (<div style={{flex:1, display:'flex'}}><div style={{flex:1}}><Bar data={data} options={options} /></div></div>)
}
