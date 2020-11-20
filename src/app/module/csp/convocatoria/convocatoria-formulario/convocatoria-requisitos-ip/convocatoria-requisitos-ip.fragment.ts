import { FormFragment } from '@core/services/action-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaRequisitoIP } from '@core/models/csp/convocatoria-requisito-ip';
import { ConvocatoriaRequisitoIPService } from '@core/services/csp/convocatoria-requisito-ip.service';

export class ConvocatoriaRequisitosIPFragment extends FormFragment<IConvocatoriaRequisitoIP> {

  private requisitoIP: IConvocatoriaRequisitoIP;

  constructor(
    private fb: FormBuilder,
    private readonly logger: NGXLogger,
    key: number,
    private convocatoriaRequisitoIPService: ConvocatoriaRequisitoIPService) {
    super(key, true);
    this.setComplete(true);
    this.requisitoIP = {} as IConvocatoriaRequisitoIP;
  }

  protected buildFormGroup(): FormGroup {
    this.logger.debug(ConvocatoriaRequisitosIPFragment.name, 'buildFormGroup()', 'start');
    return this.fb.group({
      numMaximoIP: [null, Validators.compose(
        [Validators.min(0), Validators.max(9999)])],
      nivelAcademicoRef: ['', Validators.maxLength(50)],
      aniosNivelAcademico: ['', Validators.compose(
        [Validators.min(0), Validators.max(9999)])],
      edadMaxima: ['', Validators.compose(
        [Validators.min(0), Validators.max(99)])],
      sexo: [null],
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

  protected initializer(key: number): Observable<IConvocatoriaRequisitoIP> {
    this.logger.debug(ConvocatoriaRequisitosIPFragment.name, 'initializer(key: number)', 'start');
    if (this.getKey()) {
      return this.convocatoriaRequisitoIPService.getRequisitoIPConvocatoria(key).pipe(
        switchMap((requisitoIP) => {
          this.requisitoIP = requisitoIP;
          this.logger.debug(ConvocatoriaRequisitosIPFragment.name, 'initializer(key: number)', 'end');
          return of(this.requisitoIP);
        })
      );
    }
  }

  buildPatch(value: IConvocatoriaRequisitoIP): { [key: string]: any } {
    this.logger.debug(ConvocatoriaRequisitosIPFragment.name, 'buildPatch(value: IConvocatoriaRequisitoIP)', 'start');
    return {
      numMaximoIP: value ? value.numMaximoIP : null,
      nivelAcademicoRef: value ? value.nivelAcademicoRef : null,
      aniosNivelAcademico: value ? value.aniosNivelAcademico : null,
      edadMaxima: value ? value.edadMaxima : null,
      sexo: value ? value.sexo : null,
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

  getValue(): IConvocatoriaRequisitoIP {
    this.logger.debug(ConvocatoriaRequisitosIPFragment.name, 'getValue()', 'start');
    if (this.requisitoIP === null) {
      this.requisitoIP = {} as IConvocatoriaRequisitoIP;
    }
    const form = this.getFormGroup().value;
    this.requisitoIP.numMaximoIP = form.numMaximoIP;
    this.requisitoIP.nivelAcademicoRef = form.nivelAcademicoRef;
    this.requisitoIP.aniosNivelAcademico = form.aniosNivelAcademico;
    this.requisitoIP.edadMaxima = form.edadMaxima;
    this.requisitoIP.sexo = form.sexo;
    this.requisitoIP.vinculacionUniversidad = form.vinculacionUniversidad;
    this.requisitoIP.modalidadContratoRef = form.modalidadContratoRef;
    this.requisitoIP.aniosVinculacion = form.aniosVinculacion;
    this.requisitoIP.numMinimoCompetitivos = form.numMinimoCompetitivos;
    this.requisitoIP.numMinimoNoCompetitivos = form.numMinimoNoCompetitivos;
    this.requisitoIP.numMaximoCompetitivosActivos = form.numMaximoCompetitivosActivos;
    this.requisitoIP.numMaximoNoCompetitivosActivos = form.numMaximoNoCompetitivosActivos;
    this.requisitoIP.otrosRequisitos = form.otrosRequisitos;
    this.logger.debug(ConvocatoriaRequisitosIPFragment.name, 'getValue()', 'end');
    return this.requisitoIP;
  }

  saveOrUpdate(): Observable<number> {
    this.logger.debug(ConvocatoriaRequisitosIPFragment.name, 'saveOrUpdate()', 'start');
    const datosRequisitoIP = this.getValue();
    datosRequisitoIP.convocatoria = {
      id: this.getKey()
    } as IConvocatoria;
    const obs = datosRequisitoIP.id ? this.update(datosRequisitoIP) :
      this.create(datosRequisitoIP);
    return obs.pipe(
      map((value) => {
        this.requisitoIP = value;
        this.logger.debug(ConvocatoriaRequisitosIPFragment.name, 'saveOrUpdate()', 'end');
        return this.requisitoIP.id;
      })
    );
  }

  private create(requisitoIP: IConvocatoriaRequisitoIP): Observable<IConvocatoriaRequisitoIP> {
    this.logger.debug(ConvocatoriaRequisitosIPFragment.name,
      `${this.create.name}(requisitoIP: ${requisitoIP})`, 'start');
    return this.convocatoriaRequisitoIPService.create(requisitoIP).pipe(
      tap(result => this.requisitoIP = result),
      tap(() => this.logger.debug(ConvocatoriaRequisitosIPFragment.name,
        `${this.create.name}(requisitoIP: ${requisitoIP})`, 'end'))
    );
  }

  private update(requisitoIP: IConvocatoriaRequisitoIP): Observable<IConvocatoriaRequisitoIP> {
    this.logger.debug(ConvocatoriaRequisitosIPFragment.name,
      `${this.update.name}(requisitoIP: ${requisitoIP})`, 'start');
    return this.convocatoriaRequisitoIPService.update(Number(this.getKey()), requisitoIP).pipe(
      tap(result => this.requisitoIP = result),
      tap(() => this.logger.debug(ConvocatoriaRequisitosIPFragment.name,
        `${this.update.name}(requisitoIP: ${requisitoIP})`, 'end'))
    );
  }

}
