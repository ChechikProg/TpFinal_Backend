// Error con código HTTP. Se lanza desde services/controllers:
// throw new HttpError(404, 'Juego no encontrado')
export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}
