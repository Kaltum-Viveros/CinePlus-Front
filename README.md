# CinePlus 🎬

Aplicación web para gestión de cartelera cinematográfica, selección de asientos y compra de boletos.

## Descripción

CinePlus es una aplicación desarrollada con **Angular 20** que simula un sistema de cine completo con:
- 📽️ Cartelera de películas con filtros dinámicos
- 🎫 Selección de funciones (fecha y hora)
- 💺 Mapa interactivo de asientos
- 🛒 Carrito de compra con cupones de descuento
- 📧 Formulario de contacto
- 💾 Persistencia de datos en localStorage

## Tecnologías

- **Angular 20** (Standalone Components, Signals, Control Flow)
- **Bootstrap 5** + **Bootstrap Icons**
- **TypeScript**
- **SCSS**
- **SSR (Server-Side Rendering)**

## Estructura del Proyecto

```
src/app/
├── models/           # Interfaces y tipos de datos
├── services/         # Lógica de negocio y gestión de estado
├── pages/            # Componentes de página
│   ├── cartelera/    # Listado de películas
│   ├── funciones/    # Selección de asientos
│   ├── carrito/      # Carrito de compra
│   └── contacto/     # Formulario de contacto
├── app.routes.ts     # Configuración de rutas
└── app.ts            # Componente raíz
```

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm install
npm start
```

La aplicación estará disponible en `http://localhost:4200/`

## Build

Para construir el proyecto para producción:

```bash
npm run build
```

Los archivos compilados se generarán en el directorio `dist/`

## Funcionalidades Principales

### 🎬 Cartelera
- Visualización de 10 películas con información detallada
- Filtros por género y búsqueda por título
- Modal con sinopsis y tráiler de YouTube
- Cards con diseño moderno y animaciones

### 🎫 Selección de Funciones
- Selector de fecha y hora
- Mapa de asientos interactivo (7 filas × 10 columnas)
- Estados de asientos: libre (verde), seleccionado (azul), ocupado (rojo)
- Validación de fechas y horas pasadas

### 🛒 Carrito de Compra
- Visualización de boletos seleccionados
- Cálculo automático de totales
- Cupones de descuento: **CINE10** (10%), **CINE20** (20%), **PROMO15** (15%)
- Descarga automática de archivo `boletos.txt` con el comprobante

### 📧 Contacto
- Formulario con validaciones
- Información del cine (dirección, teléfono, horario)

## Integración con Backend (Futuro)

El proyecto incluye comentarios `TODO: BACKEND` en varios archivos que indican cómo adaptar la aplicación para trabajar con un backend real:

### Archivos con Comentarios de Integración

- **`src/app/services/cine.service.ts`**: Servicio principal con comentarios detallados sobre:
  - Endpoints necesarios del backend
  - Cómo reemplazar localStorage por llamadas HTTP
  - Gestión de autenticación con JWT
  - Sincronización de estado con el servidor

- **`src/app/models/movie.model.ts`**: Sugerencias sobre campos adicionales para los DTOs

- **`src/app/pages/carrito/carrito.ts`**: 
  - Validación de cupones desde el servidor
  - Integración con pasarelas de pago
  - Envío de emails de confirmación

- **`src/app/pages/funciones/funciones.ts`**:
  - Actualización en tiempo real de asientos (WebSockets)
  - Sistema de reservas temporales con expiración

- **`src/app/pages/contacto/contacto.ts`**:
  - Envío de mensajes al backend
  - Integración con captcha

### Endpoints Sugeridos del Backend

```
GET    /api/movies                        # Obtener todas las películas
GET    /api/movies/:id                    # Obtener película específica
GET    /api/funciones/:movieId            # Obtener horarios disponibles
GET    /api/asientos/:funcionId           # Obtener mapa de asientos ocupados
POST   /api/reservas/temporal             # Crear reserva temporal
POST   /api/compras                       # Confirmar compra
POST   /api/cupones/validar               # Validar cupón de descuento
POST   /api/contacto                      # Enviar mensaje de contacto
```

## Notas Técnicas

- **Persistencia actual**: Los datos se almacenan en `localStorage` del navegador
- **SSR**: La aplicación soporta Server-Side Rendering
- **Standalone Components**: No usa módulos NgModule, utiliza la nueva arquitectura de Angular
- **Signals**: Usa el sistema de reactividad moderno de Angular
- **Control Flow**: Usa la nueva sintaxis `@if`, `@for` en lugar de *ngIf, *ngFor
