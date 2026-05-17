# 🎬 CinePlus Front

Frontend Angular para la plataforma **CinePlus**.

Este proyecto corresponde a una aplicación de cine que permite consultar cartelera, seleccionar funciones, elegir asientos, agregar boletos al carrito y confirmar compras. La aplicación fue integrada con una arquitectura de microservicios mediante API REST.

---

## ✨ Funcionalidades principales

- Consultar cartelera de películas
- Filtrar películas por género
- Buscar películas por nombre
- Seleccionar fecha y horario de función
- Consultar disponibilidad real de asientos
- Reservar asientos
- Agregar boletos al carrito
- Validar cupones
- Confirmar compras
- Descargar boletos generados por backend

---

## 🏗️ Arquitectura de integración

El frontend consume cuatro microservicios principales:

| Microservicio          | URL local                   | Responsabilidad                                          |
|------------------------|-----------------------------|----------------------------------------------------------|
| `ms-peliculas`         | `http://localhost:8001`     | Gestionar cartelera de películas                         |
| `ms-funciones`         | `http://localhost:8002`     | Gestionar funciones, fechas, horarios y salas            |
| `ms-reservas-asientos` | `http://localhost:8003`     | Controlar disponibilidad de asientos y reservas          |
| `ms-compras-boletos`   | `http://localhost:8004`     | Confirmar compras, validar cupones y generar boletos     |

---

## 🖥️ Pantallas integradas con backend

### Cartelera

La pantalla de cartelera consume el microservicio de películas.

**Endpoint utilizado:**
```
GET http://localhost:8001/api/v1/peliculas
```

Antes la cartelera usaba datos estáticos en el servicio Angular. Ahora las películas se cargan desde PostgreSQL mediante el microservicio `ms-peliculas`.

---

### Selección de funciones

La pantalla de selección de funciones consume el microservicio de funciones.

**Endpoint utilizado:**
```
GET http://localhost:8002/api/v1/funciones/disponibles?movieId={id}&date={fecha}
```

Cuando el usuario selecciona una película y una fecha, Angular solicita al backend los horarios disponibles para esa película.

---

### Selección de asientos

La pantalla de asientos consume el microservicio de reservas y asientos.

**Consultar asientos ocupados:**
```
GET http://localhost:8003/api/v1/asientos/funcion/{funcionId}
```

**Crear una reserva:**
```
POST http://localhost:8003/api/v1/reservas
```

**Ejemplo de cuerpo de reserva:**
```json
{
  "funcionId": 1,
  "asientos": ["A1", "A2"]
}
```

Con esta integración, los asientos ocupados ya no dependen únicamente del estado local del navegador.

---

### Carrito y compra

La pantalla de carrito consume el microservicio de compras y boletos.

**Validar cupones:**
```
POST http://localhost:8004/api/v1/cupones/validar
```

**Confirmar compra:**
```
POST http://localhost:8004/api/v1/compras
```

El backend calcula subtotal, descuento y total. También genera los boletos con códigos únicos y devuelve el contenido del archivo TXT para descarga.

**Cupones disponibles:**

| Código    | Descuento |
|-----------|-----------|
| `CINE10`  | 10%       |
| `CINE20`  | 20%       |
| `PROMO15` | 15%       |

---

## 🚀 Ejecutar en modo desarrollo

**Instalar dependencias:**
```bash
npm install
```

**Ejecutar Angular:**
```bash
npm start
```

**Abrir en el navegador:** `http://localhost:4200`

> ⚠️ Para que la aplicación funcione correctamente, los microservicios del backend deben estar activos. Desde el repositorio `cineplus-back`:
> ```bash
> docker compose up -d --build
> ```

---

## 🐳 Ejecutar con Docker

**Construir imagen del frontend:**
```bash
docker build -t cineplus-front .
```

**Ejecutar contenedor:**
```bash
docker run --rm -p 4200:80 --name cineplus-front-test cineplus-front
```

**Abrir:** `http://localhost:4200`

**Detener contenedor:**
```bash
docker stop cineplus-front-test
```

---

## 🐙 Ejecución completa con Docker Compose

La ejecución completa del sistema se realiza desde el repositorio `cineplus-back`, donde se encuentra el `docker-compose.yml` que orquesta:

- Frontend Angular
- Microservicio de películas
- Microservicio de funciones
- Microservicio de reservas y asientos
- Microservicio de compras y boletos
- Bases de datos PostgreSQL

**Desde `cineplus-back`:**
```bash
docker compose up -d --build
```

Luego abrir: `http://localhost:4200`

---

## 🧪 Flujo de prueba recomendado

1. Abrir `http://localhost:4200`
2. Verificar que la cartelera cargue desde backend
3. Seleccionar una película y una fecha
4. Verificar que los horarios se carguen desde `ms-funciones`
5. Seleccionar una hora
6. Verificar que los asientos se carguen desde `ms-reservas-asientos`
7. Seleccionar asientos y agregar al carrito
8. Aplicar cupón (ej. `CINE10`)
9. Confirmar compra
10. Verificar que se descargue el archivo de boletos generado por backend

---

## 📦 Build de producción

**Generar build:**
```bash
npm run build
```

La salida se genera en:
```
dist/cineplus/browser
```

---

## 🐋 Archivos Docker agregados

| Archivo          | Descripción                                                       |
|------------------|-------------------------------------------------------------------|
| `Dockerfile`     | Construcción multietapa: compila con Node y sirve con Nginx       |
| `.dockerignore`  | Excluye archivos innecesarios del contexto de build               |
| `nginx.conf`     | Permite que las rutas internas de Angular funcionen al recargar   |

---

## 🛠️ Tecnologías utilizadas

- [Angular](https://angular.io/)
- [TypeScript](https://www.typescriptlang.org/)
- [Bootstrap Icons](https://icons.getbootstrap.com/)
- [Docker](https://www.docker.com/) & [Nginx](https://nginx.org/)
- API REST con microservicios en [FastAPI](https://fastapi.tiangolo.com/)
- [PostgreSQL](https://www.postgresql.org/)