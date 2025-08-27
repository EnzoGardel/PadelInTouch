# Lavalle Padel Club Website

Un sitio web moderno para el club de pádel Lavalle en Rosario, Argentina. Construido con Next.js 14, TypeScript, TailwindCSS y Supabase.

## Características

- 🏓 **Sistema de reservas en tiempo real** - Reservá canchas online con disponibilidad en vivo
- 🎨 **Diseño moderno y responsivo** - Optimizado para todos los dispositivos
- 🔒 **Prevención de doble reservas** - Sistema transaccional robusto
- 📱 **Experiencia móvil optimizada** - Interfaz táctil intuitiva
- 🚀 **Alto rendimiento** - Carga rápida y navegación fluida
- ♿ **Accesible** - Cumple con estándares WCAG
- 🌐 **SEO optimizado** - Metadatos completos y sitemap

## Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: TailwindCSS v4
- **UI Components**: shadcn/ui
- **Base de datos**: Supabase (PostgreSQL)
- **Validación**: Zod + React Hook Form
- **Iconos**: Lucide React
- **Fuentes**: Work Sans + Open Sans

## Estructura del Proyecto

\`\`\`
├── app/
│   ├── api/                 # API Routes
│   │   ├── availability/    # Consulta disponibilidad
│   │   ├── bookings/        # Crear reservas
│   │   ├── clubs/           # Obtener sucursales
│   │   ├── courts/          # Obtener canchas
│   │   └── contact/         # Formulario contacto
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Página home
│   ├── sitemap.ts           # Sitemap SEO
│   └── robots.ts            # Robots.txt
├── components/
│   ├── ui/                  # Componentes shadcn/ui
│   ├── booking/             # Sistema de reservas
│   ├── navbar.tsx           # Navegación
│   ├── hero-section.tsx     # Sección hero
│   ├── about-section.tsx    # Sobre nosotros
│   ├── contact-section.tsx  # Contacto
│   └── footer.tsx           # Footer
├── lib/
│   ├── supabase-server.ts   # Cliente Supabase
│   ├── types.ts             # Tipos TypeScript
│   ├── validation.ts        # Esquemas Zod
│   ├── time.ts              # Utilidades tiempo
│   └── rate-limit.ts        # Rate limiting
└── database/
    ├── schema.sql           # Esquema base de datos
    └── seed.sql             # Datos de prueba
\`\`\`

## Configuración

### Variables de Entorno

Crear un archivo `.env.local` con:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
TZ=America/Argentina/Cordoba
\`\`\`

### Base de Datos

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar `database/schema.sql` en el SQL Editor
3. Ejecutar `database/seed.sql` para datos de prueba
4. Configurar las variables de entorno

### Instalación

\`\`\`bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
\`\`\`

## Funcionalidades

### Sistema de Reservas

- Búsqueda por sucursal, cancha y fecha
- Visualización de horarios disponibles con precios
- Formulario de reserva con validación
- Prevención de doble reservas mediante función transaccional
- Notificaciones en tiempo real

### Gestión de Contenido

- Información del club editable
- Datos de contacto configurables
- Precios y horarios dinámicos
- Mensajes de contacto almacenados

### Optimizaciones

- Rate limiting en APIs
- Lazy loading de imágenes
- Componentes optimizados
- SEO completo
- Error boundaries
- Loading states

## Despliegue

### Vercel (Recomendado)

1. Conectar repositorio en [Vercel](https://vercel.com)
2. Configurar variables de entorno
3. Desplegar automáticamente

### Otros Proveedores

Compatible con cualquier proveedor que soporte Next.js:
- Netlify
- Railway
- DigitalOcean App Platform

## Contribuir

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## Soporte

Para soporte técnico o consultas:
- Email: contacto@lavallepadelclub.com
- Teléfono: +54 341 555-1234

---

Desarrollado con ❤️ para Lavalle Padel Club
