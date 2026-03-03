# Elevideo - PRD (Product Requirements Document)

## Fecha de Creación
Enero 2026

## Problema Original
Las vistas de pantalla horizontal a vertical pierden parte de la imagen y no se pueden generar shorts automáticamente en vertical. Startups, PyMEs y emprendedores necesitan presencia constante en redes sociales (TikTok, Instagram Reels, YouTube Shorts) para ganar visibilidad, pero no tienen tiempo para editar manualmente.

## Descripción del Negocio
Plataforma SaaS que permite a usuarios subir un video horizontal una sola vez y, con un clic, generar automáticamente:
- Versión vertical (sin perder ninguna parte importante de la imagen, usando smart crop)
- Shorts verticales automáticos o manuales

## Arquitectura

### Frontend
- **Framework**: React 18+ con hooks
- **Routing**: React Router DOM v7
- **State Management**: TanStack Query (caching), Context API (auth, theme)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Forms**: React Hook Form + Zod validation

### Backend (API Externa)
- **API Base**: https://elevideo.onrender.com
- **Auth**: JWT Bearer Token
- **Documentación**: OpenAPI 3.1

## User Personas
1. **Emprendedor/Startup**: Necesita crear contenido para redes sociales rápidamente
2. **PyME**: Equipo pequeño sin editor de video dedicado
3. **Creador de contenido**: Quiere repurposear videos horizontales a vertical

## Funcionalidades Implementadas

### Autenticación
- [x] Login con email/contraseña
- [x] Registro con validación de contraseña compleja
- [x] Recuperación de contraseña (forgot/reset)
- [x] Verificación de email
- [x] Protección de rutas (ProtectedRoute)

### Proyectos
- [x] Lista de proyectos (Dashboard)
- [x] Crear proyecto
- [x] Editar proyecto
- [x] Eliminar proyecto

### Videos
- [x] Lista de videos por proyecto
- [x] Subir video (multipart/form-data)
- [x] Ver detalles de video
- [x] Eliminar video
- [x] Reproducción de video

### Procesamiento
- [x] Formulario de procesamiento con modos:
  - VERTICAL: Video completo a 9:16
  - SHORT_AUTO: Selección automática del mejor segmento
  - SHORT_MANUAL: Especificar inicio y duración
- [x] Opciones de plataforma (TikTok, Instagram, YouTube Shorts)
- [x] Opciones de calidad (Rápido, Normal, Alta)
- [x] Modos de fondo (Smart Crop, Blurred, Black)
- [x] Opciones avanzadas (headroom, smoothing)
- [x] Lista de jobs con estados
- [x] Cancelar job
- [x] Lista de renditions (videos procesados)
- [x] Descargar rendition
- [x] Eliminar rendition

### UX/UI
- [x] Modo claro/oscuro con toggle
- [x] Diseño responsive (mobile-first)
- [x] Fuentes: Outfit (headings) + Inter (body)
- [x] Colores: Monocromático + Electric Blue accent
- [x] Toast notifications (sonner)
- [x] Loading skeletons
- [x] Estados vacíos con ilustraciones

### Perfil
- [x] Ver información de usuario
- [x] Editar nombre/apellido
- [x] Cambiar contraseña

## Estructura de Carpetas
```
/app/frontend/src/
├── api/           # API clients (auth, projects, videos, processing, users)
├── components/    # Reusable components (Layout, ProtectedRoute, ui/)
├── context/       # React contexts (AuthContext, ThemeContext)
├── lib/           # Utilities (cn function)
└── pages/         # Page components (Login, Register, Dashboard, etc.)
```

## Backlog / Próximas Funcionalidades

### P0 (Crítico)
- [ ] Polling mejorado para estado de jobs
- [ ] Preview de rendition antes de descargar

### P1 (Alta prioridad)
- [ ] Búsqueda y filtrado de videos
- [ ] Paginación infinita en listas
- [ ] Notificaciones push cuando termina el procesamiento

### P2 (Media prioridad)
- [ ] Drag & drop para subir videos
- [ ] Bulk processing (procesar múltiples videos)
- [ ] Compartir video directamente a redes sociales
- [ ] Historial de actividad

### P3 (Baja prioridad)
- [ ] Integración con Google Drive/Dropbox
- [ ] Templates de procesamiento guardados
- [ ] Analytics de uso

## Testing
- Testing Agent: 95% passed
- Form validation: 100%
- Routing: 100%
- UI rendering: 100%

## Notas Técnicas
- La API externa (elevideo.onrender.com) puede tener latencia inicial debido a cold start
- Los tokens JWT tienen expiración limitada
- El upload de videos tiene límite de 200MB
