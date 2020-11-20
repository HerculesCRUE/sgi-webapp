import { FormBuilder, FormGroup } from '@angular/forms';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { IMemoriaWithPersona } from '@core/models/eti/memoria-with-persona';
import { IPersona } from '@core/models/sgp/persona';
import { FormFragment } from '@core/services/action-service';
import { EvaluacionService } from '@core/services/eti/evaluacion.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

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
    this.logger.debug(SeguimientoDatosMemoriaFragment.name, 'constructor()', 'start');
    this.memoria = {} as IMemoriaWithPersona;
    this.logger.debug(SeguimientoDatosMemoriaFragment.name, 'constructor()', 'end');
  }

  protected buildFormGroup(): FormGroup {
    this.logger.debug(SeguimientoDatosMemoriaFragment.name, 'buildFormGroup()', 'start');
    const fb = this.fb.group({
      comite: [{ value: this.memoria?.comite?.comite, disabled: true }],
      fechaEvaluacion: [{ value: '', disabled: true }],
      referenciaMemoria: [{ value: '', disabled: true }],
      solicitante: [{ value: '', disabled: true }],
      version: [{ value: '', disabled: true }]
    });
    this.logger.debug(SeguimientoDatosMemoriaFragment.name, 'buildFormGroup()', 'end');
    return fb;
  }

  protected initializer(key: number): Observable<IMemoriaWithPersona> {
    this.logger.debug(SeguimientoDatosMemoriaFragment.name, `initializer(key: ${key})`, 'start');
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
              catchError(() => {
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
      }),
      tap(() => this.logger.debug(SeguimientoDatosMemoriaFragment.name, `initializer(key: ${key})`, 'end'))
    );
  }

  buildPatch(value: IMemoriaWithPersona): { [key: string]: any } {
    this.logger.debug(SeguimientoDatosMemoriaFragment.name, `buildPatch(value: ${value})`, 'start');
    const patch = {
      comite: value.comite.comite,
      fechaEvaluacion: value.fechaEnvioSecretaria,
      referenciaMemoria: value.numReferencia,
      version: value.version,
      solicitante: `${value?.solicitante?.nombre} ${value?.solicitante?.primerApellido} ${value?.solicitante?.segundoApellido}`
    };
    this.logger.debug(SeguimientoDatosMemoriaFragment.name, `buildPatch(value: ${value})`, 'end');
    return patch;
  }

  getValue(): IMemoriaWithPersona {
    this.logger.debug(SeguimientoDatosMemoriaFragment.name, 'getValue()', 'start');
    this.logger.debug(SeguimientoDatosMemoriaFragment.name, 'getValue()', 'end');
    return this.memoria;
  }

  saveOrUpdate(): Observable<void> {
    this.logger.debug(SeguimientoDatosMemoriaFragment.name, 'saveOrUpdate()', 'start');
    return of(void 0).pipe(
      tap(() => this.logger.debug(SeguimientoDatosMemoriaFragment.name, 'saveOrUpdate()', 'end'))
    );
  }


}
