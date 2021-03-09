import { Injectable, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IConfiguracionSolicitud } from '@core/models/csp/configuracion-solicitud';
import { Destinatarios, IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaConceptoGasto } from '@core/models/csp/convocatoria-concepto-gasto';
import { IConvocatoriaFase } from '@core/models/csp/convocatoria-fase';
import { ActionService } from '@core/services/action-service';
import { ConfiguracionSolicitudService } from '@core/services/csp/configuracion-solicitud.service';
import { ConvocatoriaAreaTematicaService } from '@core/services/csp/convocatoria-area-tematica.service';
import { ConvocatoriaConceptoGastoService } from '@core/services/csp/convocatoria-concepto-gasto.service';
import { ConvocatoriaDocumentoService } from '@core/services/csp/convocatoria-documento.service';
import { ConvocatoriaEnlaceService } from '@core/services/csp/convocatoria-enlace.service';
import { ConvocatoriaEntidadConvocanteService } from '@core/services/csp/convocatoria-entidad-convocante.service';
import { ConvocatoriaEntidadFinanciadoraService } from '@core/services/csp/convocatoria-entidad-financiadora.service';
import { ConvocatoriaEntidadGestoraService } from '@core/services/csp/convocatoria-entidad-gestora.service';
import { ConvocatoriaFaseService } from '@core/services/csp/convocatoria-fase.service';
import { ConvocatoriaHitoService } from '@core/services/csp/convocatoria-hito.service';
import { ConvocatoriaPeriodoJustificacionService } from '@core/services/csp/convocatoria-periodo-justificacion.service';
import { ConvocatoriaRequisitoEquipoService } from '@core/services/csp/convocatoria-requisito-equipo.service';
import { ConvocatoriaRequisitoIPService } from '@core/services/csp/convocatoria-requisito-ip.service';
import { ConvocatoriaSeguimientoCientificoService } from '@core/services/csp/convocatoria-seguimiento-cientifico.service';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { DocumentoRequeridoService } from '@core/services/csp/documento-requerido.service';
import { UnidadGestionService } from '@core/services/csp/unidad-gestion.service';
import { DialogService } from '@core/services/dialog.service';
import { EmpresaEconomicaService } from '@core/services/sgp/empresa-economica.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ConvocatoriaConceptoGastoFragment } from './convocatoria-formulario/convocatoria-concepto-gasto/convocatoria-concepto-gasto.fragment';
import { ConvocatoriaConfiguracionSolicitudesFragment } from './convocatoria-formulario/convocatoria-configuracion-solicitudes/convocatoria-configuracion-solicitudes.fragment';
import { ConvocatoriaDatosGeneralesFragment } from './convocatoria-formulario/convocatoria-datos-generales/convocatoria-datos-generales.fragment';
import { ConvocatoriaDocumentosFragment } from './convocatoria-formulario/convocatoria-documentos/convocatoria-documentos.fragment';
import { ConvocatoriaEnlaceFragment } from './convocatoria-formulario/convocatoria-enlace/convocatoria-enlace.fragment';
import { ConvocatoriaEntidadesConvocantesFragment } from './convocatoria-formulario/convocatoria-entidades-convocantes/convocatoria-entidades-convocantes.fragment';
import { ConvocatoriaEntidadesFinanciadorasFragment } from './convocatoria-formulario/convocatoria-entidades-financiadoras/convocatoria-entidades-financiadoras.fragment';
import { ConvocatoriaHitosFragment } from './convocatoria-formulario/convocatoria-hitos/convocatoria-hitos.fragment';
import { ConvocatoriaPeriodosJustificacionFragment } from './convocatoria-formulario/convocatoria-periodos-justificacion/convocatoria-periodo-justificacion.fragment';
import { ConvocatoriaPlazosFasesFragment } from './convocatoria-formulario/convocatoria-plazos-fases/convocatoria-plazos-fases.fragment';
import { ConvocatoriaRequisitosEquipoFragment } from './convocatoria-formulario/convocatoria-requisitos-equipo/convocatoria-requisitos-equipo.fragment';
import { ConvocatoriaRequisitosIPFragment } from './convocatoria-formulario/convocatoria-requisitos-ip/convocatoria-requisitos-ip.fragment';
import { ConvocatoriaSeguimientoCientificoFragment } from './convocatoria-formulario/convocatoria-seguimiento-cientifico/convocatoria-seguimiento-cientifico.fragment';






const MSG_REGISTRAR = marker('csp.convocatoria.registrar.msg');

@Injectable()
export class ConvocatoriaActionService extends ActionService implements OnDestroy {

  public readonly FRAGMENT = {
    DATOS_GENERALES: 'datos-generales',
    PERIODO_JUSTIFICACION: 'periodos-justificacion',
    PLAZOS_FASES: 'plazos-fases',
    HITOS: 'hitos',
    ENTIDADES_CONVOCANTES: 'entidades-convocantes',
    SEGUIMIENTO_CIENTIFICO: 'seguimiento-cientifico',
    ENLACES: 'enlaces',
    ENTIDADES_FINANCIADORAS: 'entidades-financiadoras',
    REQUISITOS_IP: 'requisitos-ip',
    ELEGIBILIDAD: 'elegibilidad',
    REQUISITOS_EQUIPO: 'requisitos-equipo',
    DOCUMENTOS: 'documentos',
    CONFIGURACION_SOLICITUDES: 'configuracion-solicitudes'
  };

  private datosGenerales: ConvocatoriaDatosGeneralesFragment;
  private plazosFases: ConvocatoriaPlazosFasesFragment;
  private periodoJustificacion: ConvocatoriaPeriodosJustificacionFragment;
  private seguimientoCientifico: ConvocatoriaSeguimientoCientificoFragment;
  private hitos: ConvocatoriaHitosFragment;
  private entidadesConvocantes: ConvocatoriaEntidadesConvocantesFragment;
  private entidadesFinanciadoras: ConvocatoriaEntidadesFinanciadorasFragment;
  private enlaces: ConvocatoriaEnlaceFragment;
  private requisitosIP: ConvocatoriaRequisitosIPFragment;
  private elegibilidad: ConvocatoriaConceptoGastoFragment;
  private requisitosEquipo: ConvocatoriaRequisitosEquipoFragment;
  private documentos: ConvocatoriaDocumentosFragment;
  private configuracionSolicitudes: ConvocatoriaConfiguracionSolicitudesFragment;

  private dialogService: DialogService;
  private configuracionSolicitud: IConfiguracionSolicitud;
  readonly = false;
  private destionarioRequisitoIP = false;
  private destionarioRequisitoEquipo = false;

  private modeloEjecucionIdValue: number;

  get modeloEjecucionId(): number {
    if (this.datosGenerales.isInitialized()) {
      return this.datosGenerales.getValue().modeloEjecucion?.id;
    }
    return this.modeloEjecucionIdValue;
  }

  get duracion(): number {
    return this.getDatosGeneralesConvocatoria().duracion;
  }

  convocatoriaId: number;

  constructor(
    fb: FormBuilder,
    logger: NGXLogger,
    route: ActivatedRoute,
    private convocatoriaService: ConvocatoriaService,
    convocatoriaEnlaceService: ConvocatoriaEnlaceService,
    empresaEconomicaService: EmpresaEconomicaService,
    convocatoriaEntidadFinanciadoraService: ConvocatoriaEntidadFinanciadoraService,
    convocatoriaEntidadGestoraService: ConvocatoriaEntidadGestoraService,
    unidadGestionService: UnidadGestionService,
    convocatoriaPeriodoJustificacionService: ConvocatoriaPeriodoJustificacionService,
    convocatoriaFaseService: ConvocatoriaFaseService,
    convocatoriaConceptoGastoService: ConvocatoriaConceptoGastoService,
    convocatoriaHitoService: ConvocatoriaHitoService,
    convocatoriaSeguimientoCientificoService: ConvocatoriaSeguimientoCientificoService,
    convocatoriaAreaTematicaService: ConvocatoriaAreaTematicaService,
    convocatoriaEntidadConvocanteService: ConvocatoriaEntidadConvocanteService,
    convocatoriaRequisitoEquipoService: ConvocatoriaRequisitoEquipoService,
    convocatoriaRequisitoIPService: ConvocatoriaRequisitoIPService,
    convocatoriaDocumentoService: ConvocatoriaDocumentoService,
    configuracionSolicitudService: ConfiguracionSolicitudService,
    documentoRequeridoService: DocumentoRequeridoService,
    dialogService: DialogService,
  ) {
    super();
    this.dialogService = dialogService;
    if (route.snapshot.data.convocatoriaId) {
      this.convocatoriaId = route.snapshot.data.convocatoriaId;
      this.enableEdit();
    }
    if (route.snapshot.data.configuracionSolicitud) {
      this.configuracionSolicitud = route.snapshot.data.configuracionSolicitud;
    }
    if (route.snapshot.data.modeloEjecucionId) {
      this.modeloEjecucionIdValue = route.snapshot.data.modeloEjecucionId;
    }

    this.datosGenerales = new ConvocatoriaDatosGeneralesFragment(
      logger, this.convocatoriaId, convocatoriaService, empresaEconomicaService,
      convocatoriaEntidadGestoraService, unidadGestionService, convocatoriaAreaTematicaService,
      this.readonly);
    this.periodoJustificacion = new ConvocatoriaPeriodosJustificacionFragment(
      this.convocatoriaId, convocatoriaService, convocatoriaPeriodoJustificacionService, this.readonly);
    this.entidadesConvocantes = new ConvocatoriaEntidadesConvocantesFragment(
      logger, this.convocatoriaId, convocatoriaService, convocatoriaEntidadConvocanteService,
      empresaEconomicaService, this.readonly);
    this.plazosFases = new ConvocatoriaPlazosFasesFragment(
      this.convocatoriaId, convocatoriaService, convocatoriaFaseService, this.readonly);
    this.hitos = new ConvocatoriaHitosFragment(this.convocatoriaId, convocatoriaService,
      convocatoriaHitoService, this.readonly);
    this.documentos = new ConvocatoriaDocumentosFragment(logger, this.convocatoriaId, convocatoriaService,
      convocatoriaDocumentoService, this.readonly);
    this.seguimientoCientifico = new ConvocatoriaSeguimientoCientificoFragment(this.convocatoriaId,
      convocatoriaService, convocatoriaSeguimientoCientificoService, this.readonly);
    this.entidadesFinanciadoras = new ConvocatoriaEntidadesFinanciadorasFragment(
      this.convocatoriaId, convocatoriaService, convocatoriaEntidadFinanciadoraService, this.readonly);
    this.enlaces = new ConvocatoriaEnlaceFragment(this.convocatoriaId, convocatoriaService,
      convocatoriaEnlaceService, this.readonly);
    this.requisitosIP = new ConvocatoriaRequisitosIPFragment(fb, this.convocatoriaId,
      convocatoriaRequisitoIPService, this.readonly);
    this.elegibilidad = new ConvocatoriaConceptoGastoFragment(fb, this.convocatoriaId, convocatoriaService,
      convocatoriaConceptoGastoService, this.datosGenerales, this.readonly);
    this.requisitosEquipo = new ConvocatoriaRequisitosEquipoFragment(fb, this.convocatoriaId,
      convocatoriaRequisitoEquipoService, this.readonly);
    this.configuracionSolicitudes = new ConvocatoriaConfiguracionSolicitudesFragment(
      logger, this.convocatoriaId, configuracionSolicitudService, documentoRequeridoService,
      this.readonly);

    this.addFragment(this.FRAGMENT.DATOS_GENERALES, this.datosGenerales);
    this.addFragment(this.FRAGMENT.SEGUIMIENTO_CIENTIFICO, this.seguimientoCientifico);
    this.addFragment(this.FRAGMENT.ENTIDADES_CONVOCANTES, this.entidadesConvocantes);
    this.addFragment(this.FRAGMENT.ENTIDADES_FINANCIADORAS, this.entidadesFinanciadoras);
    this.addFragment(this.FRAGMENT.PERIODO_JUSTIFICACION, this.periodoJustificacion);
    this.addFragment(this.FRAGMENT.PLAZOS_FASES, this.plazosFases);
    this.addFragment(this.FRAGMENT.HITOS, this.hitos);
    this.addFragment(this.FRAGMENT.DOCUMENTOS, this.documentos);
    this.addFragment(this.FRAGMENT.ENLACES, this.enlaces);
    this.addFragment(this.FRAGMENT.REQUISITOS_IP, this.requisitosIP);
    this.addFragment(this.FRAGMENT.ELEGIBILIDAD, this.elegibilidad);
    this.addFragment(this.FRAGMENT.REQUISITOS_EQUIPO, this.requisitosEquipo);
    this.addFragment(this.FRAGMENT.CONFIGURACION_SOLICITUDES, this.configuracionSolicitudes);

    if (this.isEdit()) {
      const subscription = this.convocatoriaService.modificable(this.convocatoriaId).subscribe(
        (value) => {
          this.readonly = !value;
          if (this.readonly) {
            this.datosGenerales.getFormGroup()?.disable();
            this.requisitosEquipo.getFormGroup()?.disable();
          }
          this.datosGenerales.readonly = this.readonly;
          this.seguimientoCientifico.readonly = this.readonly;
          this.entidadesConvocantes.readonly = this.readonly;
          this.entidadesFinanciadoras.readonly = this.readonly;
          this.periodoJustificacion.readonly = this.readonly;
          this.plazosFases.readonly = this.readonly;
          this.hitos.readonly = this.readonly;
          this.documentos.readonly = this.readonly;
          this.enlaces.readonly = this.readonly;
          this.requisitosIP.readonly = this.readonly;
          this.elegibilidad.readonly = this.readonly;
          this.requisitosEquipo.readonly = this.readonly;
          this.configuracionSolicitudes.readonly = this.readonly;
        });
      this.subscriptions.push(subscription);
    }

    this.subscriptions.push(this.configuracionSolicitudes.initialized$.subscribe(value => {
      if (value && !this.plazosFases.isInitialized()) {
        this.plazosFases.initialize();
      }
    }));
    this.subscriptions.push(this.plazosFases.plazosFase$.subscribe(fases => {
      this.configuracionSolicitudes.setFases(fases.map(fase => fase.value));
    }));

    this.subscriptions.push(this.datosGenerales.destinatariosValue$.subscribe((destinatarios) => this.mostrarPestañaRequisito(destinatarios)));
  }

  /**
   * Recupera los datos de la convocatoria del formulario de datos generales,
   * si no se ha cargado el formulario de datos generales se recuperan los datos de la convocatoria que se esta editando.
   *
   * @returns los datos de la convocatoria.
   */
  getDatosGeneralesConvocatoria(): IConvocatoria {
    return this.datosGenerales.isInitialized() ? this.datosGenerales.getValue() : {} as IConvocatoria;
  }

  /**
   * Recupera plazos y fases
   * si no se ha cargado el formulario de plazos y fases se recuperan los datos de la convocatoria que se esta editando.
   *
   * @returns los datos de la convocatoria.
   */
  getPlazosFases(): StatusWrapper<IConvocatoriaFase>[] {
    return this.plazosFases.isInitialized() ? this.plazosFases.plazosFase$.value : [];
  }

  /**
   * Recupera los registros de conceptos de gasto permitidos en la convocatoria
   *
   * @returns los conceptos de gastos permitidos de la convocatoria.
   */
  getElegibilidadPermitidos(): StatusWrapper<IConvocatoriaConceptoGasto>[] {
    return this.elegibilidad.isInitialized() ? this.elegibilidad.convocatoriaConceptoGastoPermitido$.value : [];
  }

  /**
   * Recupera los registros de conceptos de gasto no permitidos en la convocatoria
   *
   * @returns los conceptos de gastos no permitidos de la convocatoria.
   */
  getElegibilidadNoPermitidos(): StatusWrapper<IConvocatoriaConceptoGasto>[] {
    return this.elegibilidad.isInitialized() ? this.elegibilidad.convocatoriaConceptoGastoNoPermitido$.value : [];
  }



  /**
   * Recupera plazos y fases
   * si no se ha cargado el formulario de plazos y fases se recuperan los datos de la convocatoria que se esta editando.
   *
   * @returns los datos de la convocatoria.
   */
  isPlazosFasesInitialized(): boolean {
    return this.plazosFases.isInitialized();
  }

  /**
   * Cuando se elimina una fase se actualizan los datos de la pestaña configuración solicitudes.
   */
  isDelete(convocatoriaFaseEliminada: IConvocatoriaFase): boolean {
    const fasePresentacionSolicitudes = this.configuracionSolicitudes.getFormGroup()
      .controls.fasePresentacionSolicitudes.value;

    if (!fasePresentacionSolicitudes) {
      return true;
    }

    return !(convocatoriaFaseEliminada.tipoFase.id === fasePresentacionSolicitudes.tipoFase.id
      && convocatoriaFaseEliminada.fechaInicio === fasePresentacionSolicitudes.fechaInicio
      && convocatoriaFaseEliminada.fechaFin === fasePresentacionSolicitudes.fechaFin
      && convocatoriaFaseEliminada.observaciones === fasePresentacionSolicitudes.observaciones);
  }


  initializeConfiguracionSolicitud(): void {
    this.configuracionSolicitudes.initialize();
  }

  initializePlazosFases(): void {
    this.plazosFases.initialize();
  }

  saveOrUpdate(): Observable<void> {
    this.performChecks(true);
    if (this.hasErrors()) {
      return throwError('Errores');
    }
    if (this.isEdit()) {
      return this.datosGenerales.saveOrUpdate().pipe(
        switchMap(() => {
          this.datosGenerales.refreshInitialState(true);
          return this.plazosFases.saveOrUpdate();
        }),
        switchMap(() => {
          this.plazosFases.refreshInitialState(true);
          return this.elegibilidad.saveOrUpdate();
        }),
        switchMap(() => {
          this.elegibilidad.refreshInitialState(true);

          return super.saveOrUpdate();
        })
      );
    } else {
      return this.datosGenerales.saveOrUpdate().pipe(
        switchMap((key) => {
          this.datosGenerales.refreshInitialState(true);
          if (typeof key === 'string' || typeof key === 'number') {
            this.onKeyChange(key);
          }
          return this.plazosFases.saveOrUpdate();
        }),
        switchMap(() => {
          this.plazosFases.refreshInitialState(true);
          return this.elegibilidad.saveOrUpdate();
        }),
        switchMap(() => {
          this.elegibilidad.refreshInitialState(true);

          return super.saveOrUpdate();
        })
      );
    }
  }

  /**
   * Recupera los datos de la convocatoria del formulario de configuración de solicitudes
   *
   * @return los datos de la cofiguración de solicitudes.
   */
  getConfiguracionSolicitudesConvocatoria(): IConfiguracionSolicitud {
    return this.configuracionSolicitudes.isInitialized() ? this.configuracionSolicitudes.getValue() : this.configuracionSolicitud;
  }

  /**
   * Mostramos pestaña requisitos IP/Equipo dependiendo
   * lo seleccionado en la pestaña DATOS GENERALES - DESTINATARIOS
   */
  private mostrarPestañaRequisito(destionarios: Destinatarios) {
    this.destionarioRequisitoIP = false;
    this.destionarioRequisitoEquipo = false;
    if (destionarios === Destinatarios.INDIVIDUAL) {
      this.destionarioRequisitoIP = !this.destionarioRequisitoIP;
      this.destionarioRequisitoEquipo = this.destionarioRequisitoEquipo;
    }
    if (destionarios === Destinatarios.EQUIPO_PROYECTO || destionarios === Destinatarios.GRUPO_INVESTIGACION) {
      this.destionarioRequisitoIP = !this.destionarioRequisitoIP;
      this.destionarioRequisitoEquipo = !this.destionarioRequisitoEquipo;
    }
  }

  /**
   * Modifica la visibilidad de la pestaña Requisito IP
   *
   * @param value Valor boolean
   */
  get disabledRequisitoIP(): boolean {
    return this.destionarioRequisitoIP;
  }

  /**
   * Modifica la visibilidad de la pestaña requisito EQUIPO
   *
   * @param value Valor boolean
   */
  get disabledRequisitoEquipo(): boolean {
    return this.destionarioRequisitoEquipo;
  }

  /**
   * Acción de registro de una convocatoria
   */
  registrar(): Observable<void> {
    return this.dialogService.showConfirmation(MSG_REGISTRAR)
      .pipe(switchMap((accept) => {
        if (accept) {
          return this.convocatoriaService.registrar(this.convocatoriaId);
        } else {
          return of(void 0);
        }
      }));
  }
}
