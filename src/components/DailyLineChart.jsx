import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale, Filler } from 'chart.js'
import 'chartjs-adapter-date-fns'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale, Filler)

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


  // Segment styling: línea gris y discontinua si hay más de 2h entre puntos
  const TWO_HOURS = 2 * 60 * 60 * 1000;
  const dataset = {
    label: 'Puntuación',
    data: dataPoints,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16,185,129,0.18)', // verde con opacidad
    fill: true,
    tension: 0,
    pointRadius: 3,
    segment: {
      borderColor: (ctx) => {
        const i = ctx.p0DataIndex;
        if (i < 0 || i >= labels.length - 1) return '#10B981';
        const t0 = labels[i]?.getTime?.() || new Date(labels[i]).getTime();
        const t1 = labels[i+1]?.getTime?.() || new Date(labels[i+1]).getTime();
        return (t1 - t0 > TWO_HOURS) ? '#fff' : '#10B981';
      },
      borderDash: (ctx) => {
        const i = ctx.p0DataIndex;
        if (i < 0 || i >= labels.length - 1) return undefined;
        const t0 = labels[i]?.getTime?.() || new Date(labels[i]).getTime();
        const t1 = labels[i+1]?.getTime?.() || new Date(labels[i+1]).getTime();
        return (t1 - t0 > TWO_HOURS) ? [6,6] : undefined;
      }
    }
  };

  const data = {
    labels,
    datasets: [dataset]
  }

  const options = { responsive:true, maintainAspectRatio:false, scales:{ x:{ type:'time', time:{ unit:'hour', tooltipFormat:'p' } }, y:{ min:0, max:5, ticks:{stepSize:1} } }, plugins:{ legend:{display:false} } }

  return (<div style={{flex:1, display:'flex'}}><div style={{flex:1}}><Line data={data} options={options} /></div></div>)
}
