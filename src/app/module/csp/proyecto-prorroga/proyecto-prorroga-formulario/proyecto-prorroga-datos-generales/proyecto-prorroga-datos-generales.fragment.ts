import { FormControl, FormGroup, Validators } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IProyectoProrroga, Tipo } from '@core/models/csp/proyecto-prorroga';
import { FormFragment } from '@core/services/action-service';
import { ProyectoProrrogaService } from '@core/services/csp/proyecto-prorroga.service';
import { DialogService } from '@core/services/dialog.service';
import { DateValidator } from '@core/validators/date-validator';
import { DateTime } from 'luxon';
import { NEVER, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

const MSG_IMPORTE = marker('msg.csp.prorroga.update-importe-proyecto');

export class ProyectoProrrogaDatosGeneralesFragment extends FormFragment<IProyectoProrroga> {

  private proyectoProrroga: IProyectoProrroga;
  private importeInicial: number;

  constructor(
    key: number,
    private service: ProyectoProrrogaService,
    proyectoId: number,
    private fechaUltimaConcesion: DateTime,
    private readonly: boolean,
    private dialogService: DialogService
  ) {
    super(key);
    this.proyectoProrroga = {
      proyectoId
    } as IProyectoProrroga;
  }

  protected buildFormGroup(): FormGroup {
    const form = new FormGroup(
      {
        numProrroga: new FormControl({
          value: 1,
          disabled: true
        }),
        fechaConcesion: new FormControl(null, [
          Validators.required
        ]),
        tipo: new FormControl('', [
          Validators.required
        ]),
        fechaFin: new FormControl({ value: null, disabled: true }),
        importe: new FormControl({ value: '', disabled: true }),
        observaciones: new FormControl('', [Validators.maxLength(250)]),
        fechaUltimaConcesion: new FormControl(this.fechaUltimaConcesion)
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
    this.proyectoProrroga = proyectoProrroga;
    this.importeInicial = this.proyectoProrroga.importe;
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
    return this.service.findById(key);
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
    let mostrarAvisoImporte = false;
    if (proyectoProrroga.tipo === Tipo.IMPORTE) {
      if (this.isEdit() && proyectoProrroga.importe !== this.importeInicial) {
        mostrarAvisoImporte = true;
      } else if (proyectoProrroga.importe !== null) {
        mostrarAvisoImporte = true;
      }
    }
    const observable$ = this.isEdit() ? this.update(proyectoProrroga) : this.create(proyectoProrroga);
    if (mostrarAvisoImporte) {
      return this.dialogService.showConfirmation(MSG_IMPORTE).pipe(
        switchMap(aceptado => {
          if (aceptado) {
            return this.persist(observable$);
          } else {
            return NEVER;
          }
        })
      );
    } else {
      return this.persist(observable$);
    }
  }

  private persist(observable$: Observable<IProyectoProrroga>): Observable<number> {
    return observable$.pipe(
      map(result => {
        this.proyectoProrroga = result;
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
}
