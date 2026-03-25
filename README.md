# Sueñogram 🌌

Sueñogram es una aplicación web interactiva que permite a los usuarios registrar sus sueños en un mapa mundial. Elige una ubicación geográfica que resuene con tu sueño, descríbelo y nuestra IA generará una representación visual surrealista única de tu experiencia onírica.

## Características Principales ✨
- 🗺️ **Mapa Interactivo:** Explora sueños de personas alrededor del mundo usando un globo terráqueo estilizado (Leaflet).
- ✍️ **Registro de Sueños:** Añade tus propios sueños especificando nombre, fecha y una descripción vívida.
- 🎨 **Arte Generado por IA:** Mediante la integración de los modelos generativos de Google, las descripciones de los sueños cobran vida visualmente.
- 🎵 **Ambiente Inmersivo:** Acompañamiento musical etéreo para una experiencia completa (AudioPlayer integrado).
- 🔐 **Autenticación Segura:** Sistema de inicio de sesión impulsado por Firebase Authentication (Google).

## Tecnologías Utilizadas 🛠️

- **Frontend:** React, TypeScript, Vite
- **Estilos:** Tailwind CSS, Lucide React (para iconos)
- **Mapas:** React Leaflet
- **Animaciones:** Motion (Framer Motion)
- **Backend / Base de datos:** Firebase (Firestore & Auth)
- **Inteligencia Artificial:** `@google/genai` (Gemini Flash-Image para generación artística)

## Instalación y Ejecución Local 🚀

1. **Clonar el repositorio** (si aplica)
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd suenogram
   ```

2. **Instalar dependencias**
   Asegúrate de tener Node.js instalado, luego ejecuta:
   ```bash
   npm install
   ```

3. **Configuración de Variables de Entorno**
   - Crea un archivo `.env` en la raíz del proyecto.
   - Añade tu clave de API para Gemini:
     ```env
     GEMINI_API_KEY=tu_api_key_aqui
     ```
   - Asegúrate de que los archivos de configuración de Firebase (`firebase-applet-config.json` u otros) tengan la información correcta de tu base de datos y autenticación si planeas usar tu propio backend.

4. **Iniciar el Servidor de Desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el Navegador**
   Navega a la URL local (por lo general `http://localhost:5173`) para ver la aplicación en acción.

## Estructura del Proyecto 📁

```text
src/
├── components/          # Componentes de React (Map, Modals, AudioPlayer, AuthButton)
├── data/                # Datos simulados (mockDreams) y assets (musica.mp3)
├── services/            # Servicios externos (Llamadas a la IA en ai.ts)
├── App.tsx              # Componente raíz y lógica principal
├── firebase.ts          # Configuración e inicialización de Firebase
├── index.css            # Estilos globales y configuración de Tailwind
└── main.tsx             # Punto de entrada de React
```

## Contribución 🤝
¡Las contribuciones son bienvenidas! Siéntete libre de abrir *issues* (problemas) y *pull requests* (solicitudes de extracción) para proponer mejoras o correcciones de errores.

## Licencia 📄
Este proyecto permite su uso personal y educativo. *Desarrollado originalmente por Abejorro Digital.*
