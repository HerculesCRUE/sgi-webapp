import { Injectable, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IConvocatoriaFase } from '@core/models/csp/convocatoria-fase';
import { IModeloEjecucion } from '@core/models/csp/tipos-configuracion';
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
import { DocumentoRequeridoSolicitudService } from '@core/services/csp/documento-requerido-solicitud.service';
import { UnidadGestionService } from '@core/services/csp/unidad-gestion.service';
import { DialogService } from '@core/services/dialog.service';
import { EmpresaService } from '@core/services/sgemp/empresa.service';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { CONVOCATORIA_DATA_KEY } from './convocatoria-data.resolver';
import { ConvocatoriaConceptoGastoFragment } from './convocatoria-formulario/convocatoria-concepto-gasto/convocatoria-concepto-gasto.fragment';
import { ConvocatoriaConfiguracionSolicitudesFragment } from './convocatoria-formulario/convocatoria-configuracion-solicitudes/convocatoria-configuracion-solicitudes.fragment';
import { ConvocatoriaDatosGeneralesFragment } from './convocatoria-formulario/convocatoria-datos-generales/convocatoria-datos-generales.fragment';
import { ConvocatoriaDocumentosFragment } from './convocatoria-formulario/convocatoria-documentos/convocatoria-documentos.fragment';
import { ConvocatoriaEnlaceFragment } from './convocatoria-formulario/convocatoria-enlace/convocatoria-enlace.fragment';
import { ConvocatoriaEntidadesConvocantesFragment } from './convocatoria-formulario/convocatoria-entidades-convocantes/convocatoria-entidades-convocantes.fragment';
import { ConvocatoriaEntidadesFinanciadorasFragment } from './convocatoria-formulario/convocatoria-entidades-financiadoras/convocatoria-entidades-financiadoras.fragment';
import { ConvocatoriaHitosFragment } from './convocatoria-formulario/convocatoria-hitos/convocatoria-hitos.fragment';
import { ConvocatoriaPeriodosJustificacionFragment } from './convocatoria-formulario/convocatoria-periodos-justificacion/convocatoria-periodos-justificacion.fragment';
import { ConvocatoriaPlazosFasesFragment } from './convocatoria-formulario/convocatoria-plazos-fases/convocatoria-plazos-fases.fragment';
import { ConvocatoriaRequisitosEquipoFragment } from './convocatoria-formulario/convocatoria-requisitos-equipo/convocatoria-requisitos-equipo.fragment';
import { ConvocatoriaRequisitosIPFragment } from './convocatoria-formulario/convocatoria-requisitos-ip/convocatoria-requisitos-ip.fragment';
import { ConvocatoriaSeguimientoCientificoFragment } from './convocatoria-formulario/convocatoria-seguimiento-cientifico/convocatoria-seguimiento-cientifico.fragment';
import { CONVOCATORIA_ROUTE_PARAMS } from './convocatoria-route-params';

const MSG_REGISTRAR = marker('msg.csp.convocatoria.registrar');

export interface IConvocatoriaData {
  readonly: boolean;
}

@Injectable()
export class ConvocatoriaActionService extends ActionService implements OnDestroy {

  public readonly FRAGMENT = {
    DATOS_GENERALES: 'datos-generales',
    PERIODO_JUSTIFICACION: 'periodos-justificacion',
    FASES: 'fases',
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

  private readonly data: IConvocatoriaData;
  public readonly id: number;

  public readonly hasModeloEjecucion$: Subject<boolean> = new BehaviorSubject<boolean>(false);

  private modeloEjecucion: IModeloEjecucion;
  get modeloEjecucionId(): number {
    return this.modeloEjecucion?.id;
  }

  get duracion(): number {
    return this.datosGenerales.getValue().duracion;
  }

  get readonly(): boolean {
    return this.data?.readonly ?? false;
  }

  constructor(
    fb: FormBuilder,
    logger: NGXLogger,
    route: ActivatedRoute,
    private convocatoriaService: ConvocatoriaService,
    convocatoriaEnlaceService: ConvocatoriaEnlaceService,
    empresaService: EmpresaService,
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
    documentoRequeridoSolicitudService: DocumentoRequeridoSolicitudService,
    dialogService: DialogService,
  ) {
    super();
    this.id = Number(route.snapshot.paramMap.get(CONVOCATORIA_ROUTE_PARAMS.ID));
    this.dialogService = dialogService;
    if (this.id) {
      this.data = route.snapshot.data[CONVOCATORIA_DATA_KEY];
      this.enableEdit();
    }

    this.datosGenerales = new ConvocatoriaDatosGeneralesFragment(
      logger, this.id, convocatoriaService, empresaService,
      convocatoriaEntidadGestoraService, unidadGestionService, convocatoriaAreaTematicaService,
      this.readonly);
    this.periodoJustificacion = new ConvocatoriaPeriodosJustificacionFragment(
      this.id, convocatoriaService, convocatoriaPeriodoJustificacionService, this.readonly);
    this.entidadesConvocantes = new ConvocatoriaEntidadesConvocantesFragment(
      logger, this.id, convocatoriaService, convocatoriaEntidadConvocanteService,
      empresaService, this.readonly);
    this.plazosFases = new ConvocatoriaPlazosFasesFragment(
      this.id, convocatoriaService, convocatoriaFaseService, this.readonly);
    this.hitos = new ConvocatoriaHitosFragment(this.id, convocatoriaService,
      convocatoriaHitoService, this.readonly);
    this.documentos = new ConvocatoriaDocumentosFragment(logger, this.id, convocatoriaService,
      convocatoriaDocumentoService, this.readonly);
    this.seguimientoCientifico = new ConvocatoriaSeguimientoCientificoFragment(this.id,
      convocatoriaService, convocatoriaSeguimientoCientificoService, this.readonly);
    this.entidadesFinanciadoras = new ConvocatoriaEntidadesFinanciadorasFragment(
      this.id, convocatoriaService, convocatoriaEntidadFinanciadoraService, this.readonly);
    this.enlaces = new ConvocatoriaEnlaceFragment(this.id, convocatoriaService,
      convocatoriaEnlaceService, this.readonly);
    this.requisitosIP = new ConvocatoriaRequisitosIPFragment(fb, this.id,
      convocatoriaRequisitoIPService, this.readonly);
    this.elegibilidad = new ConvocatoriaConceptoGastoFragment(fb, this.id, convocatoriaService,
      convocatoriaConceptoGastoService, this.readonly);
    this.requisitosEquipo = new ConvocatoriaRequisitosEquipoFragment(fb, this.id,
      convocatoriaRequisitoEquipoService, this.readonly);
    this.configuracionSolicitudes = new ConvocatoriaConfiguracionSolicitudesFragment(
      logger, this.id, configuracionSolicitudService, documentoRequeridoSolicitudService,
      this.readonly);

    this.addFragment(this.FRAGMENT.DATOS_GENERALES, this.datosGenerales);
    this.addFragment(this.FRAGMENT.SEGUIMIENTO_CIENTIFICO, this.seguimientoCientifico);
    this.addFragment(this.FRAGMENT.ENTIDADES_CONVOCANTES, this.entidadesConvocantes);
    this.addFragment(this.FRAGMENT.ENTIDADES_FINANCIADORAS, this.entidadesFinanciadoras);
    this.addFragment(this.FRAGMENT.PERIODO_JUSTIFICACION, this.periodoJustificacion);
    this.addFragment(this.FRAGMENT.FASES, this.plazosFases);
    this.addFragment(this.FRAGMENT.HITOS, this.hitos);
    this.addFragment(this.FRAGMENT.DOCUMENTOS, this.documentos);
    this.addFragment(this.FRAGMENT.ENLACES, this.enlaces);
    this.addFragment(this.FRAGMENT.REQUISITOS_IP, this.requisitosIP);
    this.addFragment(this.FRAGMENT.ELEGIBILIDAD, this.elegibilidad);
    this.addFragment(this.FRAGMENT.REQUISITOS_EQUIPO, this.requisitosEquipo);
    this.addFragment(this.FRAGMENT.CONFIGURACION_SOLICITUDES, this.configuracionSolicitudes);

    if (this.isEdit()) {
      if (this.readonly) {
        this.datosGenerales.getFormGroup()?.disable();
        this.requisitosEquipo.getFormGroup()?.disable();
      }
    }

    this.subscriptions.push(this.configuracionSolicitudes.initialized$.subscribe(value => {
      if (value) {
        this.plazosFases.initialize();
      }
    }));
    this.subscriptions.push(this.plazosFases.initialized$.subscribe(value => {
      if (value) {
        this.configuracionSolicitudes.initialize();
      }
    }));
    this.subscriptions.push(this.plazosFases.plazosFase$.subscribe(fases => {
      this.configuracionSolicitudes.setFases(fases.map(fase => fase.value));
    }));
    this.subscriptions.push(this.datosGenerales.modeloEjecucion$.subscribe(
      (modeloEjecucion) => {
        this.modeloEjecucion = modeloEjecucion;
        this.hasModeloEjecucion$.next(Boolean(modeloEjecucion));
      }
    ));

    // Inicializamos los datos generales
    this.datosGenerales.initialize();
  }

  /**
   * Cuando se elimina una fase se actualizan los datos de la pestaña configuración solicitudes.
   */
  isDelete(convocatoriaFaseEliminada: IConvocatoriaFase): boolean {
    const fasePresentacionSolicitudes = this.configuracionSolicitudes.getValue()?.fasePresentacionSolicitudes;

    if (!fasePresentacionSolicitudes) {
      return true;
    }

    return !(convocatoriaFaseEliminada.tipoFase.id === fasePresentacionSolicitudes?.tipoFase?.id
      && convocatoriaFaseEliminada.fechaInicio.equals(fasePresentacionSolicitudes?.fechaInicio)
      && convocatoriaFaseEliminada.fechaFin.equals(fasePresentacionSolicitudes?.fechaFin)
      && convocatoriaFaseEliminada.observaciones === fasePresentacionSolicitudes?.observaciones);
  }

  saveOrUpdate(): Observable<void> {
    this.performChecks(true);
    if (this.hasErrors()) {
      return throwError('Errores');
    }
    if (this.isEdit()) {
      let cascade = of(void 0);
      if (this.datosGenerales.hasChanges()) {
        cascade = cascade.pipe(
          switchMap(() => this.datosGenerales.saveOrUpdate().pipe(tap(() => this.datosGenerales.refreshInitialState(true))))
        );
      }
      if (this.plazosFases.hasChanges()) {
        cascade = cascade.pipe(
          switchMap(() => this.plazosFases.saveOrUpdate().pipe(tap(() => this.plazosFases.refreshInitialState(true))))
        );
      }
      return cascade.pipe(
        switchMap(() => super.saveOrUpdate())
      );
    } else {
      let cascade = of(void 0);
      if (this.datosGenerales.hasChanges()) {
        cascade = cascade.pipe(
          switchMap(() => this.datosGenerales.saveOrUpdate().pipe(
            tap((key) => {
              this.datosGenerales.refreshInitialState(true);
              if (typeof key === 'string' || typeof key === 'number') {
                this.onKeyChange(key);
              }
            })
          ))
        );
      }
      if (this.plazosFases.hasChanges()) {
        cascade = cascade.pipe(
          switchMap(() => this.plazosFases.saveOrUpdate().pipe(tap(() => this.plazosFases.refreshInitialState(true))))
        );
      }
      return cascade.pipe(
        switchMap(() => super.saveOrUpdate())
      );
    }
  }

  /**
   * Acción de registro de una convocatoria
   */
  registrar(): Observable<void> {
    return this.dialogService.showConfirmation(MSG_REGISTRAR).pipe(
      switchMap((accept) => {
        if (accept) {
          return this.convocatoriaService.registrar(this.id);
        } else {
          return of(void 0);
        }
      })
    );
  }
}
