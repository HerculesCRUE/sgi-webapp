import { Injectable } from '@angular/core';
import { SgiRestService, SgiRestFindOptions, SgiRestListResult } from '@sgi/framework/http/';
import { NGXLogger } from 'ngx-logger';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaPeriodoJustificacion } from '@core/models/csp/convocatoria-periodo-justificacion';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IConvocatoriaAreaTematica } from '@core/models/csp/convocatoria-area-tematica';
import { IConvocatoriaEntidadFinanciadora } from '@core/models/csp/convocatoria-entidad-financiadora';
import { IConvocatoriaEnlace } from '@core/models/csp/convocatoria-enlace';
import { IConvocatoriaHito } from '@core/models/csp/convocatoria-hito';
import { IConvocatoriaFase } from '@core/models/csp/convocatoria-fase';
import { IConvocatoriaEntidadConvocante } from '@core/models/csp/convocatoria-entidad-convocante';
import { IConvocatoriaConceptoGasto } from '@core/models/csp/convocatoria-concepto-gasto';
import { IConvocatoriaSeguimientoCientifico } from '@core/models/csp/convocatoria-seguimiento-cientifico';
import { IConvocatoriaConceptoGastoCodigoEc } from '@core/models/csp/convocatoria-concepto-gasto-codigo-ec';
import { IConvocatoriaDocumento } from '@core/models/csp/convocatoria-documento';

@Injectable({
  providedIn: 'root'
})

export class ConvocatoriaService extends SgiRestService<number, IConvocatoria> {
  private static readonly MAPPING = '/convocatorias';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      ConvocatoriaService.name,
      logger,
      `${environment.serviceServers.csp}${ConvocatoriaService.MAPPING}`,
      http
    );
  }

  findAllTodos(options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoria>> {
    this.logger.debug(ConvocatoriaService.name, `${this.findAllTodos.name}(`, '-', 'START');
    return this.find<IConvocatoria, IConvocatoria>(`${this.endpointUrl}/todos`, options).pipe(
      tap(() => this.logger.debug(ConvocatoriaService.name, `${this.findAllTodos.name}()`, '-', 'END'))
    );
  }


  /**
   * Recupera el listado de todas las convocatorias asociadas a las unidades de gestión del uusario logueado.
   * @param options Opciones de búsqueda
   * @returns listado de convocatorias
   */
  findAllTodosRestringidos(options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoria>> {
    this.logger.debug(ConvocatoriaService.name, `${this.findAllTodos.name}(`, '-', 'START');
    return this.find<IConvocatoria, IConvocatoria>(`${this.endpointUrl}/todos/restringidos`, options).pipe(
      tap(() => this.logger.debug(ConvocatoriaService.name, `${this.findAllTodos.name}()`, '-', 'END'))
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
    this.logger.debug(ConvocatoriaService.name, `getPeriodosJustificacion(${id}, ${options ? JSON.stringify(options) : options})`, '-', 'START');
    return this.find<IConvocatoriaPeriodoJustificacion, IConvocatoriaPeriodoJustificacion>(`${this.endpointUrl}/${id}/convocatoriaperiodojustificaciones`, options)
      .pipe(
        tap(() => this.logger.debug(ConvocatoriaService.name, `getPeriodosJustificacion(${id}, ${options ? JSON.stringify(options) : options})`, '-', 'END'))
      );
  }

  /**
   * Recupera listado de enlaces.
   * @param id convocatoria
   * @param options opciones de búsqueda.
   */
  getEnlaces(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaEnlace>> {
    this.logger.debug(ConvocatoriaService.name, `getEnlaces(${id}, ${options})`, '-', 'start');
    const endpointUrl = `${this.endpointUrl}/${id}/convocatoriaenlaces`;
    return this.find<IConvocatoriaEnlace, IConvocatoriaEnlace>(endpointUrl, options)
      .pipe(
        tap(() => this.logger.debug(ConvocatoriaService.name, `getEnlaces(${id}, ${options})`, '-', 'end'))
      );
  }

  /**
   * Recupera listado de seguimiento científicos.
   * @param id seguimiento científicos
   * @param options opciones de búsqueda.
   */
  findSeguimientosCientificos(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaSeguimientoCientifico>> {
    this.logger.debug(ConvocatoriaService.name, `findSeguimientosCientificos(${id}, ${options})`, '-', 'start');
    const endpointUrl = `${this.endpointUrl}/${id}/convocatoriaperiodoseguimientocientificos`;
    return this.find<IConvocatoriaSeguimientoCientifico, IConvocatoriaSeguimientoCientifico>(endpointUrl, options)
      .pipe(
        tap(() => this.logger.debug(ConvocatoriaService.name, `findSeguimientosCientificos(${id}, ${options})`, '-', 'end'))
      );
  }

  findEntidadesFinanciadoras(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaEntidadFinanciadora>> {
    this.logger.debug(ConvocatoriaService.name,
      `${this.findEntidadesFinanciadoras.name}(${id}, ${options ? JSON.stringify(options) : options}`, '-', 'start');
    return this.find<IConvocatoriaEntidadFinanciadora, IConvocatoriaEntidadFinanciadora>(
      `${this.endpointUrl}/${id}/convocatoriaentidadfinanciadoras`, options).pipe(
        tap(() => this.logger.debug(ConvocatoriaService.name,
          `${this.findEntidadesFinanciadoras.name}(${id}, ${options ? JSON.stringify(options) : options}`, '-', 'end'))
      );
  }

  /**
   * Recupera listado mock de plazos y fases.
   * @param id convocatoria
   * @param options opciones de búsqueda.
   */
  findFasesConvocatoria(idConvocatoria: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaFase>> {
    this.logger.debug(ConvocatoriaService.name, `findFasesConvocatoria(${idConvocatoria}, ${options})`, '-', 'start');
    const endpointUrl = `${this.endpointUrl}/${idConvocatoria}/convocatoriafases`;
    return this.find<IConvocatoriaFase, IConvocatoriaFase>(endpointUrl, options)
      .pipe(
        tap(() => this.logger.debug(ConvocatoriaService.name, `findFasesConvocatoria(${idConvocatoria}, ${options})`, '-', 'end'))
      );
  }

  /**
   * Recupera los hitos de una convocatoria
   * @param idConvocatoria Identificador de la convocatoria.
   * @returns Listado de hitos.
   */
  findHitosConvocatoria(idConvocatoria: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaHito>> {
    this.logger.debug(ConvocatoriaService.name, `findHitosConvocatoria(${idConvocatoria}, ${options})`, '-', 'start');
    const endpointUrl = `${this.endpointUrl}/${idConvocatoria}/convocatoriahitos`;
    return this.find<IConvocatoriaHito, IConvocatoriaHito>(endpointUrl, options)
      .pipe(
        tap(() => this.logger.debug(ConvocatoriaService.name, `findHitosConvocatoria(${idConvocatoria}, ${options})`, '-', 'end'))
      );
  }

  findAllConvocatoriaEntidadConvocantes(id: number, options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IConvocatoriaEntidadConvocante>> {
    this.logger.debug(ConvocatoriaService.name,
      `${this.findAllConvocatoriaEntidadConvocantes.name}(${id}, ${options ? JSON.stringify(options) : options})`, '-', 'start');
    const endpointUrl = `${this.endpointUrl}/${id}/convocatoriaentidadconvocantes`;
    return this.find<IConvocatoriaEntidadConvocante, IConvocatoriaEntidadConvocante>(endpointUrl, options)
      .pipe(
        tap(() => this.logger.debug(ConvocatoriaService.name,
          `${this.findAllConvocatoriaEntidadConvocantes.name}(${id}, ${options ? JSON.stringify(options) : options})`, '-', 'end'))
      );
  }

  findAllConvocatoriaFases(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaFase>> {
    this.logger.debug(ConvocatoriaService.name,
      `${this.findAllConvocatoriaFases.name}(${id}, ${options ? JSON.stringify(options) : options}`, '-', 'start');
    return this.find<IConvocatoriaFase, IConvocatoriaFase>(
      `${this.endpointUrl}/${id}/convocatoriafases`, options).pipe(
        tap(() => this.logger.debug(ConvocatoriaService.name,
          `${this.findAllConvocatoriaFases.name}(${id}, ${options ? JSON.stringify(options) : options}`, '-', 'end'))
      );
  }

  findAllConvocatoriaEntidadGestora(id: number, options?:
    SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaEntidadConvocante>> {
    this.logger.debug(ConvocatoriaService.name,
      `${this.findAllConvocatoriaFases.name}(${id}, ${options ? JSON.stringify(options) : options}`, '-', 'start');
    return this.find<IConvocatoriaEntidadConvocante, IConvocatoriaEntidadConvocante>(
      `${this.endpointUrl}/${id}/convocatoriaentidadgestoras`, options).pipe(
        tap(() => this.logger.debug(ConvocatoriaService.name,
          `${this.findAllConvocatoriaFases.name}(${id}, ${options ? JSON.stringify(options) : options}`, '-', 'end'))
      );
  }

  /**
   * Recupera listado mock de modelos de áreas temáticas.
   * @param idConvocatoria opciones de búsqueda.
   * @returns listado de modelos de áreas temáticas.
   */
  findAreaTematicas(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaAreaTematica>> {
    this.logger.debug(ConvocatoriaService.name, `${this.findAreaTematicas.name}(id: ${id})`, '-', 'START');
    return this.find<IConvocatoriaAreaTematica, IConvocatoriaAreaTematica>(
      `${this.endpointUrl}/${id}/convocatoriaareatematicas`, options).pipe(
        tap(() => this.logger.debug(ConvocatoriaService.name, `${this.findAreaTematicas.name}(id: ${id})`, '-', 'END'))
      );
  }

  findDocumentos(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IConvocatoriaDocumento>> {
    this.logger.debug(ConvocatoriaService.name, `${this.findDocumentos.name}(id: ${id})`, '-', 'START');
    return this.find<IConvocatoriaDocumento, IConvocatoriaDocumento>(
      `${this.endpointUrl}/${id}/convocatoriadocumentos`, options).pipe(
        tap(() => this.logger.debug(ConvocatoriaService.name, `${this.findDocumentos.name}(id: ${id})`, '-', 'END'))
      );
  }

  /**
   * Recupera listado de convocatoria concepto gastos permitidos.
   * @param id convocatoria
   * @param options opciones de búsqueda.
   */
  getConvocatoriaConceptoGastosPermitidos(id: number): Observable<SgiRestListResult<IConvocatoriaConceptoGasto>> {
    this.logger.debug(ConvocatoriaService.name, `getConvocatoriaConceptoGastosPermitidos(${id})`, '-', 'start');
    const endpointUrl = `${this.endpointUrl}/${id}/convocatoriagastos/permitidos`;
    return this.find<IConvocatoriaConceptoGasto, IConvocatoriaConceptoGasto>(endpointUrl)
      .pipe(
        tap(() => this.logger.debug(ConvocatoriaService.name, `getConvocatoriaConceptoGastosPermitidos(${id})`, '-', 'end'))
      );
  }

  /**
   * Recupera listado de convocatoria concepto gastos NO permitidos.
   * @param id convocatoria
   * @param options opciones de búsqueda.
   */
  getConvocatoriaConceptoGastosNoPermitidos(id: number): Observable<SgiRestListResult<IConvocatoriaConceptoGasto>> {
    this.logger.debug(ConvocatoriaService.name, `getConvocatoriaConceptoGastosNoPermitidos(${id})`, '-', 'start');
    const endpointUrl = `${this.endpointUrl}/${id}/convocatoriagastos/nopermitidos`;
    return this.find<IConvocatoriaConceptoGasto, IConvocatoriaConceptoGasto>(endpointUrl)
      .pipe(
        tap(() => this.logger.debug(ConvocatoriaService.name, `getConvocatoriaConceptoGastosNoPermitidos(${id})`, '-', 'end'))
      );
  }

  /**
   * Reactivar convocatoria
   * @param options opciones de búsqueda.
   */
  reactivar(id: number): Observable<void> {
    this.logger.debug(ConvocatoriaService.name, `${this.reactivar.name}(`, '-', 'start');
    return this.http.patch<void>(`${this.endpointUrl}/${id}/reactivar`, undefined).pipe(
      tap(() => this.logger.debug(ConvocatoriaService.name, `${this.reactivar.name}()`, '-', 'end'))
    );
  }

  /**
   * Desactivar convocatoria
   * @param options opciones de búsqueda.
   */
  desactivar(id: number): Observable<void> {
    this.logger.debug(ConvocatoriaService.name, `${this.desactivar.name}(`, '-', 'start');
    return this.http.patch<void>(`${this.endpointUrl}/${id}/desactivar`, undefined).pipe(
      tap(() => this.logger.debug(ConvocatoriaService.name, `${this.desactivar.name}()`, '-', 'end'))
    );
  }

  /**
   * Recupera listado de convocatoria concepto gastos códigos económicos permitidos.
   * @param id convocatoria
   * @param options opciones de búsqueda.
   */
  getConvocatoriaConceptoGastoCodigoEcsPermitidos(id: number): Observable<SgiRestListResult<IConvocatoriaConceptoGastoCodigoEc>> {
    this.logger.debug(ConvocatoriaService.name, `getConvocatoriaConceptoGastoCodigoEcsPermitidos(${id})`, '-', 'start');
    const endpointUrl = `${this.endpointUrl}/${id}/convocatoriagastocodigoec/permitidos`;
    return this.find<IConvocatoriaConceptoGastoCodigoEc, IConvocatoriaConceptoGastoCodigoEc>(endpointUrl)
      .pipe(
        tap(() => this.logger.debug(ConvocatoriaService.name, `getConvocatoriaConceptoGastoCodigoEcsPermitidos(${id})`, '-', 'end'))
      );
  }

  /**
   * Recupera listado de convocatoria concepto gasto códigos económicos NO permitidos.
   * @param id convocatoria
   * @param options opciones de búsqueda.
   */
  getConvocatoriaConceptoGastoCodigoEcsNoPermitidos(id: number): Observable<SgiRestListResult<IConvocatoriaConceptoGastoCodigoEc>> {
    this.logger.debug(ConvocatoriaService.name, `getConvocatoriaConceptoGastoCodigoEcsPermitidos(${id})`, '-', 'start');
    const endpointUrl = `${this.endpointUrl}/${id}/convocatoriagastocodigoec/nopermitidos`;
    return this.find<IConvocatoriaConceptoGastoCodigoEc, IConvocatoriaConceptoGastoCodigoEc>(endpointUrl)
      .pipe(
        tap(() => this.logger.debug(ConvocatoriaService.name, `getConvocatoriaConceptoGastoCodigoEcsPermitidos(${id})`, '-', 'end'))
      );
  }

}
