// RAWG devuelve los géneros en inglés. Los traducimos para mostrarlos en español.
const TRADUCCIONES = {
  Action: 'Acción',
  Adventure: 'Aventura',
  Arcade: 'Arcade',
  'Board Games': 'Juegos de mesa',
  Card: 'Cartas',
  Casual: 'Casual',
  Educational: 'Educativo',
  Family: 'Familiar',
  Fighting: 'Lucha',
  Indie: 'Indie',
  'Massively Multiplayer': 'Multijugador masivo',
  Platformer: 'Plataformas',
  Puzzle: 'Puzle',
  Racing: 'Carreras',
  RPG: 'Rol',
  Shooter: 'Disparos',
  Simulation: 'Simulación',
  Sports: 'Deportes',
  Strategy: 'Estrategia',
}

export function traducirGenero(nombre) {
  return TRADUCCIONES[nombre] || nombre
}
