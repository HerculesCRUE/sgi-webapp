import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IEntidadFinanciadora } from '@core/models/csp/entidad-financiadora';
import { ActionService } from '@core/services/action-service';
import { SolicitudProyectoPresupuestoService } from '@core/services/csp/solicitud-proyecto-presupuesto.service';
import { SolicitudService } from '@core/services/csp/solicitud.service';
import { NGXLogger } from 'ngx-logger';
import { SolicitudProyectoPresupuestoDatosGeneralesFragment } from './solicitud-proyecto-presupuesto-formulario/solicitud-proyecto-presupuesto-datos-generales/solicitud-proyecto-presupuesto-datos-generales.fragment';
import { SolicitudProyectoPresupuestoPartidasGastoFragment } from './solicitud-proyecto-presupuesto-formulario/solicitud-proyecto-presupuesto-partidas-gasto/solicitud-proyecto-presupuesto-partidas-gasto.fragment';



@Injectable()
export class SolicitudProyectoPresupuestoActionService extends ActionService {

  public readonly FRAGMENT = {
    DATOS_GENERALES: 'datosGenerales',
    PARTIDAS_GASTO: 'partidasGasto'
  };

  private datosGenerales: SolicitudProyectoPresupuestoDatosGeneralesFragment;
  private partidasGasto: SolicitudProyectoPresupuestoPartidasGastoFragment;

  private solicitudId: number;
  private convocatoriaId: number;
  private entidadFinanciadora: IEntidadFinanciadora;
  private isEntidadFinanciadoraConvocatoria: boolean;

  readonly = false;


  constructor(
    private readonly logger: NGXLogger,
    route: ActivatedRoute,
    private solicitudService: SolicitudService,
    private solicitudProyectoPresupuestoService: SolicitudProyectoPresupuestoService
  ) {
    super();

    this.solicitudId = history.state.solicitudId;
    this.convocatoriaId = history.state.convocatoriaId;
    this.entidadFinanciadora = history.state.entidadFinanciadora;
    this.isEntidadFinanciadoraConvocatoria = history.state.isEntidadFinanciadoraConvocatoria;
    this.enableEdit();


    this.datosGenerales = new SolicitudProyectoPresupuestoDatosGeneralesFragment(logger, this.solicitudId, this.entidadFinanciadora,
      this.isEntidadFinanciadoraConvocatoria)
    this.partidasGasto = new SolicitudProyectoPresupuestoPartidasGastoFragment(logger, this.solicitudId, this.entidadFinanciadora,
      this.isEntidadFinanciadoraConvocatoria, this.convocatoriaId, this.solicitudService, this.solicitudProyectoPresupuestoService, this.readonly)

    this.addFragment(this.FRAGMENT.DATOS_GENERALES, this.datosGenerales);
    this.addFragment(this.FRAGMENT.PARTIDAS_GASTO, this.partidasGasto);

  }

}
