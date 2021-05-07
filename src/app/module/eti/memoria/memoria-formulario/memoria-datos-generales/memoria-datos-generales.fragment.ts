import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IMemoria } from '@core/models/eti/memoria';
import { IPeticionEvaluacion } from '@core/models/eti/peticion-evaluacion';
import { IPersona } from '@core/models/sgp/persona';
import { FormFragment } from '@core/services/action-service';
import { MemoriaService } from '@core/services/eti/memoria.service';
import { PeticionEvaluacionService } from '@core/services/eti/peticion-evaluacion.service';
import { PersonaService } from '@core/services/sgp/persona.service';
import { IsEntityValidator } from '@core/validators/is-entity-validador';
import { NullIdValidador } from '@core/validators/null-id-validador';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

export class MemoriaDatosGeneralesFragment extends FormFragment<IMemoria>  {
  private memoria: IMemoria;
  public readonly: boolean;
  public showCodOrganoCompetente = false;
  public showTitulo = false;
  public showMemoriaOriginal = false;
  public personasResponsable$: BehaviorSubject<IPersona[]> = new BehaviorSubject<IPersona[]>([]);
  public mostrarCodOrgano = false;

  private idPeticionEvaluacion: number;

  constructor(
    private fb: FormBuilder, readonly: boolean, key: number, private service: MemoriaService,
    private personaService: PersonaService,
    private readonly peticionEvaluacionService: PeticionEvaluacionService) {
    super(key);
    this.memoria = {} as IMemoria;
    this.readonly = readonly;
  }

  public loadResponsable(idPeticionEvaluacion: number): void {
    this.idPeticionEvaluacion = idPeticionEvaluacion;
    this.subscriptions.push(
      this.peticionEvaluacionService.findEquipoInvestigador(idPeticionEvaluacion).pipe(
        map((response) => {
          const equiposTrabajo = response.items;
          if (response.items) {
            const personaIdsEquiposTrabajo = new Set<string>(equiposTrabajo.map((equipoTrabajo) => equipoTrabajo.persona.id));
            this.personaService.findAllByIdIn([...personaIdsEquiposTrabajo]).pipe(
              map(
                responsePersonas => {
                  return responsePersonas.items;
                }
              )
            ).subscribe((persona) => {
              this.personasResponsable$.next(persona);
            });
          }
        })
      ).subscribe());
  }

  protected buildFormGroup(): FormGroup {
    return this.fb.group({
      numReferencia: [{ value: '', disabled: true }],
      comite: [{ value: this.isEdit() ? this.memoria.comite : '', disabled: (this.isEdit() || this.readonly) },
      [new NullIdValidador().isValid(), IsEntityValidator.isValid()]],
      tipoMemoria: [{
        value: this.isEdit() ?
          this.memoria.tipoMemoria : '', disabled: (this.isEdit() || this.readonly)
      }, IsEntityValidator.isValid()],
      titulo: [{ value: this.isEdit() ? this.memoria.titulo : '', disabled: this.readonly }],
      personaResponsable: [{ value: '', disabled: this.readonly }, Validators.maxLength(250)],
      codOrganoCompetente: [{ value: this.isEdit() ? this.memoria.codOrganoCompetente : '', disabled: this.readonly },
      Validators.maxLength(250)],
      memoriaOriginal: [{
        value: this.isEdit() ? this.memoria.memoriaOriginal?.numReferencia : '',
        disabled: this.isEdit()
      }, new NullIdValidador().isValid()]

    });
  }

  buildPatch(value: IMemoria): { [key: string]: any } {
    return {
      numReferencia: value.numReferencia,
      comite: value.comite,
      tipoMemoria: value.tipoMemoria,
      titulo: value.titulo,
      personaRef: value.responsable.id,
      codOrganoCompetente: value.codOrganoCompetente,
      memoriaOriginal: value.memoriaOriginal
    };
  }

  getValue(): IMemoria {
    const form = this.getFormGroup().value;
    if (!this.isEdit()) {
      this.memoria.comite = form.comite;
      this.memoria.tipoMemoria = form.tipoMemoria;
    }
    if (this.showTitulo && form.titulo) {
      this.memoria.titulo = form.titulo;
    }
    if (!this.memoria.responsable) {
      this.memoria.responsable = {
      } as IPersona;
    }
    this.memoria.responsable.id = form.personaResponsable.id;
    if (this.memoria.comite.comite === 'CEEA') {
      this.memoria.codOrganoCompetente = form.codOrganoCompetente;
    } else {
      this.memoria.codOrganoCompetente = null;
    }
    return this.memoria;
  }

  saveOrUpdate(): Observable<number> {
    const datosGenerales = this.getValue();
    datosGenerales.peticionEvaluacion = {} as IPeticionEvaluacion;
    datosGenerales.peticionEvaluacion.id = this.idPeticionEvaluacion;
    const obs = this.isEdit() ? this.service.update(this.getKey() as number, datosGenerales) :
      datosGenerales.tipoMemoria.id === 2 ?
        this.service.createMemoriaModificada(datosGenerales,
          this.getFormGroup().controls.memoriaOriginal.value.id) : this.service.create(datosGenerales);
    return obs.pipe(
      map((value) => {
        this.memoria = value;
        return this.memoria.id;
      })
    );
  }

  protected initializer(key: number): Observable<IMemoria> {
    if (this.getKey()) {
      return this.service.findById(key).pipe(
        switchMap((memoria) => {
          return this.personaService.findById(memoria.responsable.id).pipe(
            map((persona) => {
              this.getFormGroup().controls.personaResponsable.setValue(persona);
              this.memoria = memoria;

              this.showCodOrganoCompetente = this.memoria.comite.comite === 'CEEA' ? true : false;
              this.showTitulo = this.memoria.comite.comite === 'CEEA' ? true : false;
              this.showMemoriaOriginal = this.memoria.tipoMemoria.id === 2 ? true : false;
              if (!this.showMemoriaOriginal) {
                this.getFormGroup().controls.memoriaOriginal.clearValidators();
                this.getFormGroup().controls.memoriaOriginal.updateValueAndValidity();
              }
              return memoria;
            }),
            catchError(() => of(memoria)),
          );
        }),
        tap((memoria) => {
          this.loadResponsable(memoria.peticionEvaluacion.id);
        })
      );
    }
  }

}
