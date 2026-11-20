import { HttpError } from '../utils/httpError.js'

const ORDENES = ['', '-added', '-rating', '-metacritic', '-released', 'name']
const SLUG_REGEX = /^[a-z0-9-]*$/

export function validarBusqueda(query = {}) {
  const texto = typeof query.texto === 'string' ? query.texto.trim().slice(0, 100) : ''
  const genero = typeof query.genero === 'string' ? query.genero : ''
  const plataforma = typeof query.plataforma === 'string' ? query.plataforma : ''
  const orden = typeof query.orden === 'string' ? query.orden : ''
  const pagina = query.pagina === undefined ? 1 : Number(query.pagina)

  if (!SLUG_REGEX.test(genero)) throw new HttpError(400, 'El género no es válido')
  if (plataforma && !/^\d+$/.test(plataforma)) throw new HttpError(400, 'La plataforma no es válida')
  if (!ORDENES.includes(orden)) throw new HttpError(400, 'El orden no es válido')
  if (!Number.isInteger(pagina) || pagina < 1 || pagina > 500) {
    throw new HttpError(400, 'La página no es válida')
  }

  return { texto, genero, plataforma, orden, pagina }
}
