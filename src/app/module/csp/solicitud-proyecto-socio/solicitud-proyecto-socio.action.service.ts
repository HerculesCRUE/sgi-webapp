import { Injectable } from '@angular/core';
import { ISolicitudProyectoSocio } from '@core/models/csp/solicitud-proyecto-socio';
import { ActionService } from '@core/services/action-service';
import { SolicitudProyectoEquipoSocioService } from '@core/services/csp/solicitud-proyecto-equipo-socio.service';
import { SolicitudProyectoPeriodoJustificacionService } from '@core/services/csp/solicitud-proyecto-periodo-justificacion.service';
import { SolicitudProyectoPeriodoPagoService } from '@core/services/csp/solicitud-proyecto-periodo-pago.service';
import { SolicitudProyectoSocioService } from '@core/services/csp/solicitud-proyecto-socio.service';
import { SolicitudService } from '@core/services/csp/solicitud.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { NGXLogger } from 'ngx-logger';
import { ISolicitudProyectoSocioState } from '../solicitud/solicitud-formulario/solicitud-socios-colaboradores/solicitud-socios-colaboradores.component';
import { SolicitudProyectoPeriodoJustificacionesFragment } from './solicitud-proyecto-socio-formulario/solicitud-proyecto-periodo-justificaciones/solicitud-proyecto-periodo-justificaciones.fragment';
import { SolicitudProyectoSocioDatosGeneralesFragment } from './solicitud-proyecto-socio-formulario/solicitud-proyecto-socio-datos-generales/solicitud-proyecto-socio-datos-generales.fragment';
import { SolicitudProyectoSocioEquipoSocioFragment } from './solicitud-proyecto-socio-formulario/solicitud-proyecto-socio-equipo-socio/solicitud-proyecto-socio-equipo-socio.fragment';
import { SolicitudProyectoSocioPeriodoPagoFragment } from './solicitud-proyecto-socio-formulario/solicitud-proyecto-socio-periodo-pago/solicitud-proyecto-socio-periodo-pago.fragment';

@Injectable()
export class SolicitudProyectoSocioActionService extends ActionService {
  public readonly FRAGMENT = {
    DATOS_GENERALES: 'datos-generales',
    PERIODOS_PAGOS: 'periodos-pagos',
    PERIODOS_JUSTIFICACION: 'periodos-justificacion',
    EQUIPO_SOCIO: 'equipo-socio'
  };

  private datosGenerales: SolicitudProyectoSocioDatosGeneralesFragment;
  private periodosPago: SolicitudProyectoSocioPeriodoPagoFragment;
  private periodoJustificaciones: SolicitudProyectoPeriodoJustificacionesFragment;
  private socioEquipoSocio: SolicitudProyectoSocioEquipoSocioFragment;

  private urlProyecto: string;
  private solicitudId: number;
  private solicitudProyectoSocio: ISolicitudProyectoSocio;
  private selectedSolicitudProyectoSocios: ISolicitudProyectoSocio[];
  private coordinadorExternoValue = false;

  get coordinadorExterno(): boolean {
    return this.coordinadorExternoValue;
  }

  constructor(
    readonly logger: NGXLogger,
    solicitudService: SolicitudService,
    solicitudProyectoSocioService: SolicitudProyectoSocioService,
    solicitudProyectoPeriodoPagoService: SolicitudProyectoPeriodoPagoService,
    solicitudProyectoPeriodoJustificacionService: SolicitudProyectoPeriodoJustificacionService,
    solicitudProyectoEquipoSocioService: SolicitudProyectoEquipoSocioService,
    personaFisicaService: PersonaFisicaService
  ) {
    super();

    const state: ISolicitudProyectoSocioState = history.state;
    this.solicitudProyectoSocio = state.solicitudProyectoSocio;
    this.solicitudId = state.solicitudId;
    this.selectedSolicitudProyectoSocios = state.selectedSolicitudProyectoSocios;
    this.coordinadorExternoValue = state?.coordinadorExterno;

    if (this.solicitudProyectoSocio?.id) {
      this.enableEdit();
    }

    this.datosGenerales = new SolicitudProyectoSocioDatosGeneralesFragment(
      this.solicitudProyectoSocio?.id, this.solicitudId, solicitudProyectoSocioService, solicitudService, history.state.readonly);
    this.periodosPago = new SolicitudProyectoSocioPeriodoPagoFragment(logger, this.solicitudProyectoSocio?.id,
      solicitudProyectoSocioService, solicitudProyectoPeriodoPagoService, history.state.readonly);
    this.periodoJustificaciones = new SolicitudProyectoPeriodoJustificacionesFragment(logger, this.solicitudProyectoSocio?.id,
      solicitudProyectoSocioService, solicitudProyectoPeriodoJustificacionService, history.state.readonly);
    this.socioEquipoSocio = new SolicitudProyectoSocioEquipoSocioFragment(logger, this.solicitudProyectoSocio?.id,
      solicitudProyectoSocioService, solicitudProyectoEquipoSocioService, personaFisicaService, history.state.readonly);

    this.addFragment(this.FRAGMENT.DATOS_GENERALES, this.datosGenerales);
    this.addFragment(this.FRAGMENT.PERIODOS_PAGOS, this.periodosPago);
    this.addFragment(this.FRAGMENT.PERIODOS_JUSTIFICACION, this.periodoJustificaciones);
    this.addFragment(this.FRAGMENT.EQUIPO_SOCIO, this.socioEquipoSocio);


  }

  getSolicitudProyectoSocio(): ISolicitudProyectoSocio {
    return this.datosGenerales.isInitialized() ? this.datosGenerales.getValue() : this.solicitudProyectoSocio;
  }

  getSelectedSolicitudProyectoSocios(): ISolicitudProyectoSocio[] {
    return this.selectedSolicitudProyectoSocios;
  }
}
