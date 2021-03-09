import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaEntidadConvocante } from '@core/models/csp/convocatoria-entidad-convocante';
import { Estado } from '@core/models/csp/estado-solicitud';
import { IPrograma } from '@core/models/csp/programa';
import { ISolicitud } from '@core/models/csp/solicitud';
import { ISolicitudModalidad } from '@core/models/csp/solicitud-modalidad';
import { IPersona } from '@core/models/sgp/persona';
import { IUnidadGestion } from '@core/models/usr/unidad-gestion';
import { FormFragment } from '@core/services/action-service';
import { ConfiguracionSolicitudService } from '@core/services/csp/configuracion-solicitud.service';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { SolicitudModalidadService } from '@core/services/csp/solicitud-modalidad.service';
import { SolicitudService } from '@core/services/csp/solicitud.service';
import { UnidadGestionService } from '@core/services/csp/unidad-gestion.service';
import { EmpresaEconomicaService } from '@core/services/sgp/empresa-economica.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { IsEntityValidator } from '@core/validators/is-entity-validador';
import { SgiAuthService } from '@sgi/framework/auth';
import { RSQLSgiRestFilter, SgiRestFilterOperator, SgiRestFindOptions, SgiRestListResult } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, EMPTY, from, merge, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, takeLast, tap } from 'rxjs/operators';


export interface SolicitudModalidadEntidadConvocanteListado {
  entidadConvocante: IConvocatoriaEntidadConvocante;
  plan: IPrograma;
  modalidad: StatusWrapper<ISolicitudModalidad>;
}

export class SolicitudDatosGeneralesFragment extends FormFragment<ISolicitud> {

  solicitud: ISolicitud;

  entidadesConvocantes = [] as IConvocatoriaEntidadConvocante[];

  entidadesConvocantesModalidad$ = new BehaviorSubject<SolicitudModalidadEntidadConvocanteListado[]>([]);

  public showComentariosEstado$ = new BehaviorSubject<boolean>(false);

  convocatoriaRequired = false;
  convocatoriaExternaRequired = false;

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private service: SolicitudService,
    private configuracionSolicitudService: ConfiguracionSolicitudService,
    private convocatoriaService: ConvocatoriaService,
    private empresaEconomicaService: EmpresaEconomicaService,
    private personaFisicaService: PersonaFisicaService,
    private solicitudModalidadService: SolicitudModalidadService,
    private unidadGestionService: UnidadGestionService,
    private sgiAuthService: SgiAuthService,
    public readonly: boolean
  ) {
    super(key, true);
    this.setComplete(true);
    this.solicitud = { activo: true } as ISolicitud;
  }

  protected initializer(key: number): Observable<ISolicitud> {
    return this.service.findById(key).pipe(
      tap(solicitud => {
        this.solicitud = solicitud;
      }),
      switchMap(() => {
        return this.loadSolicitante(this.solicitud.solicitante.personaRef);
      }),
      switchMap(() => {
        return this.loadUnidadGestion(this.solicitud.unidadGestion.acronimo);
      }),
      switchMap(() => {
        return this.solicitud.convocatoria ?
          this.loadEntidadesConvocantesModalidad(this.solicitud.id, this.solicitud.convocatoria.id) : of([]);
      }),
      map(() => {
        if (this.solicitud && this.solicitud.estado) {
          const estadosComentarioVisble = [
            Estado.EXCLUIDA_PROVISIONAL,
            Estado.DESISTIDA,
            Estado.ALEGADA_ADMISION,
            Estado.EXCLUIDA,
            Estado.DENEGADA_PROVISIONAL,
            Estado.ALEGADA_CONCESION,
            Estado.DENEGADA
          ];

          this.showComentariosEstado$.next(estadosComentarioVisble.includes(this.solicitud.estado.estado));
        } else {
          this.showComentariosEstado$.next(false);
        }

        return this.solicitud;
      }),
      catchError((error) => {
        this.logger.error(error);
        return EMPTY;
      })
    );
  }

  protected buildFormGroup(): FormGroup {
    const form = new FormGroup({
      estado: new FormControl({ value: Estado.BORRADOR, disabled: true }),
      solicitante: new FormControl('', Validators.required),
      convocatoria: new FormControl({ value: '', disabled: this.isEdit() }),
      comentariosEstado: new FormControl({ value: '', disabled: true }),
      convocatoriaExterna: new FormControl(''),
      formularioSolicitud: new FormControl({ value: null, disabled: this.isEdit() }),
      unidadGestion: new FormControl({ value: '' }),
      codigoExterno: new FormControl('', Validators.maxLength(50)),
      codigoRegistro: new FormControl({ value: '', disabled: true }),
      observaciones: new FormControl('', Validators.maxLength(2000))
    });

    // Se setean los validaores condicionales y se hace una subscripcion a los campos que provocan
    // cambios en los validadores del formulario
    this.setConditionalValidators(form);

    this.subscriptions.push(
      merge(
        form.controls.convocatoria.valueChanges,
        form.controls.convocatoriaExterna.valueChanges
      ).subscribe(_ => {
        this.setConditionalValidators(form);
      })
    );

    this.subscriptions.push(
      form.controls.convocatoria.valueChanges.subscribe(
        (convocatoria) => this.onConvocatoriaChange(convocatoria)
      )
    );

    if (this.readonly) {
      form.disable();
    }

    return form;
  }

  buildPatch(solicitud: ISolicitud): { [key: string]: any } {
    const result = {
      estado: solicitud.estado?.estado,
      comentariosEstado: solicitud.estado?.comentario,
      solicitante: solicitud.solicitante,
      convocatoria: solicitud.convocatoria,
      convocatoriaExterna: solicitud.convocatoriaExterna,
      formularioSolicitud: solicitud.formularioSolicitud,
      unidadGestion: solicitud.unidadGestion,
      codigoRegistro: solicitud.codigoRegistroInterno,
      codigoExterno: solicitud.codigoExterno,
      observaciones: solicitud.observaciones
    };

    // Validaciones con los datos iniciales del formulario
    this.setConditionalValidators(this.getFormGroup(), solicitud);

    return result;
  }

  getValue(): ISolicitud {
    const form = this.getFormGroup().controls;

    this.solicitud.solicitante = form.solicitante.value;
    this.solicitud.convocatoria = form.convocatoria.value;
    this.solicitud.convocatoriaExterna = form.convocatoriaExterna.value;
    this.solicitud.formularioSolicitud = form.formularioSolicitud.value;
    this.solicitud.unidadGestion = form.unidadGestion.value;
    this.solicitud.codigoExterno = form.codigoExterno.value;
    this.solicitud.observaciones = form.observaciones.value;

    return this.solicitud;
  }

  saveOrUpdate(): Observable<number> {
    const datosGenerales = this.getValue();
    const obs = this.isEdit() ? this.service.update(datosGenerales.id, datosGenerales) : this.service.create(datosGenerales);
    return obs.pipe(
      tap((value) => {
        this.solicitud = value;
      }),
      switchMap((solicitud) => {
        return merge(
          this.createSolicitudModalidades(solicitud.id),
          this.deleteSolicitudModalidades(solicitud.id),
          this.updateSolicitudModalidades(solicitud.id));
      }),
      map(() => {
        return this.solicitud.id;
      })
    );
  }

  /**
   * Añada la solicitudModalidad y la marca como creada
   *
   * @param solicitudModalidad ISolicitudModalidad
   */
  public addSolicitudModalidad(solicitudModalidad: ISolicitudModalidad): void {
    const current = this.entidadesConvocantesModalidad$.value;
    const index = current.findIndex(value => value.entidadConvocante.entidad.personaRef === solicitudModalidad.entidad.personaRef);
    if (index >= 0) {
      const wrapper = new StatusWrapper(solicitudModalidad);
      current[index].modalidad = wrapper;
      wrapper.setCreated();
      this.setChanges(true);
    }
  }

  /**
   * Actualiza la solicitudModalidad y la marca como editada
   *
   * @param solicitudModalidad ISolicitudModalidad
   */
  public updateSolicitudModalidad(solicitudModalidad: ISolicitudModalidad): void {
    const current = this.entidadesConvocantesModalidad$.value;
    const index = current.findIndex(value => value.modalidad && value.modalidad.value === solicitudModalidad);
    if (index >= 0) {
      current[index].modalidad.value.programa = solicitudModalidad.programa;
      current[index].modalidad.setEdited();
      this.setChanges(true);
    }
  }

  /**
   * Elimina la solicitudModalidad y la marca como eliminada si era una modalidad que ya existia previamente.
   *
   * @param wrapper ISolicitudModalidad
   */
  public deleteSolicitudModalidad(wrapper: StatusWrapper<ISolicitudModalidad>): void {
    const current = this.entidadesConvocantesModalidad$.value;
    const index = current.findIndex(value => value.modalidad && value.modalidad.value === wrapper.value);
    if (index >= 0) {
      if (wrapper.created) {
        current[index].modalidad = undefined;
      } else {
        wrapper.value.programa = undefined;
        wrapper.setDeleted();
        this.setChanges(true);
      }
    }
  }

  /**
   * Crea las modalidades añadidas.
   *
   * @param solicitudId id de la solicitud
   */
  private createSolicitudModalidades(solicitudId: number): Observable<void> {
    const createdSolicitudModalidades = this.entidadesConvocantesModalidad$.value
      .filter((entidadConvocanteModalidad) => !!entidadConvocanteModalidad.modalidad && entidadConvocanteModalidad.modalidad.created)
      .map(entidadConvocanteModalidad => {
        entidadConvocanteModalidad.modalidad.value.solicitud = { id: solicitudId } as ISolicitud;
        return entidadConvocanteModalidad.modalidad;
      });

    if (createdSolicitudModalidades.length === 0) {
      return of(void 0);
    }

    return from(createdSolicitudModalidades).pipe(
      mergeMap((wrappedSolicitudModalidad) => {
        return this.solicitudModalidadService
          .create(wrappedSolicitudModalidad.value).pipe(
            map((createdSolicitudModalidad) => {
              const index = this.entidadesConvocantesModalidad$.value
                .findIndex((currentEntidadConvocanteModalidad) =>
                  currentEntidadConvocanteModalidad.modalidad === wrappedSolicitudModalidad);

              this.entidadesConvocantesModalidad$.value[index].modalidad =
                new StatusWrapper<ISolicitudModalidad>(createdSolicitudModalidad);
            })
          );
      }));
  }

  /**
   * Elimina las modalidades borradas.
   *
   * @param solicitudId id de la solicitud
   */
  private deleteSolicitudModalidades(solicitudId: number): Observable<void> {
    const deletedSolicitudModalidades = this.entidadesConvocantesModalidad$.value
      .filter(entidadConvocanteModalidad => !!entidadConvocanteModalidad.modalidad && entidadConvocanteModalidad.modalidad.deleted)
      .map(entidadConvocanteModalidad => entidadConvocanteModalidad.modalidad);

    if (deletedSolicitudModalidades.length === 0) {
      return of(void 0);
    }

    return from(deletedSolicitudModalidades).pipe(
      mergeMap((wrappedSolicitudModalidad) => {
        return this.solicitudModalidadService
          .deleteById(wrappedSolicitudModalidad.value.id).pipe(
            map(() => {
              const index = this.entidadesConvocantesModalidad$.value
                .findIndex((currentEntidadConvocanteModalidad) =>
                  currentEntidadConvocanteModalidad.modalidad === wrappedSolicitudModalidad);

              this.entidadesConvocantesModalidad$.value[index].modalidad = undefined;
            })
          );
      }));
  }

  /**
   * Actualiza las modalidades modificadas.
   *
   * @param solicitudId id de la solicitud
   */
  private updateSolicitudModalidades(solicitudId: number): Observable<void> {
    const updatedSolicitudModalidades = this.entidadesConvocantesModalidad$.value
      .filter(entidadConvocanteModalidad => !!entidadConvocanteModalidad.modalidad && entidadConvocanteModalidad.modalidad.edited)
      .map(entidadConvocanteModalidad => entidadConvocanteModalidad.modalidad);

    if (updatedSolicitudModalidades.length === 0) {
      return of(void 0);
    }

    return from(updatedSolicitudModalidades).pipe(
      mergeMap((wrappedSolicitudModalidad) => {
        return this.solicitudModalidadService
          .update(wrappedSolicitudModalidad.value.id, wrappedSolicitudModalidad.value).pipe(
            map((updatedSolicitudModalidad) => {
              const index = this.entidadesConvocantesModalidad$.value
                .findIndex((currentEntidadConvocanteModalidad) =>
                  currentEntidadConvocanteModalidad.modalidad === wrappedSolicitudModalidad);

              this.entidadesConvocantesModalidad$.value[index].modalidad =
                new StatusWrapper<ISolicitudModalidad>(updatedSolicitudModalidad);
            })
          );
      }));
  }

  /**
   * Setea la convocatoria seleccionada en el formulario y los campos que dependende de esta (tipo formulario, unidad gestión y modalidades)
   *
   * @param convocatoria una convocatoria
   */
  private onConvocatoriaChange(convocatoria: IConvocatoria): void {
    if (convocatoria) {
      this.getFormGroup().controls.convocatoriaExterna.setValue('', { emitEvent: false });

      this.subscriptions.push(
        this.unidadGestionService.findByAcronimo(convocatoria.unidadGestionRef).subscribe(unidadGestion => {
          this.getFormGroup().controls.unidadGestion.setValue(unidadGestion);
        })
      );

      this.subscriptions.push(
        this.configuracionSolicitudService.findById(convocatoria.id).subscribe(configuracionSolicitud => {
          this.getFormGroup().controls.formularioSolicitud.setValue(configuracionSolicitud.formularioSolicitud);
        })
      );

      this.subscriptions.push(
        this.loadEntidadesConvocantesModalidad(this.solicitud?.id, convocatoria.id).subscribe()
      );
    } else if (!this.isEdit()) {
      // Clean dependencies
      this.getFormGroup().controls.unidadGestion.setValue(null);
      this.getFormGroup().controls.formularioSolicitud.setValue(null);
      this.entidadesConvocantesModalidad$.next([]);

      // Enable fields
      this.getFormGroup().controls.convocatoriaExterna.enable();
      this.getFormGroup().controls.unidadGestion.enable();
      this.getFormGroup().controls.formularioSolicitud.enable();
    }
  }

  /**
   * Carga los datos del solicitante en la solicitud
   *
   * @param solicitanteRef Identificador del solicitante
   * @returns observable para recuperar los datos
   */
  private loadSolicitante(solicitanteRef: string): Observable<IPersona> {
    return this.personaFisicaService.getInformacionBasica(solicitanteRef).pipe(
      tap(solicitante => {
        this.solicitud.solicitante = solicitante;
      })
    );

  }

  /**
   * Carga los datos de la unidad de gestion en la solicitud
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
          this.solicitud.unidadGestion = result.items[0];
        }
      })
    );

  }


  /**
   * Carga los datos de la tabla de modalidades de la solicitud y emite el cambio para que
   * se pueda actualizar la tabla
   *
   * @param solicitudId Identificador de la solicitud
   * @param convocatoriaId Identificador de la convocatoria
   * @returns observable para recuperar los datos
   */
  private loadEntidadesConvocantesModalidad(solicitudId: number, convocatoriaId: number):
    Observable<SolicitudModalidadEntidadConvocanteListado[]> {

    return this.convocatoriaService.findAllConvocatoriaEntidadConvocantes(convocatoriaId).pipe(
      map(resultEntidadConvocantes => {
        if (resultEntidadConvocantes.total === 0) {
          return [] as SolicitudModalidadEntidadConvocanteListado[];
        }

        const entidadesConvocantesModalidad = resultEntidadConvocantes.items.map(entidadConvocante => {
          return {
            entidadConvocante,
            plan: this.getPlan(entidadConvocante.programa)
          } as SolicitudModalidadEntidadConvocanteListado;
        });

        this.entidadesConvocantesModalidad$.next(entidadesConvocantesModalidad);

        return entidadesConvocantesModalidad;
      }),
      mergeMap(entidadesConvocantesModalidad => {
        if (entidadesConvocantesModalidad.length === 0) {
          return of([]);
        }
        return from(entidadesConvocantesModalidad).pipe(
          mergeMap((element) => {
            return this.empresaEconomicaService.findById(element.entidadConvocante.entidad.personaRef).pipe(
              map(empresaEconomica => {
                element.entidadConvocante.entidad = empresaEconomica;
                element.plan = this.getPlan(element.entidadConvocante.programa);
                return element;
              }),
              catchError(() => of(element))
            );
          }),
          takeLast(1),
          switchMap(() => of(entidadesConvocantesModalidad))
        );
      }),
      switchMap(entidadesConvocantesModalidad => {
        if (!solicitudId) {
          return of(entidadesConvocantesModalidad);
        }

        return this.getSolicitudModalidades(solicitudId).pipe(
          switchMap(solicitudModalidades => {
            entidadesConvocantesModalidad.map(element => {
              const solicitudModalidad = solicitudModalidades
                .find(modalidad => modalidad.entidad.personaRef === element.entidadConvocante.entidad.personaRef);
              if (solicitudModalidad) {
                element.modalidad = new StatusWrapper(solicitudModalidad);
              }
            });

            return of(entidadesConvocantesModalidad);
          })
        );
      })
    );
  }

  /**
   * Recupera las modalidades de la solicitud
   *
   * @param solicitudId Identificador de la solicitud
   * @returns observable para recuperar los datos
   */
  private getSolicitudModalidades(solicitudId: number): Observable<ISolicitudModalidad[]> {
    return this.service.findAllSolicitudModalidades(solicitudId).pipe(
      switchMap(res => {
        return of(res.items);
      })
    );
  }

  /**
   * Recupera el plan de un programa (el programa que no tenga padre)
   *
   * @param programa un IPrograma
   * @returns el plan
   */
  private getPlan(programa: IPrograma): IPrograma {
    let programaRaiz = programa;

    while (programaRaiz.padre) {
      programaRaiz = programaRaiz.padre;
    }
    return programaRaiz;
  }

  /**
   * Añade/elimina los validadores del formulario que solo son necesarios si se cumplen ciertas condiciones.
   *
   * @param form el formulario
   * @param solicitud datos de la solicitud utilizados para determinar los validadores que hay que añadir.
   *  Si no se indica la evaluacion se hace con los datos rellenos en el formulario.
   */
  private setConditionalValidators(form: FormGroup, solicitud?: ISolicitud): void {
    const convocatoriaControl = form.controls.convocatoria;
    const convocatoriaExternaControl = form.controls.convocatoriaExterna;
    const formularioSolicitudControl = form.controls.formularioSolicitud;
    const unidadGestionControl = form.controls.unidadGestion;

    const convocatoriaSolicitud = solicitud ? solicitud.convocatoria : convocatoriaControl.value;
    const convocatoriaExternaSolicitud = solicitud ? solicitud.convocatoriaExterna : convocatoriaExternaControl.value;

    if (!this.isEdit()) {
      if (!convocatoriaSolicitud && !convocatoriaExternaSolicitud) {
        convocatoriaControl.setValidators([Validators.required]);
        convocatoriaExternaControl.setValidators([Validators.required, Validators.maxLength(50)]);
      }
      else if (!convocatoriaSolicitud) {
        convocatoriaControl.setValidators(null);
        convocatoriaExternaControl.setValidators([Validators.required, Validators.maxLength(50)]);
        formularioSolicitudControl.setValidators([Validators.required]);
        unidadGestionControl.setValidators([Validators.required, IsEntityValidator.isValid()]);
      } else {
        convocatoriaControl.setValidators([Validators.required]);
        convocatoriaExternaControl.setValidators(null);
        formularioSolicitudControl.setValidators(null);
        unidadGestionControl.setValidators(null);

        convocatoriaExternaControl.disable({ emitEvent: false });
        formularioSolicitudControl.disable({ emitEvent: false });
        unidadGestionControl.disable({ emitEvent: false });
      }

      convocatoriaControl.updateValueAndValidity({ emitEvent: false });
      convocatoriaExternaControl.updateValueAndValidity({ emitEvent: false });
      formularioSolicitudControl.updateValueAndValidity({ emitEvent: false });
      unidadGestionControl.updateValueAndValidity({ emitEvent: false });
    } else if (!this.readonly && convocatoriaSolicitud) {
      unidadGestionControl.disable({ emitEvent: false });
      unidadGestionControl.updateValueAndValidity({ emitEvent: false });
      convocatoriaControl.disable({ emitEvent: false });
      convocatoriaControl.updateValueAndValidity({ emitEvent: false });
      convocatoriaExternaControl.disable({ emitEvent: false });
      convocatoriaExternaControl.updateValueAndValidity({ emitEvent: false });
    }

    this.convocatoriaRequired = !convocatoriaExternaSolicitud;
    this.convocatoriaExternaRequired = !convocatoriaSolicitud;
  }

}
