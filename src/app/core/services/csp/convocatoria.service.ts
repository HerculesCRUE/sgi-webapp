import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaAreaTematica } from '@core/models/csp/convocatoria-area-tematica';
import { IConvocatoriaConceptoGasto } from '@core/models/csp/convocatoria-concepto-gasto';
import { IConvocatoriaSeguimientoCientifico } from '@core/models/csp/convocatoria-seguimiento-cientifico';
import { IConvocatoriaDocumento } from '@core/models/csp/convocatoria-documento';
import { IConvocatoriaEnlace } from '@core/models/csp/convocatoria-enlace';
import { IConvocatoriaEntidadConvocante } from '@core/models/csp/convocatoria-entidad-convocante';
import { IConvocatoriaEntidadFinanciadora } from '@core/models/csp/convocatoria-entidad-financiadora';
import { IConvocatoriaEntidadGestora } from '@core/models/csp/convocatoria-entidad-gestora';
import { IConvocatoriaFase } from '@core/models/csp/convocatoria-fase';
import { IConvocatoriaHito } from '@core/models/csp/convocatoria-hito';
import { IConvocatoriaPeriodoJustificacion } from '@core/models/csp/convocatoria-periodo-justificacion';
import { environment } from '@env';
import { SgiRestFindOptions, SgiRestListResult, SgiRestService } from '@sgi/framework/http/';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConvocatoriaEntidadConvocanteService, IConvocatoriaEntidadConvocanteBackend } from './convocatoria-entidad-convocante.service';
import { ConvocatoriaEntidadFinanciadoraService, IConvocatoriaEntidadFinanciadoraBackend } from './convocatoria-entidad-financiadora.service';
import { ConvocatoriaEntidadGestoraService, IConvocatoriaEntidadGestoraBackend } from './convocatoria-entidad-gestora.service';
import { IConvocatoriaConceptoGastoCodigoEc } from '@core/models/csp/convocatoria-concepto-gasto-codigo-ec';
import { IModeloEjecucion } from '@core/models/csp/tipos-configuracion';

@Injectable({
  providedIn: 'root'
})

export class ConvocatoriaService extends SgiRestService<number, IConvocatoria> {
  private static readonly MAPPING = '/convocatorias';

  constructor(protected http: HttpClient) {
    super(
      ConvocatoriaService.name,
      `${environment.serviceServers.csp}${ConvocatoriaService.MAPPING}`,
      http
    );
  }

  findAllTodos(options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoria>> {
    return this.find<IConvocatoria, IConvocatoria>(`${this.endpointUrl}/todos`, options);
  }

  /**
   * Recupera el listado de todas las convocatorias activas asociadas a las unidades de gestión del usuario logueado.
   * @param options Opciones de búsqueda
   * @returns listado de convocatorias
   */
  findAllRestringidos(options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoria>> {
    return this.find<IConvocatoria, IConvocatoria>(`${this.endpointUrl}/restringidos`, options);
  }

  /**
   * Recupera el listado de todas las convocatorias asociadas a las unidades de gestión del usuario logueado.
   * @param options Opciones de búsqueda
   * @returns listado de convocatorias
   */
  findAllTodosRestringidos(options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoria>> {
    return this.find<IConvocatoria, IConvocatoria>(`${this.endpointUrl}/todos/restringidos`, options);
  }

  /**
   * Recupera listado de periodos justificacion de una convocatoria.
   *
   * @param id Id de la convocatoria.
   * @param options opciones de búsqueda.
   * @returns periodos de justificacion de la convocatoria.
   */
  getPeriodosJustificacion(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaPeriodoJustificacion>> {
    return this.find<IConvocatoriaPeriodoJustificacion, IConvocatoriaPeriodoJustificacion>(`${this.endpointUrl}/${id}/convocatoriaperiodojustificaciones`, options);
  }

  /**
   * Recupera listado de enlaces.
   * @param id convocatoria
   * @param options opciones de búsqueda.
   */
  getEnlaces(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaEnlace>> {
    const endpointUrl = `${this.endpointUrl}/${id}/convocatoriaenlaces`;
    return this.find<IConvocatoriaEnlace, IConvocatoriaEnlace>(endpointUrl, options);
  }

  /**
   * Recupera listado de seguimiento científicos.
   * @param id seguimiento científicos
   * @param options opciones de búsqueda.
   */
  findSeguimientosCientificos(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaSeguimientoCientifico>> {
    const endpointUrl = `${this.endpointUrl}/${id}/convocatoriaperiodoseguimientocientificos`;
    return this.find<IConvocatoriaSeguimientoCientifico, IConvocatoriaSeguimientoCientifico>(endpointUrl, options);
  }

  findEntidadesFinanciadoras(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaEntidadFinanciadora>> {
    return this.find<IConvocatoriaEntidadFinanciadoraBackend, IConvocatoriaEntidadFinanciadora>(
      `${this.endpointUrl}/${id}/convocatoriaentidadfinanciadoras`, options, ConvocatoriaEntidadFinanciadoraService.CONVERTER);
  }

  /**
   * Recupera listado mock de plazos y fases.
   * @param id convocatoria
   * @param options opciones de búsqueda.
   */
  findFasesConvocatoria(idConvocatoria: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaFase>> {
    const endpointUrl = `${this.endpointUrl}/${idConvocatoria}/convocatoriafases`;
    return this.find<IConvocatoriaFase, IConvocatoriaFase>(endpointUrl, options);
  }

  /**
   * Recupera los hitos de una convocatoria
   * @param idConvocatoria Identificador de la convocatoria.
   * @returns Listado de hitos.
   */
  findHitosConvocatoria(idConvocatoria: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaHito>> {
    const endpointUrl = `${this.endpointUrl}/${idConvocatoria}/convocatoriahitos`;
    return this.find<IConvocatoriaHito, IConvocatoriaHito>(endpointUrl, options);
  }

  findAllConvocatoriaEntidadConvocantes(id: number, options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IConvocatoriaEntidadConvocante>> {
    const endpointUrl = `${this.endpointUrl}/${id}/convocatoriaentidadconvocantes`;
    return this.find<IConvocatoriaEntidadConvocanteBackend, IConvocatoriaEntidadConvocante>(endpointUrl, options,
      ConvocatoriaEntidadConvocanteService.CONVERTER);
  }

  findAllConvocatoriaFases(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaFase>> {
    return this.find<IConvocatoriaFase, IConvocatoriaFase>(
      `${this.endpointUrl}/${id}/convocatoriafases`, options);
  }

  findAllConvocatoriaEntidadGestora(id: number, options?:
    SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaEntidadGestora>> {
    return this.find<IConvocatoriaEntidadGestoraBackend, IConvocatoriaEntidadGestora>(
      `${this.endpointUrl}/${id}/convocatoriaentidadgestoras`, options, ConvocatoriaEntidadGestoraService.CONVERTER);
  }

  /**
   * Recupera listado mock de modelos de áreas temáticas.
   * @param idConvocatoria opciones de búsqueda.
   * @returns listado de modelos de áreas temáticas.
   */
  findAreaTematicas(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaAreaTematica>> {
    return this.find<IConvocatoriaAreaTematica, IConvocatoriaAreaTematica>(
      `${this.endpointUrl}/${id}/convocatoriaareatematicas`, options);
  }

  findDocumentos(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaDocumento>> {
    return this.find<IConvocatoriaDocumento, IConvocatoriaDocumento>(
      `${this.endpointUrl}/${id}/convocatoriadocumentos`, options);
  }

  /**
   * Recupera listado de convocatoria concepto gastos permitidos.
   * @param id convocatoria
   * @param options opciones de búsqueda.
   */
  findAllConvocatoriaConceptoGastosPermitidos(id: number): Observable<SgiRestListResult<IConvocatoriaConceptoGasto>> {
    const endpointUrl = `${this.endpointUrl}/${id}/convocatoriagastos/permitidos`;
    return this.find<IConvocatoriaConceptoGasto, IConvocatoriaConceptoGasto>(endpointUrl);
  }

  /**
   * Recupera listado de convocatoria concepto gastos NO permitidos.
   * @param id convocatoria
   * @param options opciones de búsqueda.
   */
  findAllConvocatoriaConceptoGastosNoPermitidos(id: number): Observable<SgiRestListResult<IConvocatoriaConceptoGasto>> {
    const endpointUrl = `${this.endpointUrl}/${id}/convocatoriagastos/nopermitidos`;
    return this.find<IConvocatoriaConceptoGasto, IConvocatoriaConceptoGasto>(endpointUrl);
  }

  /**
   * Recupera listado de convocatoria concepto gastos códigos económicos permitidos.
   * @param id convocatoria
   * @param options opciones de búsqueda.
   */
  findAllConvocatoriaConceptoGastoCodigoEcsPermitidos(id: number): Observable<SgiRestListResult<IConvocatoriaConceptoGastoCodigoEc>> {
    const endpointUrl = `${this.endpointUrl}/${id}/convocatoriagastocodigoec/permitidos`;
    return this.find<IConvocatoriaConceptoGastoCodigoEc, IConvocatoriaConceptoGastoCodigoEc>(endpointUrl);
  }

  /**
   * Recupera listado de convocatoria concepto gasto códigos económicos NO permitidos.
   * @param id convocatoria
   * @param options opciones de búsqueda.
   */
  findAllConvocatoriaConceptoGastoCodigoEcsNoPermitidos(id: number): Observable<SgiRestListResult<IConvocatoriaConceptoGastoCodigoEc>> {
    const endpointUrl = `${this.endpointUrl}/${id}/convocatoriagastocodigoec/nopermitidos`;
    return this.find<IConvocatoriaConceptoGastoCodigoEc, IConvocatoriaConceptoGastoCodigoEc>(endpointUrl);
  }


  /**
   * Reactivar convocatoria
   * @param options opciones de búsqueda.
   */
  reactivar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/reactivar`, undefined);
  }

  /**
   * Desactivar convocatoria
   * @param options opciones de búsqueda.
   */
  desactivar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/desactivar`, undefined);
  }

  /**
   * Acción de registro de una convocatoria
   * @param id identificador de la convocatoria a registrar
   */
  registrar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/registrar`, undefined);
  }

  /**
   * Comprueba si existe una convocatoria
   *
   * @param id Id de la convocatoria
   */
  exists(id: number): Observable<boolean> {
    const url = `${this.endpointUrl}/${id}`;
    return this.http.head(url, { observe: 'response' }).pipe(
      map(response => response.status === 200)
    );
  }

  /**
   * Comprueba si tiene permisos de edición de la convocatoria
   *
   * @param id Id de la convocatoria
   */
  modificable(id: number): Observable<boolean> {
    const url = `${this.endpointUrl}/${id}/modificable`;
    return this.http.head(url, { observe: 'response' }).pipe(
      map(response => response.status === 200)
    );
  }

  /**
   * Comprueba si una convocatoria tiene tipos de fase, tipos de hito, tipo de enlaces
   * y tipos de documentos relacionados
   *
   * @param id Id de la convocatoria
   */
  vinculaciones(id: number): Observable<boolean> {
    const url = `${this.endpointUrl}/${id}/vinculaciones`;
    return this.http.head(url, { observe: 'response' }).pipe(
      map(response => response.status === 200)
    );
  }

  getUnidadGestionRef(id: number): Observable<string> {
    const url = `${this.endpointUrl}/${id}/unidadgestion`;
    return this.http.get(url, { responseType: 'text' });
  }

  getModeloEjecucion(id: number): Observable<IModeloEjecucion> {
    const url = `${this.endpointUrl}/${id}/modeloejecucion`;
    return this.http.get<IModeloEjecucion>(url);
  }

  registrable(id: number): Observable<boolean> {
    return this.http.head(`${this.endpointUrl}/${id}/registrable`, { observe: 'response' }).pipe(
      map(response => response.status === 200)
    );
  }

  /**
   * Devuelve el listado de convocatorias que puede ver un investigador
   *
   * @param options opciones de búsqueda.
   */
  findAllInvestigador(options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoria>> {
    return this.find<IConvocatoria, IConvocatoria>(`${this.endpointUrl}/investigador`, options);
  }

  /**
   * Comprueba si Convocatoria tiene convocatoriaentidadfinanciadora
   * relacionado
   *
   * @param id Convocatoria
   */
  hasConvocatoriaEntidad(id: number): Observable<boolean> {
    const url = `${this.endpointUrl}/${id}/convocatoriaentidad`;
    return this.http.head(url, { observe: 'response' }).pipe(
      map(response => response.status === 200)
    );
  }
}
