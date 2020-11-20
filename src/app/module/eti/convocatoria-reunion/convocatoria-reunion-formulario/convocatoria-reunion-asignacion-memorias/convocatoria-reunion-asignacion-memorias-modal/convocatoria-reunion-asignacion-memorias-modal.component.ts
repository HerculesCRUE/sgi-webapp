import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { DialogData } from '@block/dialog/dialog.component';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { IEvaluador } from '@core/models/eti/evaluador';
import { IMemoria } from '@core/models/eti/memoria';
import { IPersona } from '@core/models/sgp/persona';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { EvaluadorService } from '@core/services/eti/evaluador.service';
import { MemoriaService } from '@core/services/eti/memoria.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { DateUtils } from '@core/utils/date-utils';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { NullIdValidador } from '@core/validators/null-id-validador';
import { SgiRestFilter, SgiRestFilterType, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of, Subscription } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { IConvocatoriaReunion } from '@core/models/eti/convocatoria-reunion';

const MSG_ERROR_FORM_GROUP = marker('form-group.error');
const MSG_ERROR_CARGAR_MEMORIA = marker('eti.convocatoriaReunion.formulario.asignacionMemorias.memoria.error.cargar');
const MSG_ERROR_CARGAR_EVALUADOR1 = marker('eti.convocatoriaReunion.formulario.asignacionMemorias.evaluador1.error.cargar');
const MSG_ERROR_CARGAR_EVALUADOR2 = marker('eti.convocatoriaReunion.formulario.asignacionMemorias.evaluador2.error.cargar');
const MSG_ERROR_EVALUADOR_REPETIDO = marker('eti.convocatoriaReunion.formulario.asignacionMemorias.evaluador.repetido');

@Component({
  selector: 'sgi-convocatoria-reunion-asignacion-memorias-modal',
  templateUrl: './convocatoria-reunion-asignacion-memorias-modal.component.html',
  styleUrls: ['./convocatoria-reunion-asignacion-memorias-modal.component.scss']
})
export class ConvocatoriaReunionAsignacionMemoriasModalComponent implements OnInit, OnDestroy {
  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  FormGroupUtil = FormGroupUtil;
  formGroup: FormGroup;

  evaluadores: IEvaluador[];
  memorias: IMemoria[];

  filteredEvaluadoresEvaluador1: Observable<IEvaluador[]>;
  filteredEvaluadoresEvaluador2: Observable<IEvaluador[]>;
  filteredMemorias: Observable<IMemoria[]>;

  private subscriptions: Subscription[];

  idConvocatoria: number;
  isTipoConvocatoriaSeguimiento: boolean;
  filterData: { idComite: number, idTipoConvocatoria: number, fechaLimite: Date };
  filterMemoriasAsignables: SgiRestFilter[];
  memoriasAsignadas: IMemoria[];
  evaluacion: IEvaluacion;

  constructor(
    protected readonly logger: NGXLogger,
    private readonly dialogRef: MatDialogRef<ConvocatoriaReunionAsignacionMemoriasModalComponent>,
    private readonly evaluadorService: EvaluadorService,
    private readonly memoriaService: MemoriaService,
    private readonly PersonafisicaService: PersonaFisicaService,
    private readonly snackBarService: SnackBarService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';

    this.subscriptions = [];

    const params: any = data.params;
    if (params) {
      this.idConvocatoria = params.idConvocatoria;
      this.memoriasAsignadas = params.memoriasAsignadas;
      this.filterData = params.filterMemoriasAsignables;
      this.evaluacion = params.evaluacion;
    }
    this.buildFilters();
  }

  ngOnInit(): void {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name, 'ngOnInit()', 'start');

    this.initFormGroup();

    if (this.idConvocatoria) {
      this.loadMemoriasAsignablesConvocatoria();
    } else {
      if (this.isTipoConvocatoriaSeguimiento) {
        this.loadMemoriasAsignablesConvocatoriaSeguimiento();
      } else {
        this.loadMemoriasAsignablesConvocatoriaOrdExt();
      }
    }

    this.loadEvaluadores();

    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name, 'ngOnInit()', 'end');
  }

  /**
   * Inicializa el formGroup
   */
  private initFormGroup() {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name, 'initFormGroup()', 'start');
    this.formGroup = new FormGroup({
      memoria: new FormControl(this.evaluacion.memoria, [Validators.required]),
      evaluador1: new FormControl(this.evaluacion.evaluador1),
      evaluador2: new FormControl(this.evaluacion.evaluador2),
    });
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name, 'initFormGroup()', 'end');
  }

  ngOnDestroy(): void {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions?.forEach(x => x.unsubscribe());
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name, 'ngOnDestroy()', 'end');
  }

  /**
   * Crear el FormGroup
   *
   */
  createFormGroup(): FormGroup {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name, 'createFormGroup()', 'start');
    const formGroup = new FormGroup({
      memoria: new FormControl(null, [new NullIdValidador().isValid()]),
      evaluador1: new FormControl(null, [Validators.required]),
      evaluador2: new FormControl(null, [Validators.required])
    });
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name, 'createFormGroup()', 'end');
    return formGroup;
  }

  /**
   * Construye los filtros necesarios para la búsqueda de las memorias asignables.
   *
   */
  private buildFilters(): void {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name, 'buildFilters(filterData)', 'start');
    this.filterMemoriasAsignables = [];

    if (this.filterData && this.filterData.idComite &&
      this.filterData.idTipoConvocatoria &&
      this.filterData.fechaLimite) {

      this.isTipoConvocatoriaSeguimiento = (this.filterData.idTipoConvocatoria === 3) ? true : false;

      const filtroComite = {
        field: 'comite.id',
        type: SgiRestFilterType.EQUALS,
        value: this.filterData.idComite.toString(),
      };

      const filtroFechaLimite = {
        field: 'fechaEnvioSecretaria',
        type: SgiRestFilterType.LOWER_OR_EQUAL,
        value: DateUtils.formatFechaAsISODate(this.filterData.fechaLimite),
      };

      this.filterMemoriasAsignables.push(filtroComite);
      this.filterMemoriasAsignables.push(filtroFechaLimite);
    }
  }


  /**
   * Recupera un listado de los memorias asignables a la convocatoria.
   */
  private loadMemoriasAsignablesConvocatoria(): void {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name,
      'loadMemoriasAsignablesConvocatoria()',
      'start');

    this.subscriptions.push(this.memoriaService
      .findAllMemoriasAsignablesConvocatoria(this.idConvocatoria)
      .subscribe(
        (response: SgiRestListResult<IMemoria>) => {
          this.memorias = response.items;

          // Eliminar de la lista las memorias que ya están asignadas
          this.memorias = this.memorias.filter(
            (memoria: IMemoria) => {
              return (!this.memoriasAsignadas.some(e => e.id === memoria.id));
            }
          );

          this.filteredMemorias = this.formGroup.controls.memoria.valueChanges
            .pipe(
              startWith(''),
              map(value => this._filterMemoria(value))
            );
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_CARGAR_MEMORIA);
        }
      ));

    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name,
      'loadMemoriasAsignablesConvocatoria()',
      'end');
  }

  /**
   * Recupera un listado de las memorias asignables si la convocatoria es de tipo seguimiento.
   */
  private loadMemoriasAsignablesConvocatoriaSeguimiento(): void {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name,
      'loadMemoriasAsignablesConvocatoriaSeguimiento',
      'start');

    this.subscriptions.push(this.memoriaService
      .findAllAsignablesTipoConvocatoriaSeguimiento({ filters: this.filterMemoriasAsignables })
      .subscribe(
        (response: SgiRestListResult<IMemoria>) => {
          this.memorias = response.items;

          // Eliminar de la lista las memorias que ya están asignadas
          this.memorias = this.memorias.filter(
            (memoria: IMemoria) => {
              return (!this.memoriasAsignadas.some(e => e.id === memoria.id));
            }
          );

          this.filteredMemorias = this.formGroup.controls.memoria.valueChanges
            .pipe(
              startWith(''),
              map(value => this._filterMemoria(value))
            );
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_CARGAR_MEMORIA);
        }
      ));

    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name,
      'loadMemoriasAsignablesConvocatoriaSeguimiento()',
      'end');
  }

  /**
   * Recupera un listado de las memorias asignables si la convocatoria es de tipo ordinaria / extraordinaria.
   */
  private loadMemoriasAsignablesConvocatoriaOrdExt(): void {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name,
      'loadMemoriasAsignablesConvocatoriaOrdExt',
      'start');

    this.subscriptions.push(this.memoriaService
      .findAllAsignablesTipoConvocatoriaOrdExt({ filters: this.filterMemoriasAsignables })
      .subscribe(
        (response: SgiRestListResult<IMemoria>) => {
          this.memorias = response.items;

          // Eliminar de la lista las memorias que ya están asignadas
          this.memorias = this.memorias.filter(
            (memoria: IMemoria) => {
              return (!this.memoriasAsignadas.some(e => e.id === memoria.id));
            }
          );

          this.filteredMemorias = this.formGroup.controls.memoria.valueChanges
            .pipe(
              startWith(''),
              map(value => this._filterMemoria(value))
            );
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_CARGAR_MEMORIA);
        }
      ));

    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name,
      'loadMemoriasAsignablesConvocatoriaOrdExt()',
      'end');
  }


  /**
   * Recupera un listado de los evaluadores que hay en el sistema.
   */
  private loadEvaluadores(): void {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name,
      'loadEvaluadores()',
      'start');

    const evaluadoresMemoriaSeleccionada$ =
      this.formGroup.controls.memoria.valueChanges.pipe(
        switchMap((memoria: IMemoria | string) => {
          if (typeof memoria === 'string' || !memoria.id) {
            return of([]);
          }

          return this.evaluadorService
            .findAllMemoriasAsignablesConvocatoria(memoria.comite.id, memoria.id)
            .pipe(
              switchMap((response) => {

                if (response.items) {
                  const evaluadores = response.items;

                  const personaRefsEvaluadores = evaluadores.map((convocante: IEvaluador) => convocante.personaRef);

                  if (personaRefsEvaluadores.length === 0) {
                    return of([]);
                  }

                  const evaluadoresWithDatosPersona$ = this.PersonafisicaService.findByPersonasRefs(personaRefsEvaluadores).pipe(
                    map((result: SgiRestListResult<IPersona>) => {
                      const personas = result.items;

                      evaluadores.forEach((evaluador: IEvaluador) => {
                        const datosPersonaEvaluador = personas.find((persona: IPersona) => evaluador.personaRef === persona.personaRef);
                        evaluador.nombre = datosPersonaEvaluador?.nombre;
                        evaluador.primerApellido = datosPersonaEvaluador?.primerApellido;
                        evaluador.segundoApellido = datosPersonaEvaluador?.segundoApellido;
                      });

                      return evaluadores;
                    }));

                  return evaluadoresWithDatosPersona$;
                } else {
                  return of([]);
                }
              })
            );
        }),
        shareReplay(1));

    this.subscriptions.push(evaluadoresMemoriaSeleccionada$.subscribe(
      (evaluadores: IEvaluador[]) => {
        this.evaluadores = evaluadores;

        this.filteredEvaluadoresEvaluador1 = this.formGroup.controls.evaluador1.valueChanges
          .pipe(
            startWith(''),
            map(value => this._filterEvaluador(value))
          );
      },
      () => {
        this.snackBarService.showError(MSG_ERROR_CARGAR_EVALUADOR1);
      }
    ));

    this.subscriptions.push(evaluadoresMemoriaSeleccionada$.subscribe(
      (evaluadores: IEvaluador[]) => {
        this.evaluadores = evaluadores;

        this.filteredEvaluadoresEvaluador2 = this.formGroup.controls.evaluador2.valueChanges
          .pipe(
            startWith(''),
            map(value => this._filterEvaluador(value))
          );
      },
      () => {
        this.snackBarService.showError(MSG_ERROR_CARGAR_EVALUADOR2);
      }
    ));

    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name,
      'loadEvaluadores()',
      'end');
  }



  /**
   * Filtro de campo autocompletable memoria.
   * @param value value a filtrar (string o memoria).
   * @returns lista de memorias filtrada.
   */
  private _filterMemoria(value: string | IMemoria): IMemoria[] {
    if (!value) {
      return this.memorias;
    }

    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = (value.numReferencia + ' - ' + value.titulo).toLowerCase();
    }

    return this.memorias.filter
      (memoria => (memoria.numReferencia + ' - ' + memoria.titulo).toLowerCase().includes(filterValue));
  }

  /**
   * Filtro de campo autocompletable evaluador.
   * @param value value a filtrar (string o evaluador).
   * @returns lista de evaluadores filtrada.
   */
  private _filterEvaluador(value: string | IEvaluador): IEvaluador[] {
    if (!value) {
      return this.evaluadores;
    }

    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = (value.nombre + ' ' + value.primerApellido + ' ' + value.segundoApellido).toLowerCase();
    }

    return this.evaluadores.filter
      (evaluador =>
        (evaluador.nombre + ' ' + evaluador.primerApellido + ' ' + evaluador.segundoApellido).toLowerCase().includes(filterValue));
  }

  /**
   * Devuelve el nombre completo del evaluador
   * @param evaluador Evaluador
   *
   * @returns nombre completo del evaluador
   */
  getEvaluador(evaluador: IEvaluador): string {
    return evaluador ? evaluador.nombre + ' ' + evaluador.primerApellido + ' ' + evaluador.segundoApellido : '';
  }

  /**
   * Devuelve la referencia y el titulo de la memoria
   * @param memoria Memoria
   *
   * @returns referencia y titulo memoria
   */
  getMemoria(memoria: IMemoria): string {
    return memoria ? (memoria.numReferencia + ' - ' + memoria.titulo) : '';
  }

  getDatosForm(): IEvaluacion {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name, 'getDatosFormulario()', 'start');
    const evaluacion = this.evaluacion;
    const convocatoriaReunion: IConvocatoriaReunion = {
      activo: null,
      anio: null,
      codigo: null,
      comite: null,
      convocantes: null,
      fechaEnvio: null,
      fechaEvaluacion: null,
      fechaLimite: null,
      horaInicio: null,
      id: null,
      idActa: null,
      lugar: null,
      minutoInicio: null,
      numEvaluaciones: null,
      numeroActa: null,
      ordenDia: null,
      tipoConvocatoriaReunion: null
    };

    this.evaluacion.memoria = FormGroupUtil.getValue(this.formGroup, 'memoria');
    this.evaluacion.convocatoriaReunion = convocatoriaReunion;
    this.evaluacion.evaluador1 = FormGroupUtil.getValue(this.formGroup, 'evaluador1');
    this.evaluacion.evaluador2 = FormGroupUtil.getValue(this.formGroup, 'evaluador2');

    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name, 'getDatosFormulario()', 'end');
    return this.evaluacion;
  }

  /**
   * Confirmar asignación
   */
  onAsignarmemoria(): void {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name, 'onAsignarmemoria()', 'start');

    const evaluacion: IEvaluacion = this.getDatosForm();

    if (evaluacion.evaluador1 === evaluacion.evaluador2) {
      this.snackBarService.showError(MSG_ERROR_EVALUADOR_REPETIDO);
      this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name, 'onAsignarmemoria() - end');
      return;
    }

    if (FormGroupUtil.valid(this.formGroup)) {
      this.dialogRef.close(evaluacion);
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
    }

    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name, 'onAsignarmemoria()', 'end');
  }

  onCancel(): void {
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name, 'onCancel()', 'start');
    this.dialogRef.close();
    this.logger.debug(ConvocatoriaReunionAsignacionMemoriasModalComponent.name, 'onCancel()', 'end');
  }



}
