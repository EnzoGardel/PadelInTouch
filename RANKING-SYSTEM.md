# Sistema de Ranking de Pádel

## Descripción General

Se ha implementado un sistema completo de ranking con 8 categorías para masculino y femenino, desde la Primera (nivel más alto) hasta la Octava (nivel iniciación).

## Estructura de Categorías

### 🏆 **Categorías Masculinas**
1. **Primera** - Nivel más alto - Jugadores profesionales
2. **Segunda** - Alto nivel - Jugadores avanzados
3. **Tercera** - Nivel intermedio alto
4. **Cuarta** - Nivel intermedio
5. **Quinta** - Nivel intermedio bajo
6. **Sexta** - Nivel principiante avanzado
7. **Séptima** - Nivel principiante
8. **Octava** - Nivel iniciación

### 🏆 **Categorías Femeninas**
1. **Primera** - Nivel más alto - Jugadoras profesionales
2. **Segunda** - Alto nivel - Jugadoras avanzadas
3. **Tercera** - Nivel intermedio alto
4. **Cuarta** - Nivel intermedio
5. **Quinta** - Nivel intermedio bajo
6. **Sexta** - Nivel principiante avanzado
7. **Séptima** - Nivel principiante
8. **Octava** - Nivel iniciación

## Características del Sistema

### 📊 **Información de Jugadores**
Cada jugador muestra:
- **Posición** en el ranking
- **Nombre** del jugador
- **Puntos** acumulados
- **Torneos** jugados
- **Victorias/Derrotas** (W/L)
- **Porcentaje de victoria**
- **Último torneo** participado
- **Tendencia** (ascendente, descendente, estable)

### 🎯 **Sistema de Puntos**
- Los puntos se otorgan según el rendimiento en torneos oficiales
- Cuanto mejor sea la posición en el torneo, más puntos se obtienen
- Los puntos se acumulan a lo largo de la temporada

### 📈 **Indicadores Visuales**
- **Medallas** para los 3 primeros lugares (🥇🥈🥉)
- **Badges** de posición para el resto
- **Tendencias** con flechas (↗️↘️→)
- **Porcentajes de victoria** con colores según el rendimiento

## Funcionalidades Implementadas

### 🔄 **Selector de Género**
- Botones para alternar entre Masculino y Femenino
- Interfaz intuitiva con estados activos
- Transiciones suaves entre categorías
- **Categoría sincronizada:** Mantiene la misma categoría al cambiar de género

### 📑 **Sistema de Tabs**
- 8 tabs para las diferentes categorías
- Iconos distintivos para cada categoría:
  - 🏆 Trophy (Primera)
  - 🥈 Medal (Segunda)
  - 🏅 Award (Tercera)
  - ⭐ Star (Cuarta a Octava con diferentes colores)

### 📱 **Responsive Design**
- Tabla con scroll horizontal en móviles
- Tabs adaptados para pantallas pequeñas
- Diseño optimizado para todos los dispositivos

### 🎨 **Diseño Visual**
- Fondo con patrón de puntos
- Cards con efecto glassmorphism
- Colores consistentes con el tema del sitio
- Efectos hover en las filas de la tabla

## Estructura de Datos

### Interface Player
```typescript
interface Player {
  id: string;
  name: string;
  position: number;
  points: number;
  tournaments: number;
  wins: number;
  losses: number;
  winRate: number;
  lastTournament: string;
  trend: "up" | "down" | "stable";
}
```

### Interface Category
```typescript
interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  players: Player[];
}
```

### Estados de la Aplicación
```typescript
// Estados para manejar la sincronización de categorías
const [selectedGender, setSelectedGender] = useState<"M" | "F">("M");
const [currentCategory, setCurrentCategory] = useState("primera");

// Funciones para manejar IDs de categorías según el género
const getCategoryId = (baseCategory: string) => {
  return selectedGender === "M" ? baseCategory : `${baseCategory}-f`;
};

const getBaseCategory = (categoryId: string) => {
  return categoryId.replace("-f", "");
};
```

## Componentes Utilizados

### 📋 **RankingTable**
- Tabla responsiva con información detallada
- Badges de posición y tendencias
- Efectos hover en las filas
- Scroll horizontal para móviles

### 🎛️ **Tabs System**
- Navegación entre categorías
- Iconos distintivos para cada nivel
- Estados activos claros

### 🎨 **Cards**
- Contenedores con efecto glassmorphism
- Headers con información de categoría
- Contenido organizado y legible

## Datos de Ejemplo

### 👥 **Nombres Masculinos**
- Juan Pérez, Carlos Rodríguez, Miguel González, etc.

### 👩 **Nombres Femeninos**
- María García, Ana López, Carmen Rodríguez, etc.

### 📊 **Estadísticas Generadas**
- Puntos: 1000 - (posición * 50)
- Torneos: 9-20 determinísticos (basados en posición)
- Victorias: 15-45 determinísticas
- Derrotas: 8-35 determinísticas
- % Victoria: 30-85% determinístico

**Nota:** Los datos son determinísticos para evitar errores de hidratación de React.

## Información Adicional

### 📚 **Sección Informativa**
- **¿Cómo funciona el ranking?** - Explicación del sistema de puntos
- **Ascensos y descensos** - Información sobre movimientos entre categorías
- **Próximos torneos** - Información sobre eventos futuros

### 🔄 **Actualizaciones**
- Los rankings se actualizan después de cada torneo
- Los jugadores pueden ascender/descender de categoría
- Las tendencias se calculan automáticamente

### 🧠 **Sincronización de Categorías**
- **Categoría compartida:** Ambos géneros comparten la misma categoría seleccionada
- **Cambio sincronizado:** Al cambiar de género, mantiene la categoría actual
- **Experiencia intuitiva:** Cambia solo el género, no la categoría
- **Implementación:** Usa un estado único `currentCategory` para ambos géneros

## Solución de Errores

### 🔧 **Error de Hidratación de React**
El sistema originalmente tenía un error de hidratación debido al uso de `Math.random()` en la generación de datos. Esto causaba que el contenido renderizado en el servidor no coincidiera con el del cliente.

**Solución implementada:**
- Reemplazamos los datos aleatorios con datos determinísticos
- Usamos un array predefinido de estadísticas basadas en la posición
- Esto garantiza que el servidor y cliente rendericen el mismo contenido

```typescript
// Antes (causaba error de hidratación)
tournaments: Math.floor(Math.random() * 20) + 5,
wins: Math.floor(Math.random() * 50) + 10,

// Después (determinístico)
const mockStats = [
  { tournaments: 15, wins: 45, losses: 8, winRate: 85 },
  // ... más datos predefinidos
];
```

## Personalización

### 🎨 **Cambiar Colores**
```css
/* En globals.css */
.nav-link-underline::after {
  background: linear-gradient(90deg, #tu-color-1, #tu-color-2);
}
```

### 📊 **Modificar Datos**
- Editar la función `generateMockData` para cambiar nombres
- Ajustar rangos de puntos y estadísticas
- Modificar descripciones de categorías

### 🔧 **Agregar Funcionalidades**
- Filtros por edad o región
- Búsqueda de jugadores
- Exportar rankings a PDF
- Historial de posiciones

## Resultado

El sistema de ranking ahora incluye:
- ✅ 8 categorías para masculino y femenino
- ✅ Información detallada de cada jugador
- ✅ Sistema de puntos y estadísticas
- ✅ Interfaz moderna y responsiva
- ✅ Navegación intuitiva entre categorías
- ✅ Indicadores visuales claros
- ✅ Diseño consistente con el sitio

El ranking proporciona una experiencia completa y profesional para seguir el progreso de los jugadores en cada categoría.
