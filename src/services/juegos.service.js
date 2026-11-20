import * as juegosRepository from '../repositories/juegos.repository.js'
import * as rawgService from './rawg.service.js'

// Devuelve el id interno del juego. Si todavía no está en nuestra base,
// lo trae de RAWG y lo guarda. Así los datos vienen siempre de la API
// y no de lo que mande el front.
export async function asegurarJuego(idExterno, db) {
  const idExistente = await juegosRepository.buscarIdPorIdExterno(idExterno, db)
  if (idExistente) return idExistente

  const juego = await rawgService.obtenerJuego(idExterno)
  return juegosRepository.guardar(juego, db)
}
