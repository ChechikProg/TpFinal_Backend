import * as rawgService from '../services/rawg.service.js'
import { validarBusqueda } from '../validators/juegos.validator.js'
import { validarIdExterno } from '../validators/comunes.validator.js'

export async function buscar(req, res, next) {
  try {
    res.json(await rawgService.buscarJuegos(validarBusqueda(req.query)))
  } catch (error) {
    next(error)
  }
}

export async function generos(req, res, next) {
  try {
    res.json({ generos: await rawgService.obtenerGeneros() })
  } catch (error) {
    next(error)
  }
}

export async function detalle(req, res, next) {
  try {
    const juego = await rawgService.obtenerJuego(validarIdExterno(req.params.idExterno))
    res.json({ juego })
  } catch (error) {
    next(error)
  }
}
