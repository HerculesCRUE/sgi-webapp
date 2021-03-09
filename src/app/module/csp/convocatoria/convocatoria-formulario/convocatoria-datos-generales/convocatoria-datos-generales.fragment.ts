import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IAreaTematica } from '@core/models/csp/area-tematica';
import { Destinatarios, Estado, IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaAreaTematica } from '@core/models/csp/convocatoria-area-tematica';
import { IConvocatoriaEntidadGestora } from '@core/models/csp/convocatoria-entidad-gestora';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { IUnidadGestion } from '@core/models/usr/unidad-gestion';
import { FormFragment } from '@core/services/action-service';
import { ConvocatoriaAreaTematicaService } from '@core/services/csp/convocatoria-area-tematica.service';
import { ConvocatoriaEntidadGestoraService } from '@core/services/csp/convocatoria-entidad-gestora.service';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { UnidadGestionService } from '@core/services/csp/unidad-gestion.service';
import { EmpresaEconomicaService } from '@core/services/sgp/empresa-economica.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { IsEntityValidator } from '@core/validators/is-entity-validador';
import { IsYearPlus } from '@core/validators/is-year-plus';
import { RSQLSgiRestFilter, SgiRestFilterOperator, SgiRestFindOptions } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, EMPTY, from, merge, Observable, of, Subject } from 'rxjs';
import { catchError, map, mergeMap, switchMap, takeLast, tap } from 'rxjs/operators';

export interface AreaTematicaData {
  padre: IAreaTematica;
  convocatoriaAreaTematica: StatusWrapper<IConvocatoriaAreaTematica>;
  observaciones: string;
}

export class ConvocatoriaDatosGeneralesFragment extends FormFragment<IConvocatoria> {
  areasTematicas$ = new BehaviorSubject<AreaTematicaData[]>([]);
  private convocatoriaAreaTematicaEliminadas: StatusWrapper<IConvocatoriaAreaTematica>[] = [];

  convocatoria: IConvocatoria;
  private convocatoriaEntidadGestora: IConvocatoriaEntidadGestora;

  destinatariosValue$: Subject<Destinatarios> = new Subject<Destinatarios>();

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private convocatoriaService: ConvocatoriaService,
    private empresaEconomicaService: EmpresaEconomicaService,
    private convocatoriaEntidadGestoraService: ConvocatoriaEntidadGestoraService,
    private unidadGestionService: UnidadGestionService,
    private convocatoriaAreaTematicaService: ConvocatoriaAreaTematicaService,
    public readonly: boolean
  ) {
    super(key, true);
    this.setComplete(true);
    this.convocatoria = {
      activo: true,
      estado: Estado.BORRADOR
    } as IConvocatoria;
    this.convocatoriaEntidadGestora = {} as IConvocatoriaEntidadGestora;
  }

  protected buildFormGroup(): FormGroup {
    const form = new FormGroup({
      codigo: new FormControl('', [
        Validators.required, Validators.maxLength(50)]),
      estado: new FormControl({
        value: Estado.BORRADOR,
        disabled: true
      }),
      unidadGestion: new FormControl('', [
        Validators.required, IsEntityValidator.isValid()]),
      anio: new FormControl(new Date().getFullYear(), [
        Validators.required,
        Validators.min(1000),
        Validators.max(9999),
        IsYearPlus.isValid(1)
      ]),
      titulo: new FormControl('', [
        Validators.required, Validators.maxLength(250)]),
      modeloEjecucion: new FormControl(''),
      finalidad: new FormControl(''),
      duracion: new FormControl('', [
        Validators.min(1), Validators.max(9999)]),
      ambitoGeografico: new FormControl(''),
      clasificacionCVN: new FormControl(null),
      regimenConcurrencia: new FormControl(''),
      colaborativos: new FormControl(null),
      destinatarios: new FormControl(null),
      entidadGestora: new FormControl(''),
      objeto: new FormControl('',
        Validators.maxLength(2000)),
      observaciones: new FormControl('',
        Validators.maxLength(2000))
    });
    if (this.readonly) {
      form.disable();
    }

    this.subscriptions.push(
      form.controls.destinatarios.valueChanges.subscribe((value) => {
        this.destinatariosValue$.next(value);
      })
    );

    this.checkEstado(form, this.convocatoria);
    return form;
  }

  buildPatch(convocatoria: IConvocatoria): { [key: string]: any } {
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
      estado: convocatoria.estado,
      duracion: convocatoria.duracion,
      ambitoGeografico: convocatoria.ambitoGeografico,
      clasificacionCVN: convocatoria.clasificacionCVN,
    };

    this.checkEstado(this.getFormGroup(), convocatoria);
    return result;
  }

  /**
   * Añade validadores al formulario dependiendo del estado de la convocatoria
   */
  private checkEstado(formgroup: FormGroup, convocatoria: IConvocatoria): void {
    if (convocatoria.estado === Estado.BORRADOR) {
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
  }

  isEstadoRegistrada() {
    return this.convocatoria.estado === Estado.REGISTRADA;
  }

  protected initializer(key: number): Observable<IConvocatoria> {
    return this.convocatoriaService.findById(key).pipe(
      switchMap((value) => {
        this.convocatoria = value;
        return this.getUnidadGestion(value.unidadGestionRef).pipe(
          map(unidadGestion => {
            this.getFormGroup().get('unidadGestion').setValue(unidadGestion);
            return value;
          })
        );
      }),
      switchMap((convocatoria) => {
        return this.convocatoriaService.findAllConvocatoriaEntidadGestora(key).pipe(
          switchMap((listResult) => {
            const convocatoriasEntidadGestoras = listResult.items;
            if (convocatoriasEntidadGestoras.length > 0) {
              this.convocatoriaEntidadGestora = convocatoriasEntidadGestoras[0];
              return this.empresaEconomicaService.findById(this.convocatoriaEntidadGestora.empresaEconomica.personaRef).pipe(
                map((empresaEconomica) => {
                  this.getFormGroup().get('entidadGestora').setValue(empresaEconomica);
                  return convocatoria;
                })
              );
            }
            else {
              return of(convocatoria);
            }
          })
        );
      }),
      switchMap(convocatoria => {
        return this.convocatoriaService.vinculaciones(key).pipe(
          map(status => {
            if (status) {
              this.getFormGroup().controls.unidadGestion.disable();
              this.getFormGroup().controls.modeloEjecucion.disable();
            }
            return convocatoria;
          })
        );
      }),
      tap(() => this.loadAreasTematicas(key)),
      catchError((error) => {
        this.logger.error(error);
        return EMPTY;
      })
    );
  }

  private getUnidadGestion(unidadGestionRef: string): Observable<IUnidadGestion> {
    const options: SgiRestFindOptions = {
      filter: new RSQLSgiRestFilter('acronimo', SgiRestFilterOperator.EQUALS, unidadGestionRef)
    };
    return this.unidadGestionService.findAll(options).pipe(
      map(list => {
        if (list.items.length === 1) {
          return list.items[0];
        }
        else {
          return undefined;
        }
      })
    );
  }

  private loadAreasTematicas(id: number): void {
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
    });
    this.subscriptions.push(subscription);
  }

  private getSecondLevelAreaTematica(areaTematica: IAreaTematica): IAreaTematica {
    if (areaTematica?.padre?.padre) {
      return this.getSecondLevelAreaTematica(areaTematica.padre);
    }
    return areaTematica;
  }

  private loadAreaData(data: AreaTematicaData): AreaTematicaData {
    const areaTematica = data.convocatoriaAreaTematica.value.areaTematica;
    if (areaTematica) {
      const result = this.getSecondLevelAreaTematica(areaTematica);
      const padre = result.padre ? result.padre : areaTematica;
      const element: AreaTematicaData = {
        padre,
        observaciones: data.convocatoriaAreaTematica.value.observaciones,
        convocatoriaAreaTematica: data.convocatoriaAreaTematica,
      };
      return element;
    }
    return data;
  }

  getValue(): IConvocatoria {
    const form = this.getFormGroup().controls;
    this.convocatoria.unidadGestionRef = form.unidadGestion.value?.acronimo;
    if (typeof form.modeloEjecucion.value === 'string') {
      this.convocatoria.modeloEjecucion = undefined;
    } else {
      this.convocatoria.modeloEjecucion = form.modeloEjecucion.value;
    }
    this.convocatoria.codigo = form.codigo.value;
    this.convocatoria.anio = form.anio.value;
    this.convocatoria.titulo = form.titulo.value;
    this.convocatoria.objeto = form.objeto.value;
    this.convocatoria.observaciones = form.observaciones.value;
    if (typeof form.finalidad.value === 'string') {
      this.convocatoria.finalidad = undefined;
    } else {
      this.convocatoria.finalidad = form.finalidad.value;
    }
    if (typeof form.regimenConcurrencia.value === 'string') {
      this.convocatoria.regimenConcurrencia = undefined;
    } else {
      this.convocatoria.regimenConcurrencia = form.regimenConcurrencia.value;
    }
    this.convocatoria.destinatarios = form.destinatarios.value;
    this.convocatoria.colaborativos = form.colaborativos.value;
    this.convocatoria.duracion = form.duracion.value;
    if (typeof form.ambitoGeografico.value === 'string') {
      this.convocatoria.ambitoGeografico = undefined;
    } else {
      this.convocatoria.ambitoGeografico = form.ambitoGeografico.value;
    }
    this.convocatoria.clasificacionCVN = form.clasificacionCVN.value;

    return this.convocatoria;
  }

  saveOrUpdate(): Observable<number> {
    const convocatoria = this.getValue();
    const observable$ = this.isEdit() ? this.update(convocatoria) :
      this.create(convocatoria);
    return observable$.pipe(
      map(value => {
        this.convocatoria = value;
        return this.convocatoria.id;
      })
    );
  }

  private create(convocatoria: IConvocatoria): Observable<IConvocatoria> {
    return this.convocatoriaService.create(convocatoria).pipe(
      tap(result => this.convocatoria = result),
      switchMap((result) => this.saveOrUpdateConvocatoriaEntidadGestora(result)),
      switchMap((result) => this.saveOrUpdateAreasTematicas(result))
    );
  }

  private update(convocatoria: IConvocatoria): Observable<IConvocatoria> {
    return this.convocatoriaService.update(convocatoria.id, convocatoria).pipe(
      tap(result => this.convocatoria = result),
      switchMap((result) => this.saveOrUpdateConvocatoriaEntidadGestora(result)),
      switchMap((result) => this.saveOrUpdateAreasTematicas(result))
    );
  }

  private saveOrUpdateConvocatoriaEntidadGestora(result: IConvocatoria): Observable<IConvocatoria> {
    let observable$: Observable<any>;
    const entidadRef = this.getFormGroup().controls.entidadGestora.value?.personaRef;
    this.convocatoriaEntidadGestora.convocatoria = result;
    if (entidadRef !== this.convocatoriaEntidadGestora.empresaEconomica?.personaRef) {
      if (!entidadRef) {
        observable$ = this.deleteConvocatoriaEntidadGestora();
      }
      else {
        observable$ = this.convocatoriaEntidadGestora.id ?
          this.updateConvocatoriaEntidadGestora() : this.createConvocatoriaEntidadGestora();
      }
      return observable$.pipe(
        map(() => result)
      );
    }
    return of(result);
  }

  private createConvocatoriaEntidadGestora(): Observable<IConvocatoriaEntidadGestora> {
    this.convocatoriaEntidadGestora.empresaEconomica = this.getFormGroup().controls.entidadGestora.value;
    return this.convocatoriaEntidadGestoraService.create(this.convocatoriaEntidadGestora).pipe(
      tap(result => {
        this.convocatoriaEntidadGestora = result;
        this.convocatoriaEntidadGestora.empresaEconomica = this.getFormGroup().controls.entidadGestora.value;
      })
    );
  }

  private updateConvocatoriaEntidadGestora(): Observable<IConvocatoriaEntidadGestora> {
    this.convocatoriaEntidadGestora.empresaEconomica = this.getFormGroup().controls.entidadGestora.value;
    return this.convocatoriaEntidadGestoraService.update(
      this.convocatoriaEntidadGestora.id, this.convocatoriaEntidadGestora).pipe(
        tap(result => {
          this.convocatoriaEntidadGestora = result;
          this.convocatoriaEntidadGestora.empresaEconomica = this.getFormGroup().controls.entidadGestora.value;
        })
      );
  }

  private deleteConvocatoriaEntidadGestora(): Observable<void> {
    this.convocatoriaEntidadGestora.empresaEconomica = this.getFormGroup().controls.entidadGestora.value;
    return this.convocatoriaEntidadGestoraService.deleteById(
      this.convocatoriaEntidadGestora.id).pipe(
        tap(() => {
          this.convocatoriaEntidadGestora = {} as IConvocatoriaEntidadGestora;
          this.convocatoriaEntidadGestora.empresaEconomica = {} as IEmpresaEconomica;
        })
      );
  }

  deleteConvocatoriaAreaTematica(data: AreaTematicaData) {
    const current = this.areasTematicas$.value;
    const index = current.findIndex(element =>
      element.convocatoriaAreaTematica.value === data.convocatoriaAreaTematica.value);
    if (index >= 0) {
      this.convocatoriaAreaTematicaEliminadas.push(current[index].convocatoriaAreaTematica);
      current.splice(index, 1);
      this.areasTematicas$.next(current);
      this.setChanges(true);
    }
  }

  updateConvocatoriaAreaTematica(data: AreaTematicaData) {
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
  }

  addConvocatoriaAreaTematica(data: AreaTematicaData) {
    const element = this.loadAreaData(data);
    const wrapper = new StatusWrapper<AreaTematicaData>(element);
    wrapper.setCreated();
    const current = this.areasTematicas$.value;
    current.push(wrapper.value);
    this.areasTematicas$.next(current);
    this.setChanges(true);
    this.setErrors(false);
  }

  saveOrUpdateAreasTematicas(result: IConvocatoria): Observable<IConvocatoria> {
    return merge(
      this.deleteConvocatoriaAreaTematicas(),
      this.updateConvocatoriaAreaTematicas(),
      this.createConvocatoriaAreaTematicas()
    ).pipe(
      takeLast(1),
      switchMap(() => of(result))
    );
  }

  private deleteConvocatoriaAreaTematicas(): Observable<void> {
    const deleteEntidades = this.convocatoriaAreaTematicaEliminadas.filter((value) => value.value.id);
    if (deleteEntidades.length === 0) {
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
            })
          );
      })
    );
  }

  private updateConvocatoriaAreaTematicas(): Observable<void> {
    const editedAreas = this.areasTematicas$.value.filter(
      (wrapper) => wrapper.convocatoriaAreaTematica.value.id);
    if (editedAreas.length === 0) {
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
            })
          );
      })
    );
  }

  private createConvocatoriaAreaTematicas(): Observable<void> {
    const createdAreas = this.areasTematicas$.value.filter((wrapper) => !wrapper.convocatoriaAreaTematica.value.id);
    if (createdAreas.length === 0) {
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
          })
        );
      })
    );
  }
}
