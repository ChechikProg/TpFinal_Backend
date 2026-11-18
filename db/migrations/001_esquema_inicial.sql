-- JuegosLink: estructura inicial de la base de datos
-- Ejecutar sobre la base "juegoslink"

-- =========================================
-- Usuarios y preferencias
-- =========================================
CREATE TABLE usuarios (
  id                    SERIAL PRIMARY KEY,
  nombre_usuario        VARCHAR(30)  NOT NULL UNIQUE,
  email                 VARCHAR(255) NOT NULL UNIQUE,
  contrasena_hash       TEXT         NOT NULL,
  nombre                VARCHAR(60),
  avatar_url            TEXT,
  bio                   VARCHAR(300),
  plataforma_preferida  VARCHAR(40),
  creado_en             TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Géneros preferidos del usuario (perfil)
CREATE TABLE usuario_generos (
  usuario_id INTEGER     NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  genero     VARCHAR(60) NOT NULL,
  PRIMARY KEY (usuario_id, genero)
);

-- =========================================
-- Juegos (copia de lo necesario de la API externa)
-- =========================================
CREATE TABLE juegos (
  id                SERIAL PRIMARY KEY,
  id_externo        INTEGER      NOT NULL UNIQUE,  -- id del juego en RAWG
  titulo            VARCHAR(200) NOT NULL,
  portada_url       TEXT,
  fecha_lanzamiento DATE,
  generos           TEXT[]       NOT NULL DEFAULT '{}',
  plataformas       TEXT[]       NOT NULL DEFAULT '{}',
  creado_en         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =========================================
-- Biblioteca
-- =========================================
CREATE TABLE biblioteca (
  id              SERIAL PRIMARY KEY,
  usuario_id      INTEGER      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  juego_id        INTEGER      NOT NULL REFERENCES juegos(id) ON DELETE CASCADE,
  estado          VARCHAR(20)  NOT NULL DEFAULT 'quiero_jugar'
                  CHECK (estado IN ('quiero_jugar', 'jugando', 'terminado', 'abandonado')),
  horas_jugadas   NUMERIC(7,1) NOT NULL DEFAULT 0 CHECK (horas_jugadas >= 0),
  terminado_en    TIMESTAMPTZ,
  agregado_en     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, juego_id)
);

-- =========================================
-- Favoritos
-- =========================================
CREATE TABLE favoritos (
  usuario_id INTEGER     NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  juego_id   INTEGER     NOT NULL REFERENCES juegos(id) ON DELETE CASCADE,
  creado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usuario_id, juego_id)
);

-- =========================================
-- Puntuaciones (1 a 5 estrellas, una por juego)
-- =========================================
CREATE TABLE puntuaciones (
  usuario_id     INTEGER     NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  juego_id       INTEGER     NOT NULL REFERENCES juegos(id) ON DELETE CASCADE,
  puntaje        SMALLINT    NOT NULL CHECK (puntaje BETWEEN 1 AND 5),
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usuario_id, juego_id)
);

-- =========================================
-- Reseñas (una por juego y usuario)
-- =========================================
CREATE TABLE resenas (
  id             SERIAL PRIMARY KEY,
  usuario_id     INTEGER     NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  juego_id       INTEGER     NOT NULL REFERENCES juegos(id) ON DELETE CASCADE,
  texto          TEXT        NOT NULL CHECK (char_length(texto) BETWEEN 1 AND 500),
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, juego_id)
);

-- =========================================
-- Colecciones y sus juegos
-- =========================================
CREATE TABLE colecciones (
  id             SERIAL PRIMARY KEY,
  usuario_id     INTEGER     NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre         VARCHAR(80) NOT NULL,
  descripcion    VARCHAR(300),
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, nombre)
);

CREATE TABLE coleccion_juegos (
  coleccion_id INTEGER     NOT NULL REFERENCES colecciones(id) ON DELETE CASCADE,
  juego_id     INTEGER     NOT NULL REFERENCES juegos(id) ON DELETE CASCADE,
  agregado_en  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (coleccion_id, juego_id)
);

-- =========================================
-- Actividad del usuario
-- =========================================
CREATE TABLE actividad (
  id           SERIAL PRIMARY KEY,
  usuario_id   INTEGER     NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo         VARCHAR(40) NOT NULL CHECK (tipo IN (
                 'juego_agregado', 'juego_quitado', 'estado_cambiado',
                 'favorito_agregado', 'favorito_quitado',
                 'juego_puntuado', 'resena_creada', 'resena_editada',
                 'coleccion_creada', 'coleccion_borrada',
                 'juego_agregado_a_coleccion', 'juego_quitado_de_coleccion',
                 'perfil_editado'
               )),
  juego_id     INTEGER     REFERENCES juegos(id) ON DELETE SET NULL,
  coleccion_id INTEGER     REFERENCES colecciones(id) ON DELETE SET NULL,
  detalle      JSONB,
  creado_en    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================
-- Índices para las consultas por usuario
-- =========================================
CREATE INDEX idx_biblioteca_usuario  ON biblioteca (usuario_id);
CREATE INDEX idx_resenas_juego       ON resenas (juego_id);
CREATE INDEX idx_colecciones_usuario ON colecciones (usuario_id);
CREATE INDEX idx_actividad_usuario   ON actividad (usuario_id, creado_en DESC);
