// Error con código HTTP. Se lanza desde services/controllers:
// throw new HttpError(404, 'Juego no encontrado')
// Opcionalmente lleva detalles, por ejemplo los errores de cada campo de un formulario.
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}
