import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IAreaTematica } from '@core/models/csp/area-tematica';
import { FormFragment } from '@core/services/action-service';
import { AreaTematicaService } from '@core/services/csp/area-tematica.service';
import { NGXLogger } from 'ngx-logger';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export class AreaTematicaDatosGeneralesFragment extends FormFragment<IAreaTematica> {

  private areaTematica: IAreaTematica;

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private areaTematicaService: AreaTematicaService,
  ) {
    super(key);
    this.logger.debug(AreaTematicaDatosGeneralesFragment.name, 'constructor()', 'start');
    this.areaTematica = {} as IAreaTematica;
    this.areaTematica.activo = true;
    this.logger.debug(AreaTematicaDatosGeneralesFragment.name, 'constructor()', 'end');
  }


  protected buildFormGroup(): FormGroup {
    this.logger.debug(AreaTematicaDatosGeneralesFragment.name,
      `${this.buildFormGroup.name}()`, 'start');
    const fb = new FormGroup({
      nombre: new FormControl('', [Validators.maxLength(50)]),
      descripcion: new FormControl('', [Validators.maxLength(250)]),
    });
    this.logger.debug(AreaTematicaDatosGeneralesFragment.name,
      `${this.buildFormGroup.name}()`, 'end');
    return fb;
  }

  protected buildPatch(areaTematica: IAreaTematica): { [key: string]: any; } {
    this.logger.debug(AreaTematicaDatosGeneralesFragment.name,
      `${this.buildPatch.name}(areaTematica: ${areaTematica})`, 'start');
    const result = {
      id: areaTematica.id,
      activo: areaTematica.activo,
      descripcion: areaTematica.descripcion,
      nombre: areaTematica.nombre
    } as IAreaTematica;
    this.areaTematica = areaTematica;
    this.logger.debug(AreaTematicaDatosGeneralesFragment.name,
      `${this.buildPatch.name}(areaTematica: ${areaTematica})`, 'end');
    return result;
  }

  protected initializer(key: number): Observable<IAreaTematica> {
    this.logger.debug(AreaTematicaDatosGeneralesFragment.name,
      `${this.initializer.name}(key: ${key})`, 'start');
    return this.areaTematicaService.findById(key).pipe(
      catchError(() => {
        this.logger.debug(AreaTematicaDatosGeneralesFragment.name,
          `${this.initializer.name}(key: ${key})`, 'end');
        return EMPTY;
      }),
      tap(() => {
        this.logger.debug(AreaTematicaDatosGeneralesFragment.name,
          `${this.initializer.name}(key: ${key})`, 'end');
      })
    );
  }

  getValue(): IAreaTematica {
    this.logger.debug(AreaTematicaDatosGeneralesFragment.name, `${this.getValue.name}()`, 'start');
    const form = this.getFormGroup().value;
    const areaTematica = this.areaTematica;
    areaTematica.nombre = form.nombre;
    areaTematica.descripcion = form.descripcion;
    this.logger.debug(AreaTematicaDatosGeneralesFragment.name, `${this.getValue.name}()`, 'end');
    return areaTematica;
  }

  saveOrUpdate(): Observable<number> {
    this.logger.debug(AreaTematicaDatosGeneralesFragment.name, `${this.saveOrUpdate.name}()`, 'start');
    const areaTematicas = this.getValue();
    const observable$ = this.isEdit() ? this.update(areaTematicas) : this.create(areaTematicas);
    return observable$.pipe(
      map((result: IAreaTematica) => {
        return result.id;
      }),
      tap(() => this.logger.debug(AreaTematicaDatosGeneralesFragment.name,
        `${this.saveOrUpdate.name}()`, 'end'))
    );
  }

  private create(areaTematica: IAreaTematica): Observable<IAreaTematica> {
    this.logger.debug(AreaTematicaDatosGeneralesFragment.name,
      `${this.create.name}(areaTematica: ${areaTematica})`, 'start');
    return this.areaTematicaService.create(areaTematica).pipe(
      tap((result: IAreaTematica) => {
        this.areaTematica = result;
        this.logger.debug(AreaTematicaDatosGeneralesFragment.name,
          `${this.create.name}(areaTematica: ${areaTematica})`, 'end');
      })
    );
  }

  private update(areaTematica: IAreaTematica): Observable<IAreaTematica> {
    this.logger.debug(AreaTematicaDatosGeneralesFragment.name,
      `${this.update.name}(areaTematica: ${areaTematica})`, 'start');
    return this.areaTematicaService.update(areaTematica.id, areaTematica).pipe(
      tap((result: IAreaTematica) => {
        this.areaTematica = result;
        this.logger.debug(AreaTematicaDatosGeneralesFragment.name,
          `${this.update.name}(areaTematica: ${areaTematica})`, 'end');
      })
    );
  }
}
