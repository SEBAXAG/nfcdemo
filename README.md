# Cyber NFC Humanoid AI Simulator 🤖✨

Una aplicación interactiva de simulación de tecnología NFC con aparición y articulación de un rostro humanoide 3D compuesto por partículas cuánticas y nodos neurales interconectados, desarrollado con **React**, **Tailwind CSS**, **Node.js** y **Three.js**.

---

## 🚀 Características Principales

1. **Terminal de Escaneo NFC (13.56 MHz)**:
   - **Múltiples Tecnologías NFC**:
     - *NTAG-215 CyberCard* (Tarjeta Inteligente ISO 14443-A)
     - *Bio-Subdermal Chip* (Microchip RFID biocompatible)
     - *Quantum Key Fob* (Llavero token MIFARE DESFire EV3)
     - *Mobile Cyber Wallet* (Emulación HCE de smartphone)
   - **Interacción Táctil y Drag & Drop**: Puedes arrastrar la tarjeta o chip directamente sobre la bobina de inducción electromagnética o pulsar *"Pasar Tecnología por el Lector"*.
   - **Soporte de Web NFC Hardware**: Compatible con la API Web NFC (`NDEFReader`) en navegadores soportados para leer tarjetas físicas reales.
   - **Efectos Acústicos con Web Audio API**: Sonido sintético de barrido de inducción electromagnética (520Hz a 1480Hz), tono de validación y resonancia holográfica.

2. **Rostro Humanoide 3D en Partículas y Nodos Neurales**:
   - Modelado anatómico 3D de alta definición mediante Three.js (cráneo, pómulos, cuencas oculares, puente nasal, labios y línea mandibular).
   - Más de 2,800 partículas luminosas con gradiente de color aditivo.
   - **Lattice de Nodos 3D**: Conexiones de líneas neurales dinámicas entre vértices adyacentes.
   - **Anillos Holográficos Orbitales**: Efecto giroscópico orbital alrededor de la cabeza.
   - **Transición de Convergencia Cuántica**: Antes de escanear, las partículas flotan en el espacio exterior; al pasar el NFC, convergen en una explosión de luz hacia la forma humanoide.

3. **Articulaciones y Gestos Faciales en Vivo**:
   - **Articulación de Mandíbula y Labios (Speech)**: Movimiento coordinado de apertura y vibración bucal en tiempo real sincronizado con la síntesis de voz.
   - **Parpadeo Ocular Orgánico (Blinking)**: Párpados superiores que se cierran y abren de forma natural periódicamente.
   - **Sonrisa y Gestos de Saludo**: Elevación de mejillas y comisuras labiales.
   - **Parallax de Seguimiento de Cursor**: El rostro gira e inclina suavemente la mirada siguiendo el puntero del ratón en 3D.
   - **Respiración Dinámica**: Ondulación senoidal orgánica a través de las partículas.

4. **Síntesis Vocal Inteligente (Web Speech API)**:
   - Saludo con voz natural: **"¡Hola! ¿En qué puedo servirte?"**.
   - Subtítulos holográficos con efecto máquina de escribir (*typewriter*).
   - Barra ecualizadora de espectro vocal animada.
   - Capacidad de ingresar texto personalizado para que el agente humanoide lo articule.

5. **Panel de Personalización Holográfica**:
   - **Matrices de Color**: *Ciber Cyan*, *Esmeralda Neón*, *Violeta Sintetizador*, *Oro Cuántico*.
   - **Selector de Expresiones**: Neutral, Sonrisa, Curioso, Hablar.
   - Botón de repetición de saludo y control de volumen/silencio.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: [React 18](https://react.dev/), [Vite](https://vitejs.dev/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/), PostCSS, Autoprefixer
- **Motor 3D**: [Three.js](https://threejs.org/) (BufferGeometry, Points, LineSegments, Additive Blending)
- **Audio & Voz**: Web Audio API (Sintetizador oscilador analógico) + Web Speech API (`SpeechSynthesis`)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Backend / Servidor**: [Node.js](https://nodejs.org/) (Vite Dev Server + `server.js` con API REST)

---

## 📦 Ejecución y Desarrollo

### Servidor de Desarrollo (Recomendado)
```bash
npm run dev
```
Abre en tu navegador: [http://localhost:5173](http://localhost:5173)

### Servidor Node.js de Producción (con API REST)
```bash
# 1. Compilar el proyecto
npm run build

# 2. Iniciar el servidor Node.js
npm start
```
Abre en tu navegador: [http://localhost:3000](http://localhost:3000)
Endpoints de la API:
- `GET /api/nfc/tags` - Listado de chips y tarjetas registradas
- `GET /api/status` - Estado del núcleo cuántico humanoide
- `POST /api/nfc/simulate-scan` - Validación de lectura NFC
