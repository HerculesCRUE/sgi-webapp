import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IComentario } from '@core/models/eti/comentario';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { IMemoriaWithPersona } from '@core/models/eti/memoria-with-persona';
import { FormFragment } from '@core/services/action-service';
import { EvaluacionService } from '@core/services/eti/evaluacion.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NullIdValidador } from '@core/validators/null-id-validador';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export class SeguimientoEvaluacionFragment extends FormFragment<IMemoriaWithPersona> {

  private memoria: IMemoriaWithPersona;
  evaluacion$: BehaviorSubject<IEvaluacion> = new BehaviorSubject<IEvaluacion>(null);
  evaluacion: IEvaluacion;
  comentarios$: BehaviorSubject<StatusWrapper<IComentario>[]> = new BehaviorSubject<StatusWrapper<IComentario>[]>([]);


  constructor(
    private fb: FormBuilder,
    key: number,
    protected readonly snackBarService: SnackBarService,
    private service: EvaluacionService,
    private personaFisicaService: PersonaFisicaService) {
    super(key);
    this.memoria = {} as IMemoriaWithPersona;
  }

  protected buildFormGroup(): FormGroup {
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
    return this.memoria;
  }

  saveOrUpdate(): Observable<number> {
    this.evaluacion = this.getValueFormDictamen();

    const obs = this.isEdit() ? this.service.update(this.evaluacion.id, this.evaluacion) : this.service.create(this.evaluacion);
    return obs.pipe(
      map((value) => {
        this.evaluacion = value;
        return this.evaluacion.id;
      })
    );
  }

  getValueFormDictamen(): IEvaluacion {
    const form = this.getFormGroup().value;
    this.evaluacion.dictamen = form.dictamen;
    return this.evaluacion;
  }

  setComentarios(comentarios: BehaviorSubject<StatusWrapper<IComentario>[]>) {
    this.comentarios$ = comentarios;
  }
}

