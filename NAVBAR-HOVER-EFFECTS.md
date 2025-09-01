# Efectos de Hover en la Navbar

## Implementación de Subrayado Animado

Se han implementado varios efectos de subrayado para los links de la navbar, todos con animaciones suaves y elegantes.

## Efectos Disponibles

### 1. **Subrayado de Derecha a Izquierda** (Actualmente Implementado)
```css
.nav-link-underline
```

**Características:**
- ✅ El subrayado aparece desde la derecha y se desliza hacia la izquierda
- ✅ Gradiente azul sutil (#3b82f6 a #1d4ed8)
- ✅ Transición suave de 0.4s con curva de bezier
- ✅ Estado activo con subrayado blanco permanente
- ✅ Bordes redondeados para mejor apariencia

### 2. **Subrayado con Expansión desde el Centro**
```css
.nav-link-expand
```

**Características:**
- ✅ El subrayado crece desde el centro hacia los extremos
- ✅ Efecto más dramático y llamativo
- ✅ Misma paleta de colores que la versión principal

### 3. **Subrayado con Gradiente Animado**
```css
.nav-link-gradient
```

**Características:**
- ✅ Gradiente multicolor que se anima continuamente
- ✅ Colores: azul → púrpura → rosa
- ✅ Animación fluida de 2 segundos
- ✅ Efecto más llamativo y moderno

## Uso en el Código

### Navbar Desktop
```typescript
<Link
  href={item.href}
  className={`text-md font-semibold nav-link-underline ${
    active ? "text-white active" : "text-white/70 hover:text-white"
  }`}
>
  {item.label}
</Link>
```

### Menú Móvil
```typescript
<Link
  href={item.href}
  onClick={() => setIsOpen(false)}
  className="block rounded-md px-3 py-2 text-white/90 hover:bg-white/10 nav-link-underline"
>
  {item.label}
</Link>
```

## Personalización

### Cambiar Colores del Gradiente
```css
/* En globals.css */
.nav-link-underline::after {
  background: linear-gradient(90deg, #tu-color-1, #tu-color-2);
}
```

### Ajustar Velocidad de Animación
```css
.nav-link-underline::after {
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Cambiar Grosor del Subrayado
```css
.nav-link-underline::after {
  height: 2px; /* Ajustar este valor */
}
```

### Cambiar Distancia del Subrayado
```css
.nav-link-underline::after {
  bottom: -4px; /* Ajustar este valor */
}
```

## Estados

### Estado Normal
- Sin subrayado visible
- Color de texto: `text-white/70`

### Estado Hover
- Subrayado aparece de derecha a izquierda
- Color de texto: `text-white`
- Transición suave de 0.4s

### Estado Activo
- Subrayado permanente visible
- Color de texto: `text-white`
- Subrayado blanco para indicar página actual

## Compatibilidad

- ✅ **Desktop:** Efecto completo con subrayado animado
- ✅ **Móvil:** Efecto adaptado para pantallas táctiles
- ✅ **Accesibilidad:** Mantiene contraste adecuado
- ✅ **Performance:** Usa transformaciones CSS optimizadas

## Alternativas de Efectos

Si quieres cambiar el efecto, simplemente reemplaza `nav-link-underline` por:

- `nav-link-expand` - Expansión desde el centro
- `nav-link-gradient` - Gradiente animado multicolor

## Resultado

El navbar ahora tiene:
- ✅ Efecto de subrayado elegante y moderno
- ✅ Animación suave de derecha a izquierda
- ✅ Estados claros (normal, hover, activo)
- ✅ Compatibilidad con móvil
- ✅ Múltiples opciones de personalización

El efecto mejora significativamente la experiencia de usuario y da un toque profesional y moderno a la navegación.
