import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ESTADO_SOLICITUD_CONVERTER } from '@core/converters/csp/estado-solicitud.converter';
import { SOLICITUD_DOCUMENTO_CONVERTER } from '@core/converters/csp/solicitud-documento.converter';
import { SOLICITUD_HITO_CONVERTER } from '@core/converters/csp/solicitud-hito.converter';
import { SOLICITUD_MODALIDAD_CONVERTER } from '@core/converters/csp/solicitud-modalidad.converter';
import { SOLICITUD_PROYECTO_ENTIDAD_FINANCIADORA_AJENA_CONVERTER } from '@core/converters/csp/solicitud-proyecto-entidad-financiadora-ajena.converter';
import { SOLICITUD_PROYECTO_EQUIPO_CONVERTER } from '@core/converters/csp/solicitud-proyecto-equipo.converter';
import { SOLICITUD_PROYECTO_PRESUPUESTO_CONVERTER } from '@core/converters/csp/solicitud-proyecto-presupuesto.converter';
import { SOLICITUD_PROYECTO_SOCIO_CONVERTER } from '@core/converters/csp/solicitud-proyecto-socio.converter';
import { SOLICITUD_PROYECTO_CONVERTER } from '@core/converters/csp/solicitud-proyecto.converter';
import { SOLICITUD_CONVERTER } from '@core/converters/csp/solicitud.converter';
import { IEstadoSolicitudBackend } from '@core/models/csp/backend/estado-solicitud-backend';
import { ISolicitudBackend } from '@core/models/csp/backend/solicitud-backend';
import { ISolicitudDocumentoBackend } from '@core/models/csp/backend/solicitud-documento-backend';
import { ISolicitudHitoBackend } from '@core/models/csp/backend/solicitud-hito-backend';
import { ISolicitudModalidadBackend } from '@core/models/csp/backend/solicitud-modalidad-backend';
import { ISolicitudProyectoBackend } from '@core/models/csp/backend/solicitud-proyecto-backend';
import { ISolicitudProyectoEntidadFinanciadoraAjenaBackend } from '@core/models/csp/backend/solicitud-proyecto-entidad-financiadora-ajena-backend';
import { ISolicitudProyectoEquipoBackend } from '@core/models/csp/backend/solicitud-proyecto-equipo-backend';
import { ISolicitudProyectoPresupuestoBackend } from '@core/models/csp/backend/solicitud-proyecto-presupuesto-backend';
import { ISolicitudProyectoSocioBackend } from '@core/models/csp/backend/solicitud-proyecto-socio-backend';
import { IEstadoSolicitud } from '@core/models/csp/estado-solicitud';
import { ISolicitud } from '@core/models/csp/solicitud';
import { ISolicitudDocumento } from '@core/models/csp/solicitud-documento';
import { ISolicitudHito } from '@core/models/csp/solicitud-hito';
import { ISolicitudModalidad } from '@core/models/csp/solicitud-modalidad';
import { ISolicitudProyecto } from '@core/models/csp/solicitud-proyecto';
import { ISolicitudProyectoEntidadFinanciadoraAjena } from '@core/models/csp/solicitud-proyecto-entidad-financiadora-ajena';
import { ISolicitudProyectoEquipo } from '@core/models/csp/solicitud-proyecto-equipo';
import { ISolicitudProyectoPresupuesto } from '@core/models/csp/solicitud-proyecto-presupuesto';
import { ISolicitudProyectoPresupuestoTotalConceptoGasto } from '@core/models/csp/solicitud-proyecto-presupuesto-total-concepto-gasto';
import { ISolicitudProyectoPresupuestoTotales } from '@core/models/csp/solicitud-proyecto-presupuesto-totales';
import { ISolicitudProyectoSocio } from '@core/models/csp/solicitud-proyecto-socio';
import { environment } from '@env';
import { SgiMutableRestService, SgiRestFindOptions, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { from, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { PersonaService } from '../sgp/persona.service';
import { SolicitudModalidadService } from './solicitud-modalidad.service';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService extends SgiMutableRestService<number, ISolicitudBackend, ISolicitud> {
  private static readonly MAPPING = '/solicitudes';

  constructor(
    private readonly logger: NGXLogger,
    protected http: HttpClient,
    private personaService: PersonaService,
  ) {
    super(
      SolicitudService.name,
      `${environment.serviceServers.csp}${SolicitudService.MAPPING}`,
      http,
      SOLICITUD_CONVERTER
    );
  }

  /**
   * Desactiva una solicitud por su id
   *
   * @param id identificador de la solicitud.
   */
  desactivar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/desactivar`, undefined);
  }

  /**
   * Reactiva una solicitud por su id
   *
   * @param id identificador de la solicitud.
   */
  reactivar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/reactivar`, undefined);
  }

  /**
   * Recupera todas las solicitudes activas e inactivas visibles por el usuario
   *
   * @param options opciones de busqueda
   * @returns observable con la lista de solicitudes
   */
  findAllTodos(options?: SgiRestFindOptions): Observable<SgiRestListResult<ISolicitud>> {
    return this.find<ISolicitudBackend, ISolicitud>(`${this.endpointUrl}/todos`, options, SOLICITUD_CONVERTER);
  }

  /**
   * Recupera todas las modalidades de la solicitud
   *
   * @param solicitudId Id de la solicitud
   * @param options opciones de busqueda
   * @returns observable con la lista de modalidades de la solicitud
   */
  findAllSolicitudModalidades(solicitudId: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<ISolicitudModalidad>> {
    return this.find<ISolicitudModalidadBackend, ISolicitudModalidad>(
      `${this.endpointUrl}/${solicitudId}${SolicitudModalidadService.MAPPING}`,
      options,
      SOLICITUD_MODALIDAD_CONVERTER
    );
  }

  /**
   * Recupera listado de historico estado
   * @param id solicitud
   * @param options opciones de búsqueda.
   */
  findEstadoSolicitud(solicitudId: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IEstadoSolicitud>> {
    return this.find<IEstadoSolicitudBackend, IEstadoSolicitud>(
      `${this.endpointUrl}/${solicitudId}/estadosolicitudes`,
      options,
      ESTADO_SOLICITUD_CONVERTER
    );
  }

  /**
   * Recupera todos los documentos
   *
   * @param id Id de la solicitud
   * @param options Opciones de busqueda
   * @returns observable con la lista de documentos de la solicitud
   */
  findDocumentos(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<ISolicitudDocumento>> {
    return this.find<ISolicitudDocumentoBackend, ISolicitudDocumento>(
      `${this.endpointUrl}/${id}/solicituddocumentos`,
      options,
      SOLICITUD_DOCUMENTO_CONVERTER
    );
  }

  /**
   * Recupera los hitos de la solicitud
   *
   * @param solicitudId Id de la solicitud
   * @param options opciones de busqueda
   * @returns observable con la lista de modalidades de la solicitud
   */
  findHitosSolicitud(solicitudId: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<ISolicitudHito>> {
    return this.find<ISolicitudHitoBackend, ISolicitudHito>(
      `${this.endpointUrl}/${solicitudId}/solicitudhitos`,
      options,
      SOLICITUD_HITO_CONVERTER
    );
  }

  /**
   * Comprueba si una solicitud está asociada a una convocatoria SGI.
   *
   * @param id Id de la solicitud.
   */
  hasConvocatoriaSGI(id: number): Observable<boolean> {
    const url = `${this.endpointUrl}/${id}/convocatoria-sgi`;
    return this.http.head(url, { observe: 'response' }).pipe(
      map(x => x.status === 200)
    );
  }

  /**
   * Devuelve los datos del proyecto de una solicitud
   *
   * @param solicitudId Id de la solicitud
   */
  findSolicitudProyecto(solicitudId: number): Observable<ISolicitudProyecto> {
    return this.http.get<ISolicitudProyectoBackend>(
      `${this.endpointUrl}/${solicitudId}/solicitudproyecto`
    ).pipe(
      map(response => SOLICITUD_PROYECTO_CONVERTER.toTarget(response))
    );
  }

  /**
   * Devuelve los proyectoEquipos de una solicitud
   *
   * @param solicitudId Id de la solicitud
   */
  findAllSolicitudProyectoEquipo(solicitudId: number): Observable<SgiRestListResult<ISolicitudProyectoEquipo>> {
    return this.find<ISolicitudProyectoEquipoBackend, ISolicitudProyectoEquipo>(
      `${this.endpointUrl}/${solicitudId}/solicitudproyectoequipo`,
      undefined,
      SOLICITUD_PROYECTO_EQUIPO_CONVERTER
    ).pipe(
      switchMap(resultList =>
        from(resultList.items).pipe(
          mergeMap(wrapper => this.loadSolicitante(wrapper)),
          switchMap(() => of(resultList))
        )
      )
    );
  }

  private loadSolicitante(solicitudProyectoEquipo: ISolicitudProyectoEquipo): Observable<ISolicitudProyectoEquipo> {
    return this.personaService.findById(solicitudProyectoEquipo.persona.id).pipe(
      map(solicitante => {
        solicitudProyectoEquipo.persona = solicitante;
        return solicitudProyectoEquipo;
      }),
      catchError((err) => {
        this.logger.error(err);
        return of(solicitudProyectoEquipo);
      })
    );
  }

  /**
   * Comprueba si existe una solicitudProyectoDatos asociada a una solicitud
   *
   * @param id Id de la solicitud
   */
  existsSolictudProyecto(id: number): Observable<boolean> {
    const url = `${this.endpointUrl}/${id}/solicitudproyecto`;
    return this.http.head(url, { observe: 'response' }).pipe(
      map(x => x.status === 200)
    );
  }

  /**
   * Recupera los ISolicitudProyectoSocio de la solicitud
   *
   * @param id Id de la solicitud
   * @param options opciones de busqueda
   * @returns observable con la lista de ISolicitudProyectoSocio de la solicitud
   */
  findAllSolicitudProyectoSocio(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<ISolicitudProyectoSocio>> {
    return this.find<ISolicitudProyectoSocioBackend, ISolicitudProyectoSocio>(
      `${this.endpointUrl}/${id}/solicitudproyectosocio`,
      options,
      SOLICITUD_PROYECTO_SOCIO_CONVERTER
    );
  }

  /**
   * Devuelve las entidades financiadoras de una solicitud
   *
   * @param solicitudId Id de la solicitud
   * @param options opciones de busqueda
   */
  findAllSolicitudProyectoEntidadFinanciadora(solicitudId: number, options?: SgiRestFindOptions)
    : Observable<SgiRestListResult<ISolicitudProyectoEntidadFinanciadoraAjena>> {
    return this.find<ISolicitudProyectoEntidadFinanciadoraAjenaBackend, ISolicitudProyectoEntidadFinanciadoraAjena>(
      `${this.endpointUrl}/${solicitudId}/solicitudproyectoentidadfinanciadoraajenas`,
      options,
      SOLICITUD_PROYECTO_ENTIDAD_FINANCIADORA_AJENA_CONVERTER
    );
  }

  /**
   * Recupera los ISolicitudProyectoPresupuesto de la solicitud
   *
   * @param id Id de la solicitud
   * @param options opciones de busqueda
   * @returns observable con la lista de ISolicitudProyectoPresupuesto de la solicitud
   */
  findAllSolicitudProyectoPresupuesto(id: number, options?: SgiRestFindOptions)
    : Observable<SgiRestListResult<ISolicitudProyectoPresupuesto>> {
    return this.find<ISolicitudProyectoPresupuestoBackend, ISolicitudProyectoPresupuesto>(
      `${this.endpointUrl}/${id}/solicitudproyectopresupuestos`,
      options,
      SOLICITUD_PROYECTO_PRESUPUESTO_CONVERTER
    );
  }

  /**
   * Comprueba si existe una solicitudProyectoDatos asociada a una solicitud
   *
   * @param id Id de la solicitud
   */
  hasPresupuestoPorEntidades(id: number): Observable<boolean> {
    const url = `${this.endpointUrl}/${id}/presupuestoporentidades`;
    return this.http.head(url, { observe: 'response' }).pipe(
      map(response => response.status === 200)
    );
  }

  /**
   * Recupera los ISolicitudProyectoPresupuesto de la entidad de la convocatoria de la solicitud
   *
   * @param id Id de la solicitud
   * @param options opciones de busqueda
   * @returns observable con la lista de ISolicitudProyectoPresupuesto de la entidad de la solicitud
   */
  findAllSolicitudProyectoPresupuestoEntidadConvocatoria(id: number, entidadRef: string, options?: SgiRestFindOptions)
    : Observable<SgiRestListResult<ISolicitudProyectoPresupuesto>> {
    return this.find<ISolicitudProyectoPresupuestoBackend, ISolicitudProyectoPresupuesto>(
      `${this.endpointUrl}/${id}/solicitudproyectopresupuestos/entidadconvocatoria/${entidadRef}`,
      options,
      SOLICITUD_PROYECTO_PRESUPUESTO_CONVERTER
    );
  }

  /**
   * Recupera los ISolicitudProyectoPresupuesto de la entidad ajena de la solicitud
   *
   * @param id Id de la solicitud
   * @param options opciones de busqueda
   * @returns observable con la lista de ISolicitudProyectoPresupuesto de la entidad de la solicitud
   */
  findAllSolicitudProyectoPresupuestoEntidadAjena(id: number, entidadRef: string, options?: SgiRestFindOptions)
    : Observable<SgiRestListResult<ISolicitudProyectoPresupuesto>> {
    return this.find<ISolicitudProyectoPresupuestoBackend, ISolicitudProyectoPresupuesto>(
      `${this.endpointUrl}/${id}/solicitudproyectopresupuestos/entidadajena/${entidadRef}`,
      options,
      SOLICITUD_PROYECTO_PRESUPUESTO_CONVERTER
    );
  }

  /**
   * Devuelve los datos del proyecto de una solicitud
   *
   * @param solicitudId Id de la solicitud
   */
  getSolicitudProyectoPresupuestoTotales(solicitudId: number): Observable<ISolicitudProyectoPresupuestoTotales> {
    return this.http.get<ISolicitudProyectoPresupuestoTotales>(`${this.endpointUrl}/${solicitudId}/solicitudproyectopresupuestos/totales`);
  }

  /**
   * Recupera los ISolicitudProyectoPresupuesto de la solicitud
   *
   * @param id Id de la solicitud
   * @param options opciones de busqueda
   * @returns observable con la lista de ISolicitudProyectoPresupuesto de la solicitud
   */
  findAllSolicitudProyectoPresupuestoTotalesConceptoGasto(id: number)
    : Observable<SgiRestListResult<ISolicitudProyectoPresupuestoTotalConceptoGasto>> {
    return this.find<ISolicitudProyectoPresupuestoTotalConceptoGasto, ISolicitudProyectoPresupuestoTotalConceptoGasto>(
      `${this.endpointUrl}/${id}/solicitudproyectopresupuestos/totalesconceptogasto`
    );
  }

  /**
   * Comprueba si se puede crear el proyecto a partir de la solicitud
   *
   * @param id Id de la solicitud
   */
  isPosibleCrearProyecto(id: number): Observable<boolean> {
    const url = `${this.endpointUrl}/${id}/crearproyecto`;
    return this.http.head(url, { observe: 'response' }).pipe(
      map(response => response.status === 200)
    );
  }

  /**
   * Comprueba si tiene permisos de edición de la solicitud
   *
   * @param id Id de la solicitud
   */
  modificable(id: number): Observable<boolean> {
    const url = `${this.endpointUrl}/${id}/modificable`;
    return this.http.head(url, { observe: 'response' }).pipe(
      map(response => response.status === 200)
    );
  }

  /**
   * Realiza el cambio de estado de "Borrador" a "Presentada"
   *
   * @param id identificador de la solicitud.
   */
  presentar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/presentar`, undefined);
  }

  /**
   * Cambio de estado de "Presentada" a "Admitida provisionalmente".
   *
   * @param id identificador de la solicitud.
   */
  admitirProvisionalmente(id: number): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/admitir-provisionalmente`, undefined);
  }

  /**
   * Cambio de estado de "Admitida provisionalmente" a "Admitida definitivamente"
   *
   * @param id identificador de la solicitud.
   */
  admitirDefinitivamente(id: number): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/admitir-definitivamente`, undefined);
  }

  /**
   * Cambio de estado de "Admitida definitivamente" a "Concedida provisional".
   *
   * @param id identificador de la solicitud.
   */
  concederProvisionalmente(id: number): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/conceder-provisionalmente`, undefined);
  }

  /**
   * Cambio de estado de "Concedida provisional" o "Alegada concesión" a "Concedida".
   *
   * @param id identificador de la solicitud.
   */
  conceder(id: number): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/conceder`, undefined);
  }


  /**
   * Cambio de estado de "Presentada"  a "Excluir provisionalmente".
   *
   * @param id identificador de la solicitud.
   * @param comentario Comentario del cambio de estado.
   */
  excluirProvisionalmente(id: number, comentario: string): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/exlcluir-provisionalmente`, comentario);
  }

  /**
   * Cambio de estado de "Excluida provisional"  a "Alegada admisión".
   *
   * @param id identificador de la solicitud.
   * @param comentario Comentario del cambio de estado.
   */
  alegarAdmision(id: number, comentario: string): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/alegar-admision`, comentario);
  }

  /**
   * Cambio de estado de "Alegada admisión"  a "Excluida".
   * @param id identificador de la solicitud.
   * @param comentario Comentario del cambio de estado.
   */
  excluir(id: number, comentario: string): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/excluir`, comentario);
  }

  /**
   * Cambio de estado de "Admitida definitiva"  a "Denegada provisional".
   *    @param id identificador de la solicitud.
   * @param comentario Comentario del cambio de estado.
   */
  denegarProvisionalmente(id: number, comentario: string): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/denegar-provisionalmente`, comentario);
  }

  /**
   * Cambio de estado de "Denegada provisional"  a "Alegada concesión".
   * @param id identificador de la solicitud.
   * @param comentario Comentario del cambio de estado.
   */
  alegarConcesion(id: number, comentario: string): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/alegar-concesion`, comentario);
  }

  /**
   *  Cambio de estado de "Alegada concesión"  a "Denegada".
   * @param id identificador de la solicitud.
   * @param comentario Comentario del cambio de estado.
   */
  denegar(id: number, comentario: string): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/denegar`, comentario);
  }

  /**
   * Cambio de estado de "Presentada", "Admitida provisional",
   * "Excluida provisional", "Admitida definitiva",
   *  "Denegada provisional" o "Concedida provisional"
   * a "Desistida".
   *
   *   @param id identificador de la solicitud.
   * @param comentario Comentario del cambio de estado.
   */
  desistir(id: number, comentario: string): Observable<void> {
    return this.http.patch<void>(`${this.endpointUrl}/${id}/desistir`, comentario);
  }

  /**
   * Comprueba si una solicitud cumple las condiciones para poder pasar al estado "Presentada".
   *
   * @param id Id de la solicitud
   */
  presentable(id: number): Observable<boolean> {
    const url = `${this.endpointUrl}/${id}/presentable`;
    return this.http.head(url, { observe: 'response' }).pipe(
      map(response => response.status === 200)
    );
  }

}
