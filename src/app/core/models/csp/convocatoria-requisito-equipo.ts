export interface IConvocatoriaRequisitoEquipo {
  /** Id */
  id: number;
  /** Id de Convocatoria */
  convocatoriaId: number;
  /** Referencia nivel académico */
  nivelAcademicoRef: string;
  /** Años nivel académico */
  aniosNivelAcademico: number;
  /** Ratio máxima */
  edadMaxima: number;
  /** Vinculación universidad */
  vinculacionUniversidad: boolean;
  /** Referencia modalidad contrato */
  modalidadContratoRef: string;
  /** Años vinculación */
  aniosVinculacion: number;
  /** Número mínimo proyectos competitivos */
  numMinimoCompetitivos: number;
  /** Número mínimo proyectos NO competitivos */
  numMinimoNoCompetitivos: number;
  /** Número máximo proyectos competitivos activos */
  numMaximoCompetitivosActivos: number;
  /** Número máximo proyectos NO competitivos activos */
  numMaximoNoCompetitivosActivos: number;
  /** Otros requisitos */
  otrosRequisitos: string;
}
