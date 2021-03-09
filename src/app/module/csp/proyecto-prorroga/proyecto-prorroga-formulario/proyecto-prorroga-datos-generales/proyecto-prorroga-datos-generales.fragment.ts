import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IProyecto } from '@core/models/csp/proyecto';
import { IProyectoProrroga, Tipo } from '@core/models/csp/proyecto-prorroga';
import { FormFragment } from '@core/services/action-service';
import { ProyectoProrrogaService } from '@core/services/csp/proyecto-prorroga.service';
import { DateValidator } from '@core/validators/date-validator';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export class ProyectoProrrogaDatosGeneralesFragment extends FormFragment<IProyectoProrroga> {

  constructor(
    key: number,
    private service: ProyectoProrrogaService,
    private proyecto: IProyecto,
    public selectedProyectoProrrogas: IProyectoProrroga[],
    private proyectoProrroga: IProyectoProrroga,
    private readonly: boolean
  ) {
    super(key);
    if (this.proyectoProrroga) {
      this.proyectoProrroga.proyecto = this.proyecto;
    } else {
      this.proyectoProrroga = {
        id: key,
        proyecto: this.proyecto as IProyecto
      } as IProyectoProrroga;
    }
  }

  protected buildFormGroup(): FormGroup {
    const form = new FormGroup(
      {
        numProrroga: new FormControl({
          value: this.getLastProrroga() ? this.getLastProrroga()?.numProrroga + 1 : 1,
          disabled: true
        }),
        fechaConcesion: new FormControl('', [
          Validators.required
        ]),
        tipo: new FormControl('', [
          Validators.required
        ]),
        fechaFin: new FormControl({ value: '', disabled: true }),
        importe: new FormControl({ value: '', disabled: true }),
        observaciones: new FormControl('', [Validators.maxLength(250)]),
        fechaUltimaConcesion: new FormControl(this?.getLastProrroga()?.fechaConcesion)
      },
      {
        validators: [
          DateValidator.isAfter('fechaUltimaConcesion', 'fechaConcesion', false),
        ]
      }
    );

    this.subscriptions.push(form.controls.tipo.valueChanges.subscribe((value: Tipo) => {
      this.addValidations(value);
    }));

    if (this.readonly) {
      form.disable();
    }

    return form;
  }

  protected buildPatch(proyectoProrroga: IProyectoProrroga): { [key: string]: any; } {
    const result = {
      numProrroga: proyectoProrroga.numProrroga,
      fechaConcesion: proyectoProrroga.fechaConcesion,
      fechaFin: proyectoProrroga.fechaFin,
      tipo: proyectoProrroga.tipo,
      importe: proyectoProrroga.importe,
      observaciones: proyectoProrroga.observaciones
    };

    this.addValidations(proyectoProrroga.tipo);
    return result;
  }

  protected initializer(key: number): Observable<IProyectoProrroga> {
    return this.service.findById(key)
      .pipe(
        tap((proyectoProrroga) => this.proyectoProrroga = proyectoProrroga)
      );
  }

  getValue(): IProyectoProrroga {
    const form = this.getFormGroup().controls;
    this.proyectoProrroga.numProrroga = form.numProrroga.value;
    this.proyectoProrroga.fechaConcesion = form.fechaConcesion.value;
    this.proyectoProrroga.fechaFin = form.fechaFin.value;
    this.proyectoProrroga.tipo = form.tipo.value;
    this.proyectoProrroga.importe = form.importe.value;
    this.proyectoProrroga.observaciones = form.observaciones.value;
    return this.proyectoProrroga;
  }

  saveOrUpdate(): Observable<number> {
    const proyectoProrroga = this.getValue();

    const observable$ = this.isEdit() ? this.update(proyectoProrroga) : this.create(proyectoProrroga);
    return observable$.pipe(
      map(result => {
        this.proyectoProrroga = result;
        this.refreshInitialState(true);
        return this.proyectoProrroga.id;
      })
    );
  }

  private create(proyectoProrroga: IProyectoProrroga): Observable<IProyectoProrroga> {
    return this.service.create(proyectoProrroga);
  }

  private update(proyectoProrroga: IProyectoProrroga): Observable<IProyectoProrroga> {
    return this.service.update(proyectoProrroga.id, proyectoProrroga);
  }

  private addValidations(value: Tipo) {
    const form = this.getFormGroup().controls;
    if (!this.readonly) {
      if (value === Tipo.TIEMPO) {
        form.fechaFin.setValidators([Validators.required]);
        form.fechaFin.enable();
        form.importe.setValidators([
          Validators.min(1),
          Validators.max(2_147_483_647)
        ]);
        form.importe.disable();
      } else if (value === Tipo.IMPORTE) {
        form.importe.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(2_147_483_647)
        ]);
        form.importe.enable();
        form.fechaFin.setValidators(null);
        form.fechaFin.disable();
      } else {
        form.fechaFin.setValidators([Validators.required]);
        form.fechaFin.enable();
        form.importe.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(2_147_483_647)
        ]);
        form.importe.enable();
      }
    }
  }

  /**
   * Obtiene la última prórroga del listado
   */
  getLastProrroga(): IProyectoProrroga {
    if (this.selectedProyectoProrrogas && this.selectedProyectoProrrogas.length > 0) {
      if (this.proyectoProrroga) {
        if (this.proyectoProrroga.id !== this.selectedProyectoProrrogas[this.selectedProyectoProrrogas.length - 1].id) {
          return this.selectedProyectoProrrogas[this.selectedProyectoProrrogas.length - 1];
        } else if (this.selectedProyectoProrrogas.length > 1) {
          return this.selectedProyectoProrrogas[this.selectedProyectoProrrogas.length - 2];
        }
      }
    }
    return null;
  }
}
