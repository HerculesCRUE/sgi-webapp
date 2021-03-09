import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPrograma } from '@core/models/csp/programa';
import { ISolicitud } from '@core/models/csp/solicitud';
import { ISolicitudModalidad } from '@core/models/csp/solicitud-modalidad';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { environment } from '@env';
import { SgiBaseConverter } from '@sgi/framework/core';
import { SgiMutableRestService } from '@sgi/framework/http';


export interface ISolicitudModalidadBackend {
  /** Id */
  id: number;

  /** Solicitud */
  solicitud: ISolicitud;

  /** EntidadRef */
  entidadRef: string;

  /** Programa */
  programa: IPrograma;

}


@Injectable({
  providedIn: 'root'
})
export class SolicitudModalidadService extends SgiMutableRestService<number, ISolicitudModalidadBackend, ISolicitudModalidad> {
  static readonly MAPPING = '/solicitudmodalidades';

  static readonly CONVERTER = new class extends SgiBaseConverter<ISolicitudModalidadBackend, ISolicitudModalidad> {
    toTarget(value: ISolicitudModalidadBackend): ISolicitudModalidad {
      return {
        id: value.id,
        solicitud: value.solicitud,
        entidad: { personaRef: value.entidadRef } as IEmpresaEconomica,
        programa: value.programa
      };
    }

    fromTarget(value: ISolicitudModalidad): ISolicitudModalidadBackend {
      return {
        id: value.id,
        solicitud: value.solicitud,
        entidadRef: value.entidad?.personaRef,
        programa: value.programa
      };
    }
  }();

  constructor(protected http: HttpClient) {
    super(
      SolicitudModalidadService.name,
      `${environment.serviceServers.csp}${SolicitudModalidadService.MAPPING}`,
      http,
      SolicitudModalidadService.CONVERTER
    );
  }

}
