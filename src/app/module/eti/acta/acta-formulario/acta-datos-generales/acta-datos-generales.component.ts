import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Component, OnInit, ViewChild } from '@angular/core';

import { NGXLogger } from 'ngx-logger';
import { Observable, Subscription } from 'rxjs';

import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';

import { ConvocatoriaReunionService } from '@core/services/eti/convocatoria-reunion.service';
import { SnackBarService } from '@core/services/snack-bar.service';

import { IConvocatoriaReunion } from '@core/models/eti/convocatoria-reunion';
import { SgiRestListResult } from '@sgi/framework/http/types';
import { startWith, map } from 'rxjs/operators';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { ActaActionService } from '../../acta.action.service';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { IActa } from '@core/models/eti/acta';
import { Router } from '@angular/router';

const MSG_ERROR_INIT = marker('eti.acta.crear.datosGenerales.convocatoriaReunion.error.cargar');

@Component({
  selector: 'sgi-acta-datos-generales',
  templateUrl: './acta-datos-generales.component.html',
  styleUrls: ['./acta-datos-generales.component.scss']
})
export class ActaDatosGeneralesComponent extends FormFragmentComponent<IActa> implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexPropertiesInline: FxFlexProperties;

  convocatoriasReunionFitlered: Observable<IConvocatoriaReunion[]>;
  convocatoriasReunion: IConvocatoriaReunion[];

  suscripciones: Subscription[] = [];

  readonly: boolean;

  constructor(
    protected readonly logger: NGXLogger,
    private readonly convocatoriaReunionService: ConvocatoriaReunionService,
    private readonly snackBarService: SnackBarService,
    private actionService: ActaActionService,
    public router: Router
  ) {
    super(actionService.FRAGMENT.DATOS_GENERALES, actionService);
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(50%-10px)';
    this.fxFlexProperties.md = '0 1 calc(33%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(32%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxFlexPropertiesInline = new FxFlexProperties();
    this.fxFlexPropertiesInline.sm = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.md = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.order = '3';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }


  ngOnInit() {
    super.ngOnInit();
    this.logger.debug(ActaDatosGeneralesComponent.name, 'ngOnInit()', 'start');

    this.readonly = this.actionService.readonly;

    this.suscripciones.push(
      this.convocatoriaReunionService.findConvocatoriasSinActa().subscribe(
        (res: SgiRestListResult<IConvocatoriaReunion>) => {
          this.convocatoriasReunion = res.items;
          this.convocatoriasReunionFitlered = this.formGroup.controls.convocatoriaReunion.valueChanges
            .pipe(
              startWith(''),
              map(value => this.filtro(value))
            );
          this.logger.debug(ActaDatosGeneralesComponent.name, 'ngOnInit()', 'end');
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_INIT);
          this.logger.debug(ActaDatosGeneralesComponent.name, 'ngOnInit()', 'end');
        }
      )
    );
  }

  /**
   * Filtra la lista devuelta por el servicio
   *
   * @param value del input para autocompletar
   */
  filtro(value: string | IConvocatoriaReunion): IConvocatoriaReunion[] {
    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.codigo.toLowerCase();
    }

    return this.convocatoriasReunion.filter
      (convocatoriaReunion => convocatoriaReunion.codigo.toLowerCase().includes(filterValue));
  }

  /**
   * Devuelve el código de una convocatoria reunión
   * @param convocatoria convocatoria
   * @returns código de una convocatoria reunión
   */
  getConvocatoria(convocatoriaReunion?: IConvocatoriaReunion): string | undefined {
    return typeof convocatoriaReunion === 'string' ? convocatoriaReunion : convocatoriaReunion?.codigo;
  }

  /**
   * Registra el evento de modificación de convocatoria reunión.
   * @param convocatoriaReunion  convocatoria reunión seleccionada
   */
  selectConvocatoriaReunion(convocatoriaReunion: IConvocatoriaReunion | string) {
    this.logger.debug(ActaDatosGeneralesComponent.name, 'selectConvocatoriaReunion(convocatoriaReunion: ConvocatoriaReunion)', 'start');
    this.actionService.setIdConvocatoria(convocatoriaReunion ? (convocatoriaReunion as IConvocatoriaReunion).id : null);
    this.logger.debug(ActaDatosGeneralesComponent.name, 'selectConvocatoriaReunion(convocatoriaReunion: ConvocatoriaReunion)', 'end');
  }

}
