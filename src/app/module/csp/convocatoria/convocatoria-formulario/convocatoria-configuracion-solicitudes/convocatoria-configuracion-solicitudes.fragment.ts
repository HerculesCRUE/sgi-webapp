import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IConfiguracionSolicitud } from '@core/models/csp/configuracion-solicitud';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaFase } from '@core/models/csp/convocatoria-fase';
import { IDocumentoRequerido } from '@core/models/csp/documentos-requeridos-solicitud';
import { FormFragment } from '@core/services/action-service';
import { ConfiguracionSolicitudService } from '@core/services/csp/configuracion-solicitud.service';
import { DocumentoRequeridoService } from '@core/services/csp/documento-requerido.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, from, merge, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, takeLast, tap } from 'rxjs/operators';

export class ConvocatoriaConfiguracionSolicitudesFragment extends FormFragment<IConfiguracionSolicitud> {
  configuracionSolicitud: IConfiguracionSolicitud;
  documentosRequeridos$ = new BehaviorSubject<StatusWrapper<IDocumentoRequerido>[]>([]);
  documentosRequeridosEliminados: StatusWrapper<IDocumentoRequerido>[] = [];
  private convocatoriaFases: IConvocatoriaFase[] = [];

  constructor(
    private readonly logger: NGXLogger,
    key: number,
    private configuracionSolicitudService: ConfiguracionSolicitudService,
    private documentoRequeridoService: DocumentoRequeridoService,
    public readonly: boolean
  ) {
    super(key, true);
    this.setComplete(true);
    this.configuracionSolicitud = {} as IConfiguracionSolicitud;
  }

  protected buildFormGroup(): FormGroup {
    const form = new FormGroup({
      tramitacionSGI: new FormControl(false),
      fasePresentacionSolicitudes: new FormControl(''),
      formularioSolicitud: new FormControl(''),
      fechaInicioFase: new FormControl({ value: '', disabled: true }),
      fechaFinFase: new FormControl({ value: '', disabled: true }),
      importeMaximoSolicitud: new FormControl(null, [Validators.maxLength(50)]),
    });
    if (this.readonly) {
      form.disable();
    }
    return form;
  }

  protected buildPatch(configuracionSolicitud: IConfiguracionSolicitud): { [key: string]: any; } {

    const fechaInicio = typeof configuracionSolicitud?.fasePresentacionSolicitudes?.fechaInicio === 'string' ?
      new Date(configuracionSolicitud?.fasePresentacionSolicitudes?.fechaInicio) :
      configuracionSolicitud?.fasePresentacionSolicitudes?.fechaInicio;

    const fechaFin = typeof configuracionSolicitud?.fasePresentacionSolicitudes?.fechaFin === 'string' ?
      new Date(configuracionSolicitud?.fasePresentacionSolicitudes?.fechaFin) :
      configuracionSolicitud?.fasePresentacionSolicitudes?.fechaFin;

    const result = {
      tramitacionSGI: configuracionSolicitud ? configuracionSolicitud?.tramitacionSGI : false,
      fasePresentacionSolicitudes: configuracionSolicitud ? configuracionSolicitud?.fasePresentacionSolicitudes : null,
      fechaInicioFase: fechaInicio,
      fechaFinFase: fechaFin,
      importeMaximoSolicitud: configuracionSolicitud ? configuracionSolicitud?.importeMaximoSolicitud : null,
      formularioSolicitud: configuracionSolicitud ? configuracionSolicitud?.formularioSolicitud : null
    };
    return result;
  }

  protected initializer(key: number): Observable<IConfiguracionSolicitud> {
    return this.configuracionSolicitudService.findById(key).pipe(
      switchMap((configuracionSolicitud) => {
        this.configuracionSolicitud = configuracionSolicitud;
        return this.configuracionSolicitudService.findAllConvocatoriaDocumentoRequeridoSolicitud(key).pipe(
          switchMap((documentosRequeridos) => {
            const documentos = documentosRequeridos.items;
            if (documentos.length > 0) {
              this.configuracionSolicitud = documentosRequeridos.items[0].configuracionSolicitud;
              this.documentosRequeridos$.next(documentosRequeridos.items.map(
                doc => new StatusWrapper<IDocumentoRequerido>(doc))
              );
            }
            return of(this.configuracionSolicitud);
          })
        );
      }),
      catchError((err) => {
        this.logger.error(err);
        return of({} as IConfiguracionSolicitud);
      })
    );
  }

  public setFases(convocatoriaFases: IConvocatoriaFase[]) {
    this.convocatoriaFases = convocatoriaFases;
  }

  getValue(): IConfiguracionSolicitud {
    const form = this.getFormGroup().value;
    if (this.configuracionSolicitud === null) {
      this.configuracionSolicitud = {} as IConfiguracionSolicitud;
    }
    this.configuracionSolicitud.tramitacionSGI = form.tramitacionSGI ? true : false;
    this.configuracionSolicitud.fasePresentacionSolicitudes = form.fasePresentacionSolicitudes ? form.fasePresentacionSolicitudes : null;

    this.configuracionSolicitud.formularioSolicitud = form.formularioSolicitud;
    this.configuracionSolicitud.importeMaximoSolicitud = form.importeMaximoSolicitud;

    return this.configuracionSolicitud;
  }

  public addDocumentoRequerido(docRequerido: IDocumentoRequerido): void {
    const wrapped = new StatusWrapper<IDocumentoRequerido>(docRequerido);
    wrapped.setCreated();
    const current = this.documentosRequeridos$.value;
    current.push(wrapped);
    this.documentosRequeridos$.next(current);
    this.setChanges(true);
  }

  public deleteDocumentoRequerido(wrapper: StatusWrapper<IDocumentoRequerido>): void {
    const current = this.documentosRequeridos$.value;
    const index = current.findIndex(
      (value: StatusWrapper<IDocumentoRequerido>) => value === wrapper
    );
    if (index >= 0) {
      if (!wrapper.created) {
        this.documentosRequeridosEliminados.push(current[index]);
      }
      current.splice(index, 1);
      this.documentosRequeridos$.next(current);
      this.setChanges(true);
    }
  }

  saveOrUpdate(): Observable<number> {
    const configuracion = this.getValue();
    const observable$ = configuracion.id ? this.update(configuracion) : this.create(configuracion);
    return observable$.pipe(
      map(value => {
        this.configuracionSolicitud = value;
        return this.configuracionSolicitud.id;
      })
    );
  }

  private create(configuracion: IConfiguracionSolicitud): Observable<IConfiguracionSolicitud> {
    configuracion.convocatoria = {
      id: this.getKey(),
      activo: true
    } as IConvocatoria;

    if (configuracion.fasePresentacionSolicitudes != null && !configuracion.fasePresentacionSolicitudes.id) {
      const fasePresentacionSolicitudes = this.convocatoriaFases.find(plazoFase =>
        plazoFase.tipoFase.id === configuracion.fasePresentacionSolicitudes.tipoFase.id);
      configuracion.fasePresentacionSolicitudes = { id: fasePresentacionSolicitudes.id } as IConvocatoriaFase;
    }

    return this.configuracionSolicitudService.create(configuracion).pipe(
      tap(result => this.configuracionSolicitud = result),
      switchMap(result => this.saveOrUpdateDocumentoRequeridos(result))
    );
  }

  private update(configuracion: IConfiguracionSolicitud): Observable<IConfiguracionSolicitud> {
    if (typeof configuracion.fasePresentacionSolicitudes === 'string') {
      configuracion.fasePresentacionSolicitudes = null;
    }

    if (configuracion.fasePresentacionSolicitudes != null && !configuracion.fasePresentacionSolicitudes.id) {
      const fasePresentacionSolicitudes = this.convocatoriaFases.find(plazoFase =>
        plazoFase.tipoFase.id === configuracion.fasePresentacionSolicitudes.tipoFase.id);
      configuracion.fasePresentacionSolicitudes = { id: fasePresentacionSolicitudes.id } as IConvocatoriaFase;
    }

    return this.configuracionSolicitudService.update(Number(this.getKey()), configuracion).pipe(
      tap(result => this.configuracionSolicitud = result),
      switchMap(result => this.saveOrUpdateDocumentoRequeridos(result))
    );
  }

  private saveOrUpdateDocumentoRequeridos(result: IConfiguracionSolicitud) {
    return merge(
      this.deleteDocumentoRequeridos(),
      this.updateDocumentoRequeridos(result),
      this.createDocumentoRequeridos(result)
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete()) {
          this.setChanges(false);
        }
      }),
      map(() => result)
    );
  }

  private deleteDocumentoRequeridos(): Observable<void> {
    if (this.documentosRequeridosEliminados.length === 0) {
      return of(void 0);
    }
    return from(this.documentosRequeridosEliminados).pipe(
      mergeMap((wrapped) => {
        return this.documentoRequeridoService.deleteById(wrapped.value.id)
          .pipe(
            tap(() => {
              this.documentosRequeridosEliminados = this.documentosRequeridosEliminados.filter(
                deletedModelo => deletedModelo.value.id !== wrapped.value.id);
            })
          );
      })
    );
  }

  private updateDocumentoRequeridos(result: IConfiguracionSolicitud): Observable<void> {
    const editedDocumentos = this.documentosRequeridos$.value.filter((value) => value.value.id && value.edited);
    if (editedDocumentos.length === 0) {
      return of(void 0);
    }
    editedDocumentos.forEach(documento =>
      documento.value.configuracionSolicitud = result);
    return from(editedDocumentos).pipe(
      mergeMap((wrapped) => {
        return this.documentoRequeridoService.update(wrapped.value.id, wrapped.value).pipe(
          map((updatedEntidad) => {
            const index = this.documentosRequeridos$.value.findIndex((currentEntidad) => currentEntidad === wrapped);
            this.documentosRequeridos$.value[index] = new StatusWrapper<IDocumentoRequerido>(updatedEntidad);
          })
        );
      })
    );
  }

  private createDocumentoRequeridos(configuracion: IConfiguracionSolicitud): Observable<void> {
    const createdDocumentos = this.documentosRequeridos$.value.filter((value) => !value.value.id && value.created);
    if (createdDocumentos.length === 0) {
      return of(void 0);
    }
    createdDocumentos.forEach(documento => {
      documento.value.configuracionSolicitud = configuracion;
    });
    return from(createdDocumentos).pipe(
      mergeMap((wrapped) => {
        return this.documentoRequeridoService.create(wrapped.value).pipe(
          map((createdEntidad) => {
            const index = this.documentosRequeridos$.value.findIndex((currentEntidad) => currentEntidad === wrapped);
            this.documentosRequeridos$[index] = new StatusWrapper<IDocumentoRequerido>(createdEntidad);
          })
        );
      })
    );
  }

  private isSaveOrUpdateComplete(): boolean {
    const touched: boolean = this.documentosRequeridos$.value.some((wrapper) => wrapper.touched);
    return (this.documentosRequeridosEliminados.length > 0 || touched);
  }
}
