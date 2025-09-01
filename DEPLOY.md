# Instrucciones de Deploy en Netlify

## Variables de Entorno Requeridas

Configura las siguientes variables de entorno en tu proyecto de Netlify:

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`: URL de tu proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave anónima de Supabase

### MercadoPago
- `MERCADOPAGO_ACCESS_TOKEN`: Token de acceso de MercadoPago
- `MERCADOPAGO_PUBLIC_KEY`: Clave pública de MercadoPago

## Configuración de Build

El proyecto ya está configurado para Netlify con:
- Comando de build: `pnpm build`
- Directorio de publicación: `.next`
- Plugin de Next.js habilitado

## Pasos para Deploy

1. Conecta tu repositorio a Netlify
2. Configura las variables de entorno en la configuración del proyecto
3. El deploy se ejecutará automáticamente en cada push a la rama principal

## Notas Importantes

- Asegúrate de que tu base de datos Supabase esté configurada y accesible
- Las funciones de MercadoPago requieren las credenciales correctas
- El proyecto usa Next.js 14 con App Router
