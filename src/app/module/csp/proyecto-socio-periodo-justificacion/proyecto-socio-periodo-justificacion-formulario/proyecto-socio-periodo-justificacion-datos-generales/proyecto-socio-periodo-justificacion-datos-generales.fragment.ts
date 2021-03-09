import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Estado } from '@core/models/csp/estado-proyecto';
import { IProyectoSocio } from '@core/models/csp/proyecto-socio';
import { IProyectoSocioPeriodoJustificacion } from '@core/models/csp/proyecto-socio-periodo-justificacion';
import { FormFragment } from '@core/services/action-service';
import { ProyectoSocioPeriodoJustificacionService } from '@core/services/csp/proyecto-socio-periodo-justificacion.service';
import { DateValidator } from '@core/validators/date-validator';
import { IRange, RangeValidator } from '@core/validators/range-validator';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export class ProyectoSocioPeriodoJustificacionDatosGeneralesFragment extends FormFragment<IProyectoSocioPeriodoJustificacion> {

  constructor(
    key: number,
    private service: ProyectoSocioPeriodoJustificacionService,
    private proyectoSocio: IProyectoSocio,
    private periodoJustificacion: IProyectoSocioPeriodoJustificacion,
    private selectedPeriodosJustificacion: IProyectoSocioPeriodoJustificacion[]
  ) {
    super(key);
  }

  protected buildFormGroup(): FormGroup {
    const rangosExistentes = this.selectedPeriodosJustificacion?.map(
      periodo => {
        const value: IRange = {
          inicio: new Date(periodo.fechaInicio),
          fin: new Date(periodo.fechaFin)
        };
        return value;
      }
    );
    const fechaInicio = typeof this.proyectoSocio?.fechaInicio === 'string' ?
      new Date(this.proyectoSocio?.fechaInicio) : this.proyectoSocio?.fechaInicio;
    const fechaFin = typeof this.proyectoSocio?.fechaFin === 'string' ?
      new Date(this.proyectoSocio?.fechaFin) : this.proyectoSocio?.fechaFin;
    const form = new FormGroup(
      {
        numPeriodo: new FormControl({
          value: this.periodoJustificacion.numPeriodo,
          disabled: true
        }),
        fechaInicio: new FormControl('', [
          Validators.required,
          DateValidator.minDate(fechaInicio),
          DateValidator.maxDate(fechaFin)
        ]),
        fechaFin: new FormControl('', [
          Validators.required,
          DateValidator.minDate(fechaInicio),
          DateValidator.maxDate(fechaFin)
        ]),
        fechaInicioPresentacion: new FormControl(null),
        fechaFinPresentacion: new FormControl(null),
        observaciones: new FormControl('', [Validators.maxLength(2_000)]),
        documentacionRecibida: new FormControl(false),
        fechaRecepcion: new FormControl(''),
      },
      {
        validators: [
          DateValidator.isAfter('fechaInicio', 'fechaFin'),
          DateValidator.isAfter('fechaInicioPresentacion', 'fechaFinPresentacion'),
          DateValidator.rangeWithTime('fechaInicioPresentacion', 'fechaInicio', 'fechaFin'),
          DateValidator.rangeWithTime('fechaFinPresentacion', 'fechaInicio', 'fechaFin'),
          RangeValidator.notOverlaps('fechaInicio', 'fechaFin', rangosExistentes),
        ]
      }
    );
    return form;
  }

  protected buildPatch(value: IProyectoSocioPeriodoJustificacion): { [key: string]: any; } {
    const result = {
      documentacionRecibida: value.documentacionRecibida,
      fechaFin: value.fechaFin ? new Date(value.fechaFin) : undefined,
      fechaFinPresentacion: value.fechaFinPresentacion,
      fechaInicio: value.fechaInicio ? new Date(value.fechaInicio) : undefined,
      fechaInicioPresentacion: value.fechaInicioPresentacion,
      fechaRecepcion: value.fechaRecepcion ? new Date(value.fechaRecepcion) : undefined,
      observaciones: value.observaciones,
      numPeriodo: value.numPeriodo
    };
    return result;
  }

  protected initializer(key: number): Observable<IProyectoSocioPeriodoJustificacion> {
    return of(this.periodoJustificacion);
  }

  getValue(): IProyectoSocioPeriodoJustificacion {
    const form = this.getFormGroup().controls;
    this.periodoJustificacion.documentacionRecibida = form.documentacionRecibida.value;
    this.periodoJustificacion.fechaFin = form.fechaFin.value;
    this.periodoJustificacion.fechaFinPresentacion = form.fechaFinPresentacion.value;
    this.periodoJustificacion.fechaInicio = form.fechaInicio.value;
    this.periodoJustificacion.fechaInicioPresentacion = form.fechaInicioPresentacion.value;
    this.periodoJustificacion.fechaRecepcion = this.periodoJustificacion.documentacionRecibida ? form.fechaRecepcion.value : undefined;
    this.periodoJustificacion.observaciones = form.observaciones.value;
    this.periodoJustificacion.numPeriodo = form.numPeriodo.value;
    return this.periodoJustificacion;
  }

  saveOrUpdate(): Observable<number> {
    const periodo = this.getValue();
    periodo.proyectoSocio = this.proyectoSocio;
    const observable$ = this.isEdit() ? this.update(periodo) : this.create(periodo);
    return observable$.pipe(
      map(result => {
        this.periodoJustificacion = result;
        this.setChanges(false);
        this.refreshInitialState(true);
        return this.periodoJustificacion.id;
      })
    );
  }

  private create(periodoJustificacion: IProyectoSocioPeriodoJustificacion): Observable<IProyectoSocioPeriodoJustificacion> {
    return this.service.create(periodoJustificacion);
  }

  private update(periodoJustificacion: IProyectoSocioPeriodoJustificacion): Observable<IProyectoSocioPeriodoJustificacion> {
    return this.service.update(Number(this.getKey()), periodoJustificacion);
  }

  get isAbierto(): boolean {
    const proyecto = this.proyectoSocio.proyecto;
    return proyecto?.estado?.estado === Estado.ABIERTO;
  }
}
