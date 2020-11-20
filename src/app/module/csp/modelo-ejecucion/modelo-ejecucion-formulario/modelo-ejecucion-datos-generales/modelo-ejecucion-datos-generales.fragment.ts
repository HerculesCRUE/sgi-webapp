import { FormControl, FormGroup } from '@angular/forms';
import { IModeloEjecucion } from '@core/models/csp/tipos-configuracion';
import { FormFragment } from '@core/services/action-service';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { NGXLogger } from 'ngx-logger';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export class ModeloEjecucionDatosGeneralesFragment extends FormFragment<IModeloEjecucion> {
  modeloEjecucion: IModeloEjecucion;

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private modeloEjecucionService: ModeloEjecucionService
  ) {
    super(key);
    this.logger.debug(ModeloEjecucionDatosGeneralesFragment.name, 'constructor()', 'start');
    this.modeloEjecucion = {} as IModeloEjecucion;
    this.modeloEjecucion.activo = true;
    this.logger.debug(ModeloEjecucionDatosGeneralesFragment.name, 'constructor()', 'end');
  }

  protected buildFormGroup(): FormGroup {
    this.logger.debug(ModeloEjecucionDatosGeneralesFragment.name,
      `${this.buildFormGroup.name}()`, 'start');
    const fb = new FormGroup({
      nombre: new FormControl(''),
      descripcion: new FormControl(''),
    });
    this.logger.debug(ModeloEjecucionDatosGeneralesFragment.name,
      `${this.buildFormGroup.name}()`, 'end');
    return fb;
  }

  protected buildPatch(modelo: IModeloEjecucion): { [key: string]: any; } {
    this.logger.debug(ModeloEjecucionDatosGeneralesFragment.name,
      `${this.buildPatch.name}(modeloEjecucion: ${modelo})`, 'start');
    const result = {
      id: modelo.id,
      activo: modelo.activo,
      descripcion: modelo.descripcion,
      nombre: modelo.nombre
    } as IModeloEjecucion;
    this.modeloEjecucion = modelo;
    this.logger.debug(ModeloEjecucionDatosGeneralesFragment.name,
      `${this.buildPatch.name}(modeloEjecucion: ${modelo})`, 'end');
    return result;
  }

  protected initializer(key: number): Observable<IModeloEjecucion> {
    this.logger.debug(ModeloEjecucionDatosGeneralesFragment.name,
      `${this.initializer.name}(key: ${key})`, 'start');
    return this.modeloEjecucionService.findById(key).pipe(
      catchError(() => {
        this.logger.debug(ModeloEjecucionDatosGeneralesFragment.name,
          `${this.initializer.name}(key: ${key})`, 'end');
        return EMPTY;
      }),
      tap(() => {
        this.logger.debug(ModeloEjecucionDatosGeneralesFragment.name,
          `${this.initializer.name}(key: ${key})`, 'end');
      })
    );
  }

  getValue(): IModeloEjecucion {
    this.logger.debug(ModeloEjecucionDatosGeneralesFragment.name, `${this.getValue.name}()`, 'start');
    const form = this.getFormGroup().value;
    const modeloEjecucion = this.modeloEjecucion;
    modeloEjecucion.nombre = form.nombre;
    modeloEjecucion.descripcion = form.descripcion;
    this.logger.debug(ModeloEjecucionDatosGeneralesFragment.name, `${this.getValue.name}()`, 'end');
    return modeloEjecucion;
  }

  saveOrUpdate(): Observable<number> {
    this.logger.debug(ModeloEjecucionDatosGeneralesFragment.name, `${this.saveOrUpdate.name}()`, 'start');
    const modeloEjecucion = this.getValue();
    const observable$ = this.isEdit() ? this.update(modeloEjecucion) : this.create(modeloEjecucion);
    return observable$.pipe(
      map((result: IModeloEjecucion) => {
        return result.id;
      }),
      tap(() => this.logger.debug(ModeloEjecucionDatosGeneralesFragment.name,
        `${this.saveOrUpdate.name}()`, 'end'))
    );
  }

  private create(modeloEjecucion: IModeloEjecucion): Observable<IModeloEjecucion> {
    this.logger.debug(ModeloEjecucionDatosGeneralesFragment.name,
      `${this.create.name}(modeloEjecucion: ${modeloEjecucion})`, 'start');
    return this.modeloEjecucionService.create(modeloEjecucion).pipe(
      tap((result: IModeloEjecucion) => {
        this.modeloEjecucion = result;
        this.logger.debug(ModeloEjecucionDatosGeneralesFragment.name,
          `${this.create.name}(modeloEjecucion: ${modeloEjecucion})`, 'end');
      })
    );
  }

  private update(modeloEjecucion: IModeloEjecucion): Observable<IModeloEjecucion> {
    this.logger.debug(ModeloEjecucionDatosGeneralesFragment.name,
      `${this.update.name}(modeloEjecucion: ${modeloEjecucion})`, 'start');
    return this.modeloEjecucionService.update(modeloEjecucion.id, modeloEjecucion).pipe(
      tap((result: IModeloEjecucion) => {
        this.modeloEjecucion = result;
        this.logger.debug(ModeloEjecucionDatosGeneralesFragment.name,
          `${this.update.name}(modeloEjecucion: ${modeloEjecucion})`, 'end');
      })
    );
  }
}
