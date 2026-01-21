import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale } from 'chart.js'
import 'chartjs-adapter-date-fns'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale)

function toDate(s) {
  if (!s) return null
  if (s.toDate) return s.toDate()
  if (s.seconds) return new Date(s.seconds * 1000)
  return new Date(s)
}

export default function DailyLineChart({ sessions, date }) {
  const dayStart = new Date(date)
  dayStart.setHours(0,0,0,0)
  const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate()+1)

  const items = (sessions || []).filter(s => {
    const d = toDate(s.createdAt) || (s.completedAt ? new Date(s.completedAt) : null)
    return d && d >= dayStart && d < dayEnd && s.rating != null
  }).sort((a,b) => (toDate(a.createdAt)||new Date(a.completedAt)) - (toDate(b.createdAt)||new Date(b.completedAt)))

  const labels = items.map(s => toDate(s.createdAt) || new Date(s.completedAt))
  const dataPoints = items.map(s => s.rating)

  const data = {
    labels,
    datasets: [{ label: 'Puntuación', data: dataPoints, borderColor: '#10B981', backgroundColor: '#10B981', tension: 0.2, pointRadius:6 }]
  }

  const options = { responsive:true, maintainAspectRatio:false, scales:{ x:{ type:'time', time:{ unit:'hour', tooltipFormat:'p' } }, y:{ min:0, max:5, ticks:{stepSize:1} } }, plugins:{ legend:{display:false} } }

  return (<div style={{flex:1, display:'flex'}}><div style={{flex:1}}><Line data={data} options={options} /></div></div>)
}
