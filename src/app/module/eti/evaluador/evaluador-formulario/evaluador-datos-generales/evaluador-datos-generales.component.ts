import { Component, OnInit } from '@angular/core';

import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';

import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';

import { ComiteService } from '@core/services/eti/comite.service';
import { CargoComiteService } from '@core/services/eti/cargo-comite.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { IEvaluador } from '@core/models/eti/evaluador';
import { IComite } from '@core/models/eti/comite';
import { CargoComite } from '@core/models/eti/cargo-comite';
import { SgiRestListResult } from '@sgi/framework/http';
import { startWith, map } from 'rxjs/operators';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { EvaluadorActionService } from '../../evaluador.action.service';
import { EvaluadorDatosGeneralesFragment } from './evaluador-datos-generales.fragment';

const TEXT_USER_BUTTON = marker('eti.buscarUsuario.boton.buscar');
const TEXT_USER_TITLE = marker('eti.buscarUsuario.titulo');

const MSG_ERROR_INIT_ = marker('eti.evaluador.datosGenerales.error.init');

@Component({
  selector: 'sgi-evaluador-datos-generales',
  templateUrl: './evaluador-datos-generales.component.html',
  styleUrls: ['./evaluador-datos-generales.component.scss']
})
export class EvaluadorDatosGeneralesComponent extends FormFragmentComponent<IEvaluador> implements OnInit {
  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexPropertiesInline: FxFlexProperties;

  comites: IComite[] = [];
  cargosComite: CargoComite[] = [];
  evaluador: IEvaluador;
  filteredComites: Observable<IComite[]>;
  filteredCargosComite: Observable<CargoComite[]>;

  textoUsuarioLabel = TEXT_USER_TITLE;
  textoUsuarioInput = TEXT_USER_TITLE;
  textoUsuarioButton = TEXT_USER_BUTTON;
  datosUsuarioEvaluadorEditado: string;

  datosGeneralesFragment: EvaluadorDatosGeneralesFragment;

  isEditForm: boolean;

  constructor(
    protected readonly logger: NGXLogger,
    private readonly comiteService: ComiteService,
    private readonly cargoComiteService: CargoComiteService,
    private readonly snackBarService: SnackBarService,
    actionService: EvaluadorActionService
  ) {
    super(actionService.FRAGMENT.DATOS_GENERALES, actionService);
    this.datosGeneralesFragment = this.fragment as EvaluadorDatosGeneralesFragment;

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(50%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '2';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
    this.isEditForm = this.datosGeneralesFragment.isEdit();

    this.fxFlexPropertiesInline = new FxFlexProperties();
    this.fxFlexPropertiesInline.sm = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.md = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexPropertiesInline.order = '3';
  }

  ngOnInit() {
    super.ngOnInit();
    this.logger.debug(EvaluadorDatosGeneralesComponent.name, 'ngOnInit()', 'start');

    this.cargarSelectorComites();
    this.cargarSelectorCargosComite();

    this.logger.debug(EvaluadorDatosGeneralesComponent.name, 'ngOnInit()', 'end');
  }

  cargarSelectorComites() {
    this.comiteService.findAll().subscribe(
      (res) => {
        this.comites = res.items;
        this.logger.debug(EvaluadorDatosGeneralesComponent.name, 'cargarSelectorComites()', 'start');
        this.filteredComites = this.formGroup.controls.comite.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filterComite(value))
          );
      },
      () => {
        this.snackBarService.showError(MSG_ERROR_INIT_);
        this.logger.debug(EvaluadorDatosGeneralesComponent.name, 'cargarSelectorComites()', 'end');
      }
    );
  }

  cargarSelectorCargosComite() {
    this.cargoComiteService.findAll().subscribe(
      (res: SgiRestListResult<CargoComite>) => {
        this.cargosComite = res.items;
        this.filteredCargosComite = this.formGroup.controls.cargoComite.valueChanges
          .pipe(
            startWith(''),
            map(value => this.filterCargoComite(value))
          );
      },
      () => {
        this.snackBarService.showError(MSG_ERROR_INIT_);
      }
    );
  }

  /**
   * Devuelve el nombre de un comité.
   * @param comite comités
   * returns nombre comité
   */
  getComite(comite: IComite): string {
    return comite?.comite;
  }

  /**
   * Devuelve el nombre de un comité.
   * @param comite comités
   * returns nombre comité
   */
  getCargoComite(cargoComite: CargoComite): string {
    return cargoComite?.nombre;
  }

  /**
   * Filtro de campo autocompletable comité.
   * @param value value a filtrar (string o nombre comité).
   * @returns lista de comités filtrados.
   */
  private filterComite(value: string | IComite): IComite[] {
    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.comite.toLowerCase();
    }

    return this.comites.filter
      (comite => comite.comite.toLowerCase().includes(filterValue));
  }

  /**
   * Filtro de campo autocompletable cargo comité.
   * @param value value a filtrar (string o nombre cargo comité).
   * @returns lista de cargos comité filtrados.
   */
  private filterCargoComite(value: string | CargoComite): CargoComite[] {
    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.nombre.toLowerCase();
    }

    return this.cargosComite.filter
      (cargoComite => cargoComite.nombre.toLowerCase().includes(filterValue));
  }

}
