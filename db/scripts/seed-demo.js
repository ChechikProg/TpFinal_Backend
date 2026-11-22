// Crea (o vuelve a crear) la cuenta demo con datos de ejemplo.
// Uso: npm run seed
// Usa la base y la key de RAWG del archivo .env. Para cargarla en producción,
// poné temporalmente en DATABASE_URL la conexión de Neon.
import bcrypt from 'bcryptjs'
import { pool } from '../../src/config/db.js'
import * as rawgService from '../../src/services/rawg.service.js'
import * as juegosRepository from '../../src/repositories/juegos.repository.js'

const DEMO = {
  nombreUsuario: 'demo',
  email: 'demo@juegoslink.com',
  contrasena: 'Demo1234',
  nombre: 'Jugador Demo',
  bio: 'Cuenta de prueba de JuegosLink. Me gustan los cooperativos y los indies difíciles.',
  plataformaPreferida: 'PC',
  generosPreferidos: ['Aventura', 'Plataformas', 'Indie'],
}

// [búsqueda en RAWG, estado, horas, puntaje, favorito, reseña, hace cuántos días se agregó]
const JUEGOS = [
  ['Rocket League', 'jugando', 140, 4, true, null, 150],
  ['Cuphead', 'jugando', 12, 4, false, 'El jefe del dragón me costó dos días. Vale cada intento, el arte es una locura.', 120],
  ['A Way Out', 'terminado', 7, 5, true, 'Hay que jugarlo con alguien al lado. La historia sorprende hasta el final.', 100],
  ['Papers, Please', 'terminado', 9, 5, true, 'Nunca pensé que revisar pasaportes podía ser tan tenso. Una joya.', 90],
  ['Grand Theft Auto V', 'abandonado', 35, 3, false, null, 160],
  ['Risk', 'quiero_jugar', 0, null, true, null, 20],
  ['Hollow Knight', 'jugando', 22, 5, false, null, 45],
  ['Stardew Valley', 'terminado', 60, 4, false, null, 75],
  ['It Takes Two', 'terminado', 14, 5, true, null, 60],
  ['Celeste', 'quiero_jugar', 0, null, false, null, 10],
  ['Portal 2', 'terminado', 10, 5, false, null, 130],
  ['Hades', 'quiero_jugar', 0, null, false, null, 5],
]

const COLECCIONES = [
  ['Co-op con amigos', 'Para jugar de a dos o más', ['A Way Out', 'It Takes Two', 'Rocket League', 'Portal 2']],
  ['Indies favoritos', 'Pequeños pero enormes', ['Cuphead', 'Hollow Knight', 'Papers, Please', 'Celeste', 'Stardew Valley']],
  ['Juegos de mesa', null, ['Risk']],
]

async function buscarEnRawg(nombre) {
  const { juegos } = await rawgService.buscarJuegos({ texto: nombre, pagina: 1 })
  if (juegos.length === 0) return null
  // Preferimos el que coincide exactamente con el nombre
  const exacto = juegos.find((j) => j.titulo.toLowerCase() === nombre.toLowerCase())
  return rawgService.obtenerJuego((exacto || juegos[0]).idExterno)
}

async function main() {
  const db = await pool.connect()
  try {
    console.log('Buscando juegos en RAWG...')
    const encontrados = new Map()
    for (const [nombre] of JUEGOS) {
      const juego = await buscarEnRawg(nombre)
      if (!juego) {
        console.log(`  ✗ ${nombre}: no se encontró, se saltea`)
        continue
      }
      encontrados.set(nombre, juego)
      console.log(`  ✓ ${nombre} → ${juego.titulo} (id ${juego.idExterno})`)
    }

    await db.query('BEGIN')

    // Borramos la cuenta demo anterior (se borra todo lo suyo en cascada)
    await db.query('DELETE FROM usuarios WHERE email = $1', [DEMO.email])

    const hash = await bcrypt.hash(DEMO.contrasena, 10)
    const { rows } = await db.query(
      `INSERT INTO usuarios (nombre_usuario, email, contrasena_hash, nombre, bio, plataforma_preferida, creado_en)
       VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '170 days') RETURNING id`,
      [DEMO.nombreUsuario, DEMO.email, hash, DEMO.nombre, DEMO.bio, DEMO.plataformaPreferida]
    )
    const usuarioId = rows[0].id
    for (const genero of DEMO.generosPreferidos) {
      await db.query('INSERT INTO usuario_generos (usuario_id, genero) VALUES ($1, $2)', [usuarioId, genero])
    }

    const idsInternos = new Map()
    const actividad = (tipo, juegoId, dias, detalle = null, coleccionId = null) =>
      db.query(
        `INSERT INTO actividad (usuario_id, tipo, juego_id, coleccion_id, detalle, creado_en)
         VALUES ($1, $2, $3, $4, $5, NOW() - make_interval(days => $6))`,
        [usuarioId, tipo, juegoId, coleccionId, detalle, dias]
      )

    for (const [nombre, estado, horas, puntaje, favorito, resena, dias] of JUEGOS) {
      const juego = encontrados.get(nombre)
      if (!juego) continue
      const juegoId = await juegosRepository.guardar(juego, db)
      idsInternos.set(nombre, juegoId)

      // Los terminados se terminaron un tiempo después de agregarlos
      const diasTerminado = estado === 'terminado' ? Math.max(1, Math.floor(dias / 2)) : null
      await db.query(
        `INSERT INTO biblioteca (usuario_id, juego_id, estado, horas_jugadas, agregado_en, actualizado_en, terminado_en)
         VALUES ($1, $2, $3, $4, NOW() - make_interval(days => $5), NOW() - make_interval(days => $5),
                 CASE WHEN $6::int IS NULL THEN NULL ELSE NOW() - make_interval(days => $6::int) END)`,
        [usuarioId, juegoId, estado, horas, dias, diasTerminado]
      )
      await actividad('juego_agregado', juegoId, dias, { estado: 'quiero_jugar' })
      if (estado !== 'quiero_jugar') {
        await actividad('estado_cambiado', juegoId, diasTerminado ?? Math.floor(dias / 3), { anterior: 'quiero_jugar', nuevo: estado })
      }

      if (puntaje) {
        await db.query('INSERT INTO puntuaciones (usuario_id, juego_id, puntaje) VALUES ($1, $2, $3)', [usuarioId, juegoId, puntaje])
        await actividad('juego_puntuado', juegoId, Math.max(1, Math.floor(dias / 4)), { puntaje })
      }
      if (favorito) {
        await db.query('INSERT INTO favoritos (usuario_id, juego_id) VALUES ($1, $2)', [usuarioId, juegoId])
        await actividad('favorito_agregado', juegoId, Math.max(1, Math.floor(dias / 5)))
      }
      if (resena) {
        await db.query('INSERT INTO resenas (usuario_id, juego_id, texto) VALUES ($1, $2, $3)', [usuarioId, juegoId, resena])
        await actividad('resena_creada', juegoId, Math.max(1, Math.floor(dias / 6)))
      }
    }

    for (const [nombre, descripcion, juegos] of COLECCIONES) {
      const { rows: filas } = await db.query(
        `INSERT INTO colecciones (usuario_id, nombre, descripcion, creado_en)
         VALUES ($1, $2, $3, NOW() - INTERVAL '30 days') RETURNING id`,
        [usuarioId, nombre, descripcion]
      )
      const coleccionId = filas[0].id
      await actividad('coleccion_creada', null, 30, { nombre }, coleccionId)
      for (const juego of juegos) {
        const juegoId = idsInternos.get(juego)
        if (!juegoId) continue
        await db.query('INSERT INTO coleccion_juegos (coleccion_id, juego_id) VALUES ($1, $2)', [coleccionId, juegoId])
      }
    }

    await db.query('COMMIT')
    console.log(`\nCuenta demo lista: ${DEMO.email} / ${DEMO.contrasena}`)
    console.log(`Juegos: ${idsInternos.size} · Colecciones: ${COLECCIONES.length}`)
  } catch (error) {
    await db.query('ROLLBACK').catch(() => {})
    console.error('No se pudo crear la cuenta demo:', error.message)
    process.exitCode = 1
  } finally {
    db.release()
    await pool.end()
  }
}

main()
