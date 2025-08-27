# Base de datos – Lavalle Padel Club

Archivos:
- `database/schema.sql` (schema base)
- `database/seed.sql` (datos iniciales)
- `database/03-mercadopago.sql` (**nuevo**: pagos + integración Mercado Pago)

## Cómo aplicar
En el SQL Editor de Supabase:
1) Ejecutá `database/schema.sql`
2) Ejecutá `database/seed.sql`
3) Ejecutá `database/03-mercadopago.sql`

> Alternativa: crear un script en `scripts/03-mercadopago.sql` y usar tu endpoint `/api/setup-database` si preferís automatizar.