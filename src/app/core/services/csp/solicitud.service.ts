import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormularioSolicitud } from '@core/enums/formulario-solicitud';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { IEstadoSolicitud } from '@core/models/csp/estado-solicitud';
import { ISolicitud } from '@core/models/csp/solicitud';
import { ISolicitudDocumento } from '@core/models/csp/solicitud-documento';
import { ISolicitudHito } from '@core/models/csp/solicitud-hito';
import { ISolicitudModalidad } from '@core/models/csp/solicitud-modalidad';
import { ISolicitudProyectoDatos } from '@core/models/csp/solicitud-proyecto-datos';
import { ISolicitudProyectoEntidadFinanciadoraAjena } from '@core/models/csp/solicitud-proyecto-entidad-financiadora-ajena';
import { ISolicitudProyectoEquipo } from '@core/models/csp/solicitud-proyecto-equipo';
import { ISolicitudProyectoPresupuesto } from '@core/models/csp/solicitud-proyecto-presupuesto';
import { ISolicitudProyectoSocio } from '@core/models/csp/solicitud-proyecto-socio';
import { IPersona } from '@core/models/sgp/persona';
import { IUnidadGestion } from '@core/models/usr/unidad-gestion';
import { environment } from '@env';
import { SgiBaseConverter } from '@sgi/framework/core';
import { SgiMutableRestService, SgiRestFindOptions, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { from, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { EmpresaEconomicaService } from '../sgp/empresa-economica.service';
import { PersonaFisicaService } from '../sgp/persona-fisica.service';
import { ISolicitudModalidadBackend, SolicitudModalidadService } from './solicitud-modalidad.service';
import { ISolicitudProyectoEntidadFinanciadoraAjenaBackend, SolicitudProyectoEntidadFinanciadoraAjenaService } from './solicitud-proyecto-entidad-financiadora-ajena.service';
import { ISolicitudProyectoEquipoBackend, SolicitudProyectoEquipoService } from './solicitud-proyecto-equipo.service';
import { ISolicitudProyectoPresupuestoBackend, SolicitudProyectoPresupuestoService } from './solicitud-proyecto-presupuesto.service';
import { ISolicitudProyectoSocioBackend, SolicitudProyectoSocioService } from './solicitud-proyecto-socio.service';
import { ISolicitudProyectoPresupuestoTotales } from '@core/models/csp/solicitud-proyecto-presupuesto-totales';
import { ISolicitudProyectoPresupuestoTotalConceptoGasto } from '@core/models/csp/solicitud-proyecto-presupuesto-total-concepto-gasto';


interface ISolicitudBackend {
  /** Id */
  id: number;

  /** Activo */
  activo: boolean;

  /** Codigo externo */
  codigoExterno: string;

  /** Codigo registro interno */
  codigoRegistroInterno: string;

  /** Estado solicitud */
  estado: IEstadoSolicitud;

  /** Convocatoria */
  convocatoria: IConvocatoria;

  /** Convocatoria externa */
  convocatoriaExterna: string;

  /** Creador */
  creadorRef: string;

  /** Solicitante */
  solicitanteRef: string;

  /** Tipo formulario solicitud */
  formularioSolicitud: FormularioSolicitud;

  /** Unidad gestion */
  unidadGestionRef: string;

  /** Observaciones */
  observaciones: string;

}


@Injectable({
  providedIn: 'root'
})
export class SolicitudService extends SgiMutableRestService<number, ISolicitudBackend, ISolicitud> {
  private static readonly MAPPING = '/solicitudes';

  private static readonly CONVERTER = new class extends SgiBaseConverter<ISolicitudBackend, ISolicitud> {
    toTarget(value: ISolicitudBackend): ISolicitud {
      return {
        id: value.id,
        activo: value.activo,
        codigoExterno: value.codigoExterno,
        codigoRegistroInterno: value.codigoRegistroInterno,
        estado: value.estado,
        convocatoria: value.convocatoria,
        convocatoriaExterna: value.convocatoriaExterna,
        creador: { personaRef: value.creadorRef } as IPersona,
        solicitante: { personaRef: value.solicitanteRef } as IPersona,
        formularioSolicitud: value.formularioSolicitud,
        unidadGestion: { acronimo: value.unidadGestionRef } as IUnidadGestion,
        observaciones: value.observaciones
      };
    }

    fromTarget(value: ISolicitud): ISolicitudBackend {
      return {
        id: value.id,
        activo: value.activo,
        codigoExterno: value.codigoExterno,
        codigoRegistroInterno: value.codigoRegistroInterno,
        estado: value.estado,
        convocatoria: value.convocatoria ? { id: value.convocatoria.id } as IConvocatoria : undefined,
        convocatoriaExterna: value.convocatoriaExterna,
        creadorRef: value.creador?.personaRef,
        solicitanteRef: value.solicitante?.personaRef,
        formularioSolicitud: value.formularioSolicitud,
        unidadGestionRef: value.unidadGestion?.acronimo,
        observaciones: value.observaciones
      };
    }
  }();

  constructor(
    private readonly logger: NGXLogger,
    protected http: HttpClient,
    private personaFisicaService: PersonaFisicaService,
    private empresaEconomicaService: EmpresaEconomicaService
  ) {
    super(
      SolicitudService.name,
      `${environment.serviceServers.csp}${SolicitudService.MAPPING}`,
      http,
      SolicitudService.CONVERTER
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
    return this.find<ISolicitudBackend, ISolicitud>(`${this.endpointUrl}/todos`, options, SolicitudService.CONVERTER);
  }

  /**
   * Recupera todas las modalidades de la solicitud
   *
   * @param solicitudId Id de la solicitud
   * @param options opciones de busqueda
   * @returns observable con la lista de modalidades de la solicitud
   */
  findAllSolicitudModalidades(solicitudId: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<ISolicitudModalidad>> {
    const endpointUrl = `${this.endpointUrl}/${solicitudId}${SolicitudModalidadService.MAPPING}`;
    return this.find<ISolicitudModalidadBackend, ISolicitudModalidad>(endpointUrl, options, SolicitudModalidadService.CONVERTER);
  }

  /**
   * Recupera listado de historico estado
   * @param id solicitud
   * @param options opciones de búsqueda.
   */
  findEstadoSolicitud(solicitudId: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IEstadoSolicitud>> {
    const endpointUrl = `${this.endpointUrl}/${solicitudId}/estadosolicitudes`;
    return this.find<IEstadoSolicitud, IEstadoSolicitud>(endpointUrl, options);
  }

  /**
   * Recupera todos los documentos
   *
   * @param id Id de la solicitud
   * @param options Opciones de busqueda
   * @returns observable con la lista de documentos de la solicitud
   */
  findDocumentos(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<ISolicitudDocumento>> {
    const url = `${this.endpointUrl}/${id}/solicituddocumentos`;
    return this.find<ISolicitudDocumento, ISolicitudDocumento>(url, options);
  }

  /**
   * Recupera los hitos de la solicitud
   *
   * @param solicitudId Id de la solicitud
   * @param options opciones de busqueda
   * @returns observable con la lista de modalidades de la solicitud
   */
  findHitosSolicitud(solicitudId: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<ISolicitudHito>> {
    const endpointUrl = `${this.endpointUrl}/${solicitudId}/solicitudhitos`;
    return this.find<ISolicitudHito, ISolicitudHito>(endpointUrl, options);
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
  findSolicitudProyectoDatos(solicitudId: number): Observable<ISolicitudProyectoDatos> {
    const endpointUrl = `${this.endpointUrl}/${solicitudId}/solicitudproyectodatos`;
    return this.http.get<ISolicitudProyectoDatos>(endpointUrl);
  }

  /**
   * Devuelve los proyectoEquipos de una solicitud
   *
   * @param solicitudId Id de la solicitud
   */
  findAllSolicitudProyectoEquipo(solicitudId: number): Observable<SgiRestListResult<ISolicitudProyectoEquipo>> {
    const endpointUrl = `${this.endpointUrl}/${solicitudId}/solicitudproyectoequipo`;
    return this.find<ISolicitudProyectoEquipo, ISolicitudProyectoEquipoBackend>(endpointUrl).pipe(
      map((result) => {
        const converted: SgiRestListResult<ISolicitudProyectoEquipo> = {
          items: result.items.map(solicitudProyectoEquipoBackend =>
            SolicitudProyectoEquipoService.CONVERTER.toTarget(solicitudProyectoEquipoBackend)),
          page: result.page,
          total: result.total
        };
        return converted;
      }),
      switchMap(resultList =>
        from(resultList.items).pipe(
          mergeMap(wrapper => this.loadSolicitante(wrapper)),
          switchMap(() => of(resultList))
        )
      )
    );
  }

  private loadSolicitante(solicitudProyectoEquipo: ISolicitudProyectoEquipo): Observable<ISolicitudProyectoEquipo> {
    const personaRef = solicitudProyectoEquipo.persona.personaRef;
    return this.personaFisicaService.getInformacionBasica(personaRef).pipe(
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
  existsSolictudProyectoDatos(id: number): Observable<boolean> {
    const url = `${this.endpointUrl}/${id}/solicitudproyectodatos`;
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
  findAllSolicitudProyectoSocio(id: number, options?: SgiRestFindOptions): Observable<ISolicitudProyectoSocio[]> {
    const endpointUrl = `${this.endpointUrl}/${id}/solicitudproyectosocio`;
    return this.find<ISolicitudProyectoSocio, ISolicitudProyectoSocioBackend>(endpointUrl, options)
      .pipe(
        map((result) => result.items.map(solicitudProyectoSocioBackend =>
          SolicitudProyectoSocioService.CONVERTER.toTarget(solicitudProyectoSocioBackend))
        )
      );
  }

  /**
   * Devuelve las entidades financiadoras de una solicitud
   *
   * @param solicitudId Id de la solicitud
   * @param options opciones de busqueda
   */
  findAllSolicitudProyectoEntidadFinanciadora(solicitudId: number, options?: SgiRestFindOptions):
    Observable<SgiRestListResult<ISolicitudProyectoEntidadFinanciadoraAjena>> {
    const endpointUrl = `${this.endpointUrl}/${solicitudId}/solicitudproyectoentidadfinanciadoraajenas`;
    return this.find<ISolicitudProyectoEntidadFinanciadoraAjenaBackend, ISolicitudProyectoEntidadFinanciadoraAjena>(
      endpointUrl, options, SolicitudProyectoEntidadFinanciadoraAjenaService.CONVERTER);
  }

  /**
   * Recupera los ISolicitudProyectoPresupuesto de la solicitud
   *
   * @param id Id de la solicitud
   * @param options opciones de busqueda
   * @returns observable con la lista de ISolicitudProyectoPresupuesto de la solicitud
   */
  findAllSolicitudProyectoPresupuesto(id: number, options?: SgiRestFindOptions): Observable<ISolicitudProyectoPresupuesto[]> {
    const endpointUrl = `${this.endpointUrl}/${id}/solicitudproyectopresupuestos`;
    return this.find<ISolicitudProyectoPresupuestoBackend, ISolicitudProyectoPresupuesto>(
      endpointUrl, options, SolicitudProyectoPresupuestoService.CONVERTER)
      .pipe(
        map((result) => result.items)
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
  findAllSolicitudProyectoPresupuestoEntidadConvocatoria(id: number, entidadRef: string, options?: SgiRestFindOptions): Observable<SgiRestListResult<ISolicitudProyectoPresupuesto>> {
    const endpointUrl = `${this.endpointUrl}/${id}/solicitudproyectopresupuestos/entidadconvocatoria/${entidadRef}`;
    return this.find<ISolicitudProyectoPresupuestoBackend, ISolicitudProyectoPresupuesto>(
      endpointUrl, options, SolicitudProyectoPresupuestoService.CONVERTER);
  }

  /**
   * Recupera los ISolicitudProyectoPresupuesto de la entidad ajena de la solicitud
   *
   * @param id Id de la solicitud
   * @param options opciones de busqueda
   * @returns observable con la lista de ISolicitudProyectoPresupuesto de la entidad de la solicitud
   */
  findAllSolicitudProyectoPresupuestoEntidadAjena(id: number, entidadRef: string, options?: SgiRestFindOptions): Observable<SgiRestListResult<ISolicitudProyectoPresupuesto>> {
    const endpointUrl = `${this.endpointUrl}/${id}/solicitudproyectopresupuestos/entidadajena/${entidadRef}`;
    return this.find<ISolicitudProyectoPresupuestoBackend, ISolicitudProyectoPresupuesto>(
      endpointUrl, options, SolicitudProyectoPresupuestoService.CONVERTER);
  }

  /**
   * Devuelve los datos del proyecto de una solicitud
   *
   * @param solicitudId Id de la solicitud
   */
  getSolicitudProyectoPresupuestoTotales(solicitudId: number): Observable<ISolicitudProyectoPresupuestoTotales> {
    const endpointUrl = `${this.endpointUrl}/${solicitudId}/solicitudproyectopresupuestos/totales`;
    return this.http.get<ISolicitudProyectoPresupuestoTotales>(endpointUrl);
  }

  /**
   * Recupera los ISolicitudProyectoPresupuesto de la solicitud
   *
   * @param id Id de la solicitud
   * @param options opciones de busqueda
   * @returns observable con la lista de ISolicitudProyectoPresupuesto de la solicitud
   */
  findAllSolicitudProyectoPresupuestoTotalesConceptoGasto(id: number): Observable<SgiRestListResult<ISolicitudProyectoPresupuestoTotalConceptoGasto>> {
    const endpointUrl = `${this.endpointUrl}/${id}/solicitudproyectopresupuestos/totalesconceptogasto`;
    return this.find<ISolicitudProyectoPresupuestoTotalConceptoGasto, ISolicitudProyectoPresupuestoTotalConceptoGasto>(
      endpointUrl);
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
