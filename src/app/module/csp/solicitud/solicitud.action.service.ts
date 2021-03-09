import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ISolicitud } from '@core/models/csp/solicitud';
import { ActionService } from '@core/services/action-service';
import { ConfiguracionSolicitudService } from '@core/services/csp/configuracion-solicitud.service';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { SolicitudDocumentoService } from '@core/services/csp/solicitud-documento.service';
import { SolicitudHitoService } from '@core/services/csp/solicitud-hito.service';
import { SolicitudModalidadService } from '@core/services/csp/solicitud-modalidad.service';
import { SolicitudProyectoDatosService } from '@core/services/csp/solicitud-proyecto-datos.service';
import { SolicitudProyectoEntidadFinanciadoraAjenaService } from '@core/services/csp/solicitud-proyecto-entidad-financiadora-ajena.service';
import { SolicitudProyectoEquipoService } from '@core/services/csp/solicitud-proyecto-equipo.service';
import { SolicitudProyectoPresupuestoService } from '@core/services/csp/solicitud-proyecto-presupuesto.service';
import { SolicitudProyectoSocioService } from '@core/services/csp/solicitud-proyecto-socio.service';
import { SolicitudService } from '@core/services/csp/solicitud.service';
import { UnidadGestionService } from '@core/services/csp/unidad-gestion.service';
import { EmpresaEconomicaService } from '@core/services/sgp/empresa-economica.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { SgiAuthService } from '@sgi/framework/auth';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SolicitudDatosGeneralesFragment } from './solicitud-formulario/solicitud-datos-generales/solicitud-datos-generales.fragment';
import { SolicitudDocumentosFragment } from './solicitud-formulario/solicitud-documentos/solicitud-documentos.fragment';
import { SolicitudEquipoProyectoFragment } from './solicitud-formulario/solicitud-equipo-proyecto/solicitud-equipo-proyecto.fragment';
import { SolicitudHistoricoEstadosFragment } from './solicitud-formulario/solicitud-historico-estados/solicitud-historico-estados.fragment';
import { SolicitudHitosFragment } from './solicitud-formulario/solicitud-hitos/solicitud-hitos.fragment';
import { SolicitudProyectoEntidadesFinanciadorasFragment } from './solicitud-formulario/solicitud-proyecto-entidades-financiadoras/solicitud-proyecto-entidades-financiadoras.fragment';
import { SolicitudProyectoFichaGeneralFragment } from './solicitud-formulario/solicitud-proyecto-ficha-general/solicitud-proyecto-ficha-general.fragment';
import { SolicitudProyectoPresupuestoGlobalFragment } from './solicitud-formulario/solicitud-proyecto-presupuesto-global/solicitud-proyecto-presupuesto-global.fragment';
import { SolicitudSociosColaboradoresFragment } from './solicitud-formulario/solicitud-socios-colaboradores/solicitud-socios-colaboradores.fragment';
import { SolicitudProyectoPresupuestoEntidadesFragment } from './solicitud-formulario/solicitud-proyecto-presupuesto-entidades/solicitud-proyecto-presupuesto-entidades.fragment';
import { Estado } from '@core/models/csp/estado-solicitud';


@Injectable()
export class SolicitudActionService extends ActionService {


  public readonly FRAGMENT = {
    DATOS_GENERALES: 'datosGenerales',
    HISTORICO_ESTADOS: 'historicoEstados',
    DOCUMENTOS: 'documentos',
    PROYECTO_DATOS: 'proyectoDatos',
    HITOS: 'hitos',
    EQUIPO_PROYECTO: 'equipoProyecto',
    SOCIOS_COLABORADORES: 'sociosColaboradores',
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
  private socioColaboradores: SolicitudSociosColaboradoresFragment;
  private entidadesFinanciadoras: SolicitudProyectoEntidadesFinanciadorasFragment;
  private desglosePresupuestoGlobal: SolicitudProyectoPresupuestoGlobalFragment;
  private desglosePresupuestoEntidades: SolicitudProyectoPresupuestoEntidadesFragment;

  solicitud: ISolicitud;
  readonly = false;

  showHitos$ = new BehaviorSubject<boolean>(false);
  isPresupuestoPorEntidades$ = new BehaviorSubject<boolean>(false);

  isPresentable$: BehaviorSubject<Boolean> = new BehaviorSubject<Boolean>(false);;
  private coordinadorExternoValue = false;

  get coordinadorExterno(): boolean {
    return this.coordinadorExternoValue;
  }

  constructor(
    private readonly logger: NGXLogger,
    route: ActivatedRoute,
    private solicitudService: SolicitudService,
    configuracionSolicitudService: ConfiguracionSolicitudService,
    convocatoriaService: ConvocatoriaService,
    empresaEconomicaService: EmpresaEconomicaService,
    personaFisicaService: PersonaFisicaService,
    solicitudModalidadService: SolicitudModalidadService,
    solicitudHitoService: SolicitudHitoService,
    unidadGestionService: UnidadGestionService,
    sgiAuthService: SgiAuthService,
    solicitudDocumentoService: SolicitudDocumentoService,
    solicitudProyectoDatosService: SolicitudProyectoDatosService,
    solicitudProyectoEquipoService: SolicitudProyectoEquipoService,
    solicitudProyectoSocioService: SolicitudProyectoSocioService,
    solicitudEntidadFinanciadoraService: SolicitudProyectoEntidadFinanciadoraAjenaService,
    solicitudProyectoPresupuestoService: SolicitudProyectoPresupuestoService
  ) {
    super();
    this.solicitud = {
      solicitante: undefined
    } as ISolicitud;
    if (route.snapshot.data.solicitud) {
      this.solicitud = route.snapshot.data.solicitud;
      this.enableEdit();
    }

    this.datosGenerales = new SolicitudDatosGeneralesFragment(logger, this.solicitud?.id, solicitudService, configuracionSolicitudService,
      convocatoriaService, empresaEconomicaService, personaFisicaService, solicitudModalidadService, unidadGestionService, sgiAuthService, this.readonly);
    this.documentos = new SolicitudDocumentosFragment(logger, this.solicitud?.id, this.solicitud?.convocatoria?.id,
      configuracionSolicitudService, solicitudService, solicitudDocumentoService, this.readonly);
    this.hitos = new SolicitudHitosFragment(this.solicitud?.id, solicitudHitoService, solicitudService, this.readonly);

    if (this.solicitud?.id) {
      this.subscriptions.push(
        solicitudService.hasConvocatoriaSGI(this.solicitud.id).subscribe((hasConvocatoriaSgi) => {
          if (hasConvocatoriaSgi) {
            this.showHitos$.next(true);
          }
        })
      );
      this.subscriptions.push(
        solicitudService.findSolicitudProyectoDatos(this.solicitud.id).subscribe((proyectoDatos) => {
          if (proyectoDatos) {
            this.proyectoDatos.coordinadorExterno$.next(Boolean(proyectoDatos.coordinadorExterno));
          }
        })
      );
    }

    this.historicoEstado = new SolicitudHistoricoEstadosFragment(this.solicitud?.id, solicitudService, this.readonly);
    this.proyectoDatos = new SolicitudProyectoFichaGeneralFragment(logger, this.solicitud, solicitudService,
      solicitudProyectoDatosService, convocatoriaService, this, this.readonly);
    this.subscriptions.push(this.proyectoDatos.coordinadorExterno$.subscribe((value) => this.coordinadorExternoValue = Boolean(value)));
    this.equipoProyecto = new SolicitudEquipoProyectoFragment(this.solicitud?.id, solicitudService,
      solicitudProyectoEquipoService, this.readonly);
    this.socioColaboradores = new SolicitudSociosColaboradoresFragment(this.solicitud?.id, solicitudService,
      solicitudProyectoSocioService, empresaEconomicaService, this.readonly);
    this.entidadesFinanciadoras = new SolicitudProyectoEntidadesFinanciadorasFragment(this.solicitud?.id, solicitudService,
      solicitudEntidadFinanciadoraService, empresaEconomicaService, this.readonly);
    this.desglosePresupuestoGlobal = new SolicitudProyectoPresupuestoGlobalFragment(this.solicitud?.id, solicitudService,
      solicitudProyectoPresupuestoService, empresaEconomicaService, this.readonly);
    this.desglosePresupuestoEntidades = new SolicitudProyectoPresupuestoEntidadesFragment(logger, this.solicitud?.id,
      this.getDatosGeneralesSolicitud().convocatoria?.id, convocatoriaService, solicitudService, empresaEconomicaService, this.readonly);

    this.addFragment(this.FRAGMENT.DATOS_GENERALES, this.datosGenerales);
    this.addFragment(this.FRAGMENT.HITOS, this.hitos);
    this.addFragment(this.FRAGMENT.HISTORICO_ESTADOS, this.historicoEstado);
    this.addFragment(this.FRAGMENT.DOCUMENTOS, this.documentos);
    this.addFragment(this.FRAGMENT.PROYECTO_DATOS, this.proyectoDatos);
    this.addFragment(this.FRAGMENT.EQUIPO_PROYECTO, this.equipoProyecto);
    this.addFragment(this.FRAGMENT.SOCIOS_COLABORADORES, this.socioColaboradores);
    this.addFragment(this.FRAGMENT.ENTIDADES_FINANCIADORAS, this.entidadesFinanciadoras);
    this.addFragment(this.FRAGMENT.DESGLOSE_PRESUPUESTO_GLOBAL, this.desglosePresupuestoGlobal);
    this.addFragment(this.FRAGMENT.DESGLOSE_PRESUPUESTO_ENTIDADES, this.desglosePresupuestoEntidades);

    if (this.isEdit()) {
      const subscription = this.solicitudService.modificable(this.solicitud?.id).subscribe(
        (value) => {
          this.readonly = !value;
          if (this.readonly) {
            this.datosGenerales.getFormGroup()?.disable();
          }
          this.datosGenerales.readonly = this.readonly;
          this.hitos.readonly = this.readonly;
          this.historicoEstado.readonly = this.readonly;
          this.documentos.readonly = this.readonly;
          this.proyectoDatos.readonly = this.readonly;
          this.equipoProyecto.readonly = this.readonly;
          this.socioColaboradores.readonly = this.readonly;
          this.entidadesFinanciadoras.readonly = this.readonly;
          this.desglosePresupuestoGlobal.readonly = this.readonly;
          this.desglosePresupuestoEntidades.readonly = this.readonly;
        });
      this.subscriptions.push(subscription);

      // Si se encuentra en estado borrador se debe comprobar si cumple las validacones para  hacer el cambio a "Presentada".
      if (this.solicitud.estado.estado === Estado.BORRADOR) {
        this.presentable(this.solicitud.id).subscribe(
          (isPrentable) => {
            this.isPresentable$.next(isPrentable);
          }
        );
      }
    }

    this.checkSociosColaboradores();

    if (this.solicitud?.id) {
      this.checkPresupuestoPorEntidades();
    }

  }

  /**
   * Suscripción cambios en pestaña Desglose prespuesto entidades
   */
  hasDesglosePresupuestoEntidades(): void {
    this.subscriptions.push(this.desglosePresupuestoEntidades?.entidadesFinanciadoras$.subscribe((value) => {
      const rowTableData = value.length > 0;
      this.proyectoDatos.disablePresupuestoGlobalEntidad(rowTableData);
    }));
  }

  /**
   * Suscripción cambios en pestaña Desglose prespuesto
   */
  hasDesglosePresupuesto(): void {
    this.subscriptions.push(this.desglosePresupuestoGlobal?.partidasGastos$.subscribe((value) => {
      const rowTableData = value.length > 0;
      this.proyectoDatos.disablePresupuestoGlobal(rowTableData);
    }));
  }

  /**
   * Suscripción cambios en pestaña Socio colaborador
   */
  hasSocioColaborador(): void {
    this.subscriptions.push(this.socioColaboradores?.proyectoSocios$.subscribe((value) => {
      const rowTableData = value.length > 0;
      this.proyectoDatos.disableSocioColaborador(rowTableData);
    }));
  }

  getDatosGeneralesSolicitud(): ISolicitud {
    return this.datosGenerales.isInitialized() ? this.datosGenerales.solicitud : this.solicitud;
  }

  getSolicitantePersonaRef(): string {
    return this.datosGenerales.isInitialized() ? this.datosGenerales.getFormGroup().get('solicitante').value?.personaRef :
      this.solicitud.solicitante?.personaRef;
  }

  existsDatosProyectos(): void {
    let existsDatosProyecto$: Observable<boolean>;
    if (this.proyectoDatos.isInitialized()) {
      const existsDatosProyecto = Boolean(this.proyectoDatos.solicitudProyectoDatos.id) ||
        !this.proyectoDatos.hasErrors();
      existsDatosProyecto$ = of(existsDatosProyecto);
    } else if (this.solicitud?.id) {
      existsDatosProyecto$ = this.solicitudService.existsSolictudProyectoDatos(this.solicitud?.id);
    } else {
      existsDatosProyecto$ = of(false);
    }

    const subscription = existsDatosProyecto$.subscribe(
      exists => {
        this.equipoProyecto.existsDatosProyecto = exists;
        this.entidadesFinanciadoras.existsDatosProyecto = exists;
        this.desglosePresupuestoGlobal.existsDatosProyecto = exists;
        this.desglosePresupuestoEntidades.existsDatosProyecto = exists;
      },
      () => {
        this.equipoProyecto.existsDatosProyecto = false;
        this.entidadesFinanciadoras.existsDatosProyecto = false;
        this.desglosePresupuestoGlobal.existsDatosProyecto = false;
        this.desglosePresupuestoEntidades.existsDatosProyecto = false;
      }
    );
    this.subscriptions.push(subscription);
  }

  saveOrUpdate(): Observable<void> {
    this.performChecks(true);
    if (this.hasErrors()) {
      return throwError('Errores');
    }
    if (this.isEdit() && this.proyectoDatos.isInitialized() && this.proyectoDatos.hasChanges()) {
      return this.proyectoDatos.saveOrUpdate().pipe(
        switchMap(() => {
          this.proyectoDatos.refreshInitialState(true);
          return super.saveOrUpdate();
        })
      );
    } else {
      return super.saveOrUpdate();
    }
  }


  /**
  * Cambio de estado de "Borrador" a "Presentada ".
  */
  presentar(): Observable<void> {

    return this.solicitudService.presentar(this.datosGenerales.getKey() as number);
  }


  presentable(id: number): Observable<Boolean> {
    return this.solicitudService.presentable(id);

  }

  /**
  * Cambio de estado de "Presentada" a "Admitida provisionalmente".
  */
  admitirProvisionalmente(): Observable<void> {

    return this.solicitudService.admitirProvisionalmente(this.datosGenerales.getKey() as number);
  }

  /**
  * Cambio de estado de "Admitida provisionalmente" a "Admitida definitivamente".
  */
  admitirDefinitivamente(): Observable<void> {

    return this.solicitudService.admitirDefinitivamente(this.datosGenerales.getKey() as number);
  }


  /**
   * Cambio de estado de "Admitida definitivamente" a "Concedida provisional".
   */
  concederProvisionalmente(): Observable<void> {

    return this.solicitudService.concederProvisionalmente(this.datosGenerales.getKey() as number);
  }

  /**
  * Cambio de estado de "Concedida provisional" o "Alegada concesión" a "Concedida".
  */
  conceder(): Observable<void> {

    return this.solicitudService.conceder(this.datosGenerales.getKey() as number);
  }

  /**
  * Cambio de estado de "Presentada"  a "Excluida provisional".
  * @param comentario Comentario del cambio de estado.
  */
  excluirProvisionalmente(comentario: string): Observable<void> {

    return this.solicitudService.excluirProvisionalmente(this.datosGenerales.getKey() as number, comentario);
  }


  /**
  * Cambio de estado de "Excluida provisional"  a "Alegada admisión".
  * @param comentario Comentario del cambio de estado.
  */
  alegarAdmision(comentario: string): Observable<void> {

    return this.solicitudService.alegarAdmision(this.datosGenerales.getKey() as number, comentario);
  }


  /**
  * Cambio de estado de "Alegada admisión"  a "Excluida".
  * @param comentario Comentario del cambio de estado.
  */
  excluir(comentario: string): Observable<void> {

    return this.solicitudService.excluir(this.datosGenerales.getKey() as number, comentario);
  }


  /**
  * Cambio de estado de "Admitida definitiva"  a "Denegada provisional".
  * @param comentario Comentario del cambio de estado.
  */
  denegarProvisionalmente(comentario: string): Observable<void> {

    return this.solicitudService.denegarProvisionalmente(this.datosGenerales.getKey() as number, comentario);
  }


  /**
  * Cambio de estado de "Denegada provisional"  a "Alegada concesión".
  * @param comentario Comentario del cambio de estado.
  */
  alegarConcesion(comentario: string): Observable<void> {

    return this.solicitudService.alegarConcesion(this.datosGenerales.getKey() as number, comentario);
  }

  /**
  * Cambio de estado de "Alegada concesión"  a "Denegada".
  * @param comentario Comentario del cambio de estado.
  */
  denegar(comentario: string): Observable<void> {

    return this.solicitudService.denegar(this.datosGenerales.getKey() as number, comentario);
  }

  /**
  * Cambio de estado de "Presentada", "Admitida provisional", 
  * "Excluida provisional", "Admitida definitiva",
  *  "Denegada provisional" o "Concedida provisional"  
  * a "Desistida".
  * @param comentario Comentario del cambio de estado.
  */
  desistir(comentario: string): Observable<void> {

    return this.solicitudService.desistir(this.datosGenerales.getKey() as number, comentario);
  }


  /**
   * Indica si se puede mostrar la pestaña SociosColaboradores
   */
  get isSociosColaboradores(): boolean {
    return this.socioColaboradores.isSociosColaboradores;
  }

  /**
   * Modifica la visibilidad de la pestaña SociosColaboradores
   *
   * @param value Valor boolean
   */
  set sociosColaboradores(value: boolean) {
    this.socioColaboradores.isSociosColaboradores = value;
  }

  /**
   * Habilita la edición de socios colaboradores
   *
   * @param value Valor boolean
   */
  set enableAddSocioColaborador(value: boolean) {
    this.socioColaboradores.enableAddSocioColaborador = value;
  }

  /**
   * Hace la comprobación de mostrar la pestaña SociosColaboradores en el back
   * si no esta inicializada la pestaña ProyectoDatos
   */
  checkSociosColaboradores(): void {
    const id = this.solicitud?.id;
    if (!this.proyectoDatos.isInitialized() && id) {
      const subscription = this.solicitudService.findSolicitudProyectoDatos(id).subscribe(
        (proyectoDatos) => {
          this.sociosColaboradores = proyectoDatos ? proyectoDatos.colaborativo : false;
          this.enableAddSocioColaborador = proyectoDatos ? proyectoDatos.colaborativo : false;
        },
        (error) => {
          this.logger.error(error);
          this.sociosColaboradores = false;
          this.enableAddSocioColaborador = false;
        }
      );
      this.subscriptions.push(subscription);
    }
  }

  checkPresupuestoPorEntidades(): void {
    const subscription = this.solicitudService.hasPresupuestoPorEntidades(this.solicitud.id).subscribe((result) => {
      this.isPresupuestoPorEntidades$.next(result);
    });

    this.subscriptions.push(subscription);
  }

  /**
   * Indica si el presupuesto es por entidades
   */
  set isPresupuestoPorEntidades(isPresupuestoPorEntidades: boolean) {
    this.isPresupuestoPorEntidades$.next(isPresupuestoPorEntidades);
  }

}
