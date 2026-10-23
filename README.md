# Reservas de citas (Fase 2: demostración visual)

Aplicación React + Vite + TypeScript. **Esta versión usa datos simulados**: no se conecta a Google Calendar, Sheets, WhatsApp ni n8n, y no crea reservas reales. Una insignia amarilla "Modo demostración" siempre está visible.

## Requisitos
- Node.js 20 o superior (https://nodejs.org)

## Ejecutar en tu computador
```bash
npm install
npm run dev
```
Abre la dirección que aparece (normalmente http://localhost:5173). Para verla como celular, abre las herramientas del navegador (F12) y activa la vista móvil.

## Probar las pantallas de resultado
Añade a la URL: `?demo=conflict` (horario ocupado), `?demo=error` (error temporal) o `?demo=pending` (pendiente de confirmación). Sin parámetro, se muestra "Cita confirmada" de prueba.

## Compilar
```bash
npm run build
```
Genera la carpeta `dist/`. También ejecuta la verificación de tipos.

## Publicar en Netlify
1. Sube esta carpeta a un repositorio de GitHub (no se suben `node_modules` ni `dist`).
2. En Netlify: *Add new site → Import an existing project* y elige el repositorio.
3. `netlify.toml` ya define comando `npm run build` y carpeta `dist`. Pulsa *Deploy*.
4. Cada cambio que subas al repositorio se publica automáticamente.

## Dónde cambiar cada cosa
| Qué | Dónde |
|---|---|
| Nombre de la clínica, servicios, campos obligatorios, texto de consentimiento | `src/config/clinic.ts` |
| Colores y tipografía | variables al inicio de `src/styles/global.css` |
| Horarios simulados | `src/mocks/mockProvider.ts` |
| Conexión con el backend | `src/services/bookingApi.ts` |

Los servicios, el horario y el texto legal son **marcadores provisionales** y deben ser aprobados por la clínica.

## Contrato de datos (referencia para n8n)
```json
// getDays → GET availability?month=2026-11&service=demo-a
[{ "date": "2026-11-12", "hasAvailability": true }]
// getSlots → GET availability?date=2026-11-12&service=demo-a
[{ "start": "2026-11-12T09:00:00-05:00", "end": "2026-11-12T10:00:00-05:00", "status": "available" }]
// createBooking → POST bookings
{ "idempotencyKey": "uuid", "serviceId": "demo-a", "slotStart": "2026-11-12T09:00:00-05:00",
  "patient": { "fullName": "", "phone": "", "documentId": "", "email": "" }, "consent": true }
// respuestas: { "status": "confirmed", "bookingRef": "...", "start": "...", "end": "..." }
//             { "status": "slot_unavailable" } | { "status": "pending" } | { "status": "server_error" }
```
`status` de cada horario: `available`, `busy` (ocupado, gris) o `unavailable` (no reservable). Nunca se envían datos de otras citas.

## Seguridad (lo que viene en las siguientes fases)
- Las variables `VITE_*` son **públicas**: acaban en el navegador. No pongas ahí URLs privadas de n8n, claves ni tokens.
- La conexión con n8n irá en una **Netlify Function** (servidor), que guardará secretos como variables de entorno de Netlify, validará todo de nuevo, aplicará protección anti-spam y límite de solicitudes.
- Las validaciones del formulario solo ayudan al usuario; la validación real se hará en el servidor.
- No se guardan datos personales en el navegador (sin localStorage).
