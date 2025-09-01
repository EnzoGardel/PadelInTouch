# Animaciones del Sistema de Ranking

## Descripción General

Se han implementado animaciones suaves y elegantes para mejorar la experiencia de usuario en los selectores de género y categorías del sistema de ranking.

## Animaciones Implementadas

### 🎯 **Selector de Género**

#### Indicador Deslizante
- **Efecto:** Un indicador azul se desliza suavemente entre las opciones Masculino/Femenino
- **Animación:** Transición de 300ms con curva `ease-out`
- **Posicionamiento:** Se mueve dinámicamente según la selección actual

```typescript
// Indicador deslizante
<div 
  className={`absolute top-1 bottom-1 bg-primary rounded-md shadow-lg transition-all duration-300 ease-out ${
    selectedGender === "M" ? "left-1 w-[calc(50%-4px)]" : "right-1 w-[calc(50%-4px)]"
  }`}
/>
```

#### Efectos Hover
- **Escala:** Los botones se agrandan ligeramente al hacer hover (`hover:scale-105`)
- **Color:** Transición suave del color de texto
- **Duración:** 300ms para todas las transiciones

### 📑 **Tabs de Categorías**

#### Indicador Deslizante Avanzado
- **Efecto:** Indicador que se desliza entre las 8 categorías
- **Cálculo dinámico:** Posición calculada automáticamente según la categoría seleccionada
- **Animación:** Transición de 500ms para un movimiento más suave

```typescript
// Indicador deslizante para categorías
<div 
  className="absolute top-1 bottom-1 bg-primary rounded-md shadow-lg transition-all duration-500 ease-out"
  style={{
    left: `${(getCategoryIndex(currentCategoryId) * 100 / 8) + 2}%`,
    width: `${100 / 8 - 4}%`
  }}
/>
```

#### Efectos Hover en Tabs
- **Escala:** Los tabs se agrandan al hacer hover (`hover:scale-105`)
- **Fondo:** Aparece un fondo semi-transparente (`hover:bg-white/10`)
- **Transición:** 300ms para todos los efectos

## Características Técnicas

### ⚡ **Performance**
- **CSS Transitions:** Uso de transiciones CSS nativas para mejor rendimiento
- **GPU Acceleration:** Las transformaciones usan la GPU del dispositivo
- **Optimización:** Animaciones suaves sin afectar la funcionalidad

### 🎨 **Diseño Visual**
- **Consistencia:** Todas las animaciones usan la misma duración base
- **Curvas de animación:** `ease-out` para movimientos naturales
- **Colores:** Uso del color primario del tema para el indicador

### 📱 **Responsive**
- **Adaptación:** Las animaciones funcionan en todos los tamaños de pantalla
- **Móvil:** Efectos optimizados para dispositivos táctiles
- **Desktop:** Experiencia completa con todos los efectos

## Funciones de Soporte

### `getCategoryIndex()`
```typescript
const getCategoryIndex = (categoryId: string) => {
  const currentCategories = selectedGender === "M" ? categories : femaleCategories;
  return currentCategories.findIndex((cat: Category) => cat.id === categoryId);
};
```

**Propósito:** Calcula la posición del indicador deslizante para las categorías

### Cálculo de Posición
```typescript
// Posición horizontal del indicador
left: `${(getCategoryIndex(currentCategoryId) * 100 / 8) + 2}%`

// Ancho del indicador
width: `${100 / 8 - 4}%`
```

## Personalización

### 🎛️ **Ajustar Velocidad**
```css
/* Para animaciones más rápidas */
transition-all duration-200

/* Para animaciones más lentas */
transition-all duration-500
```

### 🎨 **Cambiar Colores**
```css
/* Cambiar color del indicador */
.bg-primary {
  background-color: #tu-color;
}
```

### 📏 **Ajustar Escala**
```css
/* Escala más pronunciada */
hover:scale-110

/* Escala más sutil */
hover:scale-102
```

## Estados de Animación

### 🔄 **Selector de Género**
1. **Estado inicial:** Indicador en la posición del género por defecto
2. **Hover:** Botón se agranda ligeramente
3. **Click:** Indicador se desliza suavemente a la nueva posición
4. **Estado final:** Indicador en la nueva posición seleccionada

### 📋 **Tabs de Categorías**
1. **Estado inicial:** Indicador en la primera categoría
2. **Hover:** Tab se agranda y muestra fondo semi-transparente
3. **Click:** Indicador se desliza a la nueva categoría
4. **Estado final:** Indicador en la categoría seleccionada

## Beneficios de UX

### ✨ **Feedback Visual**
- **Claridad:** El usuario siempre sabe qué opción está seleccionada
- **Confirmación:** Las animaciones confirman las acciones del usuario
- **Guía:** El indicador deslizante guía la atención del usuario

### 🎯 **Interactividad**
- **Engagement:** Las animaciones hacen la interfaz más atractiva
- **Profesionalismo:** Efectos suaves dan una sensación premium
- **Modernidad:** Interfaz actualizada con tendencias de diseño moderno

### 🚀 **Performance**
- **Fluidez:** Animaciones de 60fps en dispositivos modernos
- **Eficiencia:** Uso de CSS transitions para mejor rendimiento
- **Compatibilidad:** Funciona en todos los navegadores modernos

## Resultado

Las animaciones implementadas proporcionan:
- ✅ **Experiencia visual mejorada** con efectos suaves y elegantes
- ✅ **Feedback inmediato** para las acciones del usuario
- ✅ **Navegación intuitiva** con indicadores visuales claros
- ✅ **Interfaz moderna** que se siente profesional y atractiva
- ✅ **Performance optimizada** sin afectar la funcionalidad

El sistema de ranking ahora tiene una experiencia de usuario mucho más dinámica y atractiva, manteniendo la funcionalidad completa y la accesibilidad.
