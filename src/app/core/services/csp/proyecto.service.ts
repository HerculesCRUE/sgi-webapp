import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ESTADO_PROYECTO_CONVERTER } from '@core/converters/csp/estado-proyecto.converter';
import { PROYECTO_CONTEXTO_CONVERTER } from '@core/converters/csp/proyecto-contexto.converter';
import { PROYECTO_DOCUMENTO_CONVERTER } from '@core/converters/csp/proyecto-documento.converter';
import { PROYECTO_ENTIDAD_CONVOCANTE_CONVERTER } from '@core/converters/csp/proyecto-entidad-convocante.converter';
import { PROYECTO_ENTIDAD_FINANCIADORA_CONVERTER } from '@core/converters/csp/proyecto-entidad-financiadora.converter';
import { PROYECTO_ENTIDAD_GESTORA_CONVERTER } from '@core/converters/csp/proyecto-entidad-gestora.converter';
import { PROYECTO_EQUIPO_CONVERTER } from '@core/converters/csp/proyecto-equipo.converter';
import { PROYECTO_HITO_CONVERTER } from '@core/converters/csp/proyecto-hito.converter';
import { PROYECTO_PAQUETE_TRABAJO_CONVERTER } from '@core/converters/csp/proyecto-paquete-trabajo.converter';
import { PROYECTO_PERIODO_SEGUIMIENTO_CONVERTER } from '@core/converters/csp/proyecto-periodo-seguimiento.converter';
import { PROYECTO_PLAZO_CONVERTER } from '@core/converters/csp/proyecto-plazo.converter';
import { PROYECTO_PRORROGA_CONVERTER } from '@core/converters/csp/proyecto-prorroga.converter';
import { PROYECTO_SOCIO_CONVERTER } from '@core/converters/csp/proyecto-socio.converter';
import { PROYECTO_CONVERTER } from '@core/converters/csp/proyecto.converter';
import { IEstadoProyectoBackend } from '@core/models/csp/backend/estado-proyecto-backend';
import { IProyectoBackend } from '@core/models/csp/backend/proyecto-backend';
import { IProyectoContextoBackend } from '@core/models/csp/backend/proyecto-contexto-backend';
import { IProyectoDocumentoBackend } from '@core/models/csp/backend/proyecto-documento-backend';
import { IProyectoEntidadConvocanteBackend } from '@core/models/csp/backend/proyecto-entidad-convocante-backend';
import { IProyectoEntidadFinanciadoraBackend } from '@core/models/csp/backend/proyecto-entidad-financiadora-backend';
import { IProyectoEntidadGestoraBackend } from '@core/models/csp/backend/proyecto-entidad-gestora-backend';
import { IProyectoEquipoBackend } from '@core/models/csp/backend/proyecto-equipo-backend';
import { IProyectoHitoBackend } from '@core/models/csp/backend/proyecto-hito-backend';
import { IProyectoPaqueteTrabajoBackend } from '@core/models/csp/backend/proyecto-paquete-trabajo-backend';
import { IProyectoPeriodoSeguimientoBackend } from '@core/models/csp/backend/proyecto-periodo-seguimiento-backend';
import { IProyectoPlazoBackend } from '@core/models/csp/backend/proyecto-plazo-backend';
import { IProyectoProrrogaBackend } from '@core/models/csp/backend/proyecto-prorroga-backend';
import { IProyectoSocioBackend } from '@core/models/csp/backend/proyecto-socio-backend';
import { IEstadoProyecto } from '@core/models/csp/estado-proyecto';
import { IPrograma } from '@core/models/csp/programa';
import { IProyecto } from '@core/models/csp/proyecto';
import { IProyectoContexto } from '@core/models/csp/proyecto-contexto';
import { IProyectoDocumento } from '@core/models/csp/proyecto-documento';
import { IProyectoEntidadConvocante } from '@core/models/csp/proyecto-entidad-convocante';
import { IProyectoEntidadFinanciadora } from '@core/models/csp/proyecto-entidad-financiadora';
import { IProyectoEntidadGestora } from '@core/models/csp/proyecto-entidad-gestora';
import { IProyectoEquipo } from '@core/models/csp/proyecto-equipo';
import { IProyectoHito } from '@core/models/csp/proyecto-hito';
import { IProyectoPaqueteTrabajo } from '@core/models/csp/proyecto-paquete-trabajo';
import { IProyectoPeriodoSeguimiento } from '@core/models/csp/proyecto-periodo-seguimiento';
import { IProyectoPlazos } from '@core/models/csp/proyecto-plazo';
import { IProyectoProrroga } from '@core/models/csp/proyecto-prorroga';
import { IProyectoSocio } from '@core/models/csp/proyecto-socio';
import { environment } from '@env';
import {
  RSQLSgiRestFilter,
  SgiMutableRestService,
  SgiRestFilterOperator,
  SgiRestFindOptions,
  SgiRestListResult
} from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ProyectoService extends SgiMutableRestService<number, IProyectoBackend, IProyecto> {
  private static readonly MAPPING = '/proyectos';
  private static readonly ENTIDAD_CONVOCANTES_MAPPING = 'entidadconvocantes';

  constructor(readonly logger: NGXLogger, protected http: HttpClient) {
    super(
      ProyectoService.name,
      `${environment.serviceServers.csp}${ProyectoService.MAPPING}`,
      http,
      PROYECTO_CONVERTER
    );
  }

  /**
   * Devuelve todos que estén asociadas a
   * las unidades de gestión a las que esté vinculado el usuario
   * @param options opciones de búsqueda.
   */
  findTodos(options?: SgiRestFindOptions): Observable<SgiRestListResult<IProyecto>> {
    return this.find<IProyecto, IProyecto>(`${this.endpointUrl}/todos`, options);
  }

  /**
   * Recupera los paquete trabajo de un proyecto
   * @param idProyecto Identificador del proyecto.
   * @returns Listado de paquete trabajo.
   */
  findPaqueteTrabajoProyecto(idProyecto: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IProyectoPaqueteTrabajo>> {
    return this.find<IProyectoPaqueteTrabajoBackend, IProyectoPaqueteTrabajo>(
      `${this.endpointUrl}/${idProyecto}/proyectopaquetetrabajos`,
      options,
      PROYECTO_PAQUETE_TRABAJO_CONVERTER
    );
  }

  /**
   * Recupera los plazos de un proyecto
   * @param idProyecto Identificador del proyecto.
   * @returns Listado de plazos.
   */
  findPlazosProyecto(idProyecto: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IProyectoPlazos>> {
    return this.find<IProyectoPlazoBackend, IProyectoPlazos>(
      `${this.endpointUrl}/${idProyecto}/proyectofases`,
      options,
      PROYECTO_PLAZO_CONVERTER
    );
  }

  /**
   * Devuelve los datos del proyecto contexto
   *
   * @param proyectoID Id del proyecto
   */
  findProyectoContexto(proyectoID: number): Observable<IProyectoContexto> {
    return this.http.get<IProyectoContextoBackend>(
      `${this.endpointUrl}/${proyectoID}/proyecto-contextoproyectos`
    ).pipe(
      map(response => PROYECTO_CONTEXTO_CONVERTER.toTarget(response))
    );
  }

  /**
   * Desactivar proyecto
   * @param options opciones de búsqueda.
   */
  desactivar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/desactivar`, undefined);
  }

  /**
   * Reactivar proyecto
   * @param options opciones de búsqueda.
   */
  reactivar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/reactivar`, undefined);
  }

  private findEntidadesFinanciadoras(id: number, options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IProyectoEntidadFinanciadora>> {
    return this.find<IProyectoEntidadFinanciadoraBackend, IProyectoEntidadFinanciadora>(
      `${this.endpointUrl}/${id}/proyectoentidadfinanciadoras`,
      options,
      PROYECTO_ENTIDAD_FINANCIADORA_CONVERTER
    );
  }

  private findEntidadesFinanciadorasFilterAjenas(id: number, ajenas: boolean, options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IProyectoEntidadFinanciadora>> {
    let queryOptions: SgiRestFindOptions = options;
    if (!queryOptions) {
      queryOptions = {};
    }
    if (queryOptions.filter) {
      queryOptions.filter.remove('ajena');
      queryOptions.filter.and('ajena', SgiRestFilterOperator.EQUALS, `${ajenas}`);
    }
    else {
      queryOptions.filter = new RSQLSgiRestFilter('ajena', SgiRestFilterOperator.EQUALS, `${ajenas}`);
    }
    return this.findEntidadesFinanciadoras(id, queryOptions);
  }

  /**
   * Obtiene el listado de entidades financiadores asociadas al proyecto que NO son ajenas a la convocatoria
   * @param id Identificador del proyecto
   * @param options Opciones de filtrado/ordenación
   */
  findEntidadesFinanciadorasPropias(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IProyectoEntidadFinanciadora>> {
    return this.findEntidadesFinanciadorasFilterAjenas(id, false, options);
  }

  /**
   * Obtiene el listado de entidades financiadores asociadas al proyecto que son ajenas a la convocatoria
   * @param id Identificador del proyecto
   * @param options Opciones de filtrado/ordenación
   */
  findEntidadesFinanciadorasAjenas(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IProyectoEntidadFinanciadora>> {
    return this.findEntidadesFinanciadorasFilterAjenas(id, true, options);
  }

  /**
   * Recupera los hitos de un proyecto
   * @param idProyecto Identificador del proyecto.
   * @returns Listado de hitos.
   */
  findHitosProyecto(idProyecto: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IProyectoHito>> {
    return this.find<IProyectoHitoBackend, IProyectoHito>(
      `${this.endpointUrl}/${idProyecto}/proyectohitos`,
      options,
      PROYECTO_HITO_CONVERTER
    );
  }

  /**
   * Recupera las entidades gestoras de un proyecto
   * @param idProyecto Identificador del proyecto.
   * @returns entidaded gestora.
   */
  findEntidadGestora(id: number, options?:
    SgiRestFindOptions): Observable<SgiRestListResult<IProyectoEntidadGestora>> {
    return this.find<IProyectoEntidadGestoraBackend, IProyectoEntidadGestora>(
      `${this.endpointUrl}/${id}/proyectoentidadgestoras`,
      options,
      PROYECTO_ENTIDAD_GESTORA_CONVERTER
    );
  }

  /**
   * Recupera los IProyectoSocio del proyecto
   *
   * @param id Id del proyecto
   * @param options opciones de busqueda
   * @returns observable con la lista de IProyectoSocio del proyecto
   */
  findAllProyectoSocioProyecto(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IProyectoSocio>> {
    return this.find<IProyectoSocioBackend, IProyectoSocio>(
      `${this.endpointUrl}/${id}/proyectosocios`,
      options,
      PROYECTO_SOCIO_CONVERTER
    );
  }

  /**
   * Devuelve el listado de IProyectoEquipo de un IProyecto
   *
   * @param id Id del IProyecto
   */
  findAllProyectoEquipo(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IProyectoEquipo>> {
    return this.find<IProyectoEquipoBackend, IProyectoEquipo>(
      `${this.endpointUrl}/${id}/proyectoequipos`,
      options,
      PROYECTO_EQUIPO_CONVERTER
    );
  }

  /**
   * Recupera los ProyectoEntidadConvocante de un proyecto
   * @param id Identificador del proyecto.
   * @returns Listado de ProyectoEntidadConvocante.
   */
  findAllEntidadConvocantes(idProyecto: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IProyectoEntidadConvocante>> {
    return this.find<IProyectoEntidadConvocanteBackend, IProyectoEntidadConvocante>(
      `${this.endpointUrl}/${idProyecto}/${ProyectoService.ENTIDAD_CONVOCANTES_MAPPING}`,
      options,
      PROYECTO_ENTIDAD_CONVOCANTE_CONVERTER
    );
  }

  public createEntidadConvocante(idProyecto: number, element: IProyectoEntidadConvocante): Observable<IProyectoEntidadConvocante> {
    return this.http.post<IProyectoEntidadConvocanteBackend>(
      `${this.endpointUrl}/${idProyecto}/${ProyectoService.ENTIDAD_CONVOCANTES_MAPPING}`,
      PROYECTO_ENTIDAD_CONVOCANTE_CONVERTER.fromTarget(element)
    ).pipe(
      map(response => PROYECTO_ENTIDAD_CONVOCANTE_CONVERTER.toTarget(response))
    );
  }

  public deleteEntidadConvocanteById(idProyecto: number, id: number): Observable<void> {
    const endpointUrl = `${this.endpointUrl}/${idProyecto}/${ProyectoService.ENTIDAD_CONVOCANTES_MAPPING}`;
    return this.http.delete<void>(`${endpointUrl}/${id}`);
  }

  setEntidadConvocantePrograma(idProyecto: number, id: number, programa: IPrograma): Observable<IProyectoEntidadConvocante> {
    const endpointUrl = `${this.endpointUrl}/${idProyecto}/${ProyectoService.ENTIDAD_CONVOCANTES_MAPPING}`;
    return this.http.patch<IProyectoEntidadConvocanteBackend>(
      `${endpointUrl}/${id}/programa`,
      programa
    ).pipe(
      map(response => PROYECTO_ENTIDAD_CONVOCANTE_CONVERTER.toTarget(response))
    );
  }

  /**
   * Recupera los IProyectoPeriodoSeguimiento del proyecto
   *
   * @param id Id del proyecto
   * @param options opciones de busqueda
   * @returns observable con la lista de IProyectoPeriodoSeguimiento del proyecto
   */
  findAllProyectoPeriodoSeguimientoProyecto(id: number, options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IProyectoPeriodoSeguimiento>> {
    return this.find<IProyectoPeriodoSeguimientoBackend, IProyectoPeriodoSeguimiento>(
      `${this.endpointUrl}/${id}/proyectoperiodoseguimientos`,
      options,
      PROYECTO_PERIODO_SEGUIMIENTO_CONVERTER
    );
  }

  /**
   * Recupera los IProyectoProrroga del proyecto
   *
   * @param id Id del proyecto
   * @param options opciones de busqueda
   * @returns observable con la lista de IProyectoProrroga del proyecto
   */
  findAllProyectoProrrogaProyecto(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IProyectoProrroga>> {
    return this.find<IProyectoProrrogaBackend, IProyectoProrroga>(
      `${this.endpointUrl}/${id}/proyectoprorrogas`,
      options,
      PROYECTO_PRORROGA_CONVERTER
    );
  }

  /**
   * Recupera listado de historico estado
   * @param id proyecto
   * @param options opciones de búsqueda.
   */
  findEstadoProyecto(proyectoId: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IEstadoProyecto>> {
    return this.find<IEstadoProyectoBackend, IEstadoProyecto>(
      `${this.endpointUrl}/${proyectoId}/estadoproyectos`,
      options,
      ESTADO_PROYECTO_CONVERTER
    );
  }

  /**
   * Recupera todos los documentos de un proyecto
   * @param id Identificador del proyecto.
   * @param options opciones de búsqueda
   */
  findAllProyectoDocumentos(idProyecto: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IProyectoDocumento>> {
    return this.find<IProyectoDocumentoBackend, IProyectoDocumento>(
      `${this.endpointUrl}/${idProyecto}/documentos`,
      options,
      PROYECTO_DOCUMENTO_CONVERTER
    );
  }

  /**
   * Se crea un proyecto a partir de los datos de la solicitud
   *
   * @param id identificador de la solicitud a copiar
   */
  crearProyectoBySolicitud(id: number, proyecto: IProyecto): Observable<IProyecto> {
    return this.http.post<IProyectoBackend>(
      `${this.endpointUrl}/${id}/solicitud`,
      this.converter.fromTarget(proyecto)
    ).pipe(
      map(response => this.converter.toTarget(response))
    );
  }

}
