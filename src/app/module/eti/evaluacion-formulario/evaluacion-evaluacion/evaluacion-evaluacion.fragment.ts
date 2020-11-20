import { FormFragment } from '@core/services/action-service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { EvaluacionService } from '@core/services/eti/evaluacion.service';
import { IPersona } from '@core/models/sgp/persona';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { NullIdValidador } from '@core/validators/null-id-validador';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { NGXLogger } from 'ngx-logger';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { IMemoriaWithPersona } from '@core/models/eti/memoria-with-persona';
import { IComentario } from '@core/models/eti/comentario';
import { SnackBarService } from '@core/services/snack-bar.service';
import { IMemoria } from '@core/models/eti/memoria';

interface MemoriaWithPersona extends IMemoria {
  solicitante: IPersona;
}

export class EvaluacionEvaluacionFragment extends FormFragment<MemoriaWithPersona> {

  private memoria: IMemoriaWithPersona;
  evaluacion$: BehaviorSubject<IEvaluacion> = new BehaviorSubject<IEvaluacion>(null);
  evaluacion: IEvaluacion;
  comentarios$: BehaviorSubject<StatusWrapper<IComentario>[]> = new BehaviorSubject<StatusWrapper<IComentario>[]>([]);


  constructor(
    private readonly logger: NGXLogger,
    private fb: FormBuilder,
    key: number,
    protected readonly snackBarService: SnackBarService,
    private service: EvaluacionService,
    private personaFisicaService: PersonaFisicaService) {
    super(key);
    this.memoria = {} as IMemoriaWithPersona;
  }

  protected buildFormGroup(): FormGroup {
    this.logger.debug(EvaluacionEvaluacionFragment.name, 'buildFormGroup()', 'start');
    this.logger.debug(EvaluacionEvaluacionFragment.name, 'buildFormGroup()', 'end');

    return this.fb.group({
      comite: [{ value: '', disabled: true }],
      fechaEvaluacion: [{ value: '', disabled: true }],
      referenciaMemoria: [{ value: '', disabled: true }],
      solicitante: [{ value: '', disabled: true }],
      version: [{ value: '', disabled: true }],
      dictamen: ['', [Validators.required, new NullIdValidador().isValid()]]
    });
  }

  protected initializer(key: number): Observable<IMemoriaWithPersona> {
    this.logger.debug(EvaluacionEvaluacionFragment.name, 'initializer()', 'start');
    this.logger.debug(EvaluacionEvaluacionFragment.name, 'initializer()', 'end');
    return this.service.findById(key).pipe(
      map((evaluacion) => {
        this.memoria = evaluacion.memoria as IMemoriaWithPersona;
        this.evaluacion$.next(evaluacion);
        this.evaluacion = evaluacion;
        return this.memoria;
      }),
      switchMap((memoria) => {
        if (memoria.personaRef) {
          return this.personaFisicaService.getInformacionBasica(memoria.peticionEvaluacion.personaRef).pipe(
            map((persona) => {
              memoria.solicitante = persona;
              return memoria;
            }),
            catchError((e) => of(memoria)),
          );
        }
        else {
          return of(memoria);
        }
      })
    );
  }

  buildPatch(value: IMemoriaWithPersona): { [key: string]: any } {
    this.logger.debug(EvaluacionEvaluacionFragment.name, 'buildPatch()', 'start');
    this.logger.debug(EvaluacionEvaluacionFragment.name, 'buildPatch()', 'end');
    return {
      comite: value.comite.comite,
      fechaEvaluacion: value.fechaEnvioSecretaria,
      referenciaMemoria: value.numReferencia,
      version: value.version,
      solicitante: `${value?.solicitante?.nombre} ${value?.solicitante?.primerApellido} ${value?.solicitante?.segundoApellido}`,
      dictamen: this.evaluacion.dictamen
    };
  }

  getValue(): IMemoriaWithPersona {
    this.logger.debug(EvaluacionEvaluacionFragment.name, 'getValue()', 'start');
    this.logger.debug(EvaluacionEvaluacionFragment.name, 'getValue()', 'end');
    return this.memoria;
  }

  saveOrUpdate(): Observable<number> {
    this.logger.debug(EvaluacionEvaluacionFragment.name, 'saveOrUpdate()', 'start');

    this.evaluacion = this.getValueFormDictamen();

    const obs = this.isEdit() ? this.service.update(this.evaluacion.id, this.evaluacion) : this.service.create(this.evaluacion);

    this.logger.debug(EvaluacionEvaluacionFragment.name, 'saveOrUpdate()', 'end');
    return obs.pipe(
      map((value) => {
        this.evaluacion = value;
        return this.evaluacion.id;
      })
    );
  }

  getValueFormDictamen(): IEvaluacion {
    this.logger.debug(EvaluacionEvaluacionFragment.name, 'getValueFormDictamen()', 'start');
    const form = this.getFormGroup().value;
    this.evaluacion.dictamen = form.dictamen;
    this.logger.debug(EvaluacionEvaluacionFragment.name, 'getValueFormDictamen()', 'end');
    return this.evaluacion;
  }

  setComentarios(comentarios: BehaviorSubject<StatusWrapper<IComentario>[]>) {
    this.comentarios$ = comentarios;
  }

}

