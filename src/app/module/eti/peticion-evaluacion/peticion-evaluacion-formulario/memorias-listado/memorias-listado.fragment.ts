import { Fragment } from '@core/services/action-service';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { PeticionEvaluacionService } from '@core/services/eti/peticion-evaluacion.service';
import { IMemoriaPeticionEvaluacion } from '@core/models/eti/memoriaPeticionEvaluacion';


export class MemoriasListadoFragment extends Fragment {

  memorias$: BehaviorSubject<StatusWrapper<IMemoriaPeticionEvaluacion>[]> =
    new BehaviorSubject<StatusWrapper<IMemoriaPeticionEvaluacion>[]>([]);
  private deleted: StatusWrapper<IMemoriaPeticionEvaluacion>[] = [];

  constructor(key: number, private service: PeticionEvaluacionService) {
    super(key);
    this.setComplete(true);
  }

  onInitialize(): void {
    if (this.getKey()) {
      this.loadMemorias(this.getKey() as number);
    }
    this.setComplete(true);
  }


  saveOrUpdate(): Observable<void> {
    return of(void 0);
  }

  public addMemoria(memoria: IMemoriaPeticionEvaluacion): void {
    const wrapped = new StatusWrapper<IMemoriaPeticionEvaluacion>(memoria);
    wrapped.setCreated();
    const current = this.memorias$.value;
    current.push(wrapped);
    this.memorias$.next(current);
    this.setChanges(true);
    this.setComplete(true);
  }

  public deleteMemoria(memoria: StatusWrapper<IMemoriaPeticionEvaluacion>) {
    const current = this.memorias$.value;
    const index = current.findIndex((value) => value === memoria);
    if (index >= 0) {
      if (!memoria.created) {
        this.deleted.push(current[index]);
      }
      current.splice(index, 1);
      this.memorias$.next(current);
      this.setChanges(true);
    }
    if (current.length === 0) {
      this.setComplete(false);
    }
  }

  public loadMemorias(idPeticionEvaluacion: number): void {
    this.service
      .findMemorias(
        idPeticionEvaluacion
      ).pipe(
        map((response) => {
          // Return the values
          return response.items;
        }),
        catchError(() => {
          return of([]);
        })
      ).subscribe(
        (memorias: IMemoriaPeticionEvaluacion[]) => {
          this.memorias$.next(memorias.map((memoria) => new StatusWrapper<IMemoriaPeticionEvaluacion>(memoria)));
        }
      );
  }

}
