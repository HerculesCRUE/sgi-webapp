import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaSeguimientoCientifico } from '@core/models/csp/convocatoria-seguimiento-cientifico';
import { Estado } from '@core/models/csp/estado-proyecto';
import { IProyecto } from '@core/models/csp/proyecto';
import { ISolicitudProyectoDatos } from '@core/models/csp/solicitud-proyecto-datos';
import { IUnidadGestion } from '@core/models/usr/unidad-gestion';
import { FormFragment } from '@core/services/action-service';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { ProyectoService } from '@core/services/csp/proyecto.service';
import { SolicitudService } from '@core/services/csp/solicitud.service';
import { TipoAmbitoGeograficoService } from '@core/services/csp/tipo-ambito-geografico.service';
import { TipoFinalidadService } from '@core/services/csp/tipo-finalidad.service';
import { UnidadGestionService } from '@core/services/csp/unidad-gestion.service';
import { DateValidator } from '@core/validators/date-validator';
import { IsEntityValidator } from '@core/validators/is-entity-validador';
import { RSQLSgiRestFilter, RSQLSgiRestSort, SgiRestFilterOperator, SgiRestFindOptions, SgiRestListResult, SgiRestSortDirection } from '@sgi/framework/http';
import moment from 'moment';
import { NGXLogger } from 'ngx-logger';
import { EMPTY, Observable, of, Subject } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ProyectoActionService } from '../../proyecto.action.service';

export class ProyectoFichaGeneralFragment extends FormFragment<IProyecto> {

  private proyecto: IProyecto;

  selectedConvocatoria: IConvocatoria;
  seguimientoCientificos: IConvocatoriaSeguimientoCientifico[] = [];

  abiertoRequired: boolean;
  comentarioEstadoCancelado: boolean;
  mostrarSolicitud = false;
  solicitudProyectoDatos: ISolicitudProyectoDatos;

  paquetesTrabajo$: Subject<boolean> = new Subject<boolean>();
  coordinadorExterno$: Subject<boolean> = new Subject<boolean>();
  proyectoConvocatoria$: Subject<IProyecto> = new Subject<IProyecto>();

  constructor(
    private logger: NGXLogger,
    private fb: FormBuilder,
    key: number,
    private service: ProyectoService,
    private unidadGestionService: UnidadGestionService,
    private modeloEjecucionService: ModeloEjecucionService,
    private tipoFinalidadService: TipoFinalidadService,
    private tipoAmbitoGeograficoService: TipoAmbitoGeograficoService,
    private convocatoriaService: ConvocatoriaService,
    private solicitudService: SolicitudService,
    private actionService: ProyectoActionService
  ) {
    super(key);
    this.proyecto = { activo: true } as IProyecto;
  }

  protected initializer(key: number): Observable<IProyecto> {
    return this.service.findById(key).pipe(
      tap(proyecto => {
        this.proyecto = proyecto;
      }),
      switchMap(() => {
        return this.loadUnidadGestion(this.proyecto.unidadGestion.acronimo);
      }),
      switchMap(() => {
        return this.proyecto.convocatoria ? this.loadConvocatoria(this.proyecto.convocatoria.id) : of(EMPTY);
      }),
      switchMap(() => {
        if (this.proyecto?.solicitud?.id) {
          return this.loadProyectoDatos(this.proyecto?.solicitud?.id);
        } else {
          return of(EMPTY);
        }
      }),
      map(() => {
        this.proyectoConvocatoria$.next(this.proyecto);
        return this.proyecto;
      }),
      catchError((error) => {
        this.logger.error(error);
        return EMPTY;
      })
    );
  }

  protected buildFormGroup(): FormGroup {
    const form = new FormGroup({
      estado: new FormControl({
        value: '',
        disabled: true
      }),
      titulo: new FormControl('', [
        Validators.required, Validators.maxLength(200)]),
      acronimo: new FormControl('', [Validators.maxLength(50)]),
      codigoExterno: new FormControl(null, [Validators.maxLength(50)]),
      fechaInicio: new FormControl('', [
        Validators.required]),
      fechaFin: new FormControl('', [
        Validators.required]),
      convocatoria: new FormControl({
        value: '',
        disabled: this.isEdit()
      }),
      convocatoriaExterna: new FormControl(null, [Validators.maxLength(200)]),
      unidadGestion: new FormControl('', [
        Validators.required, IsEntityValidator.isValid()]),
      modeloEjecucion: new FormControl('', [
        Validators.required, IsEntityValidator.isValid()]),
      finalidad: new FormControl(''),
      ambitoGeografico: new FormControl(''),
      confidencial: new FormControl(null),
      clasificacionCVN: new FormControl(null),
      colaborativo: new FormControl(null),
      coordinadorExterno: new FormControl(null),
      uniSubcontratada: new FormControl(null),
      timesheet: new FormControl(null),
      paquetesTrabajo: new FormControl(null),
      costeHora: new FormControl(null),
      contratacion: new FormControl(null),
      facturacion: new FormControl(null),
      iva: new FormControl(null),
      tipoHorasAnuales: new FormControl(''),
      observaciones: new FormControl(''),
      comentario: new FormControl({
        value: '',
        disabled: true
      }),
      solicitudProyecto: new FormControl({ value: '', disabled: true }),
    },
      {
        validators: [
          DateValidator.isAfter('fechaInicio', 'fechaFin')]
      });

    this.subscriptions.push(
      form.controls.convocatoria.valueChanges.subscribe(
        (convocatoria) => this.onConvocatoriaChange(convocatoria)
      )
    );
    return form;
  }

  buildPatch(proyecto: IProyecto): { [key: string]: any } {
    const result = {
      estado: proyecto.estado?.estado,
      titulo: proyecto.titulo,
      acronimo: proyecto.acronimo,
      codigoExterno: proyecto.codigoExterno,
      fechaInicio: proyecto.fechaInicio,
      fechaFin: proyecto.fechaFin,
      convocatoria: proyecto.convocatoria,
      convocatoriaExterna: proyecto.convocatoriaExterna,
      solicitud: proyecto.solicitud,
      unidadGestion: proyecto.unidadGestion,
      modeloEjecucion: proyecto.modeloEjecucion,
      finalidad: proyecto.finalidad,
      ambitoGeografico: proyecto.ambitoGeografico,
      confidencial: proyecto.confidencial,
      clasificacionCVN: proyecto.clasificacionCVN,
      colaborativo: proyecto.colaborativo,
      coordinadorExterno: proyecto.coordinadorExterno,
      uniSubcontratada: proyecto.uniSubcontratada,
      timesheet: proyecto.timesheet,
      paquetesTrabajo: proyecto.paquetesTrabajo,
      costeHora: proyecto.costeHora,
      contratacion: proyecto.contratos,
      facturacion: proyecto.facturacion,
      iva: proyecto.iva,
      tipoHorasAnuales: proyecto.tipoHorasAnuales,
      observaciones: proyecto.observaciones,
      comentario: proyecto.estado?.comentario
    };

    this.actionService.isProyectoColaborativo = proyecto.colaborativo;
    this.checkEstado(this.getFormGroup(), proyecto);

    if (proyecto.convocatoria && this.isEdit()) {
      this.getFormGroup().controls.convocatoriaExterna.disable();
    }

    this.subscriptions.push(
      this.getFormGroup().get('paquetesTrabajo').valueChanges.subscribe((value) => {
        this.paquetesTrabajo$.next(value);
      })
    );
    this.subscriptions.push(
      this.getFormGroup().get('coordinadorExterno').valueChanges.subscribe((value) => {
        this.coordinadorExterno$.next(value);
      })
    );
    return result;
  }

  getValue(): IProyecto {
    const form = this.getFormGroup().controls;
    this.proyecto.titulo = form.titulo.value;
    this.proyecto.acronimo = form.acronimo.value;
    this.proyecto.codigoExterno = form.acronimo.value;
    this.proyecto.fechaInicio = form.fechaInicio.value;
    this.proyecto.fechaFin = form.fechaFin.value;
    this.proyecto.convocatoria = form.convocatoria.value;
    if (form.convocatoria.value) {
      this.proyecto.convocatoriaExterna = undefined;
    } else {
      this.proyecto.convocatoriaExterna = form.convocatoriaExterna.value;
    }
    this.proyecto.solicitud = null;
    this.proyecto.unidadGestion = form.unidadGestion.value;
    this.proyecto.modeloEjecucion = form.modeloEjecucion.value;

    if (form.finalidad.value) {
      this.proyecto.finalidad = form.finalidad.value;
    } else {
      this.proyecto.finalidad = undefined;
    }

    if (form.ambitoGeografico.value) {
      this.proyecto.ambitoGeografico = form.ambitoGeografico.value;
    } else {
      this.proyecto.ambitoGeografico = undefined;
    }
    this.proyecto.confidencial = form.confidencial.value;
    this.proyecto.clasificacionCVN = form.clasificacionCVN.value;
    this.proyecto.colaborativo = form.colaborativo.value;
    this.proyecto.uniSubcontratada = form.uniSubcontratada.value;
    this.proyecto.timesheet = form.timesheet.value;
    this.proyecto.paquetesTrabajo = form.paquetesTrabajo.value;
    this.proyecto.costeHora = form.costeHora.value;
    this.proyecto.contratos = form.contratacion.value;
    this.proyecto.facturacion = form.facturacion.value;
    this.proyecto.iva = form.iva.value;
    if (form.tipoHorasAnuales.value?.length > 0) {
      this.proyecto.tipoHorasAnuales = form.tipoHorasAnuales.value;
    } else {
      this.proyecto.tipoHorasAnuales = undefined;
    }

    this.proyecto.comentario = form.comentario.value;
    this.proyecto.observaciones = form.observaciones.value;

    this.proyecto.coordinadorExterno = form.coordinadorExterno.value;
    return this.proyecto;
  }

  /**
  * Recupera los datos proyecto de una solicitud
  * @param idSolicitud id
  */
  private loadProyectoDatos(idSolicitud: number): Observable<ISolicitudProyectoDatos> {
    if (idSolicitud) {
      return this.solicitudService.findSolicitudProyectoDatos(idSolicitud).pipe(
        map(solicitudProyectoDatos => {
          if (solicitudProyectoDatos.titulo) {
            this.getFormGroup().controls.solicitudProyecto.setValue(solicitudProyectoDatos.titulo);
            this.mostrarSolicitud = true;
          } else {
            this.mostrarSolicitud = false;
          }
          return solicitudProyectoDatos;
        })
      );
    }
  }

  /**
   * Setea la convocatoria seleccionada en el formulario y los campos que dependende de esta
   *
   * @param convocatoria una convocatoria
   */
  private onConvocatoriaChange(convocatoria: IConvocatoria): void {
    this.seguimientoCientificos = [];

    if (convocatoria) {
      this.getFormGroup().controls.convocatoriaExterna.setValue('', { emitEvent: false });

      if (!this.proyecto.unidadGestion || !this.isEdit()) {
        this.subscriptions.push(
          this.unidadGestionService.findByAcronimo(convocatoria.unidadGestionRef).subscribe(unidadGestion => {
            this.getFormGroup().controls.unidadGestion.setValue(unidadGestion);
          })
        );
      }



      if (convocatoria.modeloEjecucion && (!this.proyecto.modeloEjecucion || !this.isEdit())) {
        this.subscriptions.push(
          this.modeloEjecucionService.findById(convocatoria.modeloEjecucion.id).subscribe(modeloEjecucion => {
            this.getFormGroup().controls.modeloEjecucion.setValue(modeloEjecucion);
          })
        );
      }


      if (convocatoria.finalidad && (!this.proyecto.finalidad || !this.isEdit())) {
        this.subscriptions.push(
          this.tipoFinalidadService.findById(convocatoria.finalidad.id).subscribe(tipoFinalidad => {
            this.getFormGroup().controls.finalidad.setValue(tipoFinalidad);
          })
        );
      }

      if (convocatoria.ambitoGeografico && (!this.proyecto.ambitoGeografico || !this.isEdit())) {
        this.subscriptions.push(
          this.tipoAmbitoGeograficoService.findById(convocatoria.ambitoGeografico.id).subscribe(tipoAmbitoGeografico => {
            this.getFormGroup().controls.ambitoGeografico.setValue(tipoAmbitoGeografico);
          })
        );
      }

      const options: SgiRestFindOptions = {
        sort: new RSQLSgiRestSort('numPeriodo', SgiRestSortDirection.ASC)
      };
      this.subscriptions.push(
        this.convocatoriaService.findSeguimientosCientificos(convocatoria.id, options).subscribe(
          res => {
            this.seguimientoCientificos = res.items;
            this.checkFechas();
          }
        )
      );
      this.getFormGroup().controls.convocatoriaExterna.disable();
    } else if (!this.isEdit()) {
      // Clean dependencies
      this.getFormGroup().controls.unidadGestion.setValue(null);
      // Enable fields
      this.getFormGroup().controls.unidadGestion.enable();
      this.getFormGroup().controls.convocatoriaExterna.enable();
    }
  }

  /**
   * Añade validadores al formulario dependiendo del estado del proyecto
   */
  private checkEstado(formgroup: FormGroup, proyecto: IProyecto): void {
    if (proyecto.estado.estado === Estado.ABIERTO) {
      formgroup.get('finalidad').setValidators([
        Validators.required, IsEntityValidator.isValid()]);
      formgroup.get('ambitoGeografico').setValidators([
        Validators.required, IsEntityValidator.isValid()]);
      formgroup.get('confidencial').setValidators([
        Validators.required]);
      formgroup.get('colaborativo').setValidators([
        Validators.required]);
      formgroup.get('coordinadorExterno').setValidators([
        Validators.required]);
      formgroup.get('timesheet').setValidators([
        Validators.required]);
      formgroup.get('paquetesTrabajo').setValidators([
        Validators.required]);
      formgroup.get('costeHora').setValidators([
        Validators.required]);
      formgroup.get('contratacion').setValidators([
        Validators.required]);
      formgroup.get('facturacion').setValidators([
        Validators.required]);
      formgroup.get('iva').setValidators([
        Validators.required]);
      this.abiertoRequired = true;
      this.comentarioEstadoCancelado = false;
    } else if (proyecto.estado.estado === Estado.CANCELADO) {
      this.comentarioEstadoCancelado = true;
      this.getFormGroup().disable();
    } else if (proyecto.estado.estado === Estado.FINALIZADO) {
      this.comentarioEstadoCancelado = false;
      this.getFormGroup().disable();
    } else {
      formgroup.get('finalidad').setValidators(IsEntityValidator.isValid());
      formgroup.get('ambitoGeografico').setValidators(IsEntityValidator.isValid());
      this.abiertoRequired = false;
      this.comentarioEstadoCancelado = false;
    }
  }

  get requiredAbierto() {
    return this.proyecto.estado.estado === Estado.ABIERTO;
  }

  saveOrUpdate(): Observable<number> {
    const fichaGeneral = this.getValue();
    const obs = fichaGeneral.id ? this.update(fichaGeneral) :
      this.create(fichaGeneral);
    return obs.pipe(
      map((value) => {
        this.proyecto = value;
        return this.proyecto.id;
      })
    );
  }

  private create(proyecto: IProyecto): Observable<IProyecto> {
    return this.service.create(proyecto).pipe(
      tap(result => this.proyecto = result)
    );
  }

  private update(proyecto: IProyecto): Observable<IProyecto> {
    return this.service.update(Number(this.getKey()), proyecto).pipe(
      tap(result => this.proyecto = result)
    );
  }

  /**
   * Carga los datos de la unidad de gestion en la proyecto
   *
   * @param acronimo Identificador de la unidad de gestion
   * @returns observable para recuperar los datos
   */
  private loadUnidadGestion(acronimo: string): Observable<SgiRestListResult<IUnidadGestion>> {
    const options: SgiRestFindOptions = {
      filter: new RSQLSgiRestFilter('acronimo', SgiRestFilterOperator.EQUALS, acronimo)
    };

    return this.unidadGestionService.findAll(options).pipe(
      tap(result => {
        if (result.items.length > 0) {
          this.proyecto.unidadGestion = result.items[0];
          this.getFormGroup().controls.unidadGestion.setValue(this.proyecto.unidadGestion);
        }
      })
    );

  }

  /**
   * Carga los datos de la convocatoria en la solicitud
   *
   * @param solicitanteRef Identificador del solicitante
   * @returns observable para recuperar los datos
   */
  private loadConvocatoria(convocatoriaId: number): Observable<IConvocatoria> {
    return this.convocatoriaService.findById(convocatoriaId).pipe(
      tap(convocatoria => {
        this.proyecto.convocatoria = convocatoria;
        this.selectedConvocatoria = this.proyecto.convocatoria;
      })
    );
  }

  checkFechas(): void {
    const inicioForm = this.getFormGroup().get('fechaInicio');
    const finForm = this.getFormGroup().get('fechaFin');
    this.deleteErrorRange(finForm);
    if (this.seguimientoCientificos.length > 0) {
      const fechaInicio = inicioForm.value ? new Date(inicioForm.value) : undefined;
      const fechaFin = finForm.value ? new Date(finForm.value) : undefined;
      if (fechaInicio && fechaFin) {
        fechaInicio.setHours(0);
        fechaInicio.setMinutes(0);
        fechaInicio.setSeconds(0);
        fechaFin.setHours(0);
        fechaFin.setMinutes(0);
        fechaFin.setSeconds(0);
        const mesInicial = this.seguimientoCientificos[0].mesInicial;
        const mesFinal = this.seguimientoCientificos[this.seguimientoCientificos.length - 1].mesFinal;
        const inicioProyecto = moment(fechaInicio).add((mesInicial - 1), 'M').toDate();
        const finProyecto = moment(fechaInicio).add((mesFinal - 1), 'M').toDate();
        if (inicioProyecto >= fechaInicio && finProyecto <= fechaFin) {
          return;
        }
        this.addErrorRange(finForm);
      }
    }
  }

  private deleteErrorRange(formControl: AbstractControl): void {
    if (formControl.errors) {
      delete formControl.errors.range;
      if (Object.keys(formControl.errors).length === 0) {
        formControl.setErrors(null);
      }
    }
  }

  private addErrorRange(formControl: AbstractControl): void {
    if (formControl.errors) {
      formControl.errors.range = true;
    } else {
      formControl.setErrors({ range: true });
    }
    formControl.markAsTouched({ onlySelf: true });
  }
}
