import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IProyecto } from '@core/models/csp/proyecto';
import { IProyectoPeriodoSeguimiento } from '@core/models/csp/proyecto-periodo-seguimiento';
import { ActionService } from '@core/services/action-service';
import { ProyectoPeriodoSeguimientoDocumentoService } from '@core/services/csp/proyecto-periodo-seguimiento-documento.service';
import { ProyectoPeriodoSeguimientoService } from '@core/services/csp/proyecto-periodo-seguimiento.service';
import { DocumentoService } from '@core/services/sgdoc/documento.service';
import { NGXLogger } from 'ngx-logger';
import { PROYECTO_PERIODO_SEGUIMIENTO_DATA_KEY } from './proyecto-periodo-seguimiento-data.resolver';
import { ProyectoPeriodoSeguimientoDatosGeneralesFragment } from './proyecto-periodo-seguimiento-formulario/proyecto-periodo-seguimiento-datos-generales/proyecto-periodo-seguimiento-datos-generales.fragment';
import { ProyectoPeriodoSeguimientoDocumentosFragment } from './proyecto-periodo-seguimiento-formulario/proyecto-periodo-seguimiento-documentos/proyecto-periodo-seguimiento-documentos.fragment';
import { PROYECTO_PERIODO_SEGUIMIENTO_ROUTE_PARAMS } from './proyecto-periodo-seguimiento-route-params';

export interface IProyectoPeriodoSeguimientoData {
  proyecto: IProyecto;
  proyectoPeriodosSeguimiento: IProyectoPeriodoSeguimiento[];
  readonly: boolean;
}

@Injectable()
export class ProyectoPeriodoSeguimientoActionService extends ActionService {

  public readonly FRAGMENT = {
    DATOS_GENERALES: 'datosGenerales',
    DOCUMENTOS: 'documentos'
  };

  private datosGenerales: ProyectoPeriodoSeguimientoDatosGeneralesFragment;
  private documentos: ProyectoPeriodoSeguimientoDocumentosFragment;

  private readonly data: IProyectoPeriodoSeguimientoData;

  get proyectoModeloEjecucionId(): number {
    return this.data.proyecto.modeloEjecucion.id;
  }

  get proyectoPeriodoSeguimiento(): IProyectoPeriodoSeguimiento[] {
    return this.data.proyectoPeriodosSeguimiento;
  }

  constructor(
    logger: NGXLogger,
    route: ActivatedRoute,
    proyectoPeriodoSeguimientoService: ProyectoPeriodoSeguimientoService,
    periodoSeguimientoDocumentoService: ProyectoPeriodoSeguimientoDocumentoService,
    documentoService: DocumentoService
  ) {
    super();
    this.data = route.snapshot.data[PROYECTO_PERIODO_SEGUIMIENTO_DATA_KEY];
    const id = Number(route.snapshot.paramMap.get(PROYECTO_PERIODO_SEGUIMIENTO_ROUTE_PARAMS.ID));

    if (id) {
      this.enableEdit();
    }

    this.datosGenerales = new ProyectoPeriodoSeguimientoDatosGeneralesFragment(
      id, proyectoPeriodoSeguimientoService, this.data.proyecto, this.data.readonly);
    this.documentos = new ProyectoPeriodoSeguimientoDocumentosFragment(
      logger, id, proyectoPeriodoSeguimientoService, periodoSeguimientoDocumentoService, documentoService, this.data.readonly);

    this.addFragment(this.FRAGMENT.DATOS_GENERALES, this.datosGenerales);
    this.addFragment(this.FRAGMENT.DOCUMENTOS, this.documentos);

  }
}
