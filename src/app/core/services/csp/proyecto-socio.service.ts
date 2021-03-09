import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IProyecto } from '@core/models/csp/proyecto';
import { IProyectoSocio } from '@core/models/csp/proyecto-socio';
import { IProyectoSocioEquipo } from '@core/models/csp/proyecto-socio-equipo';
import { IProyectoSocioPeriodoJustificacion } from '@core/models/csp/proyecto-socio-periodo-justificacion';
import { IProyectoSocioPeriodoPago } from '@core/models/csp/proyecto-socio-periodo-pago';
import { IRolSocio } from '@core/models/csp/rol-socio';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { environment } from '@env';
import { SgiBaseConverter } from '@sgi/framework/core';
import { SgiMutableRestService, SgiRestFindOptions, SgiRestListResult } from '@sgi/framework/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IProyectoSocioEquipoBackend, ProyectoSocioEquipoService } from './proyecto-socio-equipo.service';

export interface IProyectoSocioBackend {
  id: number;
  proyecto: IProyecto;
  empresaRef: string;
  rolSocio: IRolSocio;
  fechaInicio: Date;
  fechaFin: Date;
  numInvestigadores: number;
  importeConcedido: number;
}


@Injectable({
  providedIn: 'root'
})
export class ProyectoSocioService extends SgiMutableRestService<number, IProyectoSocioBackend, IProyectoSocio>  {
  private static readonly MAPPING = '/proyectosocios';

  static CONVERTER = new class extends SgiBaseConverter<IProyectoSocioBackend, IProyectoSocio> {
    toTarget(value: IProyectoSocioBackend): IProyectoSocio {
      return {
        id: value.id,
        proyecto: value.proyecto,
        empresa: { personaRef: value.empresaRef } as IEmpresaEconomica,
        rolSocio: value.rolSocio,
        fechaInicio: value.fechaInicio,
        fechaFin: value.fechaFin,
        numInvestigadores: value.numInvestigadores,
        importeConcedido: value.importeConcedido
      };
    }

    fromTarget(value: IProyectoSocio): IProyectoSocioBackend {
      return {
        id: value.id,
        proyecto: value.proyecto,
        empresaRef: value.empresa.personaRef,
        rolSocio: value.rolSocio,
        fechaInicio: value.fechaInicio,
        fechaFin: value.fechaFin,
        numInvestigadores: value.numInvestigadores,
        importeConcedido: value.importeConcedido
      };
    }
  }();


  constructor(protected http: HttpClient) {
    super(
      ProyectoSocioService.name,
      `${environment.serviceServers.csp}${ProyectoSocioService.MAPPING}`,
      http,
      ProyectoSocioService.CONVERTER
    );
  }

  /**
   * Comprueba si existe un proyecto socio
   *
   * @param id Id del proyecto socio
   */
  exists(id: number): Observable<boolean> {
    const url = `${this.endpointUrl}/${id}`;
    return this.http.head(url, { observe: 'response' }).pipe(
      map(x => x.status === 200)
    );
  }

  /**
   * Devuelve el listado de IProyectoSocioEquipo de un IProyectoSocio
   *
   * @param id Id del IProyectoSocio
   */
  findAllProyectoEquipoSocio(id: number, options?: SgiRestFindOptions)
    : Observable<SgiRestListResult<IProyectoSocioEquipo>> {
    return this.find<IProyectoSocioEquipoBackend, IProyectoSocioEquipo>(
      `${this.endpointUrl}/${id}/proyectosocioequipos`, options,
      ProyectoSocioEquipoService.CONVERTER);
  }
  /**
   * Devuelve el listado de IProyectoSocioPeriodoPago de un IProyectoSocio
   *
   * @param id Id del proyecto socio
   */
  findAllProyectoSocioPeriodoPago(id: number, options?: SgiRestFindOptions)
    : Observable<SgiRestListResult<IProyectoSocioPeriodoPago>> {
    return this.find<IProyectoSocioPeriodoPago, IProyectoSocioPeriodoPago>(
      `${this.endpointUrl}/${id}/proyectosocioperiodopagos`, options);
  }
  /**
   * Devuelve el listado de IProyectoSocioPeriodoJustificacion de un IProyectoSocio
   *
   * @param id Id del proyecto socio
   */
  findAllProyectoSocioPeriodoJustificacion(id: number, options?: SgiRestFindOptions)
    : Observable<SgiRestListResult<IProyectoSocioPeriodoJustificacion>> {
    return this.find<IProyectoSocioPeriodoJustificacion, IProyectoSocioPeriodoJustificacion>(
      `${this.endpointUrl}/${id}/proyectosocioperiodojustificaciones`, options);
  }


  /**
   * Comprueba si un IProyectoSocio tiene IproyectoSocioEquipo, IProyectoSocioPeriodoPago, SocioPeriodoJustificacionDocumento
   * y/o ProyectoSocioPeriodoJustificacion relacionados
   *
   *  @param id Id deL proyecto
   */
  vinculaciones(id: number): Observable<boolean> {
    const url = `${this.endpointUrl}/${id}/vinculaciones`;
    return this.http.head(url, { observe: 'response' }).pipe(
      map(response => response.status === 200)
    );
  }
}
