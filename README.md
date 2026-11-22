# JuegosLink · Backend

API REST de JuegosLink: una app para explorar videojuegos y armar tu biblioteca personal con estados, favoritos, colecciones, puntuaciones, reseñas y estadísticas.

**Tecnologías:** Node.js, Express, PostgreSQL, JWT en cookie HttpOnly, bcrypt. Los juegos se consultan en la API de [RAWG](https://rawg.io/apidocs) desde el servidor.

## Cuenta demo

| Correo | Contraseña |
|---|---|
| `demo@juegoslink.com` | `Demo1234` |

Tiene 12 juegos en la biblioteca, 5 favoritos, 3 colecciones, 9 puntuaciones y 3 reseñas.

## Correr en local

Requisitos: Node 20 o superior y PostgreSQL.

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Crear la base `juegoslink` y ejecutar el script `db/migrations/001_esquema_inicial.sql`.
3. Copiar `.env.example` a `.env` y completar los valores (ver abajo).
4. Cargar la cuenta demo (opcional):
   ```bash
   npm run seed
   ```
5. Levantar el servidor:
   ```bash
   npm run dev
   ```
   Queda en http://localhost:3000. Para comprobar que anda: http://localhost:3000/api/health

### Variables de entorno

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (por defecto 3000) |
| `NODE_ENV` | `development` o `production` |
| `CORS_ORIGIN` | URL del frontend |
| `DATABASE_URL` | Conexión a PostgreSQL |
| `JWT_SECRET` | Clave para firmar los tokens. Generarla con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Duración de la sesión (ej: `7d`) |
| `RAWG_API_KEY` | Key de la API de RAWG |

## Endpoints

Todas las rutas empiezan con `/api`. Salvo `/health` y `/auth/*`, todas requieren sesión iniciada.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado del servidor y de la base |
| POST | `/auth/registro` | Crear cuenta |
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/logout` | Cerrar sesión |
| GET | `/auth/yo` | Usuario logueado |
| GET | `/juegos?texto=&genero=&plataforma=&orden=&pagina=` | Buscar juegos en RAWG |
| GET | `/juegos/generos` | Géneros disponibles |
| GET | `/juegos/:idExterno` | Detalle de un juego |
| GET | `/juegos/imagen?url=` | Portada de RAWG servida por el back |
| GET | `/biblioteca?estado=&favoritos=&orden=` | Mi biblioteca y conteo por estado |
| POST | `/biblioteca` | Agregar un juego `{ idExterno, estado }` |
| GET / PATCH / DELETE | `/biblioteca/:idExterno` | Ver, cambiar estado u horas, quitar |
| GET | `/favoritos` | Mis favoritos |
| GET / PUT / DELETE | `/favoritos/:idExterno` | Consultar, marcar o desmarcar favorito |
| GET | `/valoraciones/:idExterno` | Mi puntuación y todas las reseñas del juego |
| PUT / DELETE | `/valoraciones/:idExterno/puntaje` | Puntuar del 1 al 5 o quitar |
| PUT / DELETE | `/valoraciones/:idExterno/resena` | Escribir, editar o borrar mi reseña |
| GET / POST | `/colecciones` | Listar o crear colecciones |
| GET / PATCH / DELETE | `/colecciones/:id` | Ver, renombrar o borrar una colección |
| POST | `/colecciones/:id/juegos` | Agregar un juego `{ idExterno }` |
| DELETE | `/colecciones/:id/juegos/:idExterno` | Quitar un juego |
| GET / PATCH | `/perfil` | Ver o editar nombre, bio, avatar y preferencias |
| GET | `/actividad?limite=` | Actividad reciente |
| GET | `/estadisticas` | Estadísticas calculadas con los datos del usuario |

## Estadísticas

Se calculan en el momento con consultas SQL sobre los datos del usuario, sin valores guardados:

- Juegos terminados y avance de la biblioteca (porcentaje terminado)
- Tiempo total de juego
- Puntuación promedio y distribución de puntuaciones
- Tasa de abandono
- Géneros favoritos y plataformas más usadas
- Juegos agregados y terminados por mes (últimos 6 meses)
- Juegos más jugados
- Reseñas, favoritos, colecciones y días activos

## Estructura

```
src/
├── config/        Variables de entorno y conexión a la base
├── routes/        Definición de rutas
├── controllers/   Reciben el pedido y devuelven la respuesta
├── validators/    Validación de los datos de entrada
├── services/      Lógica de negocio
├── repositories/  Consultas SQL
├── middlewares/   Autenticación y manejo de errores
└── utils/         JWT, errores HTTP y traducción de géneros
db/
├── migrations/    Script para crear las tablas
└── scripts/       Carga de la cuenta demo
```

## Seguridad

- Contraseñas hasheadas con bcrypt.
- JWT con vencimiento, guardado en una cookie HttpOnly.
- Cada consulta filtra por el usuario de la sesión: nadie puede ver ni modificar datos de otra cuenta.
- Consultas SQL parametrizadas.
- La key de RAWG y los secretos solo están en variables de entorno.
