import { FormFragment } from '@core/services/action-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { ConvocatoriaRequisitoEquipoService } from '@core/services/csp/convocatoria-requisito-equipo.service';
import { IConvocatoriaRequisitoEquipo } from '@core/models/csp/convocatoria-requisito-equipo';

export class ConvocatoriaRequisitosEquipoFragment extends FormFragment<IConvocatoriaRequisitoEquipo> {

  private requisitoEquipo: IConvocatoriaRequisitoEquipo;

  constructor(
    private fb: FormBuilder,
    private readonly logger: NGXLogger,
    key: number,
    private convocatoriaRequisitoEquipoService: ConvocatoriaRequisitoEquipoService) {
    super(key, true);
    this.setComplete(true);
    this.requisitoEquipo = {} as IConvocatoriaRequisitoEquipo;
  }

  protected buildFormGroup(): FormGroup {
    this.logger.debug(ConvocatoriaRequisitosEquipoFragment.name, 'buildFormGroup()', 'start');
    return this.fb.group({
      nivelAcademicoRef: ['', Validators.maxLength(50)],
      aniosNivelAcademico: ['', Validators.compose(
        [Validators.min(0), Validators.max(9999)])],
      edadMaxima: ['', Validators.compose(
        [Validators.min(0), Validators.max(99)])],
      vinculacionUniversidad: [null],
      modalidadContratoRef: ['', Validators.maxLength(50)],
      aniosVinculacion: ['', Validators.compose(
        [Validators.min(0), Validators.max(9999)])],
      numMinimoCompetitivos: ['', Validators.compose(
        [Validators.min(0), Validators.max(9999)])],
      numMinimoNoCompetitivos: ['', Validators.compose(
        [Validators.min(0), Validators.max(9999)])],
      numMaximoCompetitivosActivos: ['', Validators.compose(
        [Validators.min(0), Validators.max(9999)])],
      numMaximoNoCompetitivosActivos: ['', Validators.compose(
        [Validators.min(0), Validators.max(9999)])],
      otrosRequisitos: ['']
    });
  }

  protected initializer(key: number): Observable<IConvocatoriaRequisitoEquipo> {
    this.logger.debug(ConvocatoriaRequisitosEquipoFragment.name, 'initializer(key: number)', 'start');
    if (this.getKey()) {
      return this.convocatoriaRequisitoEquipoService.findById(key).pipe(
        switchMap((requisitoEquipo) => {
          this.requisitoEquipo = requisitoEquipo;
          this.logger.debug(ConvocatoriaRequisitosEquipoFragment.name, 'initializer(key: number)', 'end');
          return of(this.requisitoEquipo);
        })
      );
    }
  }

  buildPatch(value: IConvocatoriaRequisitoEquipo): { [key: string]: any } {
    this.logger.debug(ConvocatoriaRequisitosEquipoFragment.name, 'buildPatch(value: IConvocatoriaRequisitoEquipo)', 'start');
    return {
      nivelAcademicoRef: value ? value.nivelAcademicoRef : null,
      aniosNivelAcademico: value ? value.aniosNivelAcademico : null,
      edadMaxima: value ? value.edadMaxima : null,
      vinculacionUniversidad: value ? value.vinculacionUniversidad : null,
      modalidadContratoRef: value ? value.modalidadContratoRef : null,
      aniosVinculacion: value ? value.aniosVinculacion : null,
      numMinimoCompetitivos: value ? value.numMinimoCompetitivos : null,
      numMinimoNoCompetitivos: value ? value.numMinimoNoCompetitivos : null,
      numMaximoCompetitivosActivos: value ? value.numMaximoCompetitivosActivos : null,
      numMaximoNoCompetitivosActivos: value ? value.numMaximoNoCompetitivosActivos : null,
      otrosRequisitos: value ? value.otrosRequisitos : null
    };
  }

  getValue(): IConvocatoriaRequisitoEquipo {
    this.logger.debug(ConvocatoriaRequisitosEquipoFragment.name, 'getValue()', 'start');
    if (this.requisitoEquipo === null) {
      this.requisitoEquipo = {} as IConvocatoriaRequisitoEquipo;
    }
    const form = this.getFormGroup().value;
    this.requisitoEquipo.nivelAcademicoRef = form.nivelAcademicoRef;
    this.requisitoEquipo.aniosNivelAcademico = form.aniosNivelAcademico;
    this.requisitoEquipo.edadMaxima = form.edadMaxima;
    this.requisitoEquipo.vinculacionUniversidad = form.vinculacionUniversidad;
    this.requisitoEquipo.modalidadContratoRef = form.modalidadContratoRef;
    this.requisitoEquipo.aniosVinculacion = form.aniosVinculacion;
    this.requisitoEquipo.numMinimoCompetitivos = form.numMinimoCompetitivos;
    this.requisitoEquipo.numMinimoNoCompetitivos = form.numMinimoNoCompetitivos;
    this.requisitoEquipo.numMaximoCompetitivosActivos = form.numMaximoCompetitivosActivos;
    this.requisitoEquipo.numMaximoNoCompetitivosActivos = form.numMaximoNoCompetitivosActivos;
    this.requisitoEquipo.otrosRequisitos = form.otrosRequisitos;
    this.logger.debug(ConvocatoriaRequisitosEquipoFragment.name, 'getValue()', 'end');
    return this.requisitoEquipo;
  }

  saveOrUpdate(): Observable<number> {
    this.logger.debug(ConvocatoriaRequisitosEquipoFragment.name, 'saveOrUpdate()', 'start');
    const datosrequisitoEquipo = this.getValue();
    datosrequisitoEquipo.convocatoria = {
      id: this.getKey()
    } as IConvocatoria;
    const obs = datosrequisitoEquipo.id ? this.update(datosrequisitoEquipo) :
      this.create(datosrequisitoEquipo);
    return obs.pipe(
      map((value) => {
        this.requisitoEquipo = value;
        this.logger.debug(ConvocatoriaRequisitosEquipoFragment.name, 'saveOrUpdate()', 'end');
        return this.requisitoEquipo.id;
      })
    );
  }

  private create(requisitoEquipo: IConvocatoriaRequisitoEquipo): Observable<IConvocatoriaRequisitoEquipo> {
    this.logger.debug(ConvocatoriaRequisitosEquipoFragment.name,
      `${this.create.name}(requisitoEquipo: ${requisitoEquipo})`, 'start');
    return this.convocatoriaRequisitoEquipoService.create(requisitoEquipo).pipe(
      tap(result => this.requisitoEquipo = result),
      tap(() => this.logger.debug(ConvocatoriaRequisitosEquipoFragment.name,
        `${this.create.name}(requisitoEquipo: ${requisitoEquipo})`, 'end'))
    );
  }

  private update(requisitoEquipo: IConvocatoriaRequisitoEquipo): Observable<IConvocatoriaRequisitoEquipo> {
    this.logger.debug(ConvocatoriaRequisitosEquipoFragment.name,
      `${this.update.name}(requisitoEquipo: ${requisitoEquipo})`, 'start');
    return this.convocatoriaRequisitoEquipoService.update(Number(this.getKey()), requisitoEquipo).pipe(
      tap(result => this.requisitoEquipo = result),
      tap(() => this.logger.debug(ConvocatoriaRequisitosEquipoFragment.name,
        `${this.update.name}(requisitoEquipo: ${requisitoEquipo})`, 'end'))
    );
  }

}
