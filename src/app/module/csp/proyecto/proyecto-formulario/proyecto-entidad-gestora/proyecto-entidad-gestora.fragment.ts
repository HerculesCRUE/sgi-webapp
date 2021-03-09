import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { IProyecto } from '@core/models/csp/proyecto';
import { IProyectoEntidadGestora } from '@core/models/csp/proyecto-entidad-gestora';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { FormFragment } from '@core/services/action-service';
import { ProyectoEntidadGestoraService } from '@core/services/csp/proyecto-entidad-gestora.service';
import { ProyectoService } from '@core/services/csp/proyecto.service';
import { EmpresaEconomicaService } from '@core/services/sgp/empresa-economica.service';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ProyectoActionService } from '../../proyecto.action.service';

export class ProyectoEntidadGestoraFragment extends FormFragment<IProyectoEntidadGestora> {

  private proyectoEntidadGestora: IProyectoEntidadGestora;

  private padreRef: IEmpresaEconomica;
  ocultarSubEntidad: boolean;

  constructor(
    private fb: FormBuilder,
    key: number,
    private proyectoService: ProyectoService,
    private proyectoEntidadGestoraService: ProyectoEntidadGestoraService,
    private empresaEconomicaService: EmpresaEconomicaService,
    private actionService: ProyectoActionService
  ) {
    super(key, true);
    this.setComplete(true);
    this.proyectoEntidadGestora = {} as IProyectoEntidadGestora;
  }

  protected initializer(key: number): Observable<IProyectoEntidadGestora> {
    if (this.getKey()) {
      return this.proyectoService.findEntidadGestora(key).pipe(
        switchMap((entidadGestora) => {
          const proyectoEntidadesGestoras = entidadGestora.items;
          if (proyectoEntidadesGestoras.length > 0) {
            this.proyectoEntidadGestora = proyectoEntidadesGestoras[0];
            return this.empresaEconomicaService.findById(this.proyectoEntidadGestora.empresaEconomica.personaRef).pipe(
              map((empresaEconomica) => {
                this.getFormGroup().get('entidadGestora').setValue(empresaEconomica);
                return this.proyectoEntidadGestora;
              })
            );
          }
          return of(this.proyectoEntidadGestora);
        })
      );
    }
  }

  protected buildFormGroup(): FormGroup {
    const form = this.fb.group({
      entidadGestora: new FormControl({
        value: '',
        disabled: false
      }),
      identificadorFiscal: new FormControl({
        value: '',
        disabled: true
      }),
      numeroIdentificadorFiscal: new FormControl({
        value: '',
        disabled: true
      }),
      nombre: new FormControl({
        value: '',
        disabled: true
      }),
      razonSocial: new FormControl({
        value: '',
        disabled: true
      }),
      entidad: new FormControl({
        value: '',
        disabled: true
      }),
      codigoSubentidad: new FormControl({
        value: '',
        disabled: true
      }),
      direccionPostal: new FormControl({
        value: '',
        disabled: true
      }),
      tipoEmpresa: new FormControl({
        value: '',
        disabled: true
      }),
      nombrePrincipal: new FormControl({
        value: '',
        disabled: true
      }),
      raazonSocialPrincipal: new FormControl({
        value: '',
        disabled: true
      })
    });

    this.subscriptions.push(
      form.controls.entidadGestora.valueChanges.subscribe(
        (entidadGestora) => this.onEntidadGestoraChange(entidadGestora)
      )
    );

    return form;
  }

  buildPatch(entidadGestora: IProyectoEntidadGestora): { [key: string]: any } {
    return {};
  }

  getValue(): IProyectoEntidadGestora {
    if (this.proyectoEntidadGestora === null) {
      this.proyectoEntidadGestora = {} as IProyectoEntidadGestora;
    }

    this.proyectoEntidadGestora.proyecto = this.actionService.proyectoDatosGenerales;

    return this.proyectoEntidadGestora;
  }

  /**
   * Setea la entidad gestora seleccionada en el formulario
   * @param entidadGestora empresa
   */
  private onEntidadGestoraChange(entidadGestora: IEmpresaEconomica): void {
    if (entidadGestora) {

      this.getFormGroup().controls.identificadorFiscal.setValue(entidadGestora.tipoDocumento);
      this.getFormGroup().controls.razonSocial.setValue(entidadGestora.razonSocial);
      this.getFormGroup().controls.direccionPostal.setValue(entidadGestora.direccion);
      this.getFormGroup().controls.tipoEmpresa.setValue(entidadGestora.tipoEmpresa);

      if (entidadGestora.personaRefPadre) {

        this.getFormGroup().controls.entidad.setValue(2);
        this.getFormGroup().controls.nombre.setValue(entidadGestora.tipoEmpresa);
        this.getFormGroup().controls.razonSocial.setValue(entidadGestora.razonSocial);
        this.getFormGroup().controls.codigoSubentidad.setValue(entidadGestora.numeroDocumento);

        this.subscriptions.push(
          this.empresaEconomicaService.findById(entidadGestora.personaRefPadre).subscribe(
            personaRef => {
              if (personaRef) {
                this.getFormGroup().controls.raazonSocialPrincipal.setValue(personaRef.razonSocial);
                this.getFormGroup().controls.nombrePrincipal.setValue(personaRef.tipoEmpresa);
                this.getFormGroup().controls.numeroIdentificadorFiscal.setValue(personaRef.numeroDocumento);
              } else {
                this.getFormGroup().controls.raazonSocialPrincipal.setValue('');
                this.getFormGroup().controls.nombrePrincipal.setValue('');
                this.getFormGroup().controls.numeroIdentificadorFiscal.setValue('');
              }

            }
          )
        );

        this.ocultarSubEntidad = true;
      } else {
        this.getFormGroup().controls.entidad.setValue(1);
        this.getFormGroup().controls.razonSocial.setValue(entidadGestora.razonSocial);
        this.getFormGroup().controls.nombre.setValue(entidadGestora.tipoEmpresa);
        this.getFormGroup().controls.numeroIdentificadorFiscal.setValue(entidadGestora.numeroDocumento);

        this.getFormGroup().controls.nombrePrincipal.setValue('');
        this.getFormGroup().controls.raazonSocialPrincipal.setValue('');
        this.getFormGroup().controls.codigoSubentidad.setValue('');
        this.ocultarSubEntidad = false;
      }
    }
  }

  saveOrUpdate(): Observable<number> {
    let observable$: Observable<any>;
    const fichaGeneral = this.getValue();
    fichaGeneral.proyecto = {
      id: this.getKey()
    } as IProyecto;
    const entidadRef = this.getFormGroup().controls.entidadGestora.value?.personaRef;
    if (entidadRef !== this.proyectoEntidadGestora.empresaEconomica?.personaRef) {
      if (!entidadRef) {
        observable$ = this.deleteProyectoEntidadGestora();
      }
      else {
        observable$ = this.proyectoEntidadGestora.id ?
          this.updateProyectoEntidadGestora() : this.createProyectoEntidadGestora();
      }
      return observable$.pipe(
        map((value) => {
          if (entidadRef) {
            this.proyectoEntidadGestora = value;
          }
          return this.proyectoEntidadGestora.id;
        })
      );
    }
  }


  private createProyectoEntidadGestora(): Observable<IProyectoEntidadGestora> {
    this.proyectoEntidadGestora.empresaEconomica = this.getFormGroup().controls.entidadGestora.value;
    return this.proyectoEntidadGestoraService.create(this.proyectoEntidadGestora).pipe(
      tap(result => {
        this.proyectoEntidadGestora = result;
        this.proyectoEntidadGestora.empresaEconomica = this.getFormGroup().controls.entidadGestora.value;
      })
    );
  }

  private updateProyectoEntidadGestora(): Observable<IProyectoEntidadGestora> {
    this.proyectoEntidadGestora.empresaEconomica = this.getFormGroup().controls.entidadGestora.value;
    return this.proyectoEntidadGestoraService.update(
      this.proyectoEntidadGestora.id, this.proyectoEntidadGestora).pipe(
        tap(result => {
          this.proyectoEntidadGestora = result;
          this.proyectoEntidadGestora.empresaEconomica = this.getFormGroup().controls.entidadGestora.value;
        })
      );
  }

  private deleteProyectoEntidadGestora(): Observable<void> {
    this.proyectoEntidadGestora.empresaEconomica = this.getFormGroup().controls.entidadGestora.value;
    return this.proyectoEntidadGestoraService.deleteById(
      this.proyectoEntidadGestora.id).pipe(
        tap(() => {
          this.proyectoEntidadGestora = {} as IProyectoEntidadGestora;
          this.proyectoEntidadGestora.empresaEconomica = {} as IEmpresaEconomica;
        })
      );
  }

}
