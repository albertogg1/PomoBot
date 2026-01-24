import { useState } from 'react'
import './RatingModal.css'

export default function RatingModal({ onSubmit, onClose, sessionType }) {
  const [rating, setRating] = useState(0)

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating)
      setRating(0)
    }
  }

  const label = sessionType === 'work' 
    ? '¿Cómo de productivo fue este pomodoro?' 
    : '¿Cuánto de descansado te sientes?'

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal">
        <h2>Evalúa tu sesión</h2>
        <p>{label}</p>
        
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              className={`star ${rating >= num ? 'active' : ''}`}
              onClick={() => setRating(num)}
              title={`${num} - ${num === 1 ? 'Muy bajo' : num === 5 ? 'Muy alto' : 'Medio'}`}
            >
              ★
            </button>
          ))}
        </div>

        {rating > 0 && <div className="rating-text">Calificación: {rating} / 5</div>}

        <div className="rating-buttons">
          <button 
            className="btn-submit" 
            onClick={handleSubmit}
            disabled={rating === 0}
          >
            Guardar
          </button>
          <button 
            className="btn-cancel" 
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
