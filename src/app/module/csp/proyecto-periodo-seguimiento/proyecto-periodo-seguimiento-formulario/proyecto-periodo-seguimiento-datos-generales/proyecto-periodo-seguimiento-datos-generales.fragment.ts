import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Estado } from '@core/models/csp/estado-proyecto';
import { IProyecto } from '@core/models/csp/proyecto';
import { IProyectoPeriodoSeguimiento } from '@core/models/csp/proyecto-periodo-seguimiento';
import { FormFragment } from '@core/services/action-service';
import { ProyectoPeriodoSeguimientoService } from '@core/services/csp/proyecto-periodo-seguimiento.service';
import { DateValidator } from '@core/validators/date-validator';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export class ProyectoPeriodoSeguimientoDatosGeneralesFragment extends FormFragment<IProyectoPeriodoSeguimiento> {
  proyectoPeriodoSeguimiento: IProyectoPeriodoSeguimiento;

  constructor(
    key: number,
    private service: ProyectoPeriodoSeguimientoService,
    private proyecto: IProyecto,
    private readonly
  ) {
    super(key);
    this.proyectoPeriodoSeguimiento = { proyectoId: proyecto.id } as IProyectoPeriodoSeguimiento;
  }

  protected buildFormGroup(): FormGroup {
    const form = new FormGroup(
      {
        numPeriodo: new FormControl({
          value: 1,
          disabled: true
        }),
        fechaInicio: new FormControl(null, [
          Validators.required
        ]),
        fechaFin: new FormControl(null, [
          Validators.required
        ]),
        fechaInicioPresentacion: new FormControl(null),
        fechaFinPresentacion: new FormControl(null),
        observaciones: new FormControl('', [Validators.maxLength(250)]),
        fechaInicioProyecto: new FormControl(this.proyecto?.fechaInicio),
        fechaFinProyecto: new FormControl(this.proyecto?.fechaFin)
      },
      {
        validators: [
          DateValidator.isAfter('fechaInicio', 'fechaFin'),
          DateValidator.isAfter('fechaInicioPresentacion', 'fechaFinPresentacion'),
          DateValidator.isAfterOrEqual('fechaInicioProyecto', 'fechaInicio'),
          DateValidator.isBefore('fechaFinProyecto', 'fechaFin')
        ]
      }
    );

    if (this.proyecto?.estado?.estado === Estado.ABIERTO) {
      form.controls.fechaInicioPresentacion.setValidators([Validators.required]);
      form.controls.fechaFinPresentacion.setValidators([Validators.required]);
    } else {
      form.controls.fechaInicioPresentacion.setValidators(null);
      form.controls.fechaFinPresentacion.setValidators(null);
    }

    if (this.readonly) {
      form.disable();
    }

    return form;
  }

  protected buildPatch(proyectoPeriodoSeguimiento: IProyectoPeriodoSeguimiento): { [key: string]: any; } {
    this.proyectoPeriodoSeguimiento = proyectoPeriodoSeguimiento;
    const result = {
      numPeriodo: proyectoPeriodoSeguimiento.numPeriodo,
      fechaInicio: proyectoPeriodoSeguimiento.fechaInicio,
      fechaFin: proyectoPeriodoSeguimiento.fechaFin,
      fechaInicioPresentacion: proyectoPeriodoSeguimiento.fechaInicioPresentacion,
      fechaFinPresentacion: proyectoPeriodoSeguimiento.fechaFinPresentacion,
      observaciones: proyectoPeriodoSeguimiento.observaciones
    };
    return result;
  }

  protected initializer(key: number): Observable<IProyectoPeriodoSeguimiento> {
    return this.service.findById(key);
  }

  getValue(): IProyectoPeriodoSeguimiento {
    const form = this.getFormGroup().controls;
    this.proyectoPeriodoSeguimiento.numPeriodo = form.numPeriodo.value;
    this.proyectoPeriodoSeguimiento.fechaInicio = form.fechaInicio.value;
    this.proyectoPeriodoSeguimiento.fechaFin = form.fechaFin.value;
    this.proyectoPeriodoSeguimiento.fechaInicioPresentacion = form.fechaInicioPresentacion.value;
    this.proyectoPeriodoSeguimiento.fechaFinPresentacion = form.fechaFinPresentacion.value;
    this.proyectoPeriodoSeguimiento.observaciones = form.observaciones.value;
    return this.proyectoPeriodoSeguimiento;
  }

  saveOrUpdate(): Observable<number> {
    const proyectoPeriodoSeguimiento = this.getValue();

    const observable$ = this.isEdit() ? this.update(proyectoPeriodoSeguimiento) : this.create(proyectoPeriodoSeguimiento);
    return observable$.pipe(
      map(result => {
        this.proyectoPeriodoSeguimiento = result;
        return this.proyectoPeriodoSeguimiento.id;
      })
    );
  }

  private create(proyectoPeriodoSeguimiento: IProyectoPeriodoSeguimiento): Observable<IProyectoPeriodoSeguimiento> {
    return this.service.create(proyectoPeriodoSeguimiento);
  }

  private update(proyectoPeriodoSeguimiento: IProyectoPeriodoSeguimiento): Observable<IProyectoPeriodoSeguimiento> {
    return this.service.update(proyectoPeriodoSeguimiento.id, proyectoPeriodoSeguimiento);
  }
}
