import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IFuenteFinanciacion } from '@core/models/csp/fuente-financiacion';
import { IProyectoEntidadFinanciadora } from '@core/models/csp/proyecto-entidad-financiadora';
import { ITipoFinanciacion } from '@core/models/csp/tipos-configuracion';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { environment } from '@env';
import { SgiBaseConverter } from '@sgi/framework/core';
import { SgiMutableRestService } from '@sgi/framework/http';

export interface IProyectoEntidadFinanciadoraBackend {
  id: number;
  entidadRef: string;
  proyectoId: number;
  fuenteFinanciacion: IFuenteFinanciacion;
  tipoFinanciacion: ITipoFinanciacion;
  porcentajeFinanciacion: number;
  ajena: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProyectoEntidadFinanciadoraService extends
  SgiMutableRestService<number, IProyectoEntidadFinanciadoraBackend, IProyectoEntidadFinanciadora> {
  private static readonly MAPPING = '/proyectoentidadfinanciadoras';

  public static readonly CONVERTER = new class extends SgiBaseConverter<IProyectoEntidadFinanciadoraBackend, IProyectoEntidadFinanciadora> {
    toTarget(value: IProyectoEntidadFinanciadoraBackend): IProyectoEntidadFinanciadora {
      return {
        id: value.id,
        empresa: { personaRef: value.entidadRef } as IEmpresaEconomica,
        proyectoId: value.proyectoId,
        fuenteFinanciacion: value.fuenteFinanciacion,
        tipoFinanciacion: value.tipoFinanciacion,
        porcentajeFinanciacion: value.porcentajeFinanciacion,
        ajena: value.ajena
      };
    }

    fromTarget(value: IProyectoEntidadFinanciadora): IProyectoEntidadFinanciadoraBackend {
      return {
        id: value.id,
        entidadRef: value.empresa?.personaRef,
        proyectoId: value.proyectoId,
        fuenteFinanciacion: value.fuenteFinanciacion,
        tipoFinanciacion: value.tipoFinanciacion,
        porcentajeFinanciacion: value.porcentajeFinanciacion,
        ajena: value.ajena
      };
    }
  }();

  constructor(protected http: HttpClient) {
    super(
      ProyectoEntidadFinanciadoraService.name,
      `${environment.serviceServers.csp}${ProyectoEntidadFinanciadoraService.MAPPING}`,
      http,
      ProyectoEntidadFinanciadoraService.CONVERTER
    );
  }
}
