import { env } from '../config/env.js'
import { HttpError } from '../utils/httpError.js'

export const JUEGOS_POR_PAGINA = 20
const DURACION_CACHE_MS = 10 * 60 * 1000 // 10 minutos

// Guardamos las respuestas un rato para no pedirle lo mismo a RAWG muchas veces.
const cache = new Map()

async function pedirARawg(ruta, params = {}) {
  if (!env.rawgApiKey) {
    throw new HttpError(500, 'Falta configurar RAWG_API_KEY en el servidor')
  }

  const url = new URL(env.rawgApiUrl + ruta)
  url.searchParams.set('key', env.rawgApiKey)
  for (const [clave, valor] of Object.entries(params)) {
    if (valor !== undefined && valor !== '') url.searchParams.set(clave, valor)
  }

  const claveCache = url.toString()
  const guardado = cache.get(claveCache)
  if (guardado && guardado.vence > Date.now()) return guardado.datos

  let respuesta
  try {
    respuesta = await fetch(url, { signal: AbortSignal.timeout(10000) })
  } catch {
    throw new HttpError(502, 'No se pudo conectar con la API de juegos')
  }

  if (respuesta.status === 404) throw new HttpError(404, 'No encontramos ese juego')
  if (!respuesta.ok) throw new HttpError(502, 'La API de juegos respondió con un error')

  const datos = await respuesta.json()
  cache.set(claveCache, { datos, vence: Date.now() + DURACION_CACHE_MS })
  return datos
}

// Pasamos los datos de RAWG a un formato propio. Si mañana cambiamos de API,
// solo hay que tocar este archivo.
function aJuegoResumido(juego) {
  return {
    idExterno: juego.id,
    titulo: juego.name,
    portadaUrl: juego.background_image || null,
    fechaLanzamiento: juego.released || null,
    puntaje: juego.rating,
    metacritic: juego.metacritic ?? null,
    generos: (juego.genres || []).map((g) => g.name),
    plataformas: (juego.parent_platforms || []).map((p) => p.platform.name),
  }
}

function aJuegoCompleto(juego) {
  return {
    ...aJuegoResumido(juego),
    descripcion: juego.description_raw || '',
    desarrolladores: (juego.developers || []).map((d) => d.name),
    editores: (juego.publishers || []).map((p) => p.name),
    plataformasDetalle: (juego.platforms || []).map((p) => p.platform.name),
    duracionPromedio: juego.playtime || null,
    clasificacion: juego.esrb_rating?.name || null,
  }
}

export async function buscarJuegos({ texto, genero, plataforma, orden, pagina }) {
  const datos = await pedirARawg('/games', {
    page: pagina,
    page_size: JUEGOS_POR_PAGINA,
    search: texto,
    search_precise: texto ? 'true' : undefined,
    genres: genero,
    parent_platforms: plataforma,
    ordering: orden,
  })

  return {
    juegos: datos.results.map(aJuegoResumido),
    total: datos.count,
    hayMas: Boolean(datos.next),
  }
}

export async function obtenerJuego(idExterno) {
  const datos = await pedirARawg(`/games/${idExterno}`)
  return aJuegoCompleto(datos)
}

export async function obtenerGeneros() {
  const datos = await pedirARawg('/genres', { page_size: 40 })
  return datos.results.map((g) => ({ slug: g.slug, nombre: g.name }))
}
