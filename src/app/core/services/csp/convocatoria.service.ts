import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CONVOCATORIA_AREA_TEMATICA_CONVERTER } from '@core/converters/csp/convocatoria-area-tematica.converter';
import { CONVOCATORIA_CONCEPTO_GASTO_CODIGO_EC_CONVERTER } from '@core/converters/csp/convocatoria-concepto-gasto-codigo-ec.converter';
import { CONVOCATORIA_CONCEPTO_GASTO_CONVERTER } from '@core/converters/csp/convocatoria-concepto-gasto.converter';
import { CONVOCATORIA_DOCUMENTO_CONVERTER } from '@core/converters/csp/convocatoria-documento.converter';
import { CONVOCATORIA_ENLACE_CONVERTER } from '@core/converters/csp/convocatoria-enlace.converter';
import { CONVOCATORIA_ENTIDAD_CONVOCANTE_CONVERTER } from '@core/converters/csp/convocatoria-entidad-convocante.converter';
import { CONVOCATORIA_ENTIDAD_FINANCIADORA_CONVERTER } from '@core/converters/csp/convocatoria-entidad-financiadora.converter';
import { CONVOCATORIA_ENTIDAD_GESTORA_CONVERTER } from '@core/converters/csp/convocatoria-entidad-gestora.converter';
import { CONVOCATORIA_FASE_CONVERTER } from '@core/converters/csp/convocatoria-fase.converter';
import { CONVOCATORIA_HITO_CONVERTER } from '@core/converters/csp/convocatoria-hito.converter';
import { CONVOCATORIA_PERIODO_JUSTIFICACION_CONVERTER } from '@core/converters/csp/convocatoria-periodo-justificacion.converter';
import { CONVOCATORIA_PERIODO_SEGUIMIENTO_CIENTIFICO_CONVERTER } from '@core/converters/csp/convocatoria-periodo-seguimiento-cientifico.converter';
import { CONVOCATORIA_CONVERTER } from '@core/converters/csp/convocatoria.converter';
import { IConvocatoriaAreaTematicaBackend } from '@core/models/csp/backend/convocatoria-area-tematica-backend';
import { IConvocatoriaBackend } from '@core/models/csp/backend/convocatoria-backend';
import { IConvocatoriaConceptoGastoBackend } from '@core/models/csp/backend/convocatoria-concepto-gasto-backend';
import { IConvocatoriaConceptoGastoCodigoEcBackend } from '@core/models/csp/backend/convocatoria-concepto-gasto-codigo-ec-backend';
import { IConvocatoriaDocumentoBackend } from '@core/models/csp/backend/convocatoria-documento-backend';
import { IConvocatoriaEnlaceBackend } from '@core/models/csp/backend/convocatoria-enlace-backend';
import { IConvocatoriaEntidadConvocanteBackend } from '@core/models/csp/backend/convocatoria-entidad-convocante-backend';
import { IConvocatoriaEntidadFinanciadoraBackend } from '@core/models/csp/backend/convocatoria-entidad-financiadora-backend';
import { IConvocatoriaEntidadGestoraBackend } from '@core/models/csp/backend/convocatoria-entidad-gestora-backend';
import { IConvocatoriaFaseBackend } from '@core/models/csp/backend/convocatoria-fase-backend';
import { IConvocatoriaHitoBackend } from '@core/models/csp/backend/convocatoria-hito-backend';
import { IConvocatoriaPeriodoJustificacionBackend } from '@core/models/csp/backend/convocatoria-periodo-justificacion-backend';
import { IConvocatoriaPeriodoSeguimientoCientificoBackend } from '@core/models/csp/backend/convocatoria-periodo-seguimiento-cientifico-backend';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaAreaTematica } from '@core/models/csp/convocatoria-area-tematica';
import { IConvocatoriaConceptoGasto } from '@core/models/csp/convocatoria-concepto-gasto';
import { IConvocatoriaConceptoGastoCodigoEc } from '@core/models/csp/convocatoria-concepto-gasto-codigo-ec';
import { IConvocatoriaDocumento } from '@core/models/csp/convocatoria-documento';
import { IConvocatoriaEnlace } from '@core/models/csp/convocatoria-enlace';
import { IConvocatoriaEntidadConvocante } from '@core/models/csp/convocatoria-entidad-convocante';
import { IConvocatoriaEntidadFinanciadora } from '@core/models/csp/convocatoria-entidad-financiadora';
import { IConvocatoriaEntidadGestora } from '@core/models/csp/convocatoria-entidad-gestora';
import { IConvocatoriaFase } from '@core/models/csp/convocatoria-fase';
import { IConvocatoriaHito } from '@core/models/csp/convocatoria-hito';
import { IConvocatoriaPeriodoJustificacion } from '@core/models/csp/convocatoria-periodo-justificacion';
import { IConvocatoriaPeriodoSeguimientoCientifico } from '@core/models/csp/convocatoria-periodo-seguimiento-cientifico';
import { IModeloEjecucion } from '@core/models/csp/tipos-configuracion';
import { environment } from '@env';
import { SgiMutableRestService, SgiRestFindOptions, SgiRestListResult } from '@sgi/framework/http/';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaService extends SgiMutableRestService<number, IConvocatoriaBackend, IConvocatoria> {
  private static readonly MAPPING = '/convocatorias';

  constructor(protected http: HttpClient) {
    super(
      ConvocatoriaService.name,
      `${environment.serviceServers.csp}${ConvocatoriaService.MAPPING}`,
      http,
      CONVOCATORIA_CONVERTER
    );
  }

  findAllTodos(options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoria>> {
    return this.find<IConvocatoriaBackend, IConvocatoria>(
      `${this.endpointUrl}/todos`,
      options,
      this.converter
    );
  }

  /**
   * Recupera el listado de todas las convocatorias activas asociadas a las unidades de gestión del usuario logueado.
   * @param options Opciones de búsqueda
   * @returns listado de convocatorias
   */
  findAllRestringidos(options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoria>> {
    return this.find<IConvocatoriaBackend, IConvocatoria>(
      `${this.endpointUrl}/restringidos`,
      options,
      this.converter
    );
  }

  /**
   * Recupera el listado de todas las convocatorias asociadas a las unidades de gestión del usuario logueado.
   * @param options Opciones de búsqueda
   * @returns listado de convocatorias
   */
  findAllTodosRestringidos(options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoria>> {
    return this.find<IConvocatoriaBackend, IConvocatoria>(
      `${this.endpointUrl}/todos/restringidos`,
      options,
      this.converter
    );
  }

  /**
   * Recupera listado de periodos justificacion de una convocatoria.
   *
   * @param id Id de la convocatoria.
   * @param options opciones de búsqueda.
   * @returns periodos de justificacion de la convocatoria.
   */
  getPeriodosJustificacion(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaPeriodoJustificacion>> {
    return this.find<IConvocatoriaPeriodoJustificacionBackend, IConvocatoriaPeriodoJustificacion>(
      `${this.endpointUrl}/${id}/convocatoriaperiodojustificaciones`,
      options,
      CONVOCATORIA_PERIODO_JUSTIFICACION_CONVERTER
    );
  }

  /**
   * Recupera listado de enlaces.
   * @param id convocatoria
   * @param options opciones de búsqueda.
   */
  getEnlaces(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaEnlace>> {
    return this.find<IConvocatoriaEnlaceBackend, IConvocatoriaEnlace>(
      `${this.endpointUrl}/${id}/convocatoriaenlaces`,
      options,
      CONVOCATORIA_ENLACE_CONVERTER
    );
  }

  /**
   * Recupera listado de seguimiento científicos.
   * @param id seguimiento científicos
   * @param options opciones de búsqueda.
   */
  findSeguimientosCientificos(id: number, options?: SgiRestFindOptions)
    : Observable<SgiRestListResult<IConvocatoriaPeriodoSeguimientoCientifico>> {
    return this.find<IConvocatoriaPeriodoSeguimientoCientificoBackend, IConvocatoriaPeriodoSeguimientoCientifico>(
      `${this.endpointUrl}/${id}/convocatoriaperiodoseguimientocientificos`,
      options,
      CONVOCATORIA_PERIODO_SEGUIMIENTO_CIENTIFICO_CONVERTER
    );
  }

  findEntidadesFinanciadoras(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaEntidadFinanciadora>> {
    return this.find<IConvocatoriaEntidadFinanciadoraBackend, IConvocatoriaEntidadFinanciadora>(
      `${this.endpointUrl}/${id}/convocatoriaentidadfinanciadoras`,
      options,
      CONVOCATORIA_ENTIDAD_FINANCIADORA_CONVERTER
    );
  }

  /**
   * Recupera los hitos de una convocatoria
   * @param idConvocatoria Identificador de la convocatoria.
   * @returns Listado de hitos.
   */
  findHitosConvocatoria(idConvocatoria: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaHito>> {
    return this.find<IConvocatoriaHitoBackend, IConvocatoriaHito>(
      `${this.endpointUrl}/${idConvocatoria}/convocatoriahitos`,
      options,
      CONVOCATORIA_HITO_CONVERTER
    );
  }

  findAllConvocatoriaEntidadConvocantes(id: number, options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IConvocatoriaEntidadConvocante>> {
    return this.find<IConvocatoriaEntidadConvocanteBackend, IConvocatoriaEntidadConvocante>(
      `${this.endpointUrl}/${id}/convocatoriaentidadconvocantes`,
      options,
      CONVOCATORIA_ENTIDAD_CONVOCANTE_CONVERTER
    );
  }

  findAllConvocatoriaFases(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaFase>> {
    return this.find<IConvocatoriaFaseBackend, IConvocatoriaFase>(
      `${this.endpointUrl}/${id}/convocatoriafases`,
      options,
      CONVOCATORIA_FASE_CONVERTER
    );
  }

  findAllConvocatoriaEntidadGestora(id: number, options?:
    SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaEntidadGestora>> {
    return this.find<IConvocatoriaEntidadGestoraBackend, IConvocatoriaEntidadGestora>(
      `${this.endpointUrl}/${id}/convocatoriaentidadgestoras`,
      options,
      CONVOCATORIA_ENTIDAD_GESTORA_CONVERTER
    );
  }

  /**
   * Recupera listado mock de modelos de áreas temáticas.
   * @param idConvocatoria opciones de búsqueda.
   * @returns listado de modelos de áreas temáticas.
   */
  findAreaTematicas(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaAreaTematica>> {
    return this.find<IConvocatoriaAreaTematicaBackend, IConvocatoriaAreaTematica>(
      `${this.endpointUrl}/${id}/convocatoriaareatematicas`,
      options,
      CONVOCATORIA_AREA_TEMATICA_CONVERTER
    );
  }

  findDocumentos(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaDocumento>> {
    return this.find<IConvocatoriaDocumentoBackend, IConvocatoriaDocumento>(
      `${this.endpointUrl}/${id}/convocatoriadocumentos`,
      options,
      CONVOCATORIA_DOCUMENTO_CONVERTER
    );
  }

  /**
   * Recupera listado de convocatoria concepto gastos permitidos.
   * @param id convocatoria
   * @param options opciones de búsqueda.
   */
  findAllConvocatoriaConceptoGastosPermitidos(id: number): Observable<SgiRestListResult<IConvocatoriaConceptoGasto>> {
    return this.find<IConvocatoriaConceptoGastoBackend, IConvocatoriaConceptoGasto>(
      `${this.endpointUrl}/${id}/convocatoriagastos/permitidos`,
      undefined,
      CONVOCATORIA_CONCEPTO_GASTO_CONVERTER
    );
  }

  /**
   * Recupera listado de convocatoria concepto gastos NO permitidos.
   * @param id convocatoria
   * @param options opciones de búsqueda.
   */
  findAllConvocatoriaConceptoGastosNoPermitidos(id: number): Observable<SgiRestListResult<IConvocatoriaConceptoGasto>> {
    return this.find<IConvocatoriaConceptoGastoBackend, IConvocatoriaConceptoGasto>(
      `${this.endpointUrl}/${id}/convocatoriagastos/nopermitidos`,
      undefined,
      CONVOCATORIA_CONCEPTO_GASTO_CONVERTER
    );
  }

  /**
   * Recupera listado de convocatoria concepto gastos códigos económicos permitidos.
   * @param id convocatoria
   * @param options opciones de búsqueda.
   */
  findAllConvocatoriaConceptoGastoCodigoEcsPermitidos(id: number): Observable<SgiRestListResult<IConvocatoriaConceptoGastoCodigoEc>> {
    return this.find<IConvocatoriaConceptoGastoCodigoEcBackend, IConvocatoriaConceptoGastoCodigoEc>(
      `${this.endpointUrl}/${id}/convocatoriagastocodigoec/permitidos`,
      undefined,
      CONVOCATORIA_CONCEPTO_GASTO_CODIGO_EC_CONVERTER
    );
  }

  /**
   * Recupera listado de convocatoria concepto gasto códigos económicos NO permitidos.
   * @param id convocatoria
   * @param options opciones de búsqueda.
   */
  findAllConvocatoriaConceptoGastoCodigoEcsNoPermitidos(id: number): Observable<SgiRestListResult<IConvocatoriaConceptoGastoCodigoEc>> {
    return this.find<IConvocatoriaConceptoGastoCodigoEcBackend, IConvocatoriaConceptoGastoCodigoEc>(
      `${this.endpointUrl}/${id}/convocatoriagastocodigoec/nopermitidos`,
      undefined,
      CONVOCATORIA_CONCEPTO_GASTO_CODIGO_EC_CONVERTER);
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
    return this.find<IConvocatoriaBackend, IConvocatoria>(
      `${this.endpointUrl}/investigador`,
      options,
      this.converter
    );
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
