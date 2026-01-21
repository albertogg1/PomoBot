import './SessionController.css'
import { BsSun, BsMoon } from 'react-icons/bs'
import { FaPlay, FaPause, FaRedo, FaForward, FaClock } from 'react-icons/fa'

export default function SessionController({ isRunning, onToggle, onReset, onSkip, isDarkMode, onThemeToggle, onOpenSettings, workDuration, breakDuration }) {
  return (
    <div className={`session-controller ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="controls">
        <button
          className={`control-btn play-pause ${isRunning ? 'playing' : ''}`}
          onClick={onToggle}
          title={isRunning ? 'Pausar' : 'Iniciar'}
        >
          <span className="icon">{isRunning ? <FaPause /> : <FaPlay />}</span>
          <span className="text">{isRunning ? 'Pausar' : 'Iniciar'}</span>
        </button>

        <button
          className="control-btn reset"
          onClick={onReset}
          title="Reiniciar"
        >
          <span className="icon"><FaRedo /></span>
          <span className="text">Reiniciar</span>
        </button>

        <button
          className="control-btn skip"
          onClick={onSkip}
          title="Saltar sesión"
        >
          <span className="icon"><FaForward /></span>
          <span className="text">Saltar</span>
        </button>

        <button
          className="control-btn settings"
          onClick={onOpenSettings}
          title={`Personalizar: ${workDuration}m estudio, ${breakDuration}m descanso`}
        >
          <span className="icon"><FaClock /></span>
          <span className="text">Personalizar</span>
        </button>
      </div>
    </div>
  )
}
