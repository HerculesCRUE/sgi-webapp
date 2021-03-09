import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IRolSocio } from '@core/models/csp/rol-socio';
import { ISolicitudProyectoDatos } from '@core/models/csp/solicitud-proyecto-datos';
import { ISolicitudProyectoEquipoSocio } from '@core/models/csp/solicitud-proyecto-equipo-socio';
import { ISolicitudProyectoPeriodoJustificacion } from '@core/models/csp/solicitud-proyecto-periodo-justificacion';
import { ISolicitudProyectoPeriodoPago } from '@core/models/csp/solicitud-proyecto-periodo-pago';
import { ISolicitudProyectoSocio } from '@core/models/csp/solicitud-proyecto-socio';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { environment } from '@env';
import { SgiBaseConverter } from '@sgi/framework/core';
import { SgiMutableRestService, SgiRestFindOptions, SgiRestListResult } from '@sgi/framework/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { EmpresaEconomicaService } from '../sgp/empresa-economica.service';
import { ISolicitudProyectoEquipoSocioBackend, SolicitudProyectoEquipoSocioService } from './solicitud-proyecto-equipo-socio.service';

export interface ISolicitudProyectoSocioBackend {
  id: number;
  solicitudProyectoDatos: ISolicitudProyectoDatos;
  empresaRef: string;
  rolSocio: IRolSocio;
  mesInicio: number;
  mesFin: number;
  numInvestigadores: number;
  importeSolicitado: number;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitudProyectoSocioService extends SgiMutableRestService<number, ISolicitudProyectoSocioBackend, ISolicitudProyectoSocio>  {
  private static readonly MAPPING = '/solicitudproyectosocio';

  static CONVERTER = new class extends SgiBaseConverter<ISolicitudProyectoSocioBackend, ISolicitudProyectoSocio> {
    toTarget(value: ISolicitudProyectoSocioBackend): ISolicitudProyectoSocio {
      const empresa: IEmpresaEconomica = {
        direccion: undefined,
        numeroDocumento: undefined,
        personaRef: value.empresaRef,
        personaRefPadre: undefined,
        razonSocial: undefined,
        tipo: undefined,
        tipoDocumento: undefined,
        tipoEmpresa: undefined
      };
      const result: ISolicitudProyectoSocio = {
        empresa,
        id: value.id,
        importeSolicitado: value.importeSolicitado,
        mesFin: value.mesFin,
        mesInicio: value.mesInicio,
        numInvestigadores: value.numInvestigadores,
        rolSocio: value.rolSocio,
        solicitudProyectoDatos: value.solicitudProyectoDatos
      };
      return result;
    }

    fromTarget(value: ISolicitudProyectoSocio): ISolicitudProyectoSocioBackend {
      const result: ISolicitudProyectoSocioBackend = {
        empresaRef: value.empresa.personaRef,
        id: value.id,
        importeSolicitado: value.importeSolicitado,
        mesFin: value.mesFin,
        mesInicio: value.mesInicio,
        numInvestigadores: value.numInvestigadores,
        rolSocio: value.rolSocio,
        solicitudProyectoDatos: value.solicitudProyectoDatos
      };
      return result;
    }
  }();

  constructor(
    protected http: HttpClient,
    private empresaEconomicaService: EmpresaEconomicaService
  ) {
    super(
      SolicitudProyectoSocioService.name,
      `${environment.serviceServers.csp}${SolicitudProyectoSocioService.MAPPING}`,
      http,
      SolicitudProyectoSocioService.CONVERTER
    );
  }

  findById(id: number): Observable<ISolicitudProyectoSocio> {
    return super.findById(id).pipe(
      switchMap(solicitudProyectoSocio => {
        const personaRef = solicitudProyectoSocio.empresa.personaRef;
        return this.empresaEconomicaService.findById(personaRef).pipe(
          map(empresa => {
            solicitudProyectoSocio.empresa = empresa;
            return solicitudProyectoSocio;
          })
        );
      })
    );
  }

  /**
   * Devuelve el listado de ISolicitudProyectoPeriodoPago de un ISolicitudProyectoSocio
   *
   * @param id Id del ISolicitudProyectoSocio
   */
  findAllSolicitudProyectoPeriodoPago(id: number, options?: SgiRestFindOptions):
    Observable<SgiRestListResult<ISolicitudProyectoPeriodoPago>> {
    return this.find<ISolicitudProyectoPeriodoPago, ISolicitudProyectoPeriodoPago>(
      `${this.endpointUrl}/${id}/solicitudproyectoperiodopago`, options);
  }

  /**
   * Devuelve el listado de ISolicitudProyectoPeriodoPago de un ISolicitudProyectoSocio
   *
   * @param id Id del ISolicitudProyectoSocio
   */
  findAllSolicitudProyectoPeriodoJustificacion(id: number, options?: SgiRestFindOptions):
    Observable<SgiRestListResult<ISolicitudProyectoPeriodoJustificacion>> {
    return this.find<ISolicitudProyectoPeriodoJustificacion, ISolicitudProyectoPeriodoJustificacion>(
      `${this.endpointUrl}/${id}/solicitudproyectoperiodojustificaciones`, options);
  }

  /**
   * Devuelve el listado de ISolicitudProyectoEquipoSocio de un ISolicitudProyectoSocio
   *
   * @param id Id del ISolicitudProyectoSocio
   */
  findAllSolicitudProyectoEquipoSocio(id: number, options?: SgiRestFindOptions):
    Observable<SgiRestListResult<ISolicitudProyectoEquipoSocio>> {
    return this.find<ISolicitudProyectoEquipoSocioBackend, ISolicitudProyectoEquipoSocio>(
      `${this.endpointUrl}/${id}/solicitudproyectoequiposocio`, options,
      SolicitudProyectoEquipoSocioService.CONVERTER);
  }


  /**
   * Comprueba si un ISolicitudProyectoSocio tiene ISolicitudProyectoSocioEquipo,
   * ISolicitudProyectoSocioPeriodoPago y/o ISolicitudProyectoSocioPeriodoJustificacion 
   * relacionados
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
