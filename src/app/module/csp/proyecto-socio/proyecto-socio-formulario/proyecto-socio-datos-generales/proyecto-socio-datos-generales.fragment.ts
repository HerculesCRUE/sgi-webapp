import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IProyecto } from '@core/models/csp/proyecto';
import { IProyectoSocio } from '@core/models/csp/proyecto-socio';
import { FormFragment } from '@core/services/action-service';
import { ProyectoSocioService } from '@core/services/csp/proyecto-socio.service';
import { EmpresaEconomicaService } from '@core/services/sgp/empresa-economica.service';
import { DateValidator } from '@core/validators/date-validator';
import { IsEntityValidator } from '@core/validators/is-entity-validador';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

export class ProyectoSocioDatosGeneralesFragment extends FormFragment<IProyectoSocio> {
  proyectoSocio: IProyectoSocio;

  constructor(
    key: number,
    private proyectoId: number,
    private service: ProyectoSocioService,
    private empresaEconomicaService: EmpresaEconomicaService
  ) {
    super(key);
    this.proyectoSocio = {
      proyecto: {
        id: this.proyectoId
      } as IProyecto
    } as IProyectoSocio;
  }

  protected buildFormGroup(): FormGroup {
    const form = new FormGroup(
      {
        empresa: new FormControl({
          value: '',
          disabled: this.isEdit()
        }, [
          Validators.required
        ]),
        rolSocio: new FormControl('', [
          Validators.required,
          IsEntityValidator.isValid()
        ]),
        numInvestigadores: new FormControl('', [
          Validators.min(1),
          Validators.max(9999)
        ]),
        importeConcedido: new FormControl('', [
          Validators.min(1),
          Validators.max(2_147_483_647)
        ]),
        fechaInicio: new FormControl(''),
        fechaFin: new FormControl(''),
      },
      {
        validators: [
          DateValidator.isAfter('fechaInicio', 'fechaFin', false)
        ]
      }
    );
    return form;
  }

  protected buildPatch(proyectoSocio: IProyectoSocio): { [key: string]: any; } {
    const result = {
      empresa: proyectoSocio.empresa,
      rolSocio: proyectoSocio.rolSocio,
      numInvestigadores: proyectoSocio.numInvestigadores,
      importeConcedido: proyectoSocio.importeConcedido,
      fechaInicio: proyectoSocio.fechaInicio,
      fechaFin: proyectoSocio.fechaFin,
    };
    return result;
  }

  protected initializer(key: number): Observable<IProyectoSocio> {
    return this.service.findById(key)
      .pipe(
        switchMap(proyectoSocio => {
          const personaRef = proyectoSocio.empresa.personaRef;
          return this.empresaEconomicaService.findById(personaRef)
            .pipe(
              map(empresa => {
                proyectoSocio.empresa = empresa;
                return proyectoSocio;
              })
            );
        }),
        tap((proyectoSocio) => this.proyectoSocio = proyectoSocio)
      );
  }

  getValue(): IProyectoSocio {
    const form = this.getFormGroup().controls;
    this.proyectoSocio.empresa = form.empresa.value;
    this.proyectoSocio.rolSocio = form.rolSocio.value;
    this.proyectoSocio.numInvestigadores = form.numInvestigadores.value;
    this.proyectoSocio.importeConcedido = form.importeConcedido.value;
    this.proyectoSocio.fechaInicio = form.fechaInicio.value;
    this.proyectoSocio.fechaFin = form.fechaFin.value;
    return this.proyectoSocio;
  }

  saveOrUpdate(): Observable<number> {
    const proyectoSocio = this.getValue();

    const observable$ = this.isEdit() ? this.update(proyectoSocio) : this.create(proyectoSocio);
    return observable$.pipe(
      map(result => {
        this.proyectoSocio = result;
        return this.proyectoSocio.id;
      })
    );
  }

  private create(proyectoSocio: IProyectoSocio): Observable<IProyectoSocio> {
    return this.service.create(proyectoSocio);
  }

  private update(proyectoSocio: IProyectoSocio): Observable<IProyectoSocio> {
    return this.service.update(proyectoSocio.id, proyectoSocio);
  }
}
