import { Component, OnInit } from '@angular/core';
import { FragmentComponent } from '@core/component/fragment.component';
import { MemoriaListado } from '@core/models/eti/memoria-listado';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ConvocatoriaReunionService } from '@core/services/eti/convocatoria-reunion.service';
import { BehaviorSubject } from 'rxjs';
import { ActaActionService } from '../../acta.action.service';
import { ActaMemoriasFragment } from './acta-memorias.fragment';






@Component({
  selector: 'sgi-acta-memorias',
  templateUrl: './acta-memorias.component.html',
  styleUrls: ['./acta-memorias.component.scss']
})
export class ActaMemoriasComponent extends FragmentComponent implements OnInit {

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  displayedColumns: string[];

  memorias$: BehaviorSubject<MemoriaListado[]>;

  constructor(
    protected readonly convocatoriaReunionService: ConvocatoriaReunionService,
    formService: ActaActionService
  ) {
    super(formService.FRAGMENT.MEMORIAS, formService);
    this.displayedColumns = ['numReferencia', 'version', 'dictamen.nombre', 'informe'];
    this.memorias$ = (this.fragment as ActaMemoriasFragment).memorias$;
  }
}
