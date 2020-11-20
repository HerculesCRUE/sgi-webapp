import { FormControl, FormGroup } from '@angular/forms';
import { IPrograma } from '@core/models/csp/programa';
import { FormFragment } from '@core/services/action-service';
import { ProgramaService } from '@core/services/csp/programa.service';
import { NGXLogger } from 'ngx-logger';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export class PlanInvestigacionDatosGeneralesFragment extends FormFragment<IPrograma> {

  programas: IPrograma;

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private planService: ProgramaService
  ) {
    super(key);
    this.logger.debug(PlanInvestigacionDatosGeneralesFragment.name, 'constructor()', 'start');
    this.programas = {} as IPrograma;
    this.programas.activo = true;
    this.logger.debug(PlanInvestigacionDatosGeneralesFragment.name, 'constructor()', 'end');
  }

  protected buildFormGroup(): FormGroup {
    this.logger.debug(PlanInvestigacionDatosGeneralesFragment.name,
      `${this.buildFormGroup.name}()`, 'start');
    const fb = new FormGroup({
      nombre: new FormControl(''),
      descripcion: new FormControl(''),
    });
    this.logger.debug(PlanInvestigacionDatosGeneralesFragment.name,
      `${this.buildFormGroup.name}()`, 'end');
    return fb;
  }

  protected buildPatch(programa: IPrograma): { [key: string]: any; } {
    this.logger.debug(PlanInvestigacionDatosGeneralesFragment.name,
      `${this.buildPatch.name}(programa: ${programa})`, 'start');
    const result = {
      id: programa.id,
      activo: programa.activo,
      descripcion: programa.descripcion,
      nombre: programa.nombre
    } as IPrograma;
    this.programas = programa;
    this.logger.debug(PlanInvestigacionDatosGeneralesFragment.name,
      `${this.buildPatch.name}(programa: ${programa})`, 'end');
    return result;
  }

  protected initializer(key: number): Observable<IPrograma> {
    this.logger.debug(PlanInvestigacionDatosGeneralesFragment.name,
      `${this.initializer.name}(key: ${key})`, 'start');
    return this.planService.findById(key).pipe(
      catchError(() => {
        this.logger.debug(PlanInvestigacionDatosGeneralesFragment.name,
          `${this.initializer.name}(key: ${key})`, 'end');
        return EMPTY;
      }),
      tap(() => {
        this.logger.debug(PlanInvestigacionDatosGeneralesFragment.name,
          `${this.initializer.name}(key: ${key})`, 'end');
      })
    );
  }

  getValue(): IPrograma {
    this.logger.debug(PlanInvestigacionDatosGeneralesFragment.name, `${this.getValue.name}()`, 'start');
    const form = this.getFormGroup().value;
    const programa = this.programas;
    programa.nombre = form.nombre;
    programa.descripcion = form.descripcion;
    this.logger.debug(PlanInvestigacionDatosGeneralesFragment.name, `${this.getValue.name}()`, 'end');
    return programa;
  }

  saveOrUpdate(): Observable<number> {
    this.logger.debug(PlanInvestigacionDatosGeneralesFragment.name, `${this.saveOrUpdate.name}()`, 'start');
    const programas = this.getValue();
    const observable$ = this.isEdit() ? this.update(programas) : this.create(programas);
    return observable$.pipe(
      map((result: IPrograma) => {
        return result.id;
      }),
      tap(() => this.logger.debug(PlanInvestigacionDatosGeneralesFragment.name,
        `${this.saveOrUpdate.name}()`, 'end'))
    );
  }

  private create(programa: IPrograma): Observable<IPrograma> {
    this.logger.debug(PlanInvestigacionDatosGeneralesFragment.name,
      `${this.create.name}(programa: ${programa})`, 'start');
    return this.planService.create(programa).pipe(
      tap((result: IPrograma) => {
        this.programas = result;
        this.logger.debug(PlanInvestigacionDatosGeneralesFragment.name,
          `${this.create.name}(programa: ${programa})`, 'end');
      })
    );
  }

  private update(programa: IPrograma): Observable<IPrograma> {
    this.logger.debug(PlanInvestigacionDatosGeneralesFragment.name,
      `${this.update.name}(programa: ${programa})`, 'start');
    return this.planService.update(programa.id, programa).pipe(
      tap((result: IPrograma) => {
        this.programas = result;
        this.logger.debug(PlanInvestigacionDatosGeneralesFragment.name,
          `${this.update.name}(programa: ${programa})`, 'end');
      })
    );
  }
}
