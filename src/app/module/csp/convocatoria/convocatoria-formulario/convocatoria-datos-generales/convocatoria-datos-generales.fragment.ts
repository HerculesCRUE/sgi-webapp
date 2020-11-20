import { FormFragment } from '@core/services/action-service';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, EMPTY, BehaviorSubject, of, from, merge } from 'rxjs';
import { catchError, map, mergeMap, switchMap, take, takeLast, tap } from 'rxjs/operators';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { EmpresaEconomicaService } from '@core/services/sgp/empresa-economica.service';
import { IsEntityValidator } from '@core/validators/is-entity-validador';
import { IConvocatoriaAreaTematica } from '@core/models/csp/convocatoria-area-tematica';
import { NGXLogger } from 'ngx-logger';
import { ConvocatoriaEntidadGestoraService } from '@core/services/csp/convocatoria-entidad-gestora.service';
import { IConvocatoriaEntidadGestora } from '@core/models/csp/convocatoria-entidad-gestora';
import { UnidadGestionService } from '@core/services/csp/unidad-gestion.service';
import { SgiRestFilter, SgiRestFilterType, SgiRestFindOptions } from '@sgi/framework/http';
import { EnumValidador } from '@core/validators/enum-validador';
import { TipoEstadoConvocatoria } from '@core/enums/tipo-estado-convocatoria';
import { IsYearPlus } from '@core/validators/is-year-plus';
import { ClasificacionCVN } from '@core/enums/clasificacion-cvn';
import { TipoDestinatario } from '@core/enums/tipo-destinatario';
import { ConvocatoriaAreaTematicaService } from '@core/services/csp/convocatoria-area-tematica.service';
import { IAreaTematica } from '@core/models/csp/area-tematica';

export interface AreaTematicaData {
  padre: IAreaTematica;
  convocatoriaAreaTematica: StatusWrapper<IConvocatoriaAreaTematica>;
  observaciones: string;
}

export class ConvocatoriaDatosGeneralesFragment extends FormFragment<IConvocatoria> {
  areasTematicas$ = new BehaviorSubject<AreaTematicaData[]>([]);
  private convocatoriaAreaTematicaEliminadas: StatusWrapper<IConvocatoriaAreaTematica>[] = [];

  convocatoria: IConvocatoria;
  selectedEmpresaEconomica: IEmpresaEconomica;
  convocatoriaEntidadGestora: IConvocatoriaEntidadGestora;

  constructor(
    private logger: NGXLogger,
    key: number,
    private convocatoriaService: ConvocatoriaService,
    private empresaEconomicaService: EmpresaEconomicaService,
    private convocatoriaEntidadGestoraService: ConvocatoriaEntidadGestoraService,
    private unidadGestionService: UnidadGestionService,
    private convocatoriaAreaTematicaService: ConvocatoriaAreaTematicaService
  ) {
    super(key, true);
    this.setComplete(true);
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name, 'constructor()', 'start');
    this.convocatoria = {
      activo: true,
      estadoActual: TipoEstadoConvocatoria.BORRADOR
    } as IConvocatoria;
    this.convocatoriaEntidadGestora = {} as IConvocatoriaEntidadGestora;
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name, 'constructor()', 'start');
  }

  protected buildFormGroup(): FormGroup {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name, 'buildFormGroup()', 'start');
    const form = new FormGroup({
      codigo: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      estadoActual: new FormControl({
        value: TipoEstadoConvocatoria.BORRADOR,
        disabled: true
      }),
      unidadGestion: new FormControl('', [Validators.required, IsEntityValidator.isValid()]),
      anio: new FormControl(new Date().getFullYear(), [
        Validators.required,
        Validators.min(1000),
        Validators.max(9999),
        IsYearPlus.isValid(1)
      ]),
      titulo: new FormControl('', [Validators.required, Validators.maxLength(250)]),
      modeloEjecucion: new FormControl(''),
      finalidad: new FormControl(''),
      duracion: new FormControl('', [Validators.min(1), Validators.max(9999)]),
      ambitoGeografico: new FormControl(''),
      clasificacionCVN: new FormControl('', EnumValidador.isValid(ClasificacionCVN)),
      regimenConcurrencia: new FormControl(''),
      colaborativos: new FormControl(null),
      destinatarios: new FormControl('', [Validators.required, EnumValidador.isValid(TipoDestinatario)]),
      entidadGestora: new FormControl(''),
      objeto: new FormControl('', Validators.maxLength(2000)),
      observaciones: new FormControl('', Validators.maxLength(2000)),
      entidadGestoraRef: new FormControl(''),
    });
    this.checkEstado(form, this.convocatoria);
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name, 'buildFormGroup()', 'start');
    return form;
  }

  buildPatch(convocatoria: IConvocatoria): { [key: string]: any } {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `buildPatch(convocatoria: ${convocatoria})`, 'start');
    const result = {
      modeloEjecucion: convocatoria.modeloEjecucion,
      codigo: convocatoria.codigo,
      anio: convocatoria.anio,
      titulo: convocatoria.titulo,
      objeto: convocatoria.objeto,
      observaciones: convocatoria.observaciones,
      finalidad: convocatoria.finalidad,
      regimenConcurrencia: convocatoria.regimenConcurrencia,
      destinatarios: convocatoria.destinatarios,
      colaborativos: convocatoria.colaborativos,
      estadoActual: convocatoria.estadoActual,
      duracion: convocatoria.duracion,
      ambitoGeografico: convocatoria.ambitoGeografico,
      clasificacionCVN: convocatoria.clasificacionCVN,
    };
    this.checkEstado(this.getFormGroup(), convocatoria);
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `buildPatch(convocatoria: ${convocatoria})`, 'end');
    return result;
  }

  /**
   * Añade validadores al formulario dependiendo del estado de la convocatoria
   */
  private checkEstado(formgroup: FormGroup, convocatoria: IConvocatoria): void {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `checkEstado(formgroup: ${formgroup}, convocatoria: ${convocatoria})`, 'start');
    if (convocatoria.estadoActual === TipoEstadoConvocatoria.BORRADOR) {
      formgroup.get('modeloEjecucion').setValidators(IsEntityValidator.isValid());
      formgroup.get('finalidad').setValidators(IsEntityValidator.isValid());
      formgroup.get('ambitoGeografico').setValidators(IsEntityValidator.isValid());
    } else {
      formgroup.get('modeloEjecucion').setValidators([
        Validators.required, IsEntityValidator.isValid()]);
      formgroup.get('finalidad').setValidators([Validators.required, IsEntityValidator.isValid()]);
      formgroup.get('ambitoGeografico').setValidators([
        Validators.required, IsEntityValidator.isValid()]);
    }
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `checkEstado(formgroup: ${formgroup}, convocatoria: ${convocatoria})`, 'end');
  }

  isEstadoRegistrada() {
    return this.convocatoria.estadoActual === TipoEstadoConvocatoria.REGISTRADA;
  }

  protected initializer(key: number): Observable<IConvocatoria> {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `initializer(key: ${key})`, 'start');
    return this.convocatoriaService.findById(key).pipe(
      switchMap((value) => {
        this.convocatoria = value;
        this.loadUnidadGestion();
        return this.convocatoriaService.findAllConvocatoriaEntidadGestora(key).pipe(
          switchMap((listResult) => {
            const convocatoriasEntidadConvocantes = listResult.items;
            if (convocatoriasEntidadConvocantes.length > 0) {
              const entidadRef = convocatoriasEntidadConvocantes[0].entidadRef;
              this.getFormGroup().controls.entidadGestoraRef.setValue(entidadRef);
              this.loadEmpresaEconomica(entidadRef);
              this.convocatoriaEntidadGestora = convocatoriasEntidadConvocantes[0];
            }
            return of(this.convocatoria);
          })
        );
      }),
      tap(() => this.loadAreasTematicas(key)),
      tap(() => this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
        `initializer(key: ${key})`, 'end')),
      catchError(() => {
        this.logger.error(ConvocatoriaDatosGeneralesFragment.name,
          `initializer(key: ${key})`, 'error');
        return EMPTY;
      })
    );
  }

  private loadEmpresaEconomica(personaRef: string): void {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `loadEmpresaEconomica(personaRef: ${personaRef})`, 'start');
    const subscription = this.empresaEconomicaService.findById(personaRef).subscribe(
      empresaEconomica => {
        this.selectedEmpresaEconomica = empresaEconomica;
        this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
          `loadEmpresaEconomica(personaRef: ${personaRef})`, 'end');
      },
      (error) => {
        this.logger.error(ConvocatoriaDatosGeneralesFragment.name,
          `loadEmpresaEconomica(personaRef: ${personaRef})`, error);
      }
    );
    this.subscriptions.push(subscription);
  }

  private loadUnidadGestion(): void {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name, `loadUnidadGestion()`, 'start');
    const options = {
      filters: [
        {
          field: 'acronimo',
          type: SgiRestFilterType.LIKE,
          value: this.convocatoria.unidadGestionRef,
        } as SgiRestFilter
      ]
    } as SgiRestFindOptions;
    const subscription = this.unidadGestionService.findAll(options).subscribe(
      result => {
        if (result.items.length > 0) {
          this.getFormGroup().get('unidadGestion').setValue(result.items[0]);
        }
        this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
          `loadUnidadGestion()`, 'end');
      },
      (error) => {
        this.logger.error(ConvocatoriaDatosGeneralesFragment.name,
          `loadUnidadGestion()`, error);
      }
    );
    this.subscriptions.push(subscription);
  }

  private loadAreasTematicas(id: number): void {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `loadAreasTematicas(id: ${id})`, 'start');
    const subscription = this.convocatoriaService.findAreaTematicas(id).pipe(
      map(response => response.items),
      map(convocatoriasAreaTematicas => {
        const list: AreaTematicaData[] = [];
        convocatoriasAreaTematicas.forEach(
          convocatoriaAreaTematica => {
            const element: AreaTematicaData = {
              padre: undefined,
              convocatoriaAreaTematica: new StatusWrapper<IConvocatoriaAreaTematica>(convocatoriaAreaTematica),
              observaciones: convocatoriaAreaTematica.observaciones
            };
            list.push(this.loadAreaData(element));
          }
        );
        return list;
      })
    ).subscribe(areas => {
      this.areasTematicas$.next(areas);
      this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
        `loadAreasTematicas(id: ${id})`, 'end');
    });
    this.subscriptions.push(subscription);
  }

  private getSecondLevelAreaTematica(areaTematica: IAreaTematica): IAreaTematica {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `getSecondLevelAreaTematica(areaTematica: ${areaTematica})`, 'start');
    if (areaTematica?.padre?.padre) {
      this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
        `getSecondLevelAreaTematica(areaTematica: ${areaTematica})`, 'end');
      return this.getSecondLevelAreaTematica(areaTematica.padre);
    }
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `getSecondLevelPrograma(areaTematica: ${areaTematica})`, 'end');
    return areaTematica;
  }

  private loadAreaData(data: AreaTematicaData): AreaTematicaData {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name, `loadData(data: ${data})`, 'start');
    let areaTematica = data.convocatoriaAreaTematica.value.areaTematica;
    if (areaTematica) {
      const result = this.getSecondLevelAreaTematica(areaTematica);
      const padre = result.padre ? result.padre : areaTematica;
      areaTematica = padre.id === areaTematica.id ? undefined : areaTematica;
      const element: AreaTematicaData = {
        padre,
        observaciones: data.convocatoriaAreaTematica.value.observaciones,
        convocatoriaAreaTematica: data.convocatoriaAreaTematica,
      };
      this.logger.debug(ConvocatoriaDatosGeneralesFragment.name, `loadData(data: ${data})`, 'end');
      return element;
    }
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name, `loadData(data: ${data})`, 'end');
    return data;
  }

  getValue(): IConvocatoria {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name, `getValue()`, 'start');
    const form = this.getFormGroup().value;
    this.convocatoria.unidadGestionRef = form.unidadGestion.acronimo;
    if (form.modeloEjecucion) {
      this.convocatoria.modeloEjecucion = form.modeloEjecucion;
    } else {
      this.convocatoria.modeloEjecucion = undefined;
    }
    this.convocatoria.codigo = form.codigo;
    this.convocatoria.anio = form.anio;
    this.convocatoria.titulo = form.titulo;
    this.convocatoria.objeto = form.objeto;
    this.convocatoria.observaciones = form.observaciones;
    if (typeof form.finalidad === 'string') {
      this.convocatoria.finalidad = undefined;
    } else {
      this.convocatoria.finalidad = form.finalidad;
    }
    if (typeof form.regimenConcurrencia === 'string') {
      this.convocatoria.regimenConcurrencia = undefined;
    } else {
      this.convocatoria.regimenConcurrencia = form.regimenConcurrencia;
    }
    if (form.destinatarios?.length > 0) {
      this.convocatoria.destinatarios = form.destinatarios;
    } else {
      this.convocatoria.destinatarios = undefined;
    }
    this.convocatoria.colaborativos = form.colaborativos;
    this.convocatoria.duracion = form.duracion;
    if (typeof form.ambitoGeografico === 'string') {
      this.convocatoria.ambitoGeografico = undefined;
    } else {
      this.convocatoria.ambitoGeografico = form.ambitoGeografico;
    }
    if (form.clasificacionCVN?.length > 0) {
      this.convocatoria.clasificacionCVN = form.clasificacionCVN;
    } else {
      this.convocatoria.clasificacionCVN = undefined;
    }
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name, `getValue()`, 'end');
    return this.convocatoria;
  }

  saveOrUpdate(): Observable<number> {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name, `saveOrUpdate()`, 'start');
    const convocatoria = this.getValue();
    const observable$ = this.isEdit() ? this.update(convocatoria) :
      this.create(convocatoria);
    return observable$.pipe(
      map(value => {
        this.convocatoria = value;
        return this.convocatoria.id;
      }),
      tap(() => this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
        `saveOrUpdate()`, 'end'))
    );
  }

  private create(convocatoria: IConvocatoria): Observable<IConvocatoria> {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `create(convocatoria: ${convocatoria})`, 'start');
    return this.convocatoriaService.create(convocatoria).pipe(
      tap(result => this.convocatoria = result),
      switchMap((result) => this.saveOrUpdateConvocatoriaEntidadConvocante(result)),
      switchMap((result) => this.saveOrUpdateAreasTematicas(result)),
      tap(() => this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
        `create(convocatoria: ${convocatoria})`, 'end'))
    );
  }

  private update(convocatoria: IConvocatoria): Observable<IConvocatoria> {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `update(convocatoria: ${convocatoria})`, 'start');
    return this.convocatoriaService.update(convocatoria.id, convocatoria).pipe(
      tap(result => this.convocatoria = result),
      switchMap((result) => this.saveOrUpdateConvocatoriaEntidadConvocante(result)),
      switchMap((result) => this.saveOrUpdateAreasTematicas(result)),
      tap(() => this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
        `update(convocatoria: ${convocatoria})`, 'end'))
    );
  }

  private saveOrUpdateConvocatoriaEntidadConvocante(result: IConvocatoria): Observable<IConvocatoria> {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `saveOrUpdateConvocatoriaEntidadConvocante(result: ${result})`, 'start');
    let observable$ = of({});
    const entidadRef = this.getFormGroup().controls.entidadGestoraRef.value;
    this.convocatoriaEntidadGestora.convocatoria = result;
    if (entidadRef) {
      observable$ = this.convocatoriaEntidadGestora.id ?
        this.updateConvocatoriaEntidadConvocante() : this.createConvocatoriaEntidadConvocante();
    }
    return observable$.pipe(
      switchMap(() => of(result)),
      tap(() => this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
        `saveOrUpdateConvocatoriaEntidadConvocante(result: ${result})`, 'end'))
    );
  }

  private createConvocatoriaEntidadConvocante(): Observable<IConvocatoriaEntidadGestora> {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `createConvocatoriaEntidadConvocante()`, 'start');
    return this.convocatoriaEntidadGestoraService.create(this.convocatoriaEntidadGestora).pipe(
      tap(result => this.convocatoriaEntidadGestora = result),
      tap(() => this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
        `createConvocatoriaEntidadConvocante()`, 'end'))
    );
  }

  private updateConvocatoriaEntidadConvocante(): Observable<IConvocatoriaEntidadGestora> {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `updateConvocatoriaEntidadConvocante()`, 'start');
    return this.convocatoriaEntidadGestoraService.update(
      this.convocatoriaEntidadGestora.id, this.convocatoriaEntidadGestora).pipe(
        tap(result => this.convocatoriaEntidadGestora = result),
        tap(() => this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
          `updateConvocatoriaEntidadConvocante()`, 'end'))
      );
  }

  setEmpresaEconomica(empresaEconomica: IEmpresaEconomica): void {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `setEmpresaEconomica(value: ${empresaEconomica})`, 'start');
    const entidadRef = empresaEconomica.personaRef;
    if (this.isEdit()) {
      const changed = this.getFormGroup().controls.entidadGestoraRef.value !== entidadRef;
      this.setChanges(changed);
    } else if (!this.isEdit()) {
      this.setComplete(!!empresaEconomica);
      this.setChanges(!!empresaEconomica);
    }
    this.selectedEmpresaEconomica = empresaEconomica;
    this.convocatoriaEntidadGestora.entidadRef = entidadRef;
    this.getFormGroup().controls.entidadGestoraRef.setValue(entidadRef);
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `setEmpresaEconomica(value: ${empresaEconomica})`, 'end');
  }

  getEmpresaEconomica(): IEmpresaEconomica {
    return this.selectedEmpresaEconomica;
  }

  get empresaEconomicaText(): string {
    return this.selectedEmpresaEconomica ? this.selectedEmpresaEconomica.razonSocial : '';
  }

  deleteConvocatoriaAreaTematica(data: AreaTematicaData) {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `deleteConvocatoriaAreaTematica(wrapper: ${data})`, 'start');
    const current = this.areasTematicas$.value;
    const index = current.findIndex(element =>
      element.convocatoriaAreaTematica.value === data.convocatoriaAreaTematica.value);
    if (index >= 0) {
      this.convocatoriaAreaTematicaEliminadas.push(current[index].convocatoriaAreaTematica);
      current.splice(index, 1);
      this.areasTematicas$.next(current);
      this.setChanges(true);
    }
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `deleteConvocatoriaAreaTematica(wrapper: ${data})`, 'end');
  }

  updateConvocatoriaAreaTematica(data: AreaTematicaData) {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `updateConvocatoriaAreaTematica(wrapper: ${data})`, 'start');
    const element = this.loadAreaData(data);
    const wrapper = new StatusWrapper<AreaTematicaData>(element);
    const current = this.areasTematicas$.value;
    const index = current.findIndex(value =>
      value.convocatoriaAreaTematica.value === data.convocatoriaAreaTematica.value);
    if (index >= 0) {
      wrapper.setEdited();
      this.areasTematicas$.value[index] = wrapper.value;
      this.areasTematicas$.next(current);
      this.setChanges(true);
    }
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `${this.updateConvocatoriaAreaTematica.name}(wrapper: ${data})`, 'end');
  }

  addConvocatoriaAreaTematica(data: AreaTematicaData) {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `addConvocatoriaAreaTematica(areaTematica: ${data})`, 'start');
    const element = this.loadAreaData(data);
    const wrapper = new StatusWrapper<AreaTematicaData>(element);
    wrapper.setCreated();
    const current = this.areasTematicas$.value;
    current.push(wrapper.value);
    this.areasTematicas$.next(current);
    this.setChanges(true);
    this.setErrors(false);
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `addConvocatoriaAreaTematica(areaTematica: ${data})`, 'end');
  }

  saveOrUpdateAreasTematicas(result: IConvocatoria): Observable<IConvocatoria> {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `saveOrUpdateAreasTematicas()`, 'start');
    return merge(
      this.deleteConvocatoriaAreaTematicas(),
      this.updateConvocatoriaAreaTematicas(),
      this.createConvocatoriaAreaTematicas()
    ).pipe(
      takeLast(1),
      switchMap(() => of(result)),
      tap(() => this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
        `saveOrUpdateAreasTematicas()`, 'end'))
    );
  }

  private deleteConvocatoriaAreaTematicas(): Observable<void> {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `deleteConvocatoriaAreaTematicas()`, 'start');
    const deleteEntidades = this.convocatoriaAreaTematicaEliminadas.filter((value) => value.value.id);
    if (deleteEntidades.length === 0) {
      this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
        `deleteConvocatoriaAreaTematicas()`, 'end');
      return of(void 0);
    }
    return from(deleteEntidades).pipe(
      mergeMap((wrapped) => {
        return this.convocatoriaAreaTematicaService.deleteById(wrapped.value.id)
          .pipe(
            tap(() => {
              this.convocatoriaAreaTematicaEliminadas =
                this.convocatoriaAreaTematicaEliminadas.filter(deletedModelo =>
                  deletedModelo.value.id !== wrapped.value.id);
            }),
            tap(() => this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
              `deleteConvocatoriaAreaTematicas()`, 'end'))
          );
      })
    );
  }

  private updateConvocatoriaAreaTematicas(): Observable<void> {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `updateConvocatoriaAreaTematicas()`, 'start');
    const editedAreas = this.areasTematicas$.value.filter(
      (wrapper) => wrapper.convocatoriaAreaTematica.value.id);
    if (editedAreas.length === 0) {
      this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
        `updateConvocatoriaAreaTematicas()`, 'end');
      return of(void 0);
    }
    return from(editedAreas).pipe(
      mergeMap((data) => {
        return this.convocatoriaAreaTematicaService.update(
          data.convocatoriaAreaTematica.value.id, data.convocatoriaAreaTematica.value).pipe(
            map((updated) => {
              const index = this.areasTematicas$.value.findIndex(
                (current) => current === data);
              const element: AreaTematicaData = {
                padre: undefined,
                convocatoriaAreaTematica: new StatusWrapper<IConvocatoriaAreaTematica>(updated),
                observaciones: updated.observaciones
              };
              this.areasTematicas$.value[index] = this.loadAreaData(element);
            }),
            tap(() => this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
              `updateConvocatoriaAreaTematicas()`, 'end')
            )
          );
      })
    );
  }

  private createConvocatoriaAreaTematicas(): Observable<void> {
    this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
      `createConvocatoriaAreaTematicas()`, 'start');
    const createdAreas = this.areasTematicas$.value.filter((wrapper) => !wrapper.convocatoriaAreaTematica.value.id);
    if (createdAreas.length === 0) {
      this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
        `createConvocatoriaAreaTematicas()`, 'end');
      return of(void 0);
    }
    createdAreas.forEach(
      (wrapper) => wrapper.convocatoriaAreaTematica.value.convocatoria = this.convocatoria
    );
    return from(createdAreas).pipe(
      mergeMap((data) => {
        return this.convocatoriaAreaTematicaService.create(data.convocatoriaAreaTematica.value).pipe(
          map((createdEntidad) => {
            const index = this.areasTematicas$.value.findIndex(
              (currentEntidad) => currentEntidad === data);
            this.areasTematicas$[index] =
              new StatusWrapper<IConvocatoriaAreaTematica>(createdEntidad);
          }),
          tap(() => this.logger.debug(ConvocatoriaDatosGeneralesFragment.name,
            `createConvocatoriaAreaTematicas()`, 'end'))
        );
      })
    );
  }
}
