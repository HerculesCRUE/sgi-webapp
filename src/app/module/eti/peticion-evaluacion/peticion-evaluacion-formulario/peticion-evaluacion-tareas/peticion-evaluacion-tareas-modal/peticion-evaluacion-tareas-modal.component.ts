import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { BaseModalComponent } from '@core/component/base-modal.component';
import { MSG_PARAMS } from '@core/i18n';
import { IEquipoTrabajo } from '@core/models/eti/equipo-trabajo';
import { FormacionEspecifica } from '@core/models/eti/formacion-especifica';
import { IMemoria } from '@core/models/eti/memoria';
import { IMemoriaPeticionEvaluacion } from '@core/models/eti/memoria-peticion-evaluacion';
import { ITareaWithIsEliminable } from '@core/models/eti/tarea-with-is-eliminable';
import { TipoTarea } from '@core/models/eti/tipo-tarea';
import { IPersona } from '@core/models/sgp/persona';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { EquipoTrabajoService } from '@core/services/eti/equipo-trabajo.service';
import { FormacionEspecificaService } from '@core/services/eti/formacion-especifica.service';
import { MemoriaService } from '@core/services/eti/memoria.service';
import { TareaService } from '@core/services/eti/tarea.service';
import { TipoTareaService } from '@core/services/eti/tipo-tarea.service';
import { PersonaService } from '@core/services/sgp/persona.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

const MSG_ERROR_FORM = marker('error.form-group');
const MSG_ERROR = marker('error.load');
const TITLE_NEW_ENTITY = marker('title.new.entity');
const TAREA_KEY = marker('eti.peticion-evaluacion.tarea');
const BTN_ADD = marker('btn.add');
const BTN_OK = marker('btn.ok');
const TAREA_EQUIPO_TRABAJO_KEY = marker('eti.peticion-evaluacion.tarea.persona');
const TAREA_MEMORIA_KEY = marker('eti.memoria');
const TAREA_FORMACION_ESPECIFICA_KEY = marker('eti.peticion-evaluacion.tarea.formacion-especifica');
const TAREA_ANIO_KEY = marker('eti.peticion-evaluacion.tarea.anio');
const TAREA_ORGANISMO_KEY = marker('eti.peticion-evaluacion.tarea.organismo');

export interface PeticionEvaluacionTareasModalComponentData {
  tarea: ITareaWithIsEliminable;
  equiposTrabajo: IEquipoTrabajo[];
  memorias: IMemoriaPeticionEvaluacion[];
}

@Component({
  selector: 'sgi-peticion-evaluacion-tareas-modal',
  templateUrl: './peticion-evaluacion-tareas-modal.component.html',
  styleUrls: ['./peticion-evaluacion-tareas-modal.component.scss']
})
export class PeticionEvaluacionTareasModalComponent extends
  BaseModalComponent<PeticionEvaluacionTareasModalComponentData, PeticionEvaluacionTareasModalComponent> implements OnInit, OnDestroy {

  fxLayoutProperties: FxLayoutProperties;

  tareaSuscripcion: Subscription;

  formacionListado: FormacionEspecifica[];
  formacionesSubscription: Subscription;
  filteredFormaciones: Observable<FormacionEspecifica[]>;

  memoriaListado: IMemoriaPeticionEvaluacion[];
  memoriasSubscription: Subscription;
  filteredMemorias: Observable<IMemoriaPeticionEvaluacion[]>;

  equipoTrabajoListado: IEquipoTrabajo[];
  equiposTrabajoSubscription: Subscription;
  filteredEquiposTrabajo: Observable<IEquipoTrabajo[]>;

  tipoTareaListado: TipoTarea[];
  tipoTareasSubscription: Subscription;
  filteredTipoTareas: Observable<TipoTarea[]>;

  personaServiceOneSubscritpion: Subscription;

  mostrarOrganismo: boolean;
  mostrarOrganismo$ = new BehaviorSubject(false);
  mostrarOrganismoSubscription: Subscription;

  mostrarOrganismoYanio: boolean;
  mostrarOrganismoYanio$ = new BehaviorSubject(false);
  mostrarOrganismoYanioSubscription: Subscription;

  tareaYformacionTexto: boolean;
  tareaYformacionTexto$ = new BehaviorSubject(false);
  tareaYformacionTextoSubscription: Subscription;

  title: string;
  textoAceptar: string;

  msgParamEquipoTrabajoEntity = {};
  msgParamMemoriaEntity = {};
  msgParamTareaEntity = {};
  msgParamFormacionEntity = {};
  msgParamAnioEntity = {};
  msgParamOrganismoEntity = {};

  get MSG_PARAMS() {
    return MSG_PARAMS;
  }

  constructor(
    private readonly logger: NGXLogger,
    public readonly matDialogRef: MatDialogRef<PeticionEvaluacionTareasModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PeticionEvaluacionTareasModalComponentData,
    protected readonly snackBarService: SnackBarService,
    protected readonly tareaService: TareaService,
    protected readonly formacionService: FormacionEspecificaService,
    protected readonly memoriaService: MemoriaService,
    protected readonly equipoTrabajoService: EquipoTrabajoService,
    protected readonly personaService: PersonaService,
    protected readonly tipoTareaService: TipoTareaService,
    private readonly translate: TranslateService
  ) {
    super(snackBarService, matDialogRef, data);

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'column';
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.setupI18N();
    this.mostrarOrganismoYanioSubscription = this.mostrarOrganismoYanio$.subscribe(mostrar => {
      this.mostrarOrganismoYanio = mostrar;
    });
    this.tareaYformacionTextoSubscription = this.tareaYformacionTexto$.subscribe(mostrar => {
      this.tareaYformacionTexto = mostrar;
    });
    this.onClickMemoria(this.data.tarea?.memoria);
    this.loadFormaciones();
    this.loadMemorias();
    this.loadEquiposTrabajo();
    this.loadTipoTareas();
  }

  private setupI18N(): void {
    if (this.data.tarea?.memoria) {
      this.translate.get(
        TAREA_KEY,
        MSG_PARAMS.CARDINALIRY.SINGULAR
      ).subscribe((value) => this.title = value);

      this.translate.get(
        BTN_OK,
        MSG_PARAMS.CARDINALIRY.SINGULAR
      ).subscribe((value) => this.textoAceptar = value);
    } else {
      this.translate.get(
        TAREA_KEY,
        MSG_PARAMS.CARDINALIRY.SINGULAR
      ).pipe(
        switchMap((value) => {
          return this.translate.get(
            TITLE_NEW_ENTITY,
            { entity: value, ...MSG_PARAMS.GENDER.FEMALE }
          );
        })
      ).subscribe((value) => this.title = value);

      this.translate.get(
        BTN_ADD,
        MSG_PARAMS.CARDINALIRY.SINGULAR
      ).subscribe((value) => this.textoAceptar = value);

    }

    this.translate.get(
      TAREA_EQUIPO_TRABAJO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamEquipoTrabajoEntity = { entity: value, ...MSG_PARAMS.GENDER.FEMALE });

    this.translate.get(
      TAREA_MEMORIA_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamMemoriaEntity = { entity: value, ...MSG_PARAMS.GENDER.FEMALE });

    this.translate.get(
      TAREA_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamTareaEntity = { entity: value, ...MSG_PARAMS.GENDER.FEMALE });

    this.translate.get(
      TAREA_FORMACION_ESPECIFICA_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamFormacionEntity = { entity: value, ...MSG_PARAMS.GENDER.FEMALE });

    this.translate.get(
      TAREA_ANIO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamAnioEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE });

    this.translate.get(
      TAREA_ORGANISMO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamOrganismoEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE });
  }

  /**
   * Devuelve el nombre de una formación específica.
   * @param formacion formación específica
   * returns nombre de la formación específica
   */
  getFormacion(formacion: FormacionEspecifica): string {
    return formacion?.nombre;
  }

  /**
   * Recupera un listado de las formaciones escíficas que hay en el sistema.
   */
  loadFormaciones(): void {
    this.formacionesSubscription = this.formacionService.findAll().subscribe(
      (response) => {
        this.formacionListado = response.items;

        this.filteredFormaciones = this.formGroup.controls.formacionEspecifica.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filterFormacion(value))
          );
      });
  }

  /**
   * Filtro de campo autocompletable formación específica
   * @param value value a filtrar (string o nombre formación).
   * @returns lista de formaciones filtradas.
   */
  private filterFormacion(value: string | FormacionEspecifica): FormacionEspecifica[] {
    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.nombre.toLowerCase();
    }

    return this.formacionListado.filter
      (formacion => formacion.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Devuelve el titulo de una memoria
   * @param memoria memoria
   * returns título de la memoria
   */
  getMemoria(memoria: IMemoria): string {
    return memoria?.numReferencia;
  }

  /**
   * Recupera un listado de las memorias que hay en el sistema.
   */
  loadMemorias(): void {
    this.memoriaListado = this.data.memorias;

    this.filteredMemorias = this.formGroup.controls.memoria.valueChanges
      .pipe(
        startWith(''),
        map(value => this.filterMemoria(value))
      );
  }

  /**
   * Evento click de selector de memorias
   * @param memoria memoria
   * muestra y oculta los campos oportunos
   */
  onClickMemoria(memoria: IMemoria): void {
    if (memoria?.comite?.comite === 'CEIAB' || memoria?.comite?.comite === 'CEEA') {
      this.mostrarOrganismoYanio$.next(true);
      this.formGroup.controls.organismo.setValidators(Validators.required);
      this.formGroup.controls.anio.setValidators(Validators.required);
    } else {
      this.mostrarOrganismoYanio$.next(false);
      this.formGroup.controls.organismo.clearValidators();
      this.formGroup.controls.anio.clearValidators();
    }

    if (memoria?.comite?.comite === 'CEISH' || memoria?.comite?.comite === 'CEIAB') {
      this.tareaYformacionTexto$.next(true);
      this.formGroup.controls.tarea.setValidators(Validators.required);
      this.formGroup.controls.formacion.setValidators(Validators.required);
      this.formGroup.controls.tipoTarea.clearValidators();
      this.formGroup.controls.formacionEspecifica.clearValidators();
    } else {
      this.tareaYformacionTexto$.next(false);
      this.formGroup.controls.tipoTarea.setValidators(Validators.required);
      this.formGroup.controls.formacionEspecifica.setValidators(Validators.required);
      this.formGroup.controls.tarea.clearValidators();
      this.formGroup.controls.formacion.clearValidators();
    }

    this.formGroup.controls.anio.updateValueAndValidity();
    this.formGroup.controls.formacion.updateValueAndValidity();
    this.formGroup.controls.formacionEspecifica.updateValueAndValidity();
    this.formGroup.controls.organismo.updateValueAndValidity();
    this.formGroup.controls.tarea.updateValueAndValidity();
    this.formGroup.controls.tipoTarea.updateValueAndValidity();
  }

  /**
   * Filtro de campo autocompletable de memoria
   * @param value value a filtrar (string o título memoria).
   * @returns lista de memorias filtradas.
   */
  private filterMemoria(value: string | IMemoriaPeticionEvaluacion): IMemoriaPeticionEvaluacion[] {
    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.numReferencia.toLowerCase();
    }

    return this.memoriaListado?.filter
      (memoria => memoria.numReferencia.toLowerCase().includes(filterValue));
  }

  /**
   * Devuelve la persona del equipo de trabajo
   * @param equipoTrabajo el equipo de trabajo
   * returns persona del equipo de trabajo
   */
  getEquipoTrabajo(equipoTrabajo: IEquipoTrabajo): string {
    if (typeof equipoTrabajo === 'string') {
      return null;
    }
    return equipoTrabajo?.persona.nombre + ' ' + equipoTrabajo?.persona.apellidos;
  }

  /**
   * Recupera un listado de los equipo de trabajo que hay en el sistema.
   */
  loadEquiposTrabajo(): void {
    this.equipoTrabajoListado = this.data.equiposTrabajo;

    this.filteredEquiposTrabajo = this.formGroup.controls.equipoTrabajo.valueChanges
      .pipe(
        startWith(''),
        map(value => this.filterEquipoTrabajo(value))
      );
  }

  onClickEquipoTrabajo(): void {
    this.filteredEquiposTrabajo = this.formGroup.controls.equipoTrabajo.valueChanges
      .pipe(
        startWith(''),
        map(value => this.filterEquipoTrabajo(value))
      );
  }

  /**
   * Devuelve el nombre de un tipo de tarea
   * @param tipoTarea el tipo de tarea
   * returns nombre del tipo de tarea
   */
  getTipoTarea(tipoTarea: TipoTarea): string {
    return tipoTarea?.nombre;
  }

  /**
   * Recupera un listado de los tipos de tareas que hay en el sistema.
   */
  loadTipoTareas(): void {
    this.tipoTareasSubscription = this.tipoTareaService.findAll().subscribe(
      (response) => {
        this.tipoTareaListado = response.items;

        this.filteredTipoTareas = this.formGroup.controls.tipoTarea.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filterTipoTarea(value))
          );
      });
  }

  /**
   * Filtro de campo autocompletable tipo tarea
   * @param value value a filtrar (string o nombre tipo de la tarea).
   * @returns lista de tipo tareas filtradas.
   */
  private filterTipoTarea(value: string | TipoTarea): TipoTarea[] {
    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.nombre.toLowerCase();
    }

    return this.tipoTareaListado.filter
      (tipoTarea => tipoTarea.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * Devuelve los datos de persona de los equipos de trabajo
   * @param equiposTrabajo listado de equipos de trabajo
   * returns los equipos de trabajo con los datos de persona
   */
  loadDatosUsuario(equiposTrabajo: IEquipoTrabajo[]) {
    this.equipoTrabajoListado = [];
    equiposTrabajo.forEach(equipoTrabajo => {
      this.personaServiceOneSubscritpion = this.personaService.findById(equipoTrabajo.persona?.id)
        .subscribe(
          (persona: IPersona) => {
            equipoTrabajo.persona = persona;
            this.equipoTrabajoListado.push(equipoTrabajo);
          },
          (error) => {
            this.logger.error(error);
            this.snackBarService.showError(MSG_ERROR);
          }
        );
    });
  }

  /**
   * Filtro de campo autocompletable del equipo de trabajo
   * @param value value a filtrar (string o persona equipo de trabajo).
   * @returns lista de memorias filtradas.
   */
  private filterEquipoTrabajo(value: string | IEquipoTrabajo): IEquipoTrabajo[] {
    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.persona.nombre.toLowerCase()
        + ' ' + value.persona.apellidos.toLowerCase();
    }

    return this.equipoTrabajoListado?.filter
      (equipoTrabajo => (equipoTrabajo.persona.nombre.toLowerCase()
        + ' ' + equipoTrabajo.persona.apellidos.toLowerCase()).includes(filterValue));
  }

  protected getDatosForm(): PeticionEvaluacionTareasModalComponentData {
    if (this.mostrarOrganismoYanio) {
      this.data.tarea.organismo = this.formGroup.controls.organismo.value;
      this.data.tarea.anio = this.formGroup.controls.anio.value;
    } else {
      this.data.tarea.organismo = null;
      this.data.tarea.anio = null;
    }

    if (this.tareaYformacionTexto) {
      this.data.tarea.tipoTarea = null;
      this.data.tarea.formacionEspecifica = null;
      this.data.tarea.tarea = this.formGroup.controls.tarea.value;
      this.data.tarea.formacion = this.formGroup.controls.formacion.value;
    } else {
      this.data.tarea.tarea = null;
      this.data.tarea.formacion = null;
      this.data.tarea.tipoTarea = this.formGroup.controls.tipoTarea.value;
      this.data.tarea.formacionEspecifica = this.formGroup.controls.formacionEspecifica.value;
    }

    this.data.tarea.memoria = this.formGroup.controls.memoria.value;
    this.data.tarea.equipoTrabajo = this.formGroup.controls.equipoTrabajo.value;

    return this.data;
  }

  protected getFormGroup(): FormGroup {
    const formGroup = new FormGroup({
      tarea: new FormControl(this.data.tarea?.tarea),
      tipoTarea: new FormControl(this.data.tarea?.tipoTarea),
      organismo: new FormControl(this.data.tarea?.organismo),
      anio: new FormControl(this.data.tarea?.anio),
      formacionEspecifica: new FormControl(this.data.tarea?.formacionEspecifica),
      formacion: new FormControl(this.data.tarea?.formacion),
      memoria: new FormControl(this.data.tarea?.memoria, [Validators.required]),
      equipoTrabajo: new FormControl(this.data.tarea?.equipoTrabajo == null ? '' : this.data.tarea?.equipoTrabajo, [Validators.required])
    });

    return formGroup;
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
