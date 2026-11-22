import * as estadisticasRepository from '../repositories/estadisticas.repository.js'
import { traducirGenero } from '../utils/generos.js'

export async function calcular(usuarioId) {
  const [resumen, generos, plataformas, puntajes, meses, masJugados, diasActivos] = await Promise.all([
    estadisticasRepository.resumen(usuarioId),
    estadisticasRepository.generos(usuarioId),
    estadisticasRepository.plataformas(usuarioId),
    estadisticasRepository.distribucionPuntajes(usuarioId),
    estadisticasRepository.actividadMensual(usuarioId),
    estadisticasRepository.masJugados(usuarioId),
    estadisticasRepository.diasActivos(usuarioId),
  ])

  const total = resumen.total
  // Avance: qué porcentaje de la biblioteca ya está terminado
  const avance = total > 0 ? Math.round((resumen.terminado / total) * 100) : 0
  // Tasa de abandono sobre los juegos que ya se empezaron a jugar
  const empezados = resumen.jugando + resumen.terminado + resumen.abandonado
  const tasaAbandono = empezados > 0 ? Math.round((resumen.abandonado / empezados) * 100) : 0

  return {
    resumen: {
      totalJuegos: total,
      terminados: resumen.terminado,
      horasTotales: Math.round(resumen.horas_totales * 10) / 10,
      puntajePromedio: resumen.puntaje_promedio,
      avance,
      tasaAbandono,
      puntuaciones: resumen.puntuaciones,
      resenas: resumen.resenas,
      favoritos: resumen.favoritos,
      colecciones: resumen.colecciones,
      diasActivos,
    },
    estados: {
      quiero_jugar: resumen.quiero_jugar,
      jugando: resumen.jugando,
      terminado: resumen.terminado,
      abandonado: resumen.abandonado,
    },
    generos: generos.map((g) => ({ nombre: traducirGenero(g.genero), cantidad: g.cantidad, horas: g.horas })),
    plataformas: plataformas.map((p) => ({ nombre: p.plataforma, cantidad: p.cantidad })),
    puntajes: puntajes.map((p) => ({ puntaje: p.puntaje, cantidad: p.cantidad })),
    actividadMensual: meses,
    masJugados,
  }
}
