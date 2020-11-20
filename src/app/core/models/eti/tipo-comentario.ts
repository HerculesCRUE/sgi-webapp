export class TipoComentario {
  /** Id */
  id: number;

  /** Nombre */
  nombre: string;

  /** Activo */
  activo: boolean;

  constructor(tipoComentario?: TipoComentario) {
    this.id = tipoComentario?.id;
    this.nombre = tipoComentario?.nombre;
    this.activo = tipoComentario?.activo;
  }
}
