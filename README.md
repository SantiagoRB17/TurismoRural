# TurismoRural

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring_Boot-4.0.6-6DB33F?style=flat-square&logo=springboot&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Estado-Completado-green?style=flat-square"/>
</p>

Sistema de reservas de turismo rural para el Eje Cafetero / Quindío.  
Proyecto académico — Ingeniería de Software.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Java 21 + Spring Boot 4.0.6 |
| Frontend | React 18 + Vite (JavaScript) |
| Persistencia | HashMap en memoria (no requiere base de datos) |
| Dependencias extra | Lombok |

---

## Estructura del proyecto

```
TurismoRural/
├── src/main/java/com/proyecto/TurismoRural/
│   ├── modelo/          # Entidades: Cliente, Experiencia, Reserva
│   ├── dto/             # ReservaRequest
│   ├── repositorio/     # Acceso a datos en memoria
│   ├── servicio/        # Lógica de negocio y validaciones
│   ├── controlador/     # Endpoints REST
│   └── config/          # CORS, datos de prueba (DataSeeder), manejo de errores
├── frontend/
│   └── src/
│       ├── screens/     # NuevaReserva.jsx, Clientes.jsx
│       ├── api.js       # Llamadas al backend
│       └── App.jsx
└── pom.xml
```

---

## Requisitos previos

- Java 21
- Node.js 18 o superior
- pnpm

---

## Cómo ejecutar

**1. Backend**

```bash
.\mvnw.cmd spring-boot:run
```

Queda disponible en `http://localhost:8080`

**2. Frontend**

```bash
cd frontend
pnpm install
pnpm dev
```

Queda disponible en `http://localhost:5173`

---

## API REST

### Clientes — `/api/clientes`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/clientes` | Lista todos los clientes |
| GET | `/api/clientes?query=texto` | Busca por nombre o documento |
| GET | `/api/clientes/{documento}` | Obtiene un cliente por documento |
| POST | `/api/clientes` | Crea un nuevo cliente |
| PUT | `/api/clientes/{documento}` | Actualiza los datos de un cliente |
| PATCH | `/api/clientes/{documento}/estado` | Activa o desactiva un cliente |
| DELETE | `/api/clientes/{documento}` | Desactiva un cliente (borrado lógico) |

### Experiencias — `/api/experiencias`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/experiencias` | Lista todas las experiencias |
| GET | `/api/experiencias?query=texto` | Busca por nombre o ubicación |
| GET | `/api/experiencias/{id}` | Obtiene una experiencia por ID |

### Reservas — `/api/reservas`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/reservas` | Lista todas las reservas |
| GET | `/api/reservas?clienteDoc=doc` | Lista reservas de un cliente |
| GET | `/api/reservas/{id}` | Obtiene el detalle de una reserva |
| POST | `/api/reservas` | Crea una nueva reserva |

**Ejemplo de cuerpo para crear reserva:**

```json
{
  "clienteDocumento": "1094567890",
  "experienciaId": 3,
  "fechaExperiencia": "2025-08-20",
  "cantidadPersonas": 2
}
```

---

## Reglas de negocio

| Regla | Descripción |
|-------|-------------|
| RN-01 | Un cliente no puede tener más de 2 reservas activas simultáneas |
| RN-02 | Solo se pueden reservar experiencias con estado `DISPONIBLE` |
| RN-03 | La cantidad de personas no puede superar la capacidad máxima de la experiencia |
| RN-04 | La fecha de la experiencia debe ser mínimo el día siguiente a hoy |
| RN-05 | El total se calcula en el servidor: `precio × cantidadPersonas` |
| RN-06 | El cliente debe estar en estado `ACTIVO` |
| RN-07 | No se permiten reservas duplicadas (mismo cliente + misma experiencia + misma fecha activa) |

---

## Pantallas

- **Nueva Reserva:** formulario con búsqueda de cliente y experiencia, validación en tiempo real, modal de confirmación con código `RSV-XXXXXX`.
- **Clientes:** tabla paginada con buscador, estadísticas, drawer para crear/editar, y toggle de estado con confirmación.

---

## Autores

| Nombre | GitHub |
|--------|--------|
| Santiago Guevara | https://github.com/GuevaraSnow |
| Santiago Ramirez Bernal | https://github.com/SantiagoRB17 |
