import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IProyecto } from '@core/models/csp/proyecto';
import { ActionService } from '@core/services/action-service';
import { ContextoProyectoService } from '@core/services/csp/contexto-proyecto.service';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { ProyectoDocumentoService } from '@core/services/csp/proyecto-documento.service';
import { ProyectoEntidadFinanciadoraService } from '@core/services/csp/proyecto-entidad-financiadora.service';
import { ProyectoEntidadGestoraService } from '@core/services/csp/proyecto-entidad-gestora.service';
import { ProyectoEquipoService } from '@core/services/csp/proyecto-equipo.service';
import { ProyectoHitoService } from '@core/services/csp/proyecto-hito.service';
import { ProyectoPaqueteTrabajoService } from '@core/services/csp/proyecto-paquete-trabajo.service';
import { ProyectoPeriodoSeguimientoService } from '@core/services/csp/proyecto-periodo-seguimiento.service';
import { ProyectoPlazoService } from '@core/services/csp/proyecto-plazo.service';
import { ProyectoProrrogaService } from '@core/services/csp/proyecto-prorroga.service';
import { ProyectoSocioPeriodoJustificacionService } from '@core/services/csp/proyecto-socio-periodo-justificacion.service';
import { ProyectoSocioService } from '@core/services/csp/proyecto-socio.service';
import { ProyectoService } from '@core/services/csp/proyecto.service';
import { SolicitudService } from '@core/services/csp/solicitud.service';
import { TipoAmbitoGeograficoService } from '@core/services/csp/tipo-ambito-geografico.service';
import { TipoFinalidadService } from '@core/services/csp/tipo-finalidad.service';
import { UnidadGestionService } from '@core/services/csp/unidad-gestion.service';
import { DocumentoService } from '@core/services/sgdoc/documento.service';
import { EmpresaService } from '@core/services/sgemp/empresa.service';
import { PersonaService } from '@core/services/sgp/persona.service';
import { TranslateService } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, Subject } from 'rxjs';
import { PROYECTO_DATA_KEY } from './proyecto-data.resolver';
import { ProyectoContextoFragment } from './proyecto-formulario/proyecto-contexto/proyecto-contexto.fragment';
import { ProyectoFichaGeneralFragment } from './proyecto-formulario/proyecto-datos-generales/proyecto-ficha-general.fragment';
import { ProyectoDocumentosFragment } from './proyecto-formulario/proyecto-documentos/proyecto-documentos.fragment';
import { ProyectoEntidadGestoraFragment } from './proyecto-formulario/proyecto-entidad-gestora/proyecto-entidad-gestora.fragment';
import { ProyectoEntidadesConvocantesFragment } from './proyecto-formulario/proyecto-entidades-convocantes/proyecto-entidades-convocantes.fragment';
import { ProyectoEntidadesFinanciadorasFragment } from './proyecto-formulario/proyecto-entidades-financiadoras/proyecto-entidades-financiadoras.fragment';
import { ProyectoEquipoFragment } from './proyecto-formulario/proyecto-equipo/proyecto-equipo.fragment';
import { ProyectoHistoricoEstadosFragment } from './proyecto-formulario/proyecto-historico-estados/proyecto-historico-estados.fragment';
import { ProyectoHitosFragment } from './proyecto-formulario/proyecto-hitos/proyecto-hitos.fragment';
import { ProyectoPaqueteTrabajoFragment } from './proyecto-formulario/proyecto-paquete-trabajo/proyecto-paquete-trabajo.fragment';
import { ProyectoPeriodoSeguimientosFragment } from './proyecto-formulario/proyecto-periodo-seguimientos/proyecto-periodo-seguimientos.fragment';
import { ProyectoPlazosFragment } from './proyecto-formulario/proyecto-plazos/proyecto-plazos.fragment';
import { ProyectoProrrogasFragment } from './proyecto-formulario/proyecto-prorrogas/proyecto-prorrogas.fragment';
import { ProyectoSociosFragment } from './proyecto-formulario/proyecto-socios/proyecto-socios.fragment';
import { PROYECTO_ROUTE_PARAMS } from './proyecto-route-params';

export interface IProyectoData {
  proyecto: IProyecto;
  readonly: boolean;
}

@Injectable()
export class ProyectoActionService extends ActionService {

  public readonly FRAGMENT = {
    FICHA_GENERAL: 'ficha-general',
    ENTIDADES_FINANCIADORAS: 'entidades-financiadoras',
    SOCIOS: 'socios',
    HITOS: 'hitos',
    ENTIDADES_CONVOCANTES: 'entidades-convocantes',
    PAQUETE_TRABAJO: 'paquete-trabajo',
    FASES: 'fases',
    CONTEXTO_PROYECTO: 'contexto-proyecto',
    SEGUIMIENTO_CIENTIFICO: 'seguimiento-cientificos',
    ENTIDAD_GESTORA: 'entidad-gestora',
    EQUIPO_PROYECTO: 'equipo-proyecto',
    PRORROGAS: 'prorrogas',
    HISTORICO_ESTADOS: 'historico-estados',
    DOCUMENTOS: 'documentos'
  };

  private fichaGeneral: ProyectoFichaGeneralFragment;
  private entidadesFinanciadoras: ProyectoEntidadesFinanciadorasFragment;
  private hitos: ProyectoHitosFragment;
  private socios: ProyectoSociosFragment;
  private entidadesConvocantes: ProyectoEntidadesConvocantesFragment;
  private paqueteTrabajo: ProyectoPaqueteTrabajoFragment;
  private plazos: ProyectoPlazosFragment;
  private proyectoContexto: ProyectoContextoFragment;
  private seguimientoCientifico: ProyectoPeriodoSeguimientosFragment;
  private entidadGestora: ProyectoEntidadGestoraFragment;
  private proyectoEquipo: ProyectoEquipoFragment;
  private documentos: ProyectoDocumentosFragment;
  private prorrogas: ProyectoProrrogasFragment;
  private historicoEstados: ProyectoHistoricoEstadosFragment;

  private readonly data: IProyectoData;

  public readonly showPaquetesTrabajo$: Subject<boolean> = new BehaviorSubject(false);
  public readonly disableAddSocios$ = new BehaviorSubject<boolean>(false);

  get proyecto(): IProyecto {
    return this.fichaGeneral.getValue();
  }

  get modeloEjecucionId(): number {
    return this.proyecto?.modeloEjecucion?.id;
  }

  get readonly(): boolean {
    return this.data.readonly;
  }

  constructor(
    fb: FormBuilder,
    logger: NGXLogger,
    route: ActivatedRoute,
    proyectoService: ProyectoService,
    empresaService: EmpresaService,
    proyectoSocioService: ProyectoSocioService,
    unidadGestionService: UnidadGestionService,
    modeloEjecucionService: ModeloEjecucionService,
    tipoFinalidadService: TipoFinalidadService,
    tipoAmbitoGeograficoService: TipoAmbitoGeograficoService,
    convocatoriaService: ConvocatoriaService,
    proyectoEntidadFinanciadoraService: ProyectoEntidadFinanciadoraService,
    proyectoHitoService: ProyectoHitoService,
    proyectoPaqueteTrabajoService: ProyectoPaqueteTrabajoService,
    proyectoPlazoService: ProyectoPlazoService,
    contextoProyectoService: ContextoProyectoService,
    proyectoPeriodoSeguimientoService: ProyectoPeriodoSeguimientoService,
    documentoService: DocumentoService,
    proyectoEntidadGestora: ProyectoEntidadGestoraService,
    proyectoEquipoService: ProyectoEquipoService,
    personaService: PersonaService,
    proyectoProrrogaService: ProyectoProrrogaService,
    proyectoDocumentoService: ProyectoDocumentoService,
    solicitudService: SolicitudService,
    proyectoSocioPeriodoJustificacionService: ProyectoSocioPeriodoJustificacionService,
    translate: TranslateService,
  ) {
    super();
    this.data = route.snapshot.data[PROYECTO_DATA_KEY];
    const id = Number(route.snapshot.paramMap.get(PROYECTO_ROUTE_PARAMS.ID));

    if (id) {
      this.enableEdit();
    }

    this.fichaGeneral = new ProyectoFichaGeneralFragment(
      logger, fb, id, proyectoService, unidadGestionService,
      modeloEjecucionService, tipoFinalidadService, tipoAmbitoGeograficoService, convocatoriaService, solicitudService
    );

    this.addFragment(this.FRAGMENT.FICHA_GENERAL, this.fichaGeneral);
    if (this.isEdit()) {
      this.entidadesFinanciadoras = new ProyectoEntidadesFinanciadorasFragment(
        id, proyectoService, proyectoEntidadFinanciadoraService, empresaService, false);
      this.socios = new ProyectoSociosFragment(id, empresaService, proyectoService, proyectoSocioService);
      this.hitos = new ProyectoHitosFragment(id, proyectoService, proyectoHitoService);
      this.plazos = new ProyectoPlazosFragment(id, proyectoService, proyectoPlazoService);
      this.entidadesConvocantes = new ProyectoEntidadesConvocantesFragment(logger, id, proyectoService, empresaService);
      this.paqueteTrabajo = new ProyectoPaqueteTrabajoFragment(id, proyectoService, proyectoPaqueteTrabajoService);
      this.proyectoContexto = new ProyectoContextoFragment(id, logger, contextoProyectoService);
      this.seguimientoCientifico = new ProyectoPeriodoSeguimientosFragment(
        id, proyectoService, proyectoPeriodoSeguimientoService, documentoService);
      this.proyectoEquipo = new ProyectoEquipoFragment(logger, id, proyectoService, proyectoEquipoService, personaService);
      this.entidadGestora = new ProyectoEntidadGestoraFragment(fb, id, proyectoService, proyectoEntidadGestora, empresaService);
      this.prorrogas = new ProyectoProrrogasFragment(id, proyectoService, proyectoProrrogaService, documentoService);
      this.historicoEstados = new ProyectoHistoricoEstadosFragment(id, proyectoService);
      this.documentos = new ProyectoDocumentosFragment(
        id, proyectoService, proyectoPeriodoSeguimientoService, proyectoSocioService,
        proyectoSocioPeriodoJustificacionService, proyectoProrrogaService, proyectoDocumentoService, empresaService, translate);

      this.addFragment(this.FRAGMENT.ENTIDADES_FINANCIADORAS, this.entidadesFinanciadoras);
      this.addFragment(this.FRAGMENT.SOCIOS, this.socios);
      this.addFragment(this.FRAGMENT.HITOS, this.hitos);
      this.addFragment(this.FRAGMENT.FASES, this.plazos);
      this.addFragment(this.FRAGMENT.ENTIDADES_CONVOCANTES, this.entidadesConvocantes);
      this.addFragment(this.FRAGMENT.PAQUETE_TRABAJO, this.paqueteTrabajo);
      this.addFragment(this.FRAGMENT.CONTEXTO_PROYECTO, this.proyectoContexto);
      this.addFragment(this.FRAGMENT.SEGUIMIENTO_CIENTIFICO, this.seguimientoCientifico);
      this.addFragment(this.FRAGMENT.EQUIPO_PROYECTO, this.proyectoEquipo);
      this.addFragment(this.FRAGMENT.ENTIDAD_GESTORA, this.entidadGestora);
      this.addFragment(this.FRAGMENT.PRORROGAS, this.prorrogas);
      this.addFragment(this.FRAGMENT.HISTORICO_ESTADOS, this.historicoEstados);
      this.addFragment(this.FRAGMENT.DOCUMENTOS, this.documentos);

      this.subscriptions.push(this.fichaGeneral.initialized$.subscribe(value => {
        if (value) {
          this.proyectoContexto.ocultarTable = !Boolean(this.fichaGeneral.getValue()?.convocatoriaId);
        }
      }));
      this.subscriptions.push(this.fichaGeneral.colaborativo$.subscribe((value) => {
        this.disableAddSocios$.next(!Boolean(value));
      }));
      this.subscriptions.push(this.fichaGeneral.permitePaquetesTrabajo$.subscribe((value) => {
        this.showPaquetesTrabajo$.next(Boolean(value));
      }));

      // Inicializamos la ficha general de forma predeterminada
      this.fichaGeneral.initialize();
    }
  }
}
