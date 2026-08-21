# app-peluqueria-frontend

Aplicación web frontend desarrollada con **Angular 19** para la gestión de peluqueros y turnos de una peluquería. Consume una API REST y permite realizar operaciones CRUD completas sobre ambas entidades, además de una pantalla de reportes con indicadores agregados y filtros reactivos.

---

## Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| Angular | 19.2 | Framework principal — componentes standalone, Signals, control flow (`@if` / `@for`) |
| Angular Material | 19.2 | UI: tablas, formularios, diálogos, snackbar, datepicker, sidenav |
| Angular CDK | 19.2 | `BreakpointObserver` para diseño responsive |
| TypeScript | ~5.7 | Tipado estricto en modo `strict` completo |
| Reactive Forms | — | `FormGroup` / `FormControl` con validadores síncronos personalizados |
| RxJS | ~7.8 | Observables para HttpClient y suscripciones en formularios |

---

## Requisitos previos

- **Node.js 18+** (recomendado: 20 LTS)
- **npm** (incluido con Node.js)
- **Angular CLI 19**

  ```bash
  npm install -g @angular/cli@19
  ```

- **El backend debe estar corriendo en `http://localhost:3000`**. Consultá el README del repositorio del backend para su instalación y ejecución.

---

## Instalación

```bash
npm install
```

---

## Ejecución en desarrollo

```bash
npm start
```

Abre automáticamente `http://localhost:4200` en el navegador. La aplicación consume la API REST en `http://localhost:3000/api` — asegurate de que el backend esté corriendo antes de iniciar el frontend.

---

## Build de producción

```bash
npm run build
```

Los artefactos compilados se generan en la carpeta `dist/`. Antes de hacer el build de producción, actualizá `src/environments/environment.prod.ts` con la URL real del backend.

---

## Scripts npm disponibles

| Script | Comando | Descripción |
|---|---|---|
| `start` | `ng serve -o` | Inicia el servidor de desarrollo y abre el navegador |
| `build` | `ng build` | Compila la aplicación para producción |
| `watch` | `ng build --watch --configuration development` | Compila en modo desarrollo con recarga automática |
| `test` | `ng test` | Ejecuta los tests unitarios con Karma |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── peluqueros/
│   │   │   ├── peluquero-lista/    # Tabla CRUD de peluqueros
│   │   │   └── peluquero-form/     # Formulario crear / editar peluquero
│   │   ├── turnos/
│   │   │   ├── turno-lista/        # Tabla CRUD de turnos
│   │   │   └── turno-form/         # Formulario crear / editar turno (con validadores personalizados)
│   │   └── reportes/
│   │       └── reporte-turnos/     # KPIs + desglose por peluquero con computed()
│   ├── interceptors/
│   │   ├── error.interceptor.ts    # Interceptor HTTP: extrae error del body y muestra snackbar
│   ├── models/
│   │   ├── estado-turno.ts         # Type EstadoTurno = 'RESERVADO' | 'FINALIZADO'
│   │   ├── peluquero/              # Interfaces Peluquero, CreatePeluqueroDto, DeletePeluqueroResponse
│   │   └── turno/                  # Interfaces Turno, CreateTurnoDto, DeleteTurnoResponse
│   ├── navbar/                     # NavbarComponent: toolbar + sidenav responsive (layout principal)
│   ├── pipes/
│   │   └── fecha-es.pipe.ts        # Pipe FechaEsPipe: 'YYYY-MM-DD' → 'DD/MM/YYYY'
│   ├── services/
│   │   ├── peluquero.service.ts    # CRUD peluqueros con Signals + HttpClient
│   │   └── turno.service.ts        # CRUD turnos con Signals + HttpClient
│   ├── shared/
│   │   └── components/
│   │       └── confirm-dialog/     # ConfirmDialogComponent reutilizable para confirmaciones
│   ├── app.component.ts            # Componente raíz (solo RouterOutlet)
│   ├── app.config.ts               # Providers globales: router, httpClient, animaciones, datepicker, locale
│   └── app.routes.ts               # Rutas lazy-loaded con loadComponent
├── environments/
│   ├── environment.ts              # { production: false, apiUrl: 'http://localhost:3000/api' }
│   └── environment.prod.ts         # { production: true, apiUrl: 'http://localhost:3000/api' }
├── styles.css                      # Tema Material (azure-blue) + estilos globales (chips, snackbar)
├── index.html                      # Carga Roboto y Material Icons desde Google Fonts
└── main.ts                         # bootstrapApplication con appConfig
```

---

## Rutas

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | — | Redirige a `/turnos` |
| `/turnos` | `TurnoListaComponent` | Lista de turnos |
| `/turnos/nuevo` | `TurnoFormComponent` | Crear turno |
| `/turnos/:id/editar` | `TurnoFormComponent` | Editar turno |
| `/peluqueros` | `PeluqueroListaComponent` | Lista de peluqueros |
| `/peluqueros/nuevo` | `PeluqueroFormComponent` | Crear peluquero |
| `/peluqueros/:id/editar` | `PeluqueroFormComponent` | Editar peluquero |
| `/reportes` | `ReporteTurnosComponent` | Reportes y KPIs |

Todas las rutas son **lazy-loaded** mediante `loadComponent()` y están anidadas dentro de `NavbarComponent`, que provee el layout con sidenav.

---

## Funcionalidades

### CRUD de Peluqueros

- Listar todos los peluqueros en una tabla Material.
- Crear un nuevo peluquero con validación de nombre (requerido, mínimo 2 caracteres).
- Editar el nombre de un peluquero existente.
- Eliminar con flujo de doble confirmación:
  - Primer intento silencioso; si el backend responde `409 Conflict` (tiene turnos asociados), se muestra un diálogo advirtiendo que también se eliminarán los turnos.
  - Segundo intento con `?confirmar=true` si el usuario acepta.

### CRUD de Turnos

- Listar todos los turnos con fecha, hora, peluquero asignado y estado (chip con color diferenciado: azul para `RESERVADO`, verde para `FINALIZADO`).
- Crear un turno con las siguientes validaciones en el formulario:
  - **Fecha**: datepicker con filtro de días laborables (martes a sábado). No permite fechas pasadas.
  - **Hora**: solo intervalos `:00` o `:30`, en el rango `09:00` a `17:30`.
  - **Estado**: preseleccionado en `RESERVADO` y deshabilitado al crear; habilitado al editar.
  - **Peluquero**: select desplegable cargado dinámicamente.
- Editar un turno existente (en edición, el estado puede cambiarse a `FINALIZADO` y se habilita fechas pasadas).
- Eliminar con confirmación en diálogo.

### Reporte de Turnos

- **KPIs**: total de turnos, total reservados y total finalizados.
- **Filtro por peluquero**: selector que recalcula los KPIs.
- **Desglose por peluquero**: tabla con reservados, finalizados y total por peluquero (incluye peluqueros con 0 turnos), ordenada por total descendente y con barra visual proporcional hecha en CSS puro.

---

## Manejo de errores HTTP

El `errorInterceptor` captura todos los errores HTTP y muestra un **snackbar rojo** con el mensaje proveniente del campo `error` del body de la respuesta. Mensajes de fallback según status:

| Status | Mensaje |
|---|---|
| `404` | Recurso no encontrado |
| `409` | Conflicto de negocio |
| `500` | Error interno del servidor |
| `0` | Sin conexión con el servidor |


---

## Diseño responsive

El layout usa `BreakpointObserver` del CDK para detectar dispositivos móviles:

- **Desktop**: sidenav fija en modo `side` (visible siempre).
- **Móvil** (< 600px): sidenav en modo `over` con menú hamburguesa en la toolbar; se cierra automáticamente al navegar.

---

## Nota sobre CORS

El backend tiene habilitado CORS para el origen `http://localhost:4200`, por lo que el frontend consume la API directamente en `http://localhost:3000/api` sin necesidad de configurar un proxy en Angular.

---

## Endpoints de la API consumidos

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/peluqueros` | Listar peluqueros |
| `GET` | `/api/peluqueros/:id` | Obtener peluquero |
| `POST` | `/api/peluqueros` | Crear peluquero |
| `PUT` | `/api/peluqueros/:id` | Actualizar peluquero |
| `DELETE` | `/api/peluqueros/:id` | Eliminar peluquero (`?confirmar=true` para forzar) |
| `GET` | `/api/turnos` | Listar turnos (con peluquero populado) |
| `GET` | `/api/turnos/:id` | Obtener turno |
| `POST` | `/api/turnos` | Crear turno |
| `PUT` | `/api/turnos/:id` | Actualizar turno |
| `DELETE` | `/api/turnos/:id` | Eliminar turno |
