import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormularioSolicitud } from '@core/enums/formulario-solicitud';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { Estado } from '@core/models/csp/estado-solicitud';
import { ISolicitud } from '@core/models/csp/solicitud';
import { IPersona } from '@core/models/sgp/persona';
import { ActionService } from '@core/services/action-service';
import { ConfiguracionSolicitudService } from '@core/services/csp/configuracion-solicitud.service';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { SolicitudDocumentoService } from '@core/services/csp/solicitud-documento.service';
import { SolicitudHitoService } from '@core/services/csp/solicitud-hito.service';
import { SolicitudModalidadService } from '@core/services/csp/solicitud-modalidad.service';
import { SolicitudProyectoEntidadFinanciadoraAjenaService } from '@core/services/csp/solicitud-proyecto-entidad-financiadora-ajena.service';
import { SolicitudProyectoEquipoService } from '@core/services/csp/solicitud-proyecto-equipo.service';
import { SolicitudProyectoPresupuestoService } from '@core/services/csp/solicitud-proyecto-presupuesto.service';
import { SolicitudProyectoSocioService } from '@core/services/csp/solicitud-proyecto-socio.service';
import { SolicitudProyectoService } from '@core/services/csp/solicitud-proyecto.service';
import { SolicitudService } from '@core/services/csp/solicitud.service';
import { UnidadGestionService } from '@core/services/csp/unidad-gestion.service';
import { EmpresaService } from '@core/services/sgemp/empresa.service';
import { PersonaService } from '@core/services/sgp/persona.service';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { SOLICITUD_DATA_KEY } from './solicitud-data.resolver';
import { SolicitudDatosGeneralesFragment } from './solicitud-formulario/solicitud-datos-generales/solicitud-datos-generales.fragment';
import { SolicitudDocumentosFragment } from './solicitud-formulario/solicitud-documentos/solicitud-documentos.fragment';
import { SolicitudEquipoProyectoFragment } from './solicitud-formulario/solicitud-equipo-proyecto/solicitud-equipo-proyecto.fragment';
import { SolicitudHistoricoEstadosFragment } from './solicitud-formulario/solicitud-historico-estados/solicitud-historico-estados.fragment';
import { SolicitudHitosFragment } from './solicitud-formulario/solicitud-hitos/solicitud-hitos.fragment';
import { SolicitudProyectoEntidadesFinanciadorasFragment } from './solicitud-formulario/solicitud-proyecto-entidades-financiadoras/solicitud-proyecto-entidades-financiadoras.fragment';
import { SolicitudProyectoFichaGeneralFragment } from './solicitud-formulario/solicitud-proyecto-ficha-general/solicitud-proyecto-ficha-general.fragment';
import { SolicitudProyectoPresupuestoEntidadesFragment } from './solicitud-formulario/solicitud-proyecto-presupuesto-entidades/solicitud-proyecto-presupuesto-entidades.fragment';
import { SolicitudProyectoPresupuestoGlobalFragment } from './solicitud-formulario/solicitud-proyecto-presupuesto-global/solicitud-proyecto-presupuesto-global.fragment';
import { SolicitudProyectoSocioFragment } from './solicitud-formulario/solicitud-proyecto-socio/solicitud-proyecto-socio.fragment';

export interface ISolicitudData {
  readonly: boolean;
  solicitud: ISolicitud;
  hasSolicitudProyecto: boolean;
}

@Injectable()
export class SolicitudActionService extends ActionService {

  public readonly FRAGMENT = {
    DATOS_GENERALES: 'datosGenerales',
    HISTORICO_ESTADOS: 'historicoEstados',
    DOCUMENTOS: 'documentos',
    PROYECTO_DATOS: 'proyectoDatos',
    HITOS: 'hitos',
    EQUIPO_PROYECTO: 'equipoProyecto',
    SOCIOS: 'socios',
    ENTIDADES_FINANCIADORAS: 'entidadesFinanciadoras',
    DESGLOSE_PRESUPUESTO_GLOBAL: 'desglosePresupuestoGlobal',
    DESGLOSE_PRESUPUESTO_ENTIDADES: 'desglosePresupuestoEntidades'
  };

  private datosGenerales: SolicitudDatosGeneralesFragment;
  private historicoEstado: SolicitudHistoricoEstadosFragment;
  private documentos: SolicitudDocumentosFragment;
  private proyectoDatos: SolicitudProyectoFichaGeneralFragment;
  private hitos: SolicitudHitosFragment;
  private equipoProyecto: SolicitudEquipoProyectoFragment;
  private socio: SolicitudProyectoSocioFragment;
  private entidadesFinanciadoras: SolicitudProyectoEntidadesFinanciadorasFragment;
  private desglosePresupuestoGlobal: SolicitudProyectoPresupuestoGlobalFragment;
  private desglosePresupuestoEntidades: SolicitudProyectoPresupuestoEntidadesFragment;

  readonly showSocios$: Subject<boolean> = new BehaviorSubject(false);
  readonly showHitos$: Subject<boolean> = new BehaviorSubject<boolean>(false);
  readonly showDesglosePresupuestoGlobal$: Subject<boolean> = new BehaviorSubject<boolean>(false);
  readonly showDesglosePresupuestoEntidad$: Subject<boolean> = new BehaviorSubject<boolean>(false);
  readonly datosProyectoComplete$: Subject<boolean> = new BehaviorSubject<boolean>(false);
  readonly isPresentable$: Subject<boolean> = new BehaviorSubject<boolean>(false);

  private readonly data: ISolicitudData;
  private convocatoria: IConvocatoria;

  get formularioSolicitud(): FormularioSolicitud {
    return this.datosGenerales.getValue().formularioSolicitud;
  }

  get duracionProyecto(): number {
    return this.proyectoDatos.getValue().duracion;
  }

  get estado(): Estado {
    return this.datosGenerales.getValue().estado?.estado;
  }

  get convocatoriaId(): number {
    return this.convocatoria?.id;
  }

  get modeloEjecucionId(): number {
    return this.convocatoria?.modeloEjecucion?.id;
  }

  get solicitante(): IPersona {
    return this.datosGenerales.getValue().solicitante;
  }

  get readonly(): boolean {
    return this.data?.readonly ?? false;
  }

  constructor(
    logger: NGXLogger,
    route: ActivatedRoute,
    private solicitudService: SolicitudService,
    configuracionSolicitudService: ConfiguracionSolicitudService,
    convocatoriaService: ConvocatoriaService,
    empresaService: EmpresaService,
    personaService: PersonaService,
    solicitudModalidadService: SolicitudModalidadService,
    solicitudHitoService: SolicitudHitoService,
    unidadGestionService: UnidadGestionService,
    solicitudDocumentoService: SolicitudDocumentoService,
    solicitudProyectoService: SolicitudProyectoService,
    solicitudProyectoEquipoService: SolicitudProyectoEquipoService,
    solicitudProyectoSocioService: SolicitudProyectoSocioService,
    solicitudEntidadFinanciadoraService: SolicitudProyectoEntidadFinanciadoraAjenaService,
    solicitudProyectoPresupuestoService: SolicitudProyectoPresupuestoService
  ) {
    super();

    if (route.snapshot.data[SOLICITUD_DATA_KEY]) {
      this.data = route.snapshot.data[SOLICITUD_DATA_KEY];
      this.enableEdit();
      this.datosProyectoComplete$.next(this.data.hasSolicitudProyecto);
    }

    this.datosGenerales = new SolicitudDatosGeneralesFragment(
      logger,
      this.data?.solicitud?.id,
      solicitudService,
      configuracionSolicitudService,
      convocatoriaService,
      empresaService,
      personaService,
      solicitudModalidadService,
      unidadGestionService,
      this.readonly
    );
    this.documentos = new SolicitudDocumentosFragment(logger, this.data?.solicitud?.id, this.data?.solicitud?.convocatoriaId,
      configuracionSolicitudService, solicitudService, solicitudDocumentoService, this.readonly);
    this.hitos = new SolicitudHitosFragment(this.data?.solicitud?.id, solicitudHitoService, solicitudService, this.readonly);

    this.historicoEstado = new SolicitudHistoricoEstadosFragment(this.data?.solicitud?.id, solicitudService, this.readonly);
    this.proyectoDatos = new SolicitudProyectoFichaGeneralFragment(logger, this.data?.solicitud?.id, solicitudService,
      solicitudProyectoService, convocatoriaService, this.readonly, this.data?.solicitud.convocatoriaId);
    this.equipoProyecto = new SolicitudEquipoProyectoFragment(this.data?.solicitud?.id, solicitudService,
      solicitudProyectoEquipoService, this.readonly);
    this.socio = new SolicitudProyectoSocioFragment(this.data?.solicitud?.id, solicitudService,
      solicitudProyectoSocioService, empresaService, this.readonly);
    this.entidadesFinanciadoras = new SolicitudProyectoEntidadesFinanciadorasFragment(this.data?.solicitud?.id, solicitudService,
      solicitudEntidadFinanciadoraService, empresaService, this.readonly);
    this.desglosePresupuestoGlobal = new SolicitudProyectoPresupuestoGlobalFragment(this.data?.solicitud?.id, solicitudService,
      solicitudProyectoPresupuestoService, empresaService, this.readonly);
    this.desglosePresupuestoEntidades = new SolicitudProyectoPresupuestoEntidadesFragment(this.data?.solicitud?.id,
      this.data?.solicitud?.convocatoriaId, convocatoriaService, solicitudService, empresaService, this.readonly);

    this.addFragment(this.FRAGMENT.DATOS_GENERALES, this.datosGenerales);
    if (this.isEdit()) {
      this.addFragment(this.FRAGMENT.HITOS, this.hitos);
      this.addFragment(this.FRAGMENT.HISTORICO_ESTADOS, this.historicoEstado);
      this.addFragment(this.FRAGMENT.DOCUMENTOS, this.documentos);

      if (this.data.solicitud.formularioSolicitud === FormularioSolicitud.ESTANDAR) {
        this.addFragment(this.FRAGMENT.PROYECTO_DATOS, this.proyectoDatos);
        this.addFragment(this.FRAGMENT.EQUIPO_PROYECTO, this.equipoProyecto);
        this.addFragment(this.FRAGMENT.SOCIOS, this.socio);
        this.addFragment(this.FRAGMENT.ENTIDADES_FINANCIADORAS, this.entidadesFinanciadoras);
        this.addFragment(this.FRAGMENT.DESGLOSE_PRESUPUESTO_GLOBAL, this.desglosePresupuestoGlobal);
        this.addFragment(this.FRAGMENT.DESGLOSE_PRESUPUESTO_ENTIDADES, this.desglosePresupuestoEntidades);
      }

      // Si se encuentra en estado borrador se debe comprobar si cumple las validacones para  hacer el cambio a "Presentada".
      if (this.data.solicitud.estado.estado === Estado.BORRADOR) {
        this.presentable(this.data.solicitud.id).subscribe(
          (isPrentable) => {
            this.isPresentable$.next(isPrentable);
          }
        );
      }

      this.subscriptions.push(this.datosGenerales.convocatoria$.subscribe(
        (value) => {
          this.convocatoria = value;
        }
      ));

      if (this.data.solicitud.formularioSolicitud === FormularioSolicitud.ESTANDAR) {
        this.subscriptions.push(
          solicitudService.hasConvocatoriaSGI(this.data.solicitud.id).subscribe((hasConvocatoriaSgi) => {
            if (hasConvocatoriaSgi) {
              this.showHitos$.next(true);
            }
          })
        );

        this.subscriptions.push(this.proyectoDatos.colaborativo$.subscribe(
          (value) => {
            this.showSocios$.next(value);
          }
        ));

        this.subscriptions.push(this.proyectoDatos.presupuestoPorEntidades$.subscribe(
          (value) => {
            this.showDesglosePresupuestoEntidad$.next(value);
            this.showDesglosePresupuestoGlobal$.next(!value);
          }
        ));

        this.subscriptions.push(this.desglosePresupuestoGlobal.partidasGastos$.subscribe((value) => {
          const rowTableData = value.length > 0;
          this.proyectoDatos.disablePresupuestoPorEntidades(rowTableData);
        }));

        this.subscriptions.push(this.socio.proyectoSocios$.subscribe((value) => {
          const rowTableData = value.length > 0;
          this.proyectoDatos.disableSocioColaborador(rowTableData);
        }));

        this.subscriptions.push(this.proyectoDatos.status$.subscribe(
          (status) => {
            if (this.proyectoDatos.isInitialized() && !Boolean(this.proyectoDatos.getValue()?.id)) {
              if (status.changes && status.errors) {
                this.datosProyectoComplete$.next(false);
              }
              else if (status.changes && !status.errors) {
                this.datosProyectoComplete$.next(true);
              }
            }
          }
        ));
      }

      // Forzamos la inicialización de los datos principales
      this.datosGenerales.initialize();

      if (this.data.solicitud.formularioSolicitud === FormularioSolicitud.ESTANDAR) {
        this.proyectoDatos.initialize();
      }
    }
  }

  /**
   * Cambio de estado a **Presentada** desde:
   * - **Borrador**
   */
  presentar(): Observable<void> {
    return this.solicitudService.presentar(this.datosGenerales.getKey() as number);
  }

  presentable(id: number): Observable<boolean> {
    return this.solicitudService.presentable(id);
  }

  /**
   * Cambio de estado a **Admitida provisionalmente** desde:
   * - **Presentada**
   */
  admitirProvisionalmente(): Observable<void> {
    return this.solicitudService.admitirProvisionalmente(this.datosGenerales.getKey() as number);
  }

  /**
   * Cambio de estado a **Admitida definitivamente** desde:
   * - **Admitida provisionalmente**
   */
  admitirDefinitivamente(): Observable<void> {
    return this.solicitudService.admitirDefinitivamente(this.datosGenerales.getKey() as number);
  }

  /**
   * Cambio de estado a **Concedida provisional** desde:
   * - **Admitida definitivamente**
   */
  concederProvisionalmente(): Observable<void> {
    return this.solicitudService.concederProvisionalmente(this.datosGenerales.getKey() as number);
  }

  /**
   * Cambio de estado a **Concedida** desde:
   * - **Concedida provisional**
   * - **Alegada concesión**
   */
  conceder(): Observable<void> {
    return this.solicitudService.conceder(this.datosGenerales.getKey() as number);
  }

  /**
   * Cambio de estado a **Excluida provisional** desde:
   * - **Presentada**
   * @param comentario Comentario del cambio de estado.
   */
  excluirProvisionalmente(comentario: string): Observable<void> {
    return this.solicitudService.excluirProvisionalmente(this.datosGenerales.getKey() as number, comentario);
  }

  /**
   * Cambio de estado a **Alegada admisión** desde:
   * - **Excluida provisional**
   * @param comentario Comentario del cambio de estado.
   */
  alegarAdmision(comentario: string): Observable<void> {
    return this.solicitudService.alegarAdmision(this.datosGenerales.getKey() as number, comentario);
  }

  /**
   * Cambio de estado a **Excluida** desde:
   * - **Alegada admisión**
   * @param comentario Comentario del cambio de estado.
   */
  excluir(comentario: string): Observable<void> {
    return this.solicitudService.excluir(this.datosGenerales.getKey() as number, comentario);
  }

  /**
   * Cambio de estado a **Denegada provisional** desde:
   * - **Admitida definitiva**
   * @param comentario Comentario del cambio de estado.
   */
  denegarProvisionalmente(comentario: string): Observable<void> {
    return this.solicitudService.denegarProvisionalmente(this.datosGenerales.getKey() as number, comentario);
  }

  /**
   * Cambio de estado a **Alegada concesión** desde:
   * * **Denegada provisional**
   * @param comentario Comentario del cambio de estado.
   */
  alegarConcesion(comentario: string): Observable<void> {
    return this.solicitudService.alegarConcesion(this.datosGenerales.getKey() as number, comentario);
  }

  /**
   * Cambio de estado a **Denegada** desde:
   * * **Alegada concesión**
   * @param comentario Comentario del cambio de estado.
   */
  denegar(comentario: string): Observable<void> {
    return this.solicitudService.denegar(this.datosGenerales.getKey() as number, comentario);
  }

  /**
   * Cambio de estado a **Desistida** desde:
   * - **Presentada**
   * - **Admitida provisional**
   * - **Excluida provisional**
   * - **Admitida definitiva**
   * - **Denegada provisional**
   * - **Concedida provisional**
   * @param comentario Comentario del cambio de estado.
   */
  desistir(comentario: string): Observable<void> {
    return this.solicitudService.desistir(this.datosGenerales.getKey() as number, comentario);
  }
}
