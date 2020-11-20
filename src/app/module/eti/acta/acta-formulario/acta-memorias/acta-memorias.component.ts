import { Component, OnInit } from '@angular/core';

import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject } from 'rxjs';

import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';

import { MemoriaListado } from '@core/models/eti/memoria-listado';

import { ConvocatoriaReunionService } from '@core/services/eti/convocatoria-reunion.service';
import { ActaActionService } from '../../acta.action.service';
import { FragmentComponent } from '@core/component/fragment.component';
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
    protected readonly logger: NGXLogger,
    protected readonly convocatoriaReunionService: ConvocatoriaReunionService,
    formService: ActaActionService
  ) {
    super(formService.FRAGMENT.MEMORIAS, formService);
    this.displayedColumns = ['referencia', 'version', 'dictamen.nombre', 'informe'];
    this.memorias$ = (this.fragment as ActaMemoriasFragment).memorias$;
  }
}
