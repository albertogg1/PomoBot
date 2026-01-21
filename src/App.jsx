import { useState, useEffect, useRef } from 'react'
import { GiTomato } from 'react-icons/gi'
import { FaCoffee, FaClock, FaMusic, FaVolumeMute, FaGoogle, FaApple, FaSignOutAlt, FaUser } from 'react-icons/fa'
import { BsSun, BsMoon } from 'react-icons/bs'
import FlipClock from './components/FlipClock'
import SessionController from './components/SessionController'
import RatingModal from './components/RatingModal'
import './App.css'
import { signInWithGoogle, signInWithApple, signOutUser, onAuthChange, saveUserPreferences, loadUserPreferences, createUserWithEmail, signInWithEmail } from './auth/firebase'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Dashboard from './Dashboard'
import { saveStudySession } from './auth/firebase'

function App() {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionType, setSessionType] = useState('work') // 'work' or 'break'
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const v = localStorage.getItem('isDarkMode')
      return v !== null ? JSON.parse(v) : true
    } catch (e) {
      return true
    }
  })
  const [prefsLoaded, setPrefsLoaded] = useState(false)
  const [workDuration, setWorkDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [showSettings, setShowSettings] = useState(false)
  const [ytPlaying, setYtPlaying] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [tempWork, setTempWork] = useState(String(workDuration))
  const [tempBreak, setTempBreak] = useState(String(breakDuration))
  const [user, setUser] = useState(null)
  const [showAuthPopup, setShowAuthPopup] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authMode, setAuthMode] = useState('signin') // 'signin' or 'signup'
  const [authError, setAuthError] = useState(null)

  const [showAuthMenu, setShowAuthMenu] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [lastSessionType, setLastSessionType] = useState('work')
  // dashboard navigation handled via router

  const totalRef = useRef(workDuration * 60)
  const authButtonRef = useRef(null)
  const authMenuRef = useRef(null)
  const sessionTypeRef = useRef(sessionType)
  const breakDurationRef = useRef(breakDuration)
  const workDurationRef = useRef(workDuration)
  // tone preview parameters
  const [workFreqs, setWorkFreqs] = useState([880,1040,1318])
  const [workVol, setWorkVol] = useState(0.32)
  

  

  // keep refs in sync
  useEffect(() => { totalRef.current = minutes * 60 + seconds }, [minutes, seconds])
  useEffect(() => { sessionTypeRef.current = sessionType }, [sessionType])
  useEffect(() => { breakDurationRef.current = breakDuration }, [breakDuration])
  useEffect(() => { workDurationRef.current = workDuration }, [workDuration])

  useEffect(() => {
    let interval = null

    if (isRunning) {
      // ensure totalRef has correct value
      totalRef.current = minutes * 60 + seconds

      interval = setInterval(() => {
        if (totalRef.current > 0) {
          totalRef.current -= 1
          const m = Math.floor(totalRef.current / 60)
          const s = totalRef.current % 60
          setMinutes(m)
          setSeconds(s)
        } else {
          // reached 00:00 -> transition to next session
          playEndSound(sessionTypeRef.current)

          // save completed work session (prompt for rating)
          try {
            if (sessionTypeRef.current === 'work' && user) {
              // show rating modal before saving
              setLastSessionType('work')
              setShowRatingModal(true)
            }
          } catch (e) { console.warn(e) }

          if (sessionTypeRef.current === 'work') {
            setSessionsCompleted((prev) => prev + 1)
            setSessionType('break')
            const next = breakDurationRef.current * 60
            totalRef.current = next
            setMinutes(Math.floor(next / 60))
            setSeconds(next % 60)
            setIsRunning(true)
          } else {
            setSessionType('work')
            const next = workDurationRef.current * 60
            totalRef.current = next
            setMinutes(Math.floor(next / 60))
            setSeconds(next % 60)
            setIsRunning(true)
          }
        }
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning])

  // Auth state listener: load preferences when user logs in
  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      setUser(u)
      if (u) {
        try {
          const prefs = await loadUserPreferences(u.uid)
          if (prefs) {
            if (typeof prefs.workDuration === 'number') setWorkDuration(prefs.workDuration)
            if (typeof prefs.breakDuration === 'number') setBreakDuration(prefs.breakDuration)
            if (typeof prefs.isDarkMode === 'boolean') setIsDarkMode(prefs.isDarkMode)
          }
        } catch (e) {
          console.warn('Could not load user preferences', e)
        }
      }
      // mark that preferences have been loaded (or attempted)
      setPrefsLoaded(true)
    })
    return () => unsub && unsub()
  }, [])

  // Save preferences when user is signed in
  useEffect(() => {
    // do not save until we have loaded existing preferences to avoid overwriting them
    if (!user || !prefsLoaded) return
    const prefs = { workDuration, breakDuration, isDarkMode }
    saveUserPreferences(user.uid, prefs).catch((e) => console.warn('Save prefs failed', e))
  }, [user, workDuration, breakDuration, isDarkMode])

  // close auth menu when clicking outside
  useEffect(() => {
    if (!showAuthMenu) return
    function onDocClick(e) {
      if (!authMenuRef.current) return
      if (authMenuRef.current.contains(e.target)) return
      if (authButtonRef.current && authButtonRef.current.contains(e.target)) return
      setShowAuthMenu(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [showAuthMenu])

  // persist theme choice to localStorage for all users
  useEffect(() => {
    try {
      localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode))
    } catch (e) {}
  }, [isDarkMode])

  const openDashboard = async () => {
    setShowAuthMenu(false)
    if (!user) return
    navigate('/dashboard')
  }

  const handleSignInGoogle = async () => {
    try { await signInWithGoogle() } catch (e) { console.error(e) }
  }

  const handleSignInApple = async () => {
    try { await signInWithApple() } catch (e) { console.error(e) }
  }

  const handleSignOut = async () => {
    try { await signOutUser(); setUser(null) } catch (e) { console.error(e) }
  }

  const handleEmailSignUp = async () => {
    setAuthError(null)
    try {
      await createUserWithEmail(authEmail, authPassword)
      setShowAuthPopup(false)
    } catch (e) {
      setAuthError(e.message || String(e))
    }
  }

  const handleEmailSignIn = async () => {
    setAuthError(null)
    try {
      await signInWithEmail(authEmail, authPassword)
      setShowAuthPopup(false)
    } catch (e) {
      setAuthError(e.message || String(e))
    }
  }

  const playEndSound = (type) => {
    if (!soundEnabled) return
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      const ac = new AudioCtx()
      if (ac.state === 'suspended' && ac.resume) ac.resume()

      const now = ac.currentTime
      const masterGain = ac.createGain()
      masterGain.connect(ac.destination)

      // Different melodies for work end vs break end
      // use configured workFreqs for both work and break (break = reversed)
      const freqs = type === 'work' ? workFreqs : [...workFreqs].reverse()
      let offset = 0
      freqs.forEach((f) => {
        const o = ac.createOscillator()
        const g = ac.createGain()
        o.type = 'sine'
        o.frequency.value = f
        o.connect(g)
        g.connect(masterGain)

        const dur = 0.16
        const start = now + offset
        g.gain.setValueAtTime(0.0001, start)
        g.gain.linearRampToValueAtTime(workVol, start + 0.01)
        g.gain.exponentialRampToValueAtTime(0.001, start + dur)

        o.start(start)
        o.stop(start + dur + 0.02)
        offset += dur
      })
    } catch (e) {
      try {
        const beep = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=')
        beep.play().catch(() => {})
      } catch (_) {}
    }
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setSessionType('work')
    setMinutes(workDuration)
    setSeconds(0)
  }

  const skipSession = () => {
    if (sessionType === 'work') {
      setSessionsCompleted((prev) => prev + 1)
      setSessionType('break')
      setMinutes(breakDuration)
    } else {
      setSessionType('work')
      setMinutes(workDuration)
    }
    setSeconds(0)
    setIsRunning(false)
  }

  const handleSettingsChange = (newWorkDuration, newBreakDuration) => {
    setWorkDuration(newWorkDuration)
    setBreakDuration(newBreakDuration)
    setIsRunning(false)
    setSessionType('work')
    setMinutes(newWorkDuration)
    setSeconds(0)
    setShowSettings(false)
  }

  const navigate = useNavigate()

  const handleRatingSubmit = (rating) => {
    // Save session with rating
    if (user) {
      const durationSec = workDurationRef.current * 60
      const now = new Date()
      saveStudySession(user.uid, {
        type: 'work',
        duration: durationSec,
        rating: rating,
        completedAt: now.toISOString(),
        meta: { rating: rating }
      }).catch((e) => console.warn('saveStudySession failed', e))
    }
    setShowRatingModal(false)
  }

  const handleRatingClose = () => {
    setShowRatingModal(false)
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard user={user} />} />
      <Route path="/" element={(
        <div className={`app-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="header-info">
        <div className="session-info">
          <span className={`session-badge ${sessionType}`}>
            {sessionType === 'work' ? <><GiTomato style={{marginRight:6, color:'#ff6b35'}} />Trabajo</> : <><FaCoffee style={{marginRight:6, color:'#8B5E3C'}} />Descanso</>}
          </span>
          <span className="sessions-count">Sesiones: {sessionsCompleted}</span>
        </div>
        
      </div>
      {/* Top-right auth button */}
      <button
        ref={authButtonRef}
        className={`auth-button ${isDarkMode ? 'dark' : 'light'}`}
        onClick={() => {
          if (user) setShowAuthMenu((s) => !s)
          else setShowAuthPopup(true)
        }}
        aria-label={user ? 'Cuenta' : 'Iniciar sesión'}
        style={{position: 'fixed', right: 18, top: 12, zIndex:1200}}
      >
        {user && user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || 'avatar'} className="auth-avatar" />
        ) : (
          <FaUser size={18} />
        )}
      </button>
        
      {showAuthMenu && user && (
        <div ref={authMenuRef} className={`auth-menu ${isDarkMode ? 'dark' : 'light'}`} style={{position:'fixed', right:18, top:12}}>
          <div className="auth-menu-user">
            {user.photoURL ? <img src={user.photoURL} alt="avatar" className="auth-avatar-sm" /> : <FaUser />}
            <div style={{marginLeft:8}}>
              <div style={{fontSize:13, fontWeight:600}}>{user.displayName || user.email}</div>
              {user.email && <div style={{fontSize:12, color:'#999'}}>{user.email}</div>}
            </div>
          </div>
          <div style={{marginTop:10}}>
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              <span className="perf-text" onClick={() => { openDashboard(); setShowAuthMenu(false) }}>Rendimiento</span>
              <span className="perf-text" onClick={() => { setShowSettings(true); setShowAuthMenu(false) }}>Ajustes</span>
              <button className="logout-btn" onClick={async () => { await handleSignOut(); setShowAuthMenu(false) }}>
                <FaSignOutAlt /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      

      <FlipClock minutes={minutes} seconds={seconds} sessionType={sessionType} isDarkMode={isDarkMode} />

        <div className="footer-controls">
        {/* Left: theme toggle */}
        <button
          className={`theme-toggle ${isDarkMode ? 'dark' : 'light'}`}
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
          aria-label={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
        >
          {isDarkMode ? <BsSun className="theme-icon" size={20} /> : <BsMoon className="theme-icon" size={20} />}
        </button>

        <SessionController
          isRunning={isRunning}
          onToggle={toggleTimer}
          onReset={resetTimer}
          onSkip={skipSession}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
          onOpenSettings={() => {
            setTempWork(String(workDuration))
            setTempBreak(String(breakDuration))
            setShowSettings(true)
          }}
          workDuration={workDuration}
          breakDuration={breakDuration}
        />
        {/* Right: yt-button */}
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <button
            className={`yt-button ${ytPlaying ? 'playing' : ''} ${isDarkMode ? 'dark' : 'light'}`}
            onClick={() => setYtPlaying((p) => !p)}
            aria-label={ytPlaying ? 'Detener música' : 'Reproducir música'}
          >
            {ytPlaying ? <FaVolumeMute size={18} /> : <FaMusic size={20} />}
          </button>
        </div>

      </div>

      {showSettings && (
        <div className="settings-modal" onClick={() => setShowSettings(false)}>
          <div className="settings-content" onClick={(e) => e.stopPropagation()}>
            <h2>⏱️ Personalizar tiempos</h2>
            <div className="settings-group">
              <label>Tiempo de estudio (minutos):</label>
              <input
                type="number"
                min="1"
                max="60"
                value={tempWork}
                onChange={(e) => setTempWork(e.target.value)}
              />
            </div>
            <div className="settings-group">
              <label>Tiempo de descanso (minutos):</label>
              <input
                type="number"
                min="1"
                max="60"
                value={tempBreak}
                onChange={(e) => setTempBreak(e.target.value)}
              />
            </div>
            <div className="settings-buttons">
              <button className="settings-btn save" onClick={() => handleSettingsChange(Math.max(1, parseInt(tempWork) || 25), Math.max(1, parseInt(tempBreak) || 5))}>
                Guardar
              </button>
              <button className="settings-btn cancel" onClick={() => setShowSettings(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuthPopup && (
        <div className="auth-modal" onClick={() => setShowAuthPopup(false)}>
          <div className="auth-content" onClick={(e) => e.stopPropagation()}>
            <h2>{authMode === 'signin' ? 'Iniciar sesión' : 'Registrarse'}</h2>
            {authError && <div style={{color:'salmon', marginBottom:8}}>{authError}</div>}
            <div className="settings-group">
              <label>Email</label>
              <input type="email" value={authEmail} onChange={(e)=> setAuthEmail(e.target.value)} />
            </div>
            <div className="settings-group">
              <label>Contraseña</label>
              <input type="password" value={authPassword} onChange={(e)=> setAuthPassword(e.target.value)} />
            </div>
            <div style={{display:'flex', gap:8, marginTop:10}}>
              {authMode === 'signin' ? (
                <button className="settings-btn save" onClick={handleEmailSignIn}>Iniciar</button>
              ) : (
                <button className="settings-btn save" onClick={handleEmailSignUp}>Crear cuenta</button>
              )}
              <button className="settings-btn cancel" onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}>{authMode === 'signin' ? 'Crear cuenta' : '¿Ya tienes cuenta?'}</button>
            </div>

            <div style={{marginTop:12, display:'flex', gap:8, flexDirection:'column'}}>
              <button className="control-btn" onClick={handleSignInGoogle}><FaGoogle /> Google</button>
              <button className="control-btn" onClick={handleSignInApple}><FaApple /> Apple</button>
            </div>
          </div>
        </div>
      )}

      {showRatingModal && (
        <RatingModal 
          onSubmit={handleRatingSubmit}
          onClose={handleRatingClose}
          sessionType={lastSessionType}
        />
      )}

      

      {/* YouTube music toggle is now inside the footer-controls */}

      {/* Hidden iframe to keep playback alive without foreground overlay */}
      {ytPlaying && (
        <div style={{display: 'none'}} aria-hidden="true">
          <iframe
            title="YouTube Live Hidden"
            src="https://www.youtube.com/embed/XSXEaikz0Bc?autoplay=1&controls=0&rel=0"
            frameBorder="0"
            allow="autoplay; encrypted-media"
          />
        </div>
      )}
        </div>
      )} />
    </Routes>
  )
}

export default App
