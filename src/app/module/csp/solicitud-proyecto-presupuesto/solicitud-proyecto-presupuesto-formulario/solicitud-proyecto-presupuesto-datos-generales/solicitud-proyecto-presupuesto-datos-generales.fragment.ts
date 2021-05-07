import { FormControl, FormGroup } from '@angular/forms';
import { IEntidadFinanciadora } from '@core/models/csp/entidad-financiadora';
import { FormFragment } from '@core/services/action-service';
import { Observable, of } from 'rxjs';

export class SolicitudProyectoPresupuestoDatosGeneralesFragment extends FormFragment<IEntidadFinanciadora> {

  constructor(
    solicitudId: number,
    private entidadFinanciadora: IEntidadFinanciadora,
    public ajena: boolean,
  ) {
    super(solicitudId);
  }

  protected buildFormGroup(): FormGroup {
    const form = new FormGroup(
      {
        nombre: new FormControl({ value: '', disabled: true }),
        cif: new FormControl({ value: '', disabled: true })
      }
    );

    if (!this.ajena) {
      form.addControl('fuenteFinanciacion', new FormControl({ value: '', disabled: true }));
      form.addControl('ambito', new FormControl({ value: '', disabled: true }));
      form.addControl('tipoFinanciacion', new FormControl({ value: '', disabled: true }));
      form.addControl('porcentajeFinanciacion', new FormControl({ value: '', disabled: true }));
    }

    return form;
  }

  protected buildPatch(entidadFinanciadora: IEntidadFinanciadora): { [key: string]: any; } {
    this.entidadFinanciadora = entidadFinanciadora;
    const result = {
      nombre: entidadFinanciadora?.empresa?.nombre,
      cif: entidadFinanciadora?.empresa?.numeroIdentificacion,
      fuenteFinanciacion: entidadFinanciadora?.fuenteFinanciacion?.nombre,
      ambito: entidadFinanciadora?.fuenteFinanciacion?.tipoAmbitoGeografico?.nombre,
      tipoFinanciacion: entidadFinanciadora?.tipoFinanciacion?.nombre,
      porcentajeFinanciacion: entidadFinanciadora?.porcentajeFinanciacion
    };

    return result;
  }

  protected initializer(key: number): Observable<IEntidadFinanciadora> {
    return of(this.entidadFinanciadora);
  }

  getValue(): IEntidadFinanciadora {
    return this.entidadFinanciadora;
  }

  saveOrUpdate(): Observable<number> {
    return of(this.getKey() as number);
  }

}
