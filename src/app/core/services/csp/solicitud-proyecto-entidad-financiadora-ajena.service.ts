import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IFuenteFinanciacion } from '@core/models/csp/fuente-financiacion';
import { ISolicitudProyectoDatos } from '@core/models/csp/solicitud-proyecto-datos';
import { ISolicitudProyectoEntidadFinanciadoraAjena } from '@core/models/csp/solicitud-proyecto-entidad-financiadora-ajena';
import { ITipoFinanciacion } from '@core/models/csp/tipos-configuracion';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { environment } from '@env';
import { SgiBaseConverter } from '@sgi/framework/core';
import { SgiMutableRestService } from '@sgi/framework/http';



export interface ISolicitudProyectoEntidadFinanciadoraAjenaBackend {
  id: number;
  entidadRef: string;
  solicitudProyectoDatos: ISolicitudProyectoDatos;
  fuenteFinanciacion: IFuenteFinanciacion;
  tipoFinanciacion: ITipoFinanciacion;
  porcentajeFinanciacion: number;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitudProyectoEntidadFinanciadoraAjenaService extends
  SgiMutableRestService<number, ISolicitudProyectoEntidadFinanciadoraAjenaBackend, ISolicitudProyectoEntidadFinanciadoraAjena> {
  private static readonly MAPPING = '/solicitudproyectoentidadfinanciadoraajenas';

  public static readonly CONVERTER = new class extends SgiBaseConverter<ISolicitudProyectoEntidadFinanciadoraAjenaBackend, ISolicitudProyectoEntidadFinanciadoraAjena> {
    toTarget(value: ISolicitudProyectoEntidadFinanciadoraAjenaBackend): ISolicitudProyectoEntidadFinanciadoraAjena {
      return {
        id: value.id,
        empresa: { personaRef: value.entidadRef } as IEmpresaEconomica,
        solicitudProyectoDatos: value.solicitudProyectoDatos,
        fuenteFinanciacion: value.fuenteFinanciacion,
        tipoFinanciacion: value.tipoFinanciacion,
        porcentajeFinanciacion: value.porcentajeFinanciacion
      };
    }

    fromTarget(value: ISolicitudProyectoEntidadFinanciadoraAjena): ISolicitudProyectoEntidadFinanciadoraAjenaBackend {
      return {
        id: value.id,
        entidadRef: value.empresa.personaRef,
        solicitudProyectoDatos: value.solicitudProyectoDatos,
        fuenteFinanciacion: value.fuenteFinanciacion,
        tipoFinanciacion: value.tipoFinanciacion,
        porcentajeFinanciacion: value.porcentajeFinanciacion
      };
    }
  }();

  constructor(protected http: HttpClient) {
    super(
      SolicitudProyectoEntidadFinanciadoraAjenaService.name,
      `${environment.serviceServers.csp}${SolicitudProyectoEntidadFinanciadoraAjenaService.MAPPING}`,
      http,
      SolicitudProyectoEntidadFinanciadoraAjenaService.CONVERTER
    );
  }
}
