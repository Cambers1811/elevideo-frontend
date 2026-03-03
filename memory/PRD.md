# Elevideo - PRD (Product Requirements Document)

## Fecha de Última Actualización
Marzo 2026

## Problema Original
Las vistas de pantalla horizontal a vertical pierden parte de la imagen y no se pueden generar shorts automáticamente en vertical. Startups, PyMEs y emprendedores necesitan presencia constante en redes sociales (TikTok, Instagram Reels, YouTube Shorts) para ganar visibilidad, pero no tienen tiempo para editar manualmente.

## Descripción del Negocio
Plataforma SaaS que permite a usuarios subir un video horizontal una sola vez y, con un clic, generar automáticamente:
- Versión vertical (sin perder ninguna parte importante de la imagen, usando smart crop)
- Shorts verticales automáticos o manuales

## Arquitectura

### Frontend (Tecnologías)
- **Framework**: React 18+ con hooks
- **Routing**: React Router DOM v7
- **State Management**: TanStack Query (caching), Context API (auth, theme)
- **Styling**: Tailwind CSS + shadcn/ui + CSS custom con gradientes y glassmorphism
- **Forms**: React Hook Form + Zod validation
- **Notificaciones**: Web Notifications API (push del navegador)

### Backend (API Externa)
- **API Base**: https://elevideo.onrender.com
- **Auth**: JWT Bearer Token
- **Documentación**: OpenAPI 3.1

## User Personas
1. **Emprendedor/Startup**: Necesita crear contenido para redes sociales rápidamente
2. **PyME**: Equipo pequeño sin editor de video dedicado
3. **Creador de contenido**: Quiere repurposear videos horizontales a vertical

## Funcionalidades Implementadas

### ✅ Autenticación
- [x] Login con email/contraseña (diseño premium)
- [x] Registro con validación de contraseña compleja + indicadores visuales de fortaleza
- [x] Recuperación de contraseña (forgot/reset)
- [x] Verificación de email
- [x] Protección de rutas (ProtectedRoute)

### ✅ Proyectos
- [x] Lista de proyectos con cards 3D animadas
- [x] Crear proyecto con modal elegante
- [x] Editar proyecto
- [x] Eliminar proyecto con confirmación
- [x] Stats de proyectos y videos

### ✅ Videos
- [x] Lista de videos con thumbnails y badges de estado
- [x] Subir video con drag & drop
- [x] **VER videos directamente en la página** (modal de preview)
- [x] Eliminar video
- [x] Reproducción de video integrada

### ✅ Procesamiento
- [x] Formulario de procesamiento con 3 modos:
  - VERTICAL: Video completo a 9:16
  - SHORT_AUTO: IA selecciona el mejor segmento
  - SHORT_MANUAL: Usuario especifica inicio y duración
- [x] Opciones de plataforma (TikTok, Instagram, YouTube Shorts)
- [x] Opciones de calidad (Rápido, Normal, Alta)
- [x] Modos de fondo (Smart Crop, Blurred, Black)
- [x] Opciones avanzadas (headroom, smoothing)
- [x] Lista de jobs con estados y cancelación
- [x] **Preview de videos procesados (renditions)** en modal
- [x] Descargar rendition

### ✅ Notificaciones Push
- [x] Solicitud de permisos de notificación
- [x] **Notificación cuando termina el procesamiento** (completado o error)
- [x] Indicador visual de notificaciones activadas

### ✅ UX/UI Premium
- [x] Modo claro/oscuro con toggle en todas las páginas
- [x] Diseño responsive mobile-first
- [x] Fuentes: Outfit (headings) + Inter (body)
- [x] **Gradientes animados** (purple/blue/pink)
- [x] **Glassmorphism** (backdrop-blur, bordes suaves)
- [x] **Cards 3D con hover effects**
- [x] **Animaciones flotantes** en backgrounds
- [x] Toast notifications (sonner)
- [x] Loading states y skeletons
- [x] Empty states con ilustraciones elegantes
- [x] Indicadores de fortaleza de contraseña
- [x] Custom scrollbar con gradiente

### ✅ Perfil
- [x] Ver información de usuario
- [x] Editar nombre/apellido
- [x] Cambiar contraseña

## Estructura de Carpetas
```
/app/frontend/src/
├── api/           # API clients (auth, projects, videos, processing, users)
├── components/    # Layout, ProtectedRoute, VideoPreviewModal, ui/
├── context/       # AuthContext, ThemeContext
├── lib/           # utils, notifications
└── pages/         # Login, Register, Dashboard, Project, Video, Profile, etc.
```

## Testing
- **Testing Agent Iteration 2**: 95% passed
- Form validation: ✅ 100%
- Routing: ✅ 100%
- UI rendering: ✅ 100%
- Theme toggle: ✅ 100%
- Responsive design: ✅ 100%
- CSS animations: ✅ 100%

## Backlog / Próximas Funcionalidades

### P0 (Crítico)
- [ ] Integración con credenciales reales de la API

### P1 (Alta prioridad)
- [ ] Búsqueda y filtrado de videos
- [ ] Paginación infinita en listas
- [ ] Compartir video a redes sociales directamente

### P2 (Media prioridad)
- [ ] Bulk processing (procesar múltiples videos)
- [ ] Historial de actividad
- [ ] Analytics de uso

### P3 (Baja prioridad)
- [ ] Integración con Google Drive/Dropbox
- [ ] Templates de procesamiento guardados
- [ ] Subtítulos automáticos

## Notas Técnicas
- La API externa (elevideo.onrender.com) puede tener latencia inicial (cold start)
- Los tokens JWT tienen expiración limitada
- El upload de videos tiene límite de 200MB
- Las notificaciones push requieren permisos del navegador
