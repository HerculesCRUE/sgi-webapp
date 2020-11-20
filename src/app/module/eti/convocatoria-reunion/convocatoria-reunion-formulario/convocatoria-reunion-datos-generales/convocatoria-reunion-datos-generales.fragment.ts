import { IAsistente } from '@core/models/eti/asistente';
import { FormFragment } from '@core/services/action-service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NullIdValidador } from '@core/validators/null-id-validador';
import { HoraValidador } from '@core/validators/hora-validator';
import { MinutoValidador } from '@core/validators/minuto-validator';
import { EMPTY, from, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, takeLast, tap } from 'rxjs/operators';
import { IConvocatoriaReunion } from '@core/models/eti/convocatoria-reunion';
import { ConvocatoriaReunionService } from '@core/services/eti/convocatoria-reunion.service';
import { IEvaluador } from '@core/models/eti/evaluador';
import { AsistenteService } from '@core/services/eti/asistente.service';
import { NGXLogger } from 'ngx-logger';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { IPersona } from '@core/models/sgp/persona';
import { SgiRestFilterType, SgiRestListResult } from '@sgi/framework/http';
import { EvaluadorService } from '@core/services/eti/evaluador.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

export class ConvocatoriaReunionDatosGeneralesFragment extends FormFragment<IConvocatoriaReunion> {

  private convocatoriaReunion: IConvocatoriaReunion;
  convocantes: IEvaluador[] = [];
  evaluadoresComite: IEvaluador[] = [];
  asistentesOriginal: IAsistente[] = [];

  constructor(
    protected readonly logger: NGXLogger,
    private fb: FormBuilder,
    key: number,
    private readonly convocatoriaReunionService: ConvocatoriaReunionService,
    private readonly asistenteService: AsistenteService,
    private readonly personaFisicaService: PersonaFisicaService,
    private readonly evaluadorService: EvaluadorService
  ) {
    super(key);
    this.logger.debug(ConvocatoriaReunionDatosGeneralesFragment.name, 'constructor()', 'start');
    this.convocatoriaReunion = {} as IConvocatoriaReunion;
    this.convocatoriaReunion.activo = true;
    this.logger.debug(ConvocatoriaReunionDatosGeneralesFragment.name, 'constructor()', 'end');
  }

  protected buildFormGroup(): FormGroup {
    this.logger.debug(ConvocatoriaReunionDatosGeneralesFragment.name, 'buildFormGroup()', 'start');
    const fb = this.fb.group({
      comite: ['', new NullIdValidador().isValid()],
      fechaEvaluacion: ['', Validators.required],
      fechaLimite: ['', Validators.required],
      tipoConvocatoriaReunion: ['', new NullIdValidador().isValid()],
      horaInicio: ['', new HoraValidador().isValid()],
      minutoInicio: ['', new MinutoValidador().isValid()],
      lugar: ['', Validators.required],
      ordenDia: ['', Validators.required],
      convocantes: ['', Validators.required],
    });

    // En control del código solo aparece al editar
    if (this.isEdit()) {
      fb.addControl('codigo', new FormControl({ value: '', disabled: true }));
    }

    this.logger.debug(ConvocatoriaReunionDatosGeneralesFragment.name, 'buildFormGroup()', 'end');
    return fb;
  }

  protected initializer(key: number): Observable<IConvocatoriaReunion> {
    this.logger.debug(ConvocatoriaReunionDatosGeneralesFragment.name, 'initializer(key: number)', 'start');
    return this.convocatoriaReunionService.findByIdWithDatosGenerales(key).pipe(
      switchMap((value) => {
        this.convocatoriaReunion = value;
        return this.loadConvocantes();
      }),
      catchError(() => {
        this.logger.debug(ConvocatoriaReunionDatosGeneralesFragment.name, 'initializer(key: number)', 'end');
        return EMPTY;
      }),
      tap(() => {
        this.logger.debug(ConvocatoriaReunionDatosGeneralesFragment.name, 'initializer(key: number)', 'end');
      })
    );
  }

  /**
   * Carga los convocantes de la convocatoria
   */
  loadConvocantes(): Observable<IConvocatoriaReunion> {
    const filterComite = {
      field: 'comite.id',
      type: SgiRestFilterType.EQUALS,
      value: this.convocatoriaReunion.comite.id.toString()
    };
    return this.evaluadorService.findAll({ filters: [filterComite] })
      .pipe(
        switchMap((listadoConvocantes: SgiRestListResult<IEvaluador>) => {
          const personaRefs = listadoConvocantes.items.map((convocante: IEvaluador) => convocante.personaRef);
          return this.personaFisicaService.findByPersonasRefs(personaRefs)
            .pipe(
              map((personas: SgiRestListResult<IPersona>) => {
                return this.loadDatosPersona(personas, listadoConvocantes.items);
              })
            );
        }),
        switchMap((convocantes: IEvaluador[]) => {
          this.evaluadoresComite = convocantes;
          this.convocantes = convocantes;
          return this.loadAsistentes();
        }),
        switchMap(() => {
          return of(this.convocatoriaReunion);
        })
      );
  }

  /**
   * Carga los datos personales de los evaluadores
   *
   * @param listado Listado de personas
   * @param evaluadores Evaluadores
   */
  private loadDatosPersona(listado: SgiRestListResult<IPersona>, evaluadores: IEvaluador[]): IEvaluador[] {
    const personas = listado.items;
    evaluadores.forEach((convocante: IEvaluador) => {
      const datosPersonaConvocante = personas.find((persona: IPersona) => convocante.personaRef === persona.personaRef);
      convocante.nombre = datosPersonaConvocante?.nombre;
      convocante.primerApellido = datosPersonaConvocante?.primerApellido;
      convocante.segundoApellido = datosPersonaConvocante?.segundoApellido;
    });
    return evaluadores;
  }

  /**
   * Carga los asistentes que asistieron a la convocatoria dentro del formGroup
   */
  private loadAsistentes(): Observable<SgiRestListResult<IAsistente>> {
    return this.convocatoriaReunionService.findAsistentes(this.convocatoriaReunion.id).pipe(
      switchMap((asistentes: SgiRestListResult<IAsistente>) => {
        this.asistentesOriginal = asistentes.items;
        const asistentesFormGroup = [];
        const ids = asistentes.items.filter(asistente => asistente.asistencia)
          .map((convocante: IAsistente) => convocante.evaluador.id);
        this.convocantes.forEach((evaluador: IEvaluador) => {
          if (ids.includes(evaluador.id)) {
            asistentesFormGroup.push(evaluador);
          }
        });
        this.getFormGroup().get('convocantes').setValue(asistentesFormGroup);
        return of(asistentes);
      })
    );
  }

  buildPatch(value: IConvocatoriaReunion): { [key: string]: any } {
    this.logger.debug(ConvocatoriaReunionDatosGeneralesFragment.name, 'buildPatch(value: IConvocatoriaReunion)', 'start');
    const result = {
      codigo: value.codigo,
      comite: value.comite,
      fechaEvaluacion: value.fechaEvaluacion,
      fechaLimite: value.fechaLimite,
      tipoConvocatoriaReunion: value.tipoConvocatoriaReunion,
      horaInicio: value.horaInicio,
      minutoInicio: value.minutoInicio,
      lugar: value.lugar,
      ordenDia: value.ordenDia,
    };

    if (value.idActa) {
      // Si tiene Acta solo se podrá modificar lugar y orden del día
      this.getFormGroup().controls.comite.disable({ onlySelf: true });
      this.getFormGroup().controls.fechaEvaluacion.disable({ onlySelf: true });
      this.getFormGroup().controls.fechaLimite.disable({ onlySelf: true });
      this.getFormGroup().controls.tipoConvocatoriaReunion.disable({ onlySelf: true });
      this.getFormGroup().controls.horaInicio.disable({ onlySelf: true });
      this.getFormGroup().controls.minutoInicio.disable({ onlySelf: true });
      this.getFormGroup().controls.convocantes.disable({ onlySelf: true });
    } else {
      // Para que en la carga inicial no se permita editar si hay evaluaciones asignadas.
      if (value.numEvaluaciones > 0) {
        this.getFormGroup().controls.comite.disable({ onlySelf: true });
        this.getFormGroup().controls.fechaLimite.disable({ onlySelf: true });
        this.getFormGroup().controls.tipoConvocatoriaReunion.disable({ onlySelf: true });
      } else if (value.fechaEnvio) {
        // Si ya se ha enviado no se podrá modificar el comité
        this.getFormGroup().controls.comite.disable({ onlySelf: true });
      }
    }

    this.logger.debug(ConvocatoriaReunionDatosGeneralesFragment.name, 'buildPatch(value: IConvocatoriaReunion)', 'end');
    return result;
  }

  /**
   * True / False si la convocatoria tiene Acta
   */
  hasActa(): boolean {
    return (this.convocatoriaReunion && this.convocatoriaReunion.idActa) ? true : false;
  }

  getValue(): IConvocatoriaReunion {
    this.logger.debug(ConvocatoriaReunionDatosGeneralesFragment.name, 'getValue()', 'start');
    const form = this.getFormGroup();
    this.convocatoriaReunion.comite = (this.getFormGroup().controls.comite.disabled) ?
      this.getFormGroup().controls.comite.value : form.controls.comite.value;
    this.convocatoriaReunion.fechaEvaluacion = form.controls.fechaEvaluacion.value;
    this.convocatoriaReunion.fechaLimite = (this.getFormGroup().controls.fechaLimite.disabled) ?
      this.getFormGroup().controls.fechaLimite.value : form.controls.fechaLimite.value;
    this.convocatoriaReunion.tipoConvocatoriaReunion = (this.getFormGroup().controls.tipoConvocatoriaReunion.disabled) ?
      this.getFormGroup().controls.tipoConvocatoriaReunion.value : form.controls.tipoConvocatoriaReunion.value;
    this.convocatoriaReunion.horaInicio = form.controls.horaInicio.value;
    this.convocatoriaReunion.minutoInicio = form.controls.minutoInicio.value;
    this.convocatoriaReunion.lugar = form.controls.lugar.value;
    this.convocatoriaReunion.ordenDia = form.controls.ordenDia.value;
    this.logger.debug(ConvocatoriaReunionDatosGeneralesFragment.name, 'getValue()', 'end');
    return this.convocatoriaReunion;
  }

  saveOrUpdate(): Observable<number> {
    this.logger.debug(ConvocatoriaReunionDatosGeneralesFragment.name, 'saveOrUpdate()', 'start');

    const datosGenerales = this.getValue();
    const obs$ = this.isEdit() ? this.update(datosGenerales) : this.create(datosGenerales);
    return obs$.pipe(
      map((value) => {
        this.convocatoriaReunion = value;
        return value.id;
      }),
      tap(() => this.logger.debug(ConvocatoriaReunionDatosGeneralesFragment.name, 'saveOrUpdate()', 'end'))
    );
  }

  private create(datosGenerales: IConvocatoriaReunion): Observable<IConvocatoriaReunion> {
    this.logger.debug(ConvocatoriaReunionDatosGeneralesFragment.name, 'create(datosGenerales: IConvocatoriaReunion)', 'start');
    return this.convocatoriaReunionService.create(datosGenerales).pipe(
      switchMap((convocatoriaReunion) => {
        return this.saveAsistentes(convocatoriaReunion);
      }),
      tap(() => this.logger.debug(ConvocatoriaReunionDatosGeneralesFragment.name, 'create()', 'end'))
    );
  }

  private saveAsistentes(convocatoriaReunion: IConvocatoriaReunion): Observable<IConvocatoriaReunion> {
    this.logger.debug(ConvocatoriaReunionDatosGeneralesFragment.name,
      'saveAsistentes(convocatoriaReunion: IConvocatoriaReunion)', 'start');

    const asistentes: IAsistente[] = this.evaluadoresComite.map(
      (convocante) => {
        const asistencia = {} as IAsistente;
        asistencia.id = null;
        asistencia.convocatoriaReunion = convocatoriaReunion;
        asistencia.evaluador = convocante;
        asistencia.asistencia = false;
        asistencia.motivo = null;
        if (this.getFormGroup().controls.convocantes.value.includes(convocante)) {
          asistencia.asistencia = true;
        }
        return asistencia;
      }
    );

    return from(asistentes).pipe(
      mergeMap((asistente) => {
        return this.asistenteService.create(asistente).pipe(
          map((createdAsistente) => {
            convocatoriaReunion.convocantes.push(createdAsistente);
          })
        );
      }),
      takeLast(1),
      map(() => convocatoriaReunion),
      tap(() => this.logger.debug(ConvocatoriaReunionDatosGeneralesFragment.name,
        'saveAsistentes(convocatoriaReunion: IConvocatoriaReunion)', 'end'))
    );
  }

  private update(datosGenerales: IConvocatoriaReunion): Observable<IConvocatoriaReunion> {
    this.logger.debug(ConvocatoriaReunionDatosGeneralesFragment.name, 'update(datosGenerales: IConvocatoriaReunion)', 'start');
    return this.convocatoriaReunionService.update(datosGenerales.id, datosGenerales).pipe(
      switchMap((convocatoriaReunion) => {
        this.logger.debug(ConvocatoriaReunionDatosGeneralesFragment.name, 'update(datosGenerales: IConvocatoriaReunion)', 'end');
        return this.updateAsistentes(convocatoriaReunion);
      })
    );
  }

  private updateAsistentes(convocatoriaReunion: IConvocatoriaReunion): Observable<IConvocatoriaReunion> {
    this.logger.debug(ConvocatoriaReunionDatosGeneralesFragment.name,
      'updateAsistentes(convocatoriaReunion: IConvocatoriaReunion)', 'start');

    const convocantes: IEvaluador[] = this.getFormGroup().controls.convocantes.value;
    this.asistentesOriginal.forEach(asistente => {
      asistente.asistencia = false;
      convocantes.forEach(evaluador => {
        if (asistente.evaluador.id === evaluador.id) {
          asistente.asistencia = true;
        }
      });
    });

    return from(this.asistentesOriginal).pipe(
      mergeMap((asistente) => {
        return this.asistenteService.update(asistente.id, asistente).pipe(
          map((createdAsistente) => {
            convocatoriaReunion.convocantes.push(createdAsistente);
          })
        );
      }),
      takeLast(1),
      map(() => convocatoriaReunion),
      tap(() => this.logger.debug(ConvocatoriaReunionDatosGeneralesFragment.name,
        'saveAsistentes(convocatoriaReunion: IConvocatoriaReunion)', 'end'))
    );
  }
}
