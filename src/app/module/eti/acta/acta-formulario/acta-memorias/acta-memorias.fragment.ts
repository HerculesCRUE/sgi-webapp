import { Fragment } from '@core/services/action-service';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConvocatoriaReunionService } from '@core/services/eti/convocatoria-reunion.service';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { MemoriaListado } from '@core/models/eti/memoria-listado';


export class ActaMemoriasFragment extends Fragment {

  memorias$: BehaviorSubject<MemoriaListado[]> = new BehaviorSubject<MemoriaListado[]>([]);

  private selectedIdConvocatoria: number;

  constructor(key: number, private service: ConvocatoriaReunionService) {
    super(key);
    this.selectedIdConvocatoria = key;
  }

  onInitialize(): void {
    if (this.getKey()) {
      this.loadMemorias(this.getKey() as number);
    }
  }

  loadMemorias(idConvocatoria: number): void {
    if (!this.isInitialized() || this.selectedIdConvocatoria !== idConvocatoria) {
      this.selectedIdConvocatoria = idConvocatoria;
      this.service.findEvaluacionesActivas(idConvocatoria).pipe(
        map((response) => {
          if (response.items) {
            const evaluacionesSinDuplicados = response.items.reduce(
              (evaluacionObject, evaluacion: IEvaluacion) => ({ ...evaluacionObject, [evaluacion.id]: evaluacion }), {}
            );
            const memorias: MemoriaListado[] = Object.keys(evaluacionesSinDuplicados).map(
              idEvaluacion => new MemoriaListado(
                evaluacionesSinDuplicados[idEvaluacion].memoria?.id,
                evaluacionesSinDuplicados[idEvaluacion].memoria?.numReferencia,
                evaluacionesSinDuplicados[idEvaluacion].version,
                evaluacionesSinDuplicados[idEvaluacion].dictamen
              )
            );
            return memorias;
          }
          else {
            return [];
          }
        })
      ).subscribe((memorias) => {
        if (this.isEdit() && this.selectedIdConvocatoria !== this.getKey()) {
          this.setChanges(true);
          this.setComplete(this.selectedIdConvocatoria ? true : false);
        }
        else if (this.isEdit() && this.selectedIdConvocatoria === this.getKey()) {
          this.setChanges(false);
          this.setComplete(false);
        }
        else {
          this.setChanges(this.selectedIdConvocatoria ? true : false);
          this.setComplete(this.selectedIdConvocatoria ? true : false);
        }
        this.memorias$.next(memorias);
      });
    }
  }

  saveOrUpdate(): Observable<void> {
    return of(void 0);
  }
}
