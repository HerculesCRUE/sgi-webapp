import { FormFragment } from '@core/services/action-service';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { NGXLogger } from 'ngx-logger';
import { tap } from 'rxjs/operators';
import { IEntidadFinanciadora } from '@core/models/csp/entidad-financiadora';

export class SolicitudProyectoPresupuestoDatosGeneralesFragment extends FormFragment<IEntidadFinanciadora> {
  entidadFinanciadora: IEntidadFinanciadora;

  isEntidadFinanciadoraConvocatoria: boolean;

  constructor(
    private logger: NGXLogger,
    key: number,
    entidadFinanciadora: IEntidadFinanciadora,
    isEntidadFinanciadoraConvocatoria: boolean
  ) {
    super(key);
    this.entidadFinanciadora = entidadFinanciadora;
    this.isEntidadFinanciadoraConvocatoria = isEntidadFinanciadoraConvocatoria;

  }

  protected buildFormGroup(): FormGroup {
    const form = new FormGroup(
      {
        nombre: new FormControl({ value: '', disabled: true }),
        cif: new FormControl({ value: '', disabled: true })
      }
    );

    if (this.isEntidadFinanciadoraConvocatoria) {
      form.addControl('fuenteFinanciacion', new FormControl({ value: '', disabled: true }));
      form.addControl('ambito', new FormControl({ value: '', disabled: true }));
      form.addControl('tipoFinanciacion', new FormControl({ value: '', disabled: true }));
      form.addControl('porcentajeFinanciacion', new FormControl({ value: '', disabled: true }));
    }

    return form;
  }

  protected buildPatch(entidadFinanciadora: IEntidadFinanciadora): { [key: string]: any; } {
    const result = {
      nombre: entidadFinanciadora.empresa.razonSocial,
      cif: entidadFinanciadora.empresa.numeroDocumento,
      fuenteFinanciacion: entidadFinanciadora.fuenteFinanciacion?.nombre,
      ambito: entidadFinanciadora.fuenteFinanciacion?.tipoAmbitoGeografico?.nombre,
      tipoFinanciacion: entidadFinanciadora.tipoFinanciacion?.nombre,
      porcentajeFinanciacion: entidadFinanciadora.porcentajeFinanciacion
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
    return of(this.entidadFinanciadora.id);
  }


}
