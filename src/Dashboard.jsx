import { useEffect, useState } from 'react'
import { startOfWeek } from 'date-fns'
import { fetchUserSessionsByMonth } from './auth/firebase'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'
// charts: daily, weekly, monthly
import DailyLineChart from './components/DailyLineChart'
import WeeklyBarChart from './components/WeeklyBarChart'
import MonthlyCalendar from './components/MonthlyCalendar'
import PrettyDatePicker from './components/PrettyDatePicker'
import { useMemo } from 'react'
import { FaChevronLeft } from 'react-icons/fa'


export default function Dashboard({ user }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadedMonths, setLoadedMonths] = useState(new Set())
  const navigate = useNavigate()

  const today = new Date()
  const [selectedMonth, setSelectedMonth] = useState(() => ({ year: today.getFullYear(), month: today.getMonth() }))

  // Cargar sesiones del mes seleccionado
  useEffect(() => {
    if (!user) return navigate('/')
    const monthKey = `${selectedMonth.year}-${selectedMonth.month}`
    if (loadedMonths.has(monthKey)) {
      setLoading(false)
      return
    }
    setLoading(true)
    let mounted = true
    fetchUserSessionsByMonth(user.uid, selectedMonth.year, selectedMonth.month).then((items) => {
      if (!mounted) return
      setSessions(prev => {
        // Combinar sesiones evitando duplicados
        const existingIds = new Set(prev.map(s => s.id))
        const newItems = items.filter(s => !existingIds.has(s.id))
        return [...prev, ...newItems]
      })
      setLoadedMonths(prev => new Set(prev).add(monthKey))
      setLoading(false)
    }).catch((e) => {
      console.error(e)
      setLoading(false)
    })
    return () => { mounted = false }
  }, [user, selectedMonth])

  // Filtrar sesiones del mes seleccionado para estadísticas
  const sessionsOfMonth = useMemo(() => sessions.filter(s => {
    const ts = s.createdAt?.toDate ? s.createdAt.toDate() : (s.createdAt && s.createdAt.seconds ? new Date(s.createdAt.seconds * 1000) : null)
    if (!ts) return false
    return ts.getFullYear() === selectedMonth.year && ts.getMonth() === selectedMonth.month
  }), [sessions, selectedMonth])

  const totalMinutes = sessionsOfMonth.reduce((sum, s) => sum + (s.duration || 0), 0) / 60
  const totalSessions = sessionsOfMonth.length

  const [selectedDay, setSelectedDay] = useState(new Date())
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => {
    const d = new Date()
    const start = startOfWeek(d, { weekStartsOn: 1 })
    start.setHours(0,0,0,0)
    return start
  })
  const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
  const sessionsToday = sessionsOfMonth.filter(s => {
    const ts = s.createdAt?.toDate ? s.createdAt.toDate() : (s.createdAt && s.createdAt.seconds ? new Date(s.createdAt.seconds * 1000) : null)
    return ts ? isSameDay(ts, today) : false
  }).length

  // Sesiones recientes: solo las de las últimas 24 horas
  const recentSessions = useMemo(() => {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    return sessions.filter(s => {
      const ts = s.createdAt?.toDate ? s.createdAt.toDate() : (s.createdAt && s.createdAt.seconds ? new Date(s.createdAt.seconds * 1000) : null)
      return ts && ts >= oneDayAgo
    }).sort((a, b) => {
      const tsA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.createdAt && a.createdAt.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(0))
      const tsB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.createdAt && b.createdAt.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(0))
      return tsB - tsA
    })
  }, [sessions])

  const scoresForSelectedDay = useMemo(() => sessions.filter(s => {
    const ts = s.createdAt?.toDate ? s.createdAt.toDate() : (s.createdAt && s.createdAt.seconds ? new Date(s.createdAt.seconds * 1000) : (s.completedAt ? new Date(s.completedAt) : null))
    return ts ? isSameDay(ts, selectedDay) : false
  }), [sessions, selectedDay])

  const onPrevDay = () => { const d = new Date(selectedDay); d.setDate(d.getDate()-1); setSelectedDay(d) }
  const onNextDay = () => { const d = new Date(selectedDay); d.setDate(d.getDate()+1); setSelectedDay(d) }
  const onPrevWeek = () => { const d = new Date(selectedWeekStart); d.setDate(d.getDate()-7); setSelectedWeekStart(d) }
  const onNextWeek = () => { const d = new Date(selectedWeekStart); d.setDate(d.getDate()+7); setSelectedWeekStart(d) }
  const onPrevMonth = () => { const m = selectedMonth.month === 0 ? 11 : selectedMonth.month-1; const y = selectedMonth.month === 0 ? selectedMonth.year-1 : selectedMonth.year; setSelectedMonth({year:y, month:m}) }
  const onNextMonth = () => { const m = selectedMonth.month === 11 ? 0 : selectedMonth.month+1; const y = selectedMonth.month === 11 ? selectedMonth.year+1 : selectedMonth.year; setSelectedMonth({year:y, month:m}) }

  const getRatingColor = (r) => {
    if (r == null) return 'inherit'
    switch (Math.round(r)) {
      case 1: return '#ef4444' // red
      case 2: return '#f97316' // orange
      case 3: return '#f59e0b' // yellow
      case 4: return '#84cc16' // lime
      case 5: return '#10B981' // green
      default: return '#d97706'
    }
  }

  // when selectedDay changes, sync week and month selectors
  useEffect(() => {
    if (!selectedDay) return
    const wk = startOfWeek(selectedDay, { weekStartsOn: 1 })
    wk.setHours(0,0,0,0)
    // avoid unnecessary state updates
    if (!selectedWeekStart || wk.getTime() !== new Date(selectedWeekStart).getTime()) {
      setSelectedWeekStart(wk)
    }
    const m = { year: selectedDay.getFullYear(), month: selectedDay.getMonth() }
    if (!selectedMonth || m.year !== selectedMonth.year || m.month !== selectedMonth.month) {
      setSelectedMonth(m)
    }
  }, [selectedDay])

  // compute number of visible weeks for selectedMonth so charts can remount when calendar height changes
  const getWeeksCount = (m) => {
    if (!m) return 0
    const first = new Date(m.year, m.month, 1)
    const startDay = new Date(first); startDay.setDate(first.getDate() - first.getDay())
    const lastOfMonth = new Date(m.year, m.month + 1, 0)
    const lastVisible = new Date(lastOfMonth); lastVisible.setDate(lastOfMonth.getDate() + (6 - lastOfMonth.getDay()))
    const totalDays = Math.round((lastVisible - startDay) / (1000 * 60 * 60 * 24)) + 1
    return Math.ceil(totalDays / 7)
  }
  const calendarWeeks = getWeeksCount(selectedMonth)

  return (
    <div className="dashboard-root">
      <main className="main" style={{width: '100%'}}>
        <header className="topbar">
          <div className="topbar-left">
            <button className="settings-btn cancel" onClick={() => navigate(-1)}>
              <span className="btn-icon"><FaChevronLeft /></span>
              <span className="btn-text">Volver</span>
            </button>
            <h2>Rendimiento </h2>
          </div>
          <div className="topbar-right">
            <span className="greeting">Hola, {user?.displayName || 'Usuario'}</span>
          </div>
        </header>

        <div className="container">
          {loading ? (
            <div className="loading">Cargando...</div>
          ) : (
            <>
              <section className="parent">
                <div className="card stat div1">
                  <div className="label">Total sesiones</div>
                  <div className="value">{totalSessions}</div>
                </div>
                <div className="card stat div2">
                  <div className="label">Tiempo total (min)</div>
                  <div className="value">{Math.round(totalMinutes)}</div>
                </div>
                <div className="card stat div3">
                  <div className="label">Promedio sesión (min)</div>
                  <div className="value">{totalSessions ? Math.round(totalMinutes / totalSessions) : 0}</div>
                </div>
                <div className="card stat div4">
                  <div className="label">Sesiones hoy</div>
                  <div className="value">{sessionsToday}</div>
                </div>
                <div className="card recent div5">
                  <h3>Sesiones recientes</h3>
                  {recentSessions.length === 0 ? (
                    <div className="empty">No hay sesiones en las últimas 24 horas.</div>
                  ) : (
                    <div className="sessions-scroll">
                      <table className="sessions-table">
                      <thead>
                        <tr>
                          <th>Hora</th>
                          <th>Duración (min)</th>
                          <th>Puntuación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentSessions.map(s => {
                          const created = s.createdAt?.toDate ? s.createdAt.toDate() : (s.createdAt && s.createdAt.seconds ? new Date(s.createdAt.seconds * 1000) : new Date())
                          const time = created.toLocaleTimeString()
                          const duration = Math.round((s.duration || 0) / 60)
                          const rating = s.rating != null ? `${s.rating}/5` : '—'
                          const ratingColor = s.rating != null ? getRatingColor(s.rating) : undefined
                          return (
                            <tr key={s.id}>
                              <td>{time}</td>
                              <td>{duration}</td>
                              <td className="rating-cell" style={{color: ratingColor, fontWeight: 700}}>{rating}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>

              {/* recent section moved into parent grid as div5 */}

              <section className="content">
                <div className="card chart">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <h3>Día</h3>
                    <div>
                      <PrettyDatePicker mode="day" value={selectedDay} onChange={(d)=> setSelectedDay(d)} />
                    </div>
                  </div>
                  <DailyLineChart key={`w${calendarWeeks}`} sessions={sessions} date={selectedDay} />
                </div>

                <div className="card chart">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <h3>Semana</h3>
                    <div>
                      <PrettyDatePicker mode="week" value={selectedWeekStart} onChange={(d)=> setSelectedWeekStart(d)} />
                    </div>
                  </div>
                  <WeeklyBarChart key={`w${calendarWeeks}`} sessions={sessions} weekStart={selectedWeekStart} />
                </div>

                <div className="card chart">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <h3>Mes</h3>
                    <div>
                      <PrettyDatePicker mode="month" value={selectedMonth} onChange={(m)=> setSelectedMonth(m)} />
                    </div>
                  </div>
                  <MonthlyCalendar key={`w${calendarWeeks}`} sessions={sessions} year={selectedMonth.year} month={selectedMonth.month} onDayClick={(d)=> setSelectedDay(d)} />
                </div>

              </section>


            </>
          )}
        </div>
      </main>
    </div>
  )
}
