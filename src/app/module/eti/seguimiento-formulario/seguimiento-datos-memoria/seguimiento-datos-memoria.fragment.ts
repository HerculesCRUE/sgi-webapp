import { FormBuilder, FormGroup } from '@angular/forms';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { IMemoriaWithPersona } from '@core/models/eti/memoria-with-persona';
import { IPersona } from '@core/models/sgp/persona';
import { FormFragment } from '@core/services/action-service';
import { EvaluacionService } from '@core/services/eti/evaluacion.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export class SeguimientoDatosMemoriaFragment extends FormFragment<IMemoriaWithPersona> {
  private memoria: IMemoriaWithPersona;

  constructor(
    private readonly logger: NGXLogger,
    private fb: FormBuilder,
    key: number,
    private service: EvaluacionService,
    private personaFisicaService: PersonaFisicaService
  ) {
    super(key);
    this.memoria = {} as IMemoriaWithPersona;
  }

  protected buildFormGroup(): FormGroup {
    const fb = this.fb.group({
      comite: [{ value: this.memoria?.comite?.comite, disabled: true }],
      fechaEvaluacion: [{ value: '', disabled: true }],
      referenciaMemoria: [{ value: '', disabled: true }],
      solicitante: [{ value: '', disabled: true }],
      version: [{ value: '', disabled: true }]
    });
    return fb;
  }

  protected initializer(key: number): Observable<IMemoriaWithPersona> {
    return this.service.findById(key).pipe(
      map((evaluacion: IEvaluacion) => {
        this.memoria = evaluacion.memoria as IMemoriaWithPersona;
        return this.memoria;
      }),
      switchMap((memoria: IMemoriaWithPersona) => {
        if (memoria.peticionEvaluacion?.personaRef) {
          return this.personaFisicaService.getInformacionBasica(memoria.peticionEvaluacion.personaRef)
            .pipe(
              map((persona) => {
                memoria.solicitante = persona;
                return memoria;
              }),
              catchError((error) => {
                this.logger.error(error);
                const solicitante = {} as IPersona;
                solicitante.nombre = '';
                solicitante.primerApellido = '';
                solicitante.segundoApellido = '';
                memoria.solicitante = solicitante;
                return of(memoria);
              })
            );
        }
        else {
          return of(memoria);
        }
      })
    );
  }

  buildPatch(value: IMemoriaWithPersona): { [key: string]: any } {
    const patch = {
      comite: value.comite.comite,
      fechaEvaluacion: value.fechaEnvioSecretaria,
      referenciaMemoria: value.numReferencia,
      version: value.version,
      solicitante: `${value?.solicitante?.nombre} ${value?.solicitante?.primerApellido} ${value?.solicitante?.segundoApellido}`
    };
    return patch;
  }

  getValue(): IMemoriaWithPersona {
    return this.memoria;
  }

  saveOrUpdate(): Observable<void> {
    return of(void 0);
  }

}
