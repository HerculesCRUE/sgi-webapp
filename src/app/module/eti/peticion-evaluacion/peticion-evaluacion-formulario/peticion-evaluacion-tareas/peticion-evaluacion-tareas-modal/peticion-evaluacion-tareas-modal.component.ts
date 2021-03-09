import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IEquipoTrabajo } from '@core/models/eti/equipo-trabajo';
import { FormacionEspecifica } from '@core/models/eti/formacion-especifica';
import { IMemoria } from '@core/models/eti/memoria';
import { ITarea } from '@core/models/eti/tarea';
import { TipoTarea } from '@core/models/eti/tipo-tarea';
import { IPersona } from '@core/models/sgp/persona';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { EquipoTrabajoService } from '@core/services/eti/equipo-trabajo.service';
import { FormacionEspecificaService } from '@core/services/eti/formacion-especifica.service';
import { MemoriaService } from '@core/services/eti/memoria.service';
import { TareaService } from '@core/services/eti/tarea.service';
import { TipoTareaService } from '@core/services/eti/tipo-tarea.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

const MSG_ERROR_FORM = marker('form-group.error');
const MSG_ERROR = marker('eti.peticionEvaluacion.tareas.personas.no-encontrado');

@Component({
  selector: 'sgi-peticion-evaluacion-tareas-modal',
  templateUrl: './peticion-evaluacion-tareas-modal.component.html',
  styleUrls: ['./peticion-evaluacion-tareas-modal.component.scss']
})
export class PeticionEvaluacionTareasModalComponent implements OnInit, OnDestroy {

  FormGroupUtil = FormGroupUtil;
  formGroup: FormGroup;
  fxLayoutProperties: FxLayoutProperties;

  tareaSuscripcion: Subscription;

  formacionListado: FormacionEspecifica[];
  formacionesSubscription: Subscription;
  filteredFormaciones: Observable<FormacionEspecifica[]>;

  memoriaListado: IMemoria[];
  memoriasSubscription: Subscription;
  filteredMemorias: Observable<IMemoria[]>;

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

  constructor(
    private readonly logger: NGXLogger,
    public readonly matDialogRef: MatDialogRef<PeticionEvaluacionTareasModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      tarea: ITarea,
      equiposTrabajo: IEquipoTrabajo[],
      memorias: IMemoria[]
    },
    private readonly snackBarService: SnackBarService,
    protected readonly tareaService: TareaService,
    protected readonly formacionService: FormacionEspecificaService,
    protected readonly memoriaService: MemoriaService,
    protected readonly equipoTrabajoService: EquipoTrabajoService,
    protected readonly personaFisicaService: PersonaFisicaService,
    protected readonly tipoTareaService: TipoTareaService
  ) {
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'column';
  }

  ngOnInit(): void {
    this.mostrarOrganismoYanioSubscription = this.mostrarOrganismoYanio$.subscribe(mostrar => {
      this.mostrarOrganismoYanio = mostrar;
    });
    this.tareaYformacionTextoSubscription = this.tareaYformacionTexto$.subscribe(mostrar => {
      this.tareaYformacionTexto = mostrar;
    });
    this.initFormGroup();
    this.loadFormaciones();
    this.loadMemorias();
    this.loadEquiposTrabajo();
    this.loadTipoTareas();
  }

  /**
   * Inicializa el formGroup
   */
  private initFormGroup() {
    this.formGroup = new FormGroup({
      tarea: new FormControl(this.data.tarea?.tarea),
      tipoTarea: new FormControl(this.data.tarea?.tipoTarea),
      organismo: new FormControl(this.data.tarea?.organismo),
      anio: new FormControl(this.data.tarea?.anio),
      formacionEspecifica: new FormControl(this.data.tarea?.formacionEspecifica),
      formacion: new FormControl(this.data.tarea?.formacion),
      memoria: new FormControl(this.data.tarea?.memoria, [Validators.required]),
      equipoTrabajo: new FormControl(this.data.tarea?.equipoTrabajo == null ? '' : this.data.tarea?.equipoTrabajo, [Validators.required])
    });
    this.onClickMemoria(this.data.tarea?.memoria);
  }

  /**
   * Cierra la ventana modal y devuelve el asistencia si se ha modificado
   *
   * @param tarea asistencia modificada
   */
  closeModal(tarea?: ITarea): void {
    this.matDialogRef.close(tarea);
  }

  /**
   * Comprueba el formulario y envia la tarea resultante
   */
  addTarea() {
    if (FormGroupUtil.valid(this.formGroup)) {
      this.closeModal(this.getDatosForm());
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM);
    }
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
  private filterMemoria(value: string | IMemoria): IMemoria[] {
    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.titulo.toLowerCase();
    }

    return this.memoriaListado?.filter
      (memoria => memoria.titulo.toLowerCase().includes(filterValue));
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
    return equipoTrabajo?.nombre + ' ' + equipoTrabajo?.primerApellido + ' ' + equipoTrabajo?.segundoApellido;
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
      this.personaServiceOneSubscritpion = this.personaFisicaService.getInformacionBasica(equipoTrabajo.personaRef)
        .subscribe(
          (persona: IPersona) => {
            equipoTrabajo.nombre = persona.nombre;
            equipoTrabajo.primerApellido = persona.primerApellido;
            equipoTrabajo.segundoApellido = persona.segundoApellido;
            equipoTrabajo.identificadorNumero = persona.identificadorNumero;
            equipoTrabajo.identificadorLetra = persona.identificadorLetra;
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
      filterValue = value.nombre.toLowerCase() + ' ' + value.primerApellido.toLowerCase() + ' ' + value.segundoApellido.toLowerCase();
    }

    return this.equipoTrabajoListado?.filter
      (equipoTrabajo => (equipoTrabajo.nombre.toLowerCase() + ' ' + equipoTrabajo.primerApellido.toLowerCase() + ' ' +
        equipoTrabajo.segundoApellido.toLowerCase()).includes(filterValue));
  }

  /**
   * Método para actualizar la entidad con los datos de un formGroup
   */
  private getDatosForm(): ITarea {
    const tarea = this.data.tarea;
    if (this.mostrarOrganismoYanio) {
      tarea.organismo = FormGroupUtil.getValue(this.formGroup, 'organismo');
      tarea.anio = FormGroupUtil.getValue(this.formGroup, 'anio');
    } else {
      tarea.organismo = null;
      tarea.anio = null;
    }

    if (this.tareaYformacionTexto) {
      tarea.tipoTarea = null;
      tarea.formacionEspecifica = null;
      tarea.tarea = FormGroupUtil.getValue(this.formGroup, 'tarea');
      tarea.formacion = FormGroupUtil.getValue(this.formGroup, 'formacion');
    } else {
      tarea.tarea = null;
      tarea.formacion = null;
      tarea.tipoTarea = FormGroupUtil.getValue(this.formGroup, 'tipoTarea');
      tarea.formacionEspecifica = FormGroupUtil.getValue(this.formGroup, 'formacionEspecifica');
    }

    tarea.memoria = FormGroupUtil.getValue(this.formGroup, 'memoria');
    tarea.equipoTrabajo = FormGroupUtil.getValue(this.formGroup, 'equipoTrabajo');
    return tarea;
  }

  ngOnDestroy(): void {
    this.tareaSuscripcion?.unsubscribe();
    this.mostrarOrganismo$?.unsubscribe();
  }
}
