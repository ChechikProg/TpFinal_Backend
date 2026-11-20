import { env } from '../config/env.js'
import { HttpError } from '../utils/httpError.js'
import { traducirGenero } from '../utils/generos.js'

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
  } catch (error) {
    console.error('No se pudo conectar con RAWG:', error.cause?.code || error.message)
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
    generos: (juego.genres || []).map((g) => traducirGenero(g.name)),
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
  return datos.results.map((g) => ({ slug: g.slug, nombre: traducirGenero(g.name) }))
}

// ---------- Portadas ----------
// Las imágenes de RAWG pasan por nuestro back para que se vean aunque la red
// bloquee media.rawg.io. Solo aceptamos imágenes de ese dominio, así nadie
// puede usar el servidor para descargar cualquier cosa de internet.
const HOST_IMAGENES = 'media.rawg.io'
const TAMANO_MAXIMO = 5 * 1024 * 1024 // 5 MB

export function validarUrlDeImagen(texto) {
  let url
  try {
    url = new URL(texto)
  } catch {
    throw new HttpError(400, 'La URL de la imagen no es válida')
  }
  if (url.protocol !== 'https:' || url.hostname !== HOST_IMAGENES) {
    throw new HttpError(400, 'Solo se permiten imágenes de RAWG')
  }
  return url
}

// RAWG puede achicar la imagen: /media/games/x.jpg -> /media/resize/640/-/games/x.jpg
function urlAchicada(url, ancho) {
  const copia = new URL(url)
  const coincide = copia.pathname.match(/^\/media\/(games|screenshots)\/(.+)$/)
  if (coincide) copia.pathname = `/media/resize/${ancho}/-/${coincide[1]}/${coincide[2]}`
  return copia
}

export async function obtenerImagen(url, ancho = 640) {
  let respuesta
  try {
    respuesta = await fetch(urlAchicada(url, ancho), { signal: AbortSignal.timeout(10000) })
  } catch {
    throw new HttpError(502, 'No se pudo descargar la imagen')
  }
  if (!respuesta.ok) throw new HttpError(respuesta.status === 404 ? 404 : 502, 'No se pudo descargar la imagen')

  const tipo = respuesta.headers.get('content-type') || ''
  if (!tipo.startsWith('image/')) throw new HttpError(502, 'La respuesta no es una imagen')

  const datos = Buffer.from(await respuesta.arrayBuffer())
  if (datos.length > TAMANO_MAXIMO) throw new HttpError(502, 'La imagen es demasiado grande')

  return { tipo, datos }
}
