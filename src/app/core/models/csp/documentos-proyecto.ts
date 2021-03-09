import { SgiRestListResult } from '@sgi/framework/http';
import { IProyectoDocumento } from './proyecto-documento';
import { IProyectoPeriodoSeguimientoDocumento } from './proyecto-periodo-seguimiento-documento';
import { IProyectoProrrogaDocumento } from './proyecto-prorroga-documento';
import { ISocioPeriodoJustificacionDocumento } from './socio-periodo-justificacion-documento';

export interface IDocumentosProyecto {

  proyectoDocumentos: IProyectoDocumento[];
  socioPeriodoJustificacionDocumentos: ISocioPeriodoJustificacionDocumento[];
  proyectoPeriodoSeguimientoDocumentos: IProyectoPeriodoSeguimientoDocumento[];
  prorrogaDocumentos: IProyectoProrrogaDocumento[];
}