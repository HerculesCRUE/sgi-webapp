import { IPeticionEvaluacion } from '@core/models/eti/peticion-evaluacion';
import { FormFragment } from '@core/services/action-service';
import { FormGroup, FormBuilder, Validators, NgControlStatus } from '@angular/forms';
import { Observable, of, EMPTY, BehaviorSubject } from 'rxjs';
import { PeticionEvaluacionService } from '@core/services/eti/peticion-evaluacion.service';
import { NullIdValidador } from '@core/validators/null-id-validador';
import { SgiAuthService } from '@sgi/framework/auth/public-api';
import { catchError, map, switchMap } from 'rxjs/operators';


export class PeticionEvaluacionDatosGeneralesFragment extends FormFragment<IPeticionEvaluacion> {

  private peticionEvaluacion: IPeticionEvaluacion;
  public readonly: boolean;
  public isTipoInvestigacionTutelada$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private fb: FormBuilder,
    key: number,
    private service: PeticionEvaluacionService,
    private sgiAuthService: SgiAuthService,
    readonly: boolean
  ) {
    super(key);
    this.peticionEvaluacion = {} as IPeticionEvaluacion;
    this.peticionEvaluacion.activo = true;
    this.peticionEvaluacion.externo = false;
    this.peticionEvaluacion.tieneFondosPropios = false;
    this.peticionEvaluacion.personaRef = sgiAuthService.authStatus$.getValue().userRefId;
    this.readonly = readonly;
  }

  protected buildFormGroup(): FormGroup {
    return this.fb.group({
      codigo: [{ value: '', disabled: true }, Validators.required],
      titulo: ['', Validators.required],
      tipoActividad: [{ value: '', disabled: this.readonly }, new NullIdValidador().isValid()],
      tipoInvestigacionTutelada: [{ value: '', disabled: this.readonly }, []],
      financiacion: [{ value: '', disabled: this.readonly }, Validators.required],
      fechaInicio: [{ value: '', disabled: this.readonly }, Validators.required],
      fechaFin: [{ value: '', disabled: this.readonly }, Validators.required],
      resumen: [{ value: '', disabled: this.readonly }, Validators.required],
      valorSocial: [{ value: '', disabled: this.readonly }, Validators.required],
      objetivosCientificos: [{ value: '', disabled: this.readonly }, Validators.required],
      disenioMetodologico: [{ value: '', disabled: this.readonly }, Validators.required],
    });
  }

  protected initializer(key: number): Observable<IPeticionEvaluacion> {
    return this.service.findById(key).pipe(
      switchMap((value: IPeticionEvaluacion) => {
        this.peticionEvaluacion = value;
        this.isTipoInvestigacionTutelada$.next(this.peticionEvaluacion.tipoInvestigacionTutelada ? true : false);
        return of(value);
      }),
      catchError(() => {
        return EMPTY;
      })
    );
  }

  protected buildPatch(value: IPeticionEvaluacion): { [key: string]: any; } {
    return {
      codigo: value.codigo,
      titulo: value.titulo,
      tipoActividad: value.tipoActividad,
      tipoInvestigacionTutelada: value.tipoInvestigacionTutelada,
      financiacion: value.fuenteFinanciacion,
      fechaInicio: value.fechaInicio,
      fechaFin: value.fechaFin,
      resumen: value.resumen,
      valorSocial: value.valorSocial,
      objetivosCientificos: value.objetivos,
      disenioMetodologico: value.disMetodologico
    };
  }

  getValue(): IPeticionEvaluacion {
    const form = this.getFormGroup().value;
    this.peticionEvaluacion.codigo = form.codigo ? form.codigo : this.getFormGroup().controls.codigo.value;
    this.peticionEvaluacion.titulo = form.titulo ? form.titulo : this.getFormGroup().controls.titulo.value;
    this.peticionEvaluacion.tipoActividad = form.tipoActividad;
    this.peticionEvaluacion.tipoInvestigacionTutelada = form.tipoInvestigacionTutelada;
    this.peticionEvaluacion.fuenteFinanciacion = form.financiacion;
    this.peticionEvaluacion.fechaInicio = form.fechaInicio;
    this.peticionEvaluacion.fechaFin = form.fechaFin;
    this.peticionEvaluacion.resumen = form.resumen;
    this.peticionEvaluacion.valorSocial = form.valorSocial;
    this.peticionEvaluacion.objetivos = form.objetivosCientificos;
    this.peticionEvaluacion.disMetodologico = form.disenioMetodologico;

    return this.peticionEvaluacion;
  }

  clearInvestigacionTutelada() {
    this.getFormGroup().controls.tipoInvestigacionTutelada.reset();
  }

  saveOrUpdate(): Observable<number | void> {
    const datosGenerales = this.getValue();
    const obs = this.isEdit() ? this.service.update(datosGenerales.id, datosGenerales) : this.service.create(datosGenerales);
    return obs.pipe(
      map((value) => {
        this.peticionEvaluacion = value;
        return this.peticionEvaluacion.id;
      })
    );
  }
}

