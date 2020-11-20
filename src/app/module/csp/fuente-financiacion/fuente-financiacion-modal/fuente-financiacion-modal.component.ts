import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormGroupUtil } from '@core/utils/form-group-util';
import { NGXLogger } from 'ngx-logger';
import { IFuenteFinanciacion } from '@core/models/csp/fuente-financiacion';
import { ITipoOrigenFuenteFinanciacion } from '@core/models/csp/tipo-origen-fuente-financiacion';
import { SgiRestListResult } from '@sgi/framework/http/types';
import { TipoOrigenFuenteFinanciacionService } from '@core/services/csp/tipo-origen-fuente-financiacion.service';
import { Observable, Subscription } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ITipoAmbitoGeografico } from '@core/models/csp/tipo-ambito-geografico';
import { TipoAmbitoGeograficoService } from '@core/services/csp/tipo-ambito-geografico.service';

const MSG_ERROR_FORM_GROUP = marker('form-group.error');
const MSG_ERROR_INIT = marker('csp.fuenteFinanciacion.datos.generales.error.cargar');

@Component({
  templateUrl: './fuente-financiacion-modal.component.html',
  styleUrls: ['./fuente-financiacion-modal.component.scss']
})
export class FuenteFinanciacionModalComponent implements OnInit {
  formGroup: FormGroup;
  fxLayoutProperties: FxLayoutProperties;
  fxFlexProperties: FxFlexProperties;
  public fuenteFinanciacion: IFuenteFinanciacion;

  ambitosGeograficos: Observable<ITipoAmbitoGeografico[]>;
  origenes: Observable<ITipoOrigenFuenteFinanciacion[]>;
  private ambitoGeograficoFiltered: ITipoAmbitoGeografico[];
  private origenFiltered: ITipoOrigenFuenteFinanciacion[];

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly logger: NGXLogger,
    private readonly snackBarService: SnackBarService,
    public readonly matDialogRef: MatDialogRef<FuenteFinanciacionModalComponent>,
    private ambitoGeograficoService: TipoAmbitoGeograficoService,
    private tipoOrigenFuenteFinanciacionService: TipoOrigenFuenteFinanciacionService,
    @Inject(MAT_DIALOG_DATA) fuenteFinanciacion: IFuenteFinanciacion
  ) {
    this.logger.debug(FuenteFinanciacionModalComponent.name, 'constructor()', 'start');
    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.layout = 'row';
    this.fxLayoutProperties.layoutAlign = 'row';
    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(100%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(100%-10px)';
    this.fxFlexProperties.order = '2';
    if (fuenteFinanciacion) {
      this.fuenteFinanciacion = { ...fuenteFinanciacion };
    } else {
      this.fuenteFinanciacion = { activo: true } as IFuenteFinanciacion;
    }
    this.logger.debug(FuenteFinanciacionModalComponent.name, 'constructor()', 'end');
  }

  ngOnInit(): void {
    this.logger.debug(FuenteFinanciacionModalComponent.name, 'ngOnInit()', 'start');
    this.formGroup = new FormGroup({
      nombre: new FormControl(this.fuenteFinanciacion?.nombre),
      descripcion: new FormControl(this.fuenteFinanciacion?.descripcion),
      ambitoGeografico: new FormControl(this.fuenteFinanciacion?.tipoAmbitoGeografico),
      origen: new FormControl(this.fuenteFinanciacion?.tipoOrigenFuenteFinanciacion),
      fondoEstructural: new FormControl(this.fuenteFinanciacion?.id ? this.fuenteFinanciacion.fondoEstructural : true),
    });

    this.loadAmbitosGeograficos();
    this.loadOrigenes();

    this.logger.debug(FuenteFinanciacionModalComponent.name, 'ngOnInit()', 'end');
  }

  closeModal(fuenteFinanciacion?: IFuenteFinanciacion): void {
    this.logger.debug(FuenteFinanciacionModalComponent.name, `${this.closeModal.name}(tipoEnlace?: ITipoEnlace)`, 'start');
    this.matDialogRef.close(fuenteFinanciacion);
    this.logger.debug(FuenteFinanciacionModalComponent.name, `${this.closeModal.name}(tipoEnlace?: ITipoEnlace)`, 'end');
  }

  saveOrUpdate(): void {
    this.logger.debug(FuenteFinanciacionModalComponent.name, `${this.saveOrUpdate.name}()`, 'start');
    if (FormGroupUtil.valid(this.formGroup)) {
      this.loadDatosForm();
      this.closeModal(this.fuenteFinanciacion);
    } else {
      this.snackBarService.showError(MSG_ERROR_FORM_GROUP);
    }
    this.logger.debug(FuenteFinanciacionModalComponent.name, `${this.saveOrUpdate.name}()`, 'end');
  }

  /**
   * Método para actualizar la entidad con los datos de un formGroup
   */
  private loadDatosForm(): void {
    this.logger.debug(FuenteFinanciacionModalComponent.name, `${this.loadDatosForm.name}()`, 'start');
    this.fuenteFinanciacion.nombre = this.formGroup.get('nombre').value;
    this.fuenteFinanciacion.descripcion = this.formGroup.get('descripcion').value;
    this.fuenteFinanciacion.tipoAmbitoGeografico = this.formGroup.get('ambitoGeografico').value;
    this.fuenteFinanciacion.tipoOrigenFuenteFinanciacion = this.formGroup.get('origen').value;
    this.fuenteFinanciacion.fondoEstructural = this.formGroup.get('fondoEstructural').value;
    this.logger.debug(FuenteFinanciacionModalComponent.name, `${this.loadDatosForm.name}()`, 'end');
  }

  private loadAmbitosGeograficos() {
    this.logger.debug(FuenteFinanciacionModalComponent.name, 'loadAmbitosGeograficos()', 'start');
    this.subscriptions.push(
      this.ambitoGeograficoService.findAll().subscribe(
        (res: SgiRestListResult<ITipoAmbitoGeografico>) => {
          this.ambitoGeograficoFiltered = res.items;
          this.ambitosGeograficos = this.formGroup.controls.ambitoGeografico.valueChanges
            .pipe(

              startWith(''),
              map(value => this.filtroAmbitoGeografico(value))
            );
          this.logger.debug(FuenteFinanciacionModalComponent.name, 'loadAmbitosGeograficos()', 'end');
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_INIT);
          this.logger.debug(FuenteFinanciacionModalComponent.name, 'loadAmbitosGeograficos()', 'end');
        }
      )
    );
    this.logger.debug(FuenteFinanciacionModalComponent.name, 'loadAmbitosGeograficos()', 'end');
  }

  private loadOrigenes() {
    this.logger.debug(FuenteFinanciacionModalComponent.name, 'loadOrigenes()', 'start');
    this.subscriptions.push(
      this.tipoOrigenFuenteFinanciacionService.findAll().subscribe(
        (res: SgiRestListResult<ITipoOrigenFuenteFinanciacion>) => {
          this.origenFiltered = res.items;
          this.origenes = this.formGroup.controls.origen.valueChanges
            .pipe(

              startWith(''),
              map(value => this.filtroOrigen(value))
            );
          this.logger.debug(FuenteFinanciacionModalComponent.name, 'loadOrigenes()', 'end');
        },
        () => {
          this.snackBarService.showError(MSG_ERROR_INIT);
          this.logger.debug(FuenteFinanciacionModalComponent.name, 'loadOrigenes()', 'end');
        }
      )
    );
    this.logger.debug(FuenteFinanciacionModalComponent.name, 'loadOrigenes()', 'end');
  }

  /**
   * Devuelve el nombre de un ámbito geográfico.
   * @param ambitoGeografico ámbito geográfico.
   * @returns nombre de un ámbito geográfico.
   */
  getAmbitoGeografico(ambitoGeografico?: ITipoAmbitoGeografico): string | undefined {
    console.log(typeof ambitoGeografico);
    return typeof ambitoGeografico === 'string' ? ambitoGeografico : ambitoGeografico?.nombre;
  }

  /**
   * Devuelve el nombre de un tipo de origen.
   * @param origen origen.
   * @returns nombre de un tipo de origen.
   */
  getOrigen(origen?: ITipoOrigenFuenteFinanciacion): string | undefined {
    return typeof origen === 'string' ? origen : origen?.nombre;
  }

  /**
   * Filtra la lista devuelta por el servicio
   *
   * @param value del input para autocompletar
   */
  private filtroAmbitoGeografico(value: string): ITipoAmbitoGeografico[] {
    const filterValue = value.toString().toLowerCase();
    return this.ambitoGeograficoFiltered.filter(ambitoGeografico => ambitoGeografico.nombre.toLowerCase()
      .includes(filterValue));
  }

  /**
   * Filtra la lista devuelta por el servicio
   *
   * @param value del input para autocompletar
   */
  private filtroOrigen(value: string): ITipoOrigenFuenteFinanciacion[] {
    const filterValue = value.toString().toLowerCase();
    return this.origenFiltered.filter(origen => origen.nombre.toLowerCase().includes(filterValue));
  }
}
