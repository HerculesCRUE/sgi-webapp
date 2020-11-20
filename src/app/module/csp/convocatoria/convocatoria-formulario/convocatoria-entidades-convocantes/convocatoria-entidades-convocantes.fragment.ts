import { OnDestroy } from '@angular/core';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaEntidadConvocante } from '@core/models/csp/convocatoria-entidad-convocante';
import { IPrograma } from '@core/models/csp/programa';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { Fragment } from '@core/services/action-service';
import { ConvocatoriaEntidadConvocanteService } from '@core/services/csp/convocatoria-entidad-convocante.service';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { EmpresaEconomicaService } from '@core/services/sgp/empresa-economica.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, from, merge, Observable, of, Subscription } from 'rxjs';
import { catchError, map, mergeMap, takeLast, tap } from 'rxjs/operators';

export interface ConvocatoriaEntidadConvocanteData {
  empresaEconomica: IEmpresaEconomica;
  entidadConvocante: StatusWrapper<IConvocatoriaEntidadConvocante>;
  plan: IPrograma;
  programa: IPrograma;
  modalidad: IPrograma;
}

export class ConvocatoriaEntidadesConvocantesFragment extends Fragment implements OnDestroy {
  private entidadesConvocantesEliminadas: ConvocatoriaEntidadConvocanteData[] = [];
  data$ = new BehaviorSubject<ConvocatoriaEntidadConvocanteData[]>([]);
  private subscriptions: Subscription[] = [];

  constructor(
    private logger: NGXLogger,
    key: number,
    private convocatoriaService: ConvocatoriaService,
    private convocatoriaEntidadConvocanteService: ConvocatoriaEntidadConvocanteService,
    private empresaEconomicaService: EmpresaEconomicaService,
  ) {
    super(key);
    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name, 'constructor()', 'start');
    this.setComplete(true);
    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name, 'constructor()', 'end');
  }

  ngOnDestroy(): void {
    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name, 'ngOnDestroy()', 'start');
    this.subscriptions.forEach(x => x.unsubscribe());
    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name, 'ngOnDestroy()', 'end');
  }

  protected onInitialize(): void {
    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
      `onInitialize()`, 'start');
    if (this.getKey()) {
      const subscription = this.convocatoriaService.findAllConvocatoriaEntidadConvocantes(this.getKey() as number).pipe(
        map((response) => response.items),
        map(convocatoriaEntidadConvocantes => {
          return convocatoriaEntidadConvocantes.map(entidadConvocante => {
            const element: ConvocatoriaEntidadConvocanteData = {
              empresaEconomica: {} as IEmpresaEconomica,
              entidadConvocante: new StatusWrapper<IConvocatoriaEntidadConvocante>(entidadConvocante),
              modalidad: undefined,
              programa: undefined,
              plan: undefined
            };
            this.fillRelationshipData(element);
            return element;
          });
        }),
        mergeMap(entidadConvocanteData => {
          return from(entidadConvocanteData).pipe(
            mergeMap((data) => {
              return this.loadEmpresaEconomica(data);
            })
          );
        }),
      ).subscribe((convocatoriaEntidadConvocanteData) => {
        const current = this.data$.value;
        current.push(convocatoriaEntidadConvocanteData);
        this.data$.next(current);
        this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name, `onInitialize()`, 'end');
      });
      this.subscriptions.push(subscription);
    }
  }

  private loadEmpresaEconomica(data: ConvocatoriaEntidadConvocanteData): Observable<ConvocatoriaEntidadConvocanteData> {
    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name, `loadEmpresaEconomica()`, 'start');
    const entidadRef = data.entidadConvocante.value.entidadRef;
    return this.empresaEconomicaService.findById(entidadRef).pipe(
      map(empresaEconomica => {
        data.empresaEconomica = empresaEconomica;
        return data;
      }),
      catchError(() => of(data)),
      tap(() => this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name, `loadEmpresaEconomica()`, 'end'))
    );
  }

  private getSecondLevelPrograma(programa: IPrograma): IPrograma {
    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
      `getSecondLevelPrograma(programa: ${programa})`, 'start');
    if (programa?.padre?.padre) {
      this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
        `getSecondLevelPrograma(programa: ${programa})`, 'end');
      return this.getSecondLevelPrograma(programa.padre);
    }
    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
      `getSecondLevelPrograma(programa: ${programa})`, 'end');
    return programa;
  }

  private fillRelationshipData(data: ConvocatoriaEntidadConvocanteData): void {
    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
      `fillRelationshipData(data: ${data})`, 'start');
    const modalidad = data.entidadConvocante.value.programa;
    const programa = this.getSecondLevelPrograma(modalidad);
    const plan = programa?.padre ? programa.padre : modalidad;

    data.plan = plan;
    data.programa = programa?.id === plan?.id ? undefined : programa;
    data.modalidad = modalidad?.id === programa?.id ? undefined : modalidad;

    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
      `fillRelationshipData(data: ${data})`, 'end');
  }

  public deleteConvocatoriaEntidadConvocante(data: ConvocatoriaEntidadConvocanteData) {
    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
      `deleteConvocatoriaEntidadConvocante(data: ${data})`, 'start');

    if (!data.entidadConvocante.created) {
      this.entidadesConvocantesEliminadas.push(data);
    }

    const current = this.data$.value;
    const index = current.findIndex(value => value === data);
    current.splice(index, 1);
    this.data$.next(current);

    this.setChanges(true);

    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
      `deleteConvocatoriaEntidadConvocante(data: ${data})`, 'end');
  }

  public updateConvocatoriaEntidadConvocante(data: ConvocatoriaEntidadConvocanteData) {
    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
      `updateConvocatoriaEntidadConvocante(data: ${data})`, 'start');
    this.fillRelationshipData(data);
    if (!data.entidadConvocante.created) {
      data.entidadConvocante.setEdited();
    }
    const current = this.data$.value;
    this.data$.next(current);
    this.setChanges(true);

    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
      `updateConvocatoriaEntidadConvocante(wrapper: ${data})`, 'end');
  }

  public addConvocatoriaEntidadConvocante(data: ConvocatoriaEntidadConvocanteData) {
    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
      `addConvocatoriaEntidadConvocante(entidadConvocante: ${data})`, 'start');
    this.fillRelationshipData(data);
    data.entidadConvocante.setCreated();
    const current = this.data$.value;
    current.push(data);
    this.data$.next(current);
    this.setChanges(true);
    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
      `addConvocatoriaEntidadConvocante(entidadConvocante: ${data})`, 'end');
  }

  saveOrUpdate(): Observable<void> {
    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
      `saveOrUpdate()`, 'start');
    return merge(
      this.deleteConvocatoriaEntidadConvocantes(),
      this.updateConvocatoriaEntidadConvocantes(),
      this.createConvocatoriaEntidadConvocantes()
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete()) {
          this.setChanges(false);
        }
      }),
      tap(() => this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
        `saveOrUpdate()`, 'end'))
    );
  }

  private deleteConvocatoriaEntidadConvocantes(): Observable<void> {
    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
      `deleteConvocatoriaEntidadConvocantes()`, 'start');
    if (this.entidadesConvocantesEliminadas.length === 0) {
      this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
        `deleteConvocatoriaEntidadConvocantes()`, 'end');
      return of(void 0);
    }
    return from(this.entidadesConvocantesEliminadas).pipe(
      mergeMap((data) => {
        return this.convocatoriaEntidadConvocanteService.deleteById(data.entidadConvocante.value.id)
          .pipe(
            tap(() => {
              this.entidadesConvocantesEliminadas = this.entidadesConvocantesEliminadas.filter(deleted =>
                deleted === data);
            }),
            tap(() => this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
              `deleteConvocatoriaEntidadConvocantes()`, 'end'))
          );
      })
    );
  }

  private updateConvocatoriaEntidadConvocantes(): Observable<void> {
    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
      `updateConvocatoriaEntidadConvocantes()`, 'start');
    const editedEntidades = this.data$.value.filter((value) => value.entidadConvocante.edited);
    if (editedEntidades.length === 0) {
      this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
        `updateConvocatoriaEntidadConvocantes()`, 'end');
      return of(void 0);
    }
    return from(editedEntidades).pipe(
      mergeMap((data) => {
        return this.convocatoriaEntidadConvocanteService.update(
          data.entidadConvocante.value.id, data.entidadConvocante.value).pipe(
            map((updatedEntidad) => {
              data.entidadConvocante = new StatusWrapper<IConvocatoriaEntidadConvocante>(updatedEntidad);
              this.fillRelationshipData(data);
              this.data$.next(this.data$.value);
            }),
            tap(() => this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
              `updateConvocatoriaEntidadConvocantes()`, 'end')
            )
          );
      })
    );
  }

  private createConvocatoriaEntidadConvocantes(): Observable<void> {
    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
      `createConvocatoriaEntidadConvocantes()`, 'start');
    const createdEntidades = this.data$.value.filter((value) => value.entidadConvocante.created);
    if (createdEntidades.length === 0) {
      this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
        `createConvocatoriaEntidadConvocantes()`, 'end');
      return of(void 0);
    }
    createdEntidades.forEach(
      (wrapper) => wrapper.entidadConvocante.value.convocatoria = {
        id: this.getKey(),
      } as IConvocatoria
    );
    return from(createdEntidades).pipe(
      mergeMap((data) => {
        return this.convocatoriaEntidadConvocanteService.create(data.entidadConvocante.value).pipe(
          map((createdEntidad) => {
            data.entidadConvocante = new StatusWrapper<IConvocatoriaEntidadConvocante>(createdEntidad);
            this.fillRelationshipData(data);
            this.data$.next(this.data$.value);
          }),
          tap(() => this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name,
            `createConvocatoriaEntidadConvocantes()`, 'end'))
        );
      })
    );
  }

  private isSaveOrUpdateComplete(): boolean {
    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name, `isSaveOrUpdateComplete()`, 'start');
    const touched: boolean = this.data$.value.some((wrapper) => wrapper.entidadConvocante.touched);
    this.logger.debug(ConvocatoriaEntidadesConvocantesFragment.name, `isSaveOrUpdateComplete()`, 'end');
    return (this.entidadesConvocantesEliminadas.length > 0 || touched);
  }
}
