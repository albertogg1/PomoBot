<div align="center">
  <img src="src/assets/pomodoro.webp" alt="PomoBot Logo" width="120" />
  <h1>PomoBot</h1>
  <p><strong>Tu compañero de estudio con la técnica Pomodoro</strong></p>
  
  <a href="https://pomo-bot.vercel.app">Anímate a probar la app</a>
</div>

---

## 📖 ¿Qué es PomoBot?

**PomoBot** es una aplicación web gratuita diseñada para estudiantes que quieren mejorar su concentración y productividad utilizando la **técnica Pomodoro**.

La técnica Pomodoro divide el tiempo de estudio en bloques de trabajo intenso (por defecto 50 minutos) seguidos de descansos cortos (10 minutos). Esta metodología está científicamente respaldada para mejorar la retención de información y reducir la fatiga mental.

---

## ✨ Características principales

| Característica | Descripción |
|----------------|-------------|
| 🕐 **Reloj Flip Clock** | Interfaz visual elegante |
| ⏱️ **Temporizador personalizable** | Configura los minutos de trabajo y descanso según tus necesidades |
| 🔔 **Notificaciones de audio** | Melodías suaves al finalizar cada sesión para no perder el ritmo |
| 🎵 **Música ambiental** | Reproduce música Lo-Fi de fondo para ayudarte a concentrarte |
| 🌙 **Modo claro/oscuro** | Cambia entre temas para cuidar tu vista según la hora del día |
| 📊 **Dashboard de rendimiento** | Visualiza tus estadísticas: sesiones completadas, horas de estudio, racha diaria |
| ⭐ **Valoración de sesiones** | Califica cada sesión de estudio para hacer seguimiento de tu productividad |
| ☁️ **Sincronización en la nube** | Inicia sesión con Google para guardar tu progreso en cualquier dispositivo |
| 📱 **100% Responsive** | Funciona perfectamente en móvil, tablet y escritorio |

---

## 🚀 Cómo usar PomoBot

### 1. Inicia tu sesión de estudio
Pulsa el botón **Play ▶️** para comenzar el temporizador. La app empezará a contar el tiempo de tu sesión de trabajo.

### 2. Concéntrate en tu tarea
Mientras el reloj corre, enfócate únicamente en tu tarea de estudio. Puedes activar la música ambiental 🎵 para mejorar tu concentración.

### 3. Toma tu descanso
Cuando suene la melodía, ¡es hora de descansar! El temporizador cambiará automáticamente al modo descanso.

### 4. Repite el ciclo
Después del descanso, vuelve al trabajo. Cada 4 ciclos puedes tomar un descanso más largo.

### 5. Revisa tu progreso
Si inicias sesión, podrás ver tu **Dashboard** con:
- 📈 Gráfico de actividad semanal
- 📅 Calendario mensual con tu historial
- 🔥 Racha de días consecutivos estudiando
- ⏰ Total de horas de estudio

---

## ⚙️ Personalización

Haz clic en el icono de **engranaje ⚙️** para ajustar:

- **Tiempo de trabajo**: 1-60 minutos (por defecto: 25 min)
- **Tiempo de descanso**: 1-60 minutos (por defecto: 5 min)

Tus preferencias se guardan automáticamente en tu cuenta.

---

## 🔐 Cuenta y sincronización

PomoBot ofrece inicio de sesión con **Google** para:

- Guardar tus preferencias de tiempo
- Sincronizar tu progreso entre dispositivos
- Acceder a tu historial y estadísticas

> 💡 **Tip**: Puedes usar la app sin cuenta, pero tus datos solo se guardarán en ese navegador.

---

## 🛠️ Tecnologías utilizadas

- **React 18** — Interfaz de usuario reactiva
- **Vite** — Empaquetador ultrarrápido
- **Firebase Auth** — Autenticación segura con Google
- **Cloud Firestore** — Base de datos en tiempo real
- **Vercel** — Hosting y despliegue continuo
- **CSS3 Animations** — Efectos visuales fluidos

---

## 💻 Instalación local (desarrolladores)

```bash
# Clonar el repositorio
git clone https://github.com/albertogg1/PomoBot.git
cd PomoBot

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crea un archivo .env con tus credenciales de Firebase:
# VITE_FIREBASE_API_KEY=...
# VITE_FIREBASE_AUTH_DOMAIN=...
# VITE_FIREBASE_PROJECT_ID=...
# VITE_FIREBASE_STORAGE_BUCKET=...
# VITE_FIREBASE_MESSAGING_SENDER_ID=...
# VITE_FIREBASE_APP_ID=...

# Ejecutar en modo desarrollo
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## 📁 Estructura del proyecto

```
src/
├── auth/
│   └── firebase.js          # Configuración de Firebase y funciones de auth
├── components/
│   ├── FlipClock.jsx        # Reloj con animación flip
│   ├── SessionController.jsx # Botones de control
│   ├── RatingModal.jsx      # Modal de valoración de sesión
│   ├── MonthlyCalendar.jsx  # Calendario del dashboard
│   ├── DailyLineChart.jsx   # Gráfico de líneas
│   └── WeeklyBarChart.jsx   # Gráfico de barras semanal
├── App.jsx                  # Componente principal
├── Dashboard.jsx            # Página de estadísticas
└── main.jsx                 # Punto de entrada
```

---

## 🤝 Contribuciones

¿Tienes ideas para mejorar PomoBot? ¡Las contribuciones son bienvenidas!

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcion`)
3. Commit tus cambios (`git commit -m 'Añade nueva función'`)
4. Push a la rama (`git push origin feature/nueva-funcion`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT.

---

<div align="center">
  <p>Hecho con ❤️ para estudiantes que quieren alcanzar sus metas</p>
  <p><strong>¡Buena suerte con tus estudios! 📚</strong></p>
</div>
