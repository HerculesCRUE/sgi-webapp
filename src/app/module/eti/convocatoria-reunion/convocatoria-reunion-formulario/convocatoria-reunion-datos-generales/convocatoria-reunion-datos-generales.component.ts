import { Component, OnDestroy, OnInit } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { IAsistente } from '@core/models/eti/asistente';
import { IComite } from '@core/models/eti/comite';
import { IConvocatoriaReunion } from '@core/models/eti/convocatoria-reunion';
import { IEvaluador } from '@core/models/eti/evaluador';
import { TipoConvocatoriaReunion } from '@core/models/eti/tipo-convocatoria-reunion';
import { IPersona } from '@core/models/sgp/persona';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ComiteService } from '@core/services/eti/comite.service';
import { ConvocatoriaReunionService } from '@core/services/eti/convocatoria-reunion.service';
import { EvaluadorService } from '@core/services/eti/evaluador.service';
import { TipoConvocatoriaReunionService } from '@core/services/eti/tipo-convocatoria-reunion.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { RSQLSgiRestFilter, SgiRestFilterOperator, SgiRestFindOptions, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of, Subscription } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { ConvocatoriaReunionActionService } from '../../convocatoria-reunion.action.service';
import { ConvocatoriaReunionDatosGeneralesFragment } from './convocatoria-reunion-datos-generales.fragment';


const MSG_ERROR_LOAD_COMITES = marker('eti.convocatoriaReunion.formulario.datosGenerales.comite.error.cargar');
const MSG_ERROR_LOAD_TIPOS_CONVOCATORIA = marker('eti.convocatoriaReunion.formulario.datosGenerales.tipoConvocatoriaReunion.error.cargar');
const MSG_ERROR_LOAD_CONVOCANTES = marker('eti.convocatoriaReunion.formulario.datosGenerales.convocantes.error.cargar');

@Component({
  selector: 'sgi-convocatoria-reunion-datos-generales',
  templateUrl: './convocatoria-reunion-datos-generales.component.html',
  styleUrls: ['./convocatoria-reunion-datos-generales.component.scss']
})
export class ConvocatoriaReunionDatosGeneralesComponent extends FormFragmentComponent<IConvocatoriaReunion> implements OnInit, OnDestroy {

  fxFlexProperties: FxFlexProperties;
  fxFlexPropertiesInline: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  comites: IComite[];
  tiposConvocatoriaReunion: TipoConvocatoriaReunion[];

  filteredComites: Observable<IComite[]>;
  filteredTiposConvocatoriaReunion: Observable<TipoConvocatoriaReunion[]>;

  formFragment: ConvocatoriaReunionDatosGeneralesFragment;
  disableCamposDatosGenerales: boolean;
  private subscriptions: Subscription[] = [];


  constructor(
    private readonly logger: NGXLogger,
    private comiteService: ComiteService,
    private evaluadorService: EvaluadorService,
    private tipoConvocatoriaReunionService: TipoConvocatoriaReunionService,
    private snackBarService: SnackBarService,
    private personaFisicaService: PersonaFisicaService,
    private actionService: ConvocatoriaReunionActionService,
    private convocatoriaReunionService: ConvocatoriaReunionService
  ) {
    super(actionService.FRAGMENT.DATOS_GENERALES, actionService);
    this.formFragment = this.fragment as ConvocatoriaReunionDatosGeneralesFragment;

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(32.7%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxFlexPropertiesInline = new FxFlexProperties();
    this.fxFlexPropertiesInline.sm = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.md = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.order = '3';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnInit() {
    super.ngOnInit();
    this.comites = [];
    this.tiposConvocatoriaReunion = [];

    this.subscriptions.push(this.actionService.disableCamposDatosGenerales.subscribe(
      (value: boolean) => {
        this.disableCamposDatosGenerales = value;
      }
    ));

    // Inicializa los combos
    this.getComites();
    this.getTiposConvocatoriaReunion();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Recupera un listado de los comites que hay en el sistema.
   */
  private getComites(): void {
    const comitesSelectSubscription = this.comiteService.findAll()
      .subscribe(
        (response: SgiRestListResult<IComite>) => {
          this.comites = response.items;
          this.filteredComites = this.formGroup.controls.comite.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filterComite(value))
            );
        },
        (error) => {
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR_LOAD_COMITES);
        }
      );
    this.subscriptions.push(comitesSelectSubscription);
  }

  /**
   * Recupera un listado de los tipos de convocatoria reunion que hay en el sistema.
   */
  private getTiposConvocatoriaReunion(): void {
    const tipoConvocatoriaSelectReunionSubscription = this.tipoConvocatoriaReunionService.findAll()
      .subscribe(
        (response) => {
          this.tiposConvocatoriaReunion = response.items;
          this.filteredTiposConvocatoriaReunion = this.formGroup.controls.tipoConvocatoriaReunion.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filterTipoConvocatoriaReunion(value))
            );
        },
        (error) => {
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR_LOAD_TIPOS_CONVOCATORIA);
        });
    this.subscriptions.push(tipoConvocatoriaSelectReunionSubscription);
  }


  /**
   * Recupera el listado de convocantes correspondiente al comite seleccionado.
   */
  getConvocantesComite(): void {
    const convocantesSelectSubscription = this.formGroup.controls.comite.valueChanges.pipe(
      switchMap((comite: IComite | string) => {
        if (typeof comite === 'string' || !comite.id) {
          return of([]);
        }
        return this.getConvocantes(comite);
      })
    ).subscribe(
      (convocantes) => {
        this.formFragment.evaluadoresComite = convocantes;
      },
      (error) => {
        this.logger.error(error);
        this.snackBarService.showError(MSG_ERROR_LOAD_CONVOCANTES);
      }
    );
    this.subscriptions.push(convocantesSelectSubscription);
  }

  private getConvocantes(comite: IComite): Observable<IEvaluador[]> {
    const options: SgiRestFindOptions = {
      filter: new RSQLSgiRestFilter('comite.id', SgiRestFilterOperator.EQUALS, comite.id.toString())
    };
    return this.evaluadorService.findAll(options)
      .pipe(
        switchMap((listadoConvocantes) => {
          const personaRefsConvocantes = listadoConvocantes.items.map((convocante: IEvaluador) => convocante.personaRef);
          const convocantesWithDatosPersona$ = this.personaFisicaService.findByPersonasRefs(personaRefsConvocantes)
            .pipe(
              map((personas: SgiRestListResult<IPersona>) => {
                return this.loadDatosPersona(personas, listadoConvocantes.items);
              })
            );
          return convocantesWithDatosPersona$;
        }),
        switchMap((convocantes) => {
          this.getAsistentes(convocantes);
          return of(convocantes);
        })
      );
  }

  /**
   * Carga los datos personales de los evaluadores
   *
   * @param listado Listado de personas
   * @param evaluadores Evaluadores
   */
  private loadDatosPersona(listado: SgiRestListResult<IPersona>, evaluadores: IEvaluador[]): IEvaluador[] {
    const personas = listado.items;
    evaluadores.forEach((convocante) => {
      const datosPersonaConvocante = personas.find((persona: IPersona) => convocante.personaRef === persona.personaRef);
      convocante.nombre = datosPersonaConvocante?.nombre;
      convocante.primerApellido = datosPersonaConvocante?.primerApellido;
      convocante.segundoApellido = datosPersonaConvocante?.segundoApellido;
    });
    return evaluadores;
  }

  /**
   * Carga los asistentes de la convocatoria dentro del formGroup
   *
   * @param convocantes Convocantes
   */
  private getAsistentes(convocantes: IEvaluador[]): Observable<SgiRestListResult<IAsistente>> {
    const id = this.actionService?.convocatoriaReunion?.id;
    if (id) {
      return this.convocatoriaReunionService.findAsistentes(id).pipe(
        switchMap((asistentes: SgiRestListResult<IAsistente>) => {
          const ids = asistentes.items.map((convocante: IAsistente) => convocante.evaluador.id);
          const asistentesFormGroup = [];
          convocantes.forEach((evaluador: IEvaluador) => {
            if (ids.includes(evaluador.id)) {
              asistentesFormGroup.push(evaluador);
            }
          });
          this.formGroup.get('convocantes').setValue(asistentesFormGroup);
          return of(asistentes);
        })
      );
    }
    return of();
  }

  /**
   * Filtro de campo autocompletable comite.
   *
   * @param value value a filtrar (string o Comite.
   * @returns lista de comites filtrada.
   */
  private filterComite(value: string | IComite): IComite[] {
    if (!value) {
      return this.comites;
    }

    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.comite.toLowerCase();
    }

    return this.comites.filter
      (comite => comite.comite.toLowerCase().includes(filterValue));
  }

  /**
   * Filtro de campo autocompletable tipo convocatoria reunion.
   *
   * @param value value a filtrar (string o TipoConvocatoriaReunion).
   * @returns lista de tipos de convocatoria reunion filtrada.
   */
  private filterTipoConvocatoriaReunion(value: string | TipoConvocatoriaReunion): TipoConvocatoriaReunion[] {
    if (!value) {
      return this.tiposConvocatoriaReunion;
    }

    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.nombre.toLowerCase();
    }

    return this.tiposConvocatoriaReunion.filter
      (tipoConvocatoriaReunion => tipoConvocatoriaReunion.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Devuelve el nombre del comite
   * @param comite comite
   *
   * @returns nombre del comite
   */
  getComite(comite: IComite): string {
    return comite?.comite;
  }

  /**
   * Devuelve el nombre del tipo de convocatoria reunion
   * @param tipoConvocatoriaReunion tipo convocatoria reunion
   *
   * @returns nombre del tipo de convocatoria reunion
   */
  getTipoConvocatoriaReunion(tipoConvocatoriaReunion: TipoConvocatoriaReunion): string {
    return tipoConvocatoriaReunion?.nombre;
  }

  /**
   * Recupera los convocantes seleccionados en el formulario
   *
   * @return lista de convocantes
   */
  getDatosConvocantesFormulario(): IEvaluador[] {
    const convocantes: IEvaluador[] = this.formGroup.controls.convocantes.value;
    return convocantes;
  }
}
