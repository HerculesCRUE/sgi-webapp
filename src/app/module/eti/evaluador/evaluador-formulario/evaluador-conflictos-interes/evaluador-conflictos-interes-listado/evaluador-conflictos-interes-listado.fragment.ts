import { ITarea } from '@core/models/eti/tarea';
import { Fragment } from '@core/services/action-service';
import { PersonaService } from '@core/services/sgp/persona.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { SgiRestFilter, SgiRestFilterType } from '@sgi/framework/http';
import { BehaviorSubject, from, Observable, of, merge } from 'rxjs';
import { endWith, map, mergeMap, takeLast, tap } from 'rxjs/operators';
import { EvaluadorService } from '@core/services/eti/evaluador.service';
import { IConflictoInteres } from '@core/models/eti/conflicto-interes';
import { ConflictoInteresService } from '@core/services/eti/conflicto-interes.service';
import { FormBuilder } from '@angular/forms';
import { NGXLogger } from 'ngx-logger';

export class EvaluadorConflictosInteresFragment extends Fragment {

  conflictos$: BehaviorSubject<StatusWrapper<IConflictoInteres>[]> = new BehaviorSubject<StatusWrapper<IConflictoInteres>[]>([]);
  filter: SgiRestFilter[];
  private deleted: StatusWrapper<IConflictoInteres>[] = [];

  constructor(
    private fb: FormBuilder,
    key: number,
    private logger: NGXLogger,
    private evaluadorService: EvaluadorService,
    private personaService: PersonaService,
    private conflictoInteresService: ConflictoInteresService) {
    super(key);
    this.setComplete(true);
  }

  onInitialize(): void {
    if (this.getKey()) {
      this.loadConflictosInteres(this.getKey() as number);
    }
  }

  loadConflictosInteres(idEvaluador: number): void {
    this.evaluadorService.findConflictosInteres(idEvaluador).pipe(
      map((response) => {
        if (response.items) {
          response.items.forEach((conflictoInteres) => {
            this.personaService.findById(conflictoInteres.personaConflictoRef).pipe(
              map((usuarioInfo) => {
                conflictoInteres.identificadorNumero = usuarioInfo.identificadorNumero;
                conflictoInteres.nombre = usuarioInfo.nombre;
                conflictoInteres.primerApellido = usuarioInfo.primerApellido;
                conflictoInteres.segundoApellido = usuarioInfo.segundoApellido;
              })
            ).subscribe();
          });
          return response.items.map((conflictoInteres) => new StatusWrapper<IConflictoInteres>(conflictoInteres));
        }
        else {
          return [];
        }
      })
    ).subscribe((conflictosInteres) => {
      this.conflictos$.next(conflictosInteres);
    });
  }

  /**
   * Añade un nuevo conflicto de interés
   *
   * @param conflictoInteres un conflicto interés
   */
  addConflicto(conflictoInteres: IConflictoInteres): void {
    const wrapped = new StatusWrapper<IConflictoInteres>(conflictoInteres);
    wrapped.setCreated();
    const current = this.conflictos$.value;
    current.push(wrapped);
    this.conflictos$.next(current);
    this.setChanges(true);
    this.setComplete(true);
  }

  public deleteConflictoInteres(conflictoInteres: StatusWrapper<IConflictoInteres>) {
    const current = this.conflictos$.value;
    const index = current.findIndex((value) => value === conflictoInteres);

    if (index >= 0) {
      if (!conflictoInteres.created) {
        current[index].setDeleted();
        this.deleted.push(current[index]);
      }
      current.splice(index, 1);
      this.conflictos$.next(current);
      this.setChanges(true);
    }
    if (current.length === 0) {
      this.setComplete(false);
    }

  }

  saveOrUpdate(): Observable<void> {
    this.logger.debug(EvaluadorConflictosInteresFragment.name, 'saveOrUpdate()', 'start');
    return merge(
      this.deleteConflictos(),
      this.createConflictos()
    ).pipe(
      takeLast(1),
      tap(() => {
        if (this.isSaveOrUpdateComplete()) {
          this.setChanges(false);
        }
      }
      ),
      tap(() => this.logger.debug(EvaluadorConflictosInteresFragment.name, 'saveOrUpdate()', 'end'))
    );
  }

  private deleteConflictos(): Observable<void> {
    this.logger.debug(EvaluadorConflictosInteresFragment.name, 'deleteConflictos()', 'start');
    if (this.deleted.length === 0) {
      this.logger.debug(EvaluadorConflictosInteresFragment.name, 'deleteConflictos()', 'end');
      return of(void 0);
    }
    return from(this.deleted).pipe(
      mergeMap((wrappedConflicto) => {
        return this.conflictoInteresService.deleteById(wrappedConflicto.value.id).pipe(
          map(_ => {
            this.deleted = this.deleted.filter(deleted => deleted.value.id !== wrappedConflicto.value.id);
          })
        );
      }));
  }

  private createConflictos(): Observable<void> {
    this.logger.debug(EvaluadorConflictosInteresFragment.name, 'createConflictos()', 'start');
    const createdConflictos = this.conflictos$.value.filter((conflicto) => conflicto.created);
    if (createdConflictos.length === 0) {
      this.logger.debug(EvaluadorConflictosInteresFragment.name, 'createConflictos()', 'end');
      return of(void 0);
    }

    return from(createdConflictos).pipe(
      mergeMap((wrappedConflicto) => {
        wrappedConflicto.value.evaluador.id = this.getKey() as number;
        return this.conflictoInteresService.create(wrappedConflicto.value).pipe(
          map((savedConflicto) => {
            const index = this.conflictos$.value.findIndex((currentConflicto) => currentConflicto === wrappedConflicto);
            this.conflictos$[index] = new StatusWrapper<IConflictoInteres>(savedConflicto);
          })
        );
      }));
  }

  private isSaveOrUpdateComplete(): boolean {
    const touched: boolean = this.conflictos$.value.some((wrapper) => wrapper.touched);
    if (this.deleted.length > 0 || touched) {
      return false;
    }
    return true;
  }
}
