import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ISolicitudProyectoDatos } from '@core/models/csp/solicitud-proyecto-datos';
import { ISolicitudProyectoPresupuesto } from '@core/models/csp/solicitud-proyecto-presupuesto';
import { IConceptoGasto } from '@core/models/csp/tipos-configuracion';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { environment } from '@env';
import { SgiBaseConverter } from '@sgi/framework/core';
import { SgiMutableRestService } from '@sgi/framework/http';


export interface ISolicitudProyectoPresupuestoBackend {
  id: number;
  solicitudProyectoDatos: ISolicitudProyectoDatos;
  conceptoGasto: IConceptoGasto;
  entidadRef: string;
  anualidad: number;
  importeSolicitado: number;
  observaciones: string;
  financiacionAjena: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class SolicitudProyectoPresupuestoService extends
  SgiMutableRestService<number, ISolicitudProyectoPresupuestoBackend, ISolicitudProyectoPresupuesto>  {
  private static readonly MAPPING = '/solicitudproyectopresupuestos';

  static CONVERTER = new class extends SgiBaseConverter<ISolicitudProyectoPresupuestoBackend, ISolicitudProyectoPresupuesto> {
    toTarget(value: ISolicitudProyectoPresupuestoBackend): ISolicitudProyectoPresupuesto {
      return {
        id: value.id,
        solicitudProyectoDatos: value.solicitudProyectoDatos,
        conceptoGasto: value.conceptoGasto,
        empresa: { personaRef: value.entidadRef } as IEmpresaEconomica,
        anualidad: value.anualidad,
        importeSolicitado: value.importeSolicitado,
        observaciones: value.observaciones,
        financiacionAjena: value.financiacionAjena
      };
    }

    fromTarget(value: ISolicitudProyectoPresupuesto): ISolicitudProyectoPresupuestoBackend {
      return {
        id: value.id,
        solicitudProyectoDatos: value.solicitudProyectoDatos,
        conceptoGasto: value.conceptoGasto,
        entidadRef: value.empresa?.personaRef,
        anualidad: value.anualidad,
        importeSolicitado: value.importeSolicitado,
        observaciones: value.observaciones,
        financiacionAjena: value.financiacionAjena ? true : false
      };
    }
  }();


  constructor(protected http: HttpClient) {
    super(
      SolicitudProyectoPresupuestoService.name,
      `${environment.serviceServers.csp}${SolicitudProyectoPresupuestoService.MAPPING}`,
      http,
      SolicitudProyectoPresupuestoService.CONVERTER
    );
  }

}
