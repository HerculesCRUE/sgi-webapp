import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ClasificacionCVN } from '@core/enums/clasificacion-cvn';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { IDocumentosProyecto } from '@core/models/csp/documentos-proyecto';
import { IEstadoProyecto } from '@core/models/csp/estado-proyecto';
import { IPrograma } from '@core/models/csp/programa';
import { IProyecto, TipoHorasAnuales } from '@core/models/csp/proyecto';
import { IProyectoContexto } from '@core/models/csp/proyecto-contexto';
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
import { ISolicitud } from '@core/models/csp/solicitud';
import { ITipoAmbitoGeografico } from '@core/models/csp/tipo-ambito-geografico';
import { IModeloEjecucion, ITipoFinalidad } from '@core/models/csp/tipos-configuracion';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { IUnidadGestion } from '@core/models/usr/unidad-gestion';
import { environment } from '@env';
import { SgiBaseConverter } from '@sgi/framework/core';
import { RSQLSgiRestFilter, SgiMutableRestService, SgiRestFilterOperator, SgiRestFindOptions, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IProyectoEntidadFinanciadoraBackend, ProyectoEntidadFinanciadoraService } from './proyecto-entidad-financiadora.service';
import { IProyectoEntidadGestoraBackend, ProyectoEntidadGestoraService } from './proyecto-entidad-gestora.service';
import { IProyectoEquipoBackend, ProyectoEquipoService } from './proyecto-equipo.service';
import { IProyectoSocioBackend, ProyectoSocioService } from './proyecto-socio.service';

interface IProyectoBackend {

  /** Id */
  id: number;

  /** EstadoProyecto */
  estado: IEstadoProyecto;

  /** Titulo */
  titulo: string;

  /** Acronimo */
  acronimo: string;

  /** codigoExterno */
  codigoExterno: string;

  /** Fecha Inicio */
  fechaInicio: Date;

  /** Fecha Fin */
  fechaFin: Date;

  /** modelo ejecucion */
  modeloEjecucion: IModeloEjecucion;

  /** finalidad */
  finalidad: ITipoFinalidad;

  /** convocatoria */
  convocatoria: IConvocatoria;

  /** solicitud */
  solicitud: ISolicitud;

  /** ambitoGeografico */
  ambitoGeografico: ITipoAmbitoGeografico;

  /** confidencial */
  confidencial: boolean;

  /** clasificacionCVN */
  clasificacionCVN: ClasificacionCVN;

  /** convocatoriaExterna */
  convocatoriaExterna: string;

  /** colaborativo */
  colaborativo: boolean;

  /** coordinadorExterno */
  coordinadorExterno: boolean;

  /** uniSubcontratada */
  uniSubcontratada: boolean;

  /** timesheet */
  timesheet: boolean;

  /** paquetesTrabajo */
  paquetesTrabajo: boolean;

  /** costeHora */
  costeHora: boolean;

  /** tipoHorasAnuales */
  tipoHorasAnuales: TipoHorasAnuales;

  /** contratos */
  contratos: boolean;

  /** facturacion */
  facturacion: boolean;

  /** iva */
  iva: boolean;

  /** observaciones */
  observaciones: string;

  /** unidadGestionRef */
  unidadGestionRef: string;

  /** finalista */
  finalista: boolean;

  /** limitativo */
  limitativo: boolean;

  /** anualidades */
  anualidades: boolean;

  /** activo  */
  activo: boolean;
}

export interface IProyectoEntidadConvocanteBackend {
  id: number;
  entidadRef: string;
  programaConvocatoria: IPrograma;
  programa: IPrograma;
}

@Injectable({
  providedIn: 'root'
})
export class ProyectoService extends SgiMutableRestService<number, IProyectoBackend, IProyecto> {
  private static readonly MAPPING = '/proyectos';
  private static readonly ENTIDAD_CONVOCANTES_MAPPING = 'entidadconvocantes';

  private static readonly CONVERTER = new class extends SgiBaseConverter<IProyectoBackend, IProyecto> {
    toTarget(value: IProyectoBackend): IProyecto {
      return {
        id: value.id,
        estado: value.estado,
        activo: value.activo,
        titulo: value.titulo,
        acronimo: value.acronimo,
        codigoExterno: value.codigoExterno,
        fechaInicio: value.fechaInicio,
        fechaFin: value.fechaFin,
        modeloEjecucion: value.modeloEjecucion,
        finalidad: value.finalidad,
        convocatoria: value.convocatoria,
        convocatoriaExterna: value.convocatoriaExterna,
        solicitud: value.solicitud,
        ambitoGeografico: value.ambitoGeografico,
        confidencial: value.confidencial,
        clasificacionCVN: value.clasificacionCVN,
        colaborativo: value.colaborativo,
        coordinadorExterno: value.coordinadorExterno,
        uniSubcontratada: value.uniSubcontratada,
        timesheet: value.timesheet,
        paquetesTrabajo: value.paquetesTrabajo,
        costeHora: value.costeHora,
        tipoHorasAnuales: value.tipoHorasAnuales,
        contratos: value.contratos,
        facturacion: value.facturacion,
        iva: value.iva,
        finalista: value.finalista,
        limitativo: value.limitativo,
        anualidades: value.anualidades,
        unidadGestion: { acronimo: value.unidadGestionRef } as IUnidadGestion,
        observaciones: value.observaciones,
        comentario: value.estado.comentario
      };
    }

    fromTarget(value: IProyecto): IProyectoBackend {
      return {
        id: value.id,
        estado: value.estado,
        titulo: value.titulo,
        acronimo: value.acronimo,
        codigoExterno: value.codigoExterno,
        fechaInicio: value.fechaInicio,
        fechaFin: value.fechaFin,
        unidadGestionRef: value.unidadGestion?.acronimo,
        modeloEjecucion: value.modeloEjecucion,
        finalidad: value.finalidad,
        convocatoria: value.convocatoria ? { id: value.convocatoria.id } as IConvocatoria : undefined,
        convocatoriaExterna: value.convocatoriaExterna,
        solicitud: value.solicitud,
        ambitoGeografico: value.ambitoGeografico,
        confidencial: value.confidencial,
        clasificacionCVN: value.clasificacionCVN,
        colaborativo: value.colaborativo,
        coordinadorExterno: value.coordinadorExterno,
        uniSubcontratada: value.uniSubcontratada,
        timesheet: value.timesheet,
        paquetesTrabajo: value.paquetesTrabajo,
        costeHora: value.costeHora,
        tipoHorasAnuales: value.tipoHorasAnuales,
        contratos: value.contratos,
        facturacion: value.facturacion,
        iva: value.iva,
        observaciones: value.observaciones,
        finalista: value.finalista,
        limitativo: value.limitativo,
        anualidades: value.anualidades,
        activo: value.activo
      };
    }
  }();

  static readonly ENTIDAD_CONVOCANTE_CONVERTER =
    new class extends SgiBaseConverter<IProyectoEntidadConvocanteBackend, IProyectoEntidadConvocante> {
      toTarget(value: IProyectoEntidadConvocanteBackend): IProyectoEntidadConvocante {
        return {
          id: value.id,
          entidad: { personaRef: value.entidadRef } as IEmpresaEconomica,
          programaConvocatoria: value.programaConvocatoria,
          programa: value.programa
        };
      }

      fromTarget(value: IProyectoEntidadConvocante): IProyectoEntidadConvocanteBackend {
        return {
          id: value.id,
          entidadRef: value.entidad?.personaRef,
          programaConvocatoria: value.programaConvocatoria,
          programa: value.programa
        };
      }
    }();

  constructor(readonly logger: NGXLogger, protected http: HttpClient) {
    super(
      ProyectoService.name,
      `${environment.serviceServers.csp}${ProyectoService.MAPPING}`,
      http,
      ProyectoService.CONVERTER
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
    const endpointUrl = `${this.endpointUrl}/${idProyecto}/proyectopaquetetrabajos`;
    return this.find<IProyectoPaqueteTrabajo, IProyectoPaqueteTrabajo>(endpointUrl, options);
  }

  /**
   * Recupera los plazos de un proyecto
   * @param idProyecto Identificador del proyecto.
   * @returns Listado de plazos.
   */
  findPlazosProyecto(idProyecto: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IProyectoPlazos>> {
    const endpointUrl = `${this.endpointUrl}/${idProyecto}/proyectofases`;
    return this.find<IProyectoPlazos, IProyectoPlazos>(endpointUrl, options);
  }

  /**
   * Devuelve los datos del proyecto contexto
   *
   * @param proyectoID Id del proyecto
   */
  findProyectoContexto(proyectoID: number): Observable<IProyectoContexto> {
    const endpointUrl = `${this.endpointUrl}/${proyectoID}/proyecto-contextoproyectos`;
    return this.http.get<IProyectoContexto>(endpointUrl);
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
      `${this.endpointUrl}/${id}/proyectoentidadfinanciadoras`, options, ProyectoEntidadFinanciadoraService.CONVERTER);
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
    const endpointUrl = `${this.endpointUrl}/${idProyecto}/proyectohitos`;
    return this.find<IProyectoHito, IProyectoHito>(endpointUrl, options);
  }

  /**
   * Recupera las entidades gestoras de un proyecto
   * @param idProyecto Identificador del proyecto.
   * @returns entidaded gestora.
   */
  findEntidadGestora(id: number, options?:
    SgiRestFindOptions): Observable<SgiRestListResult<IProyectoEntidadGestora>> {
    return this.find<IProyectoEntidadGestoraBackend, IProyectoEntidadGestora>(
      `${this.endpointUrl}/${id}/proyectoentidadgestoras`, options, ProyectoEntidadGestoraService.CONVERTER);
  }

  /**
   * Recupera los equipos de un proyecto
   * @param idProyecto Identificador del proyecto.
   * @returns Listado de equipos.
   */
  findEquiposProyecto(idProyecto: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IProyectoEquipo>> {
    const endpointUrl = `${this.endpointUrl}/${idProyecto}/proyectoequipos`;
    return this.find<IProyectoEquipo, IProyectoEquipo>(endpointUrl, options);
  }

  /**
   * Recupera los IProyectoSocio del proyecto
   *
   * @param id Id del proyecto
   * @param options opciones de busqueda
   * @returns observable con la lista de IProyectoSocio del proyecto
   */
  findAllProyectoSocioProyecto(id: number, options?: SgiRestFindOptions): Observable<IProyectoSocio[]> {
    const endpointUrl = `${this.endpointUrl}/${id}/proyectosocios`;
    return this.find<IProyectoSocio, IProyectoSocioBackend>(endpointUrl, options)
      .pipe(
        map((result) => result.items.map(solicitudProyectoSocioBackend =>
          ProyectoSocioService.CONVERTER.toTarget(solicitudProyectoSocioBackend))
        )
      );
  }

  /**
   * Devuelve el listado de IProyectoEquipo de un IProyecto
   *
   * @param id Id del IProyecto
   */
  findAllProyectoEquipo(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IProyectoEquipo>> {
    return this.find<IProyectoEquipoBackend, IProyectoEquipo>(
      `${this.endpointUrl}/${id}/proyectoequipos`, options,
      ProyectoEquipoService.CONVERTER);
  }

  /**
   * Recupera los ProyectoEntidadConvocante de un proyecto
   * @param id Identificador del proyecto.
   * @returns Listado de ProyectoEntidadConvocante.
   */
  findAllEntidadConvocantes(idProyecto: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IProyectoEntidadConvocante>> {
    const endpointUrl = `${this.endpointUrl}/${idProyecto}/${ProyectoService.ENTIDAD_CONVOCANTES_MAPPING}`;
    return this.find<IProyectoEntidadConvocanteBackend, IProyectoEntidadConvocante>(endpointUrl, options,
      ProyectoService.ENTIDAD_CONVOCANTE_CONVERTER);
  }

  public createEntidadConvocante(idProyecto: number, element: IProyectoEntidadConvocante): Observable<IProyectoEntidadConvocante> {
    const endpointUrl = `${this.endpointUrl}/${idProyecto}/${ProyectoService.ENTIDAD_CONVOCANTES_MAPPING}`;
    return this.http.post<IProyectoEntidadConvocanteBackend>(endpointUrl,
      ProyectoService.ENTIDAD_CONVOCANTE_CONVERTER.fromTarget(element)).pipe(
        // TODO: Explore the use a global HttpInterceptor with or without a custom error
        catchError((error: HttpErrorResponse) => {
          // Log the error
          this.logger.error(error);
          // Pass the error to subscribers. Anyway they would decide what to do with the error.
          return throwError(error);
        }),
        map(response => {
          return ProyectoService.ENTIDAD_CONVOCANTE_CONVERTER.toTarget(response);
        })
      );
  }

  public deleteEntidadConvocanteById(idProyecto: number, id: number): Observable<void> {
    const endpointUrl = `${this.endpointUrl}/${idProyecto}/${ProyectoService.ENTIDAD_CONVOCANTES_MAPPING}`;
    return this.http.delete<void>(`${endpointUrl}/${id}`).pipe(
      // TODO: Explore the use a global HttpInterceptor with or without a custom error
      catchError((error: HttpErrorResponse) => {
        // Log the error
        this.logger.error(error);
        // Pass the error to subscribers. Anyway they would decide what to do with the error.
        return throwError(error);
      })
    );
  }

  setEntidadConvocantePrograma(idProyecto: number, id: number, programa: IPrograma): Observable<IProyectoEntidadConvocante> {
    const endpointUrl = `${this.endpointUrl}/${idProyecto}/${ProyectoService.ENTIDAD_CONVOCANTES_MAPPING}`;
    return this.http.patch<IProyectoEntidadConvocante>(`${endpointUrl}/${id}/programa`, programa);
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
    const endpointUrl = `${this.endpointUrl}/${id}/proyectoperiodoseguimientos`;
    return this.find<IProyectoPeriodoSeguimiento, IProyectoPeriodoSeguimiento>(endpointUrl, options);
  }

  /**
   * Recupera los IProyectoProrroga del proyecto
   *
   * @param id Id del proyecto
   * @param options opciones de busqueda
   * @returns observable con la lista de IProyectoProrroga del proyecto
   */
  findAllProyectoProrrogaProyecto(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IProyectoProrroga>> {
    const endpointUrl = `${this.endpointUrl}/${id}/proyectoprorrogas`;
    return this.find<IProyectoProrroga, IProyectoProrroga>(endpointUrl, options);
  }

  /**
   * Recupera listado de historico estado
   * @param id proyecto
   * @param options opciones de búsqueda.
   */
  findEstadoProyecto(proyectoId: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IEstadoProyecto>> {
    const endpointUrl = `${this.endpointUrl}/${proyectoId}/estadoproyectos`;
    return this.find<IEstadoProyecto, IEstadoProyecto>(endpointUrl, options);
  }



  /**
   * Recupera todos los documentos de un proyecto
   * @param id Identificador del proyecto.
   * @returns .
   */
  findAllDocumentos(idProyecto: number):
    Observable<IDocumentosProyecto> {
    const endpointUrl = `${this.endpointUrl}/${idProyecto}/documentos`;
    return this.http.get<IDocumentosProyecto>(endpointUrl);
  }


  /**
   * Se crea un proyecto a partir de los datos de la solicitud
   *
   * @param id identificador de la solicitud a copiar
   */
  crearProyectoBySolicitud(id: number, proyecto: IProyecto): Observable<IProyecto> {
    return this.http.post<IProyecto>(`${this.endpointUrl}/${id}/solicitud`, proyecto);
  }

}
