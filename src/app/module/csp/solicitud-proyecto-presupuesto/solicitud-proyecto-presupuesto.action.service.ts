import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IEntidadFinanciadora } from '@core/models/csp/entidad-financiadora';
import { ActionService } from '@core/services/action-service';
import { SolicitudProyectoPresupuestoService } from '@core/services/csp/solicitud-proyecto-presupuesto.service';
import { SolicitudService } from '@core/services/csp/solicitud.service';
import { SOLICITUD_ROUTE_PARAMS } from '../solicitud/solicitud-route-params';
import { SOLICITUD_PROYECTO_PRESUPUESTO_DATA_KEY } from './solicitud-proyecto-presupuesto-data.resolver';
import { SolicitudProyectoPresupuestoDatosGeneralesFragment } from './solicitud-proyecto-presupuesto-formulario/solicitud-proyecto-presupuesto-datos-generales/solicitud-proyecto-presupuesto-datos-generales.fragment';
import { SolicitudProyectoPresupuestoPartidasGastoFragment } from './solicitud-proyecto-presupuesto-formulario/solicitud-proyecto-presupuesto-partidas-gasto/solicitud-proyecto-presupuesto-partidas-gasto.fragment';

export interface ISolicitudProyectoPresupuestoData {
  entidadFinanciadora: IEntidadFinanciadora;
  ajena: boolean;
  readonly: boolean;
}

@Injectable()
export class SolicitudProyectoPresupuestoActionService extends ActionService {

  public readonly FRAGMENT = {
    DATOS_GENERALES: 'datosGenerales',
    PARTIDAS_GASTO: 'partidasGasto'
  };

  private datosGenerales: SolicitudProyectoPresupuestoDatosGeneralesFragment;
  private partidasGasto: SolicitudProyectoPresupuestoPartidasGastoFragment;

  private readonly data: ISolicitudProyectoPresupuestoData;

  constructor(
    route: ActivatedRoute,
    solicitudService: SolicitudService,
    solicitudProyectoPresupuestoService: SolicitudProyectoPresupuestoService,
  ) {
    super();
    this.data = route.snapshot.data[SOLICITUD_PROYECTO_PRESUPUESTO_DATA_KEY];
    const solicitudId = Number(route.snapshot.paramMap.get(SOLICITUD_ROUTE_PARAMS.ID));

    this.enableEdit();

    this.datosGenerales = new SolicitudProyectoPresupuestoDatosGeneralesFragment(
      solicitudId, this.data.entidadFinanciadora, this.data.ajena);
    this.partidasGasto = new SolicitudProyectoPresupuestoPartidasGastoFragment(
      solicitudId, this.data.entidadFinanciadora.empresa, this.data.ajena, solicitudService,
      solicitudProyectoPresupuestoService, this.data.readonly);

    this.addFragment(this.FRAGMENT.DATOS_GENERALES, this.datosGenerales);
    this.addFragment(this.FRAGMENT.PARTIDAS_GASTO, this.partidasGasto);

  }

}
