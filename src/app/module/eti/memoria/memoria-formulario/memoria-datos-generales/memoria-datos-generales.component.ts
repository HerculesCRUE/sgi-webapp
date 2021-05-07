import { Component, OnDestroy, OnInit } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { MSG_PARAMS } from '@core/i18n';
import { IComite } from '@core/models/eti/comite';
import { IMemoria } from '@core/models/eti/memoria';
import { TipoEstadoMemoria } from '@core/models/eti/tipo-estado-memoria';
import { TipoMemoria } from '@core/models/eti/tipo-memoria';
import { IPersona } from '@core/models/sgp/persona';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { ComiteService } from '@core/services/eti/comite.service';
import { TipoMemoriaService } from '@core/services/eti/tipo-memoria.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NullIdValidador } from '@core/validators/null-id-validador';
import { TranslateService } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';
import { Observable, Subscription } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { MemoriaActionService } from '../../memoria.action.service';
import { MemoriaDatosGeneralesFragment } from './memoria-datos-generales.fragment';

const MSG_ERROR_INIT_ = marker('error.load');
const TEXT_USER_TITLE = marker('eti.solicitante');
const TEXT_USER_BUTTON = marker('btn.eti.search.solicitante');
const MEMORIA_COMITE_KEY = marker('label.eti.comite');
const MEMORIA_ORIGINAL_KEY = marker('eti.memoria.original');
const MEMORIA_TIPO_KEY = marker('eti.memoria.tipo');
const MEMORIA_CODIGO_ORGANO_COMPETENTE = marker('eti.memoria.codigo-organo-compentente');
@Component({
  selector: 'sgi-memoria-datos-generales',
  templateUrl: './memoria-datos-generales.component.html',
  styleUrls: ['./memoria-datos-generales.component.scss']
})
export class MemoriaDatosGeneralesComponent extends FormFragmentComponent<IMemoria> implements OnInit, OnDestroy {

  fxFlexProperties: FxFlexProperties;
  fxFlexPropertiesInline: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;
  comites: IComite[] = [];
  tiposMemoria: TipoMemoria[] = [];

  memorias: IMemoria[] = [];

  filteredComites: Observable<IComite[]>;
  filteredTipoMemorias: Observable<TipoMemoria[]>;
  filteredMemorias: Observable<IMemoria[]>;

  datosGeneralesFragment: MemoriaDatosGeneralesFragment;
  textoUsuarioLabel = TEXT_USER_TITLE;
  textoUsuarioInput = TEXT_USER_TITLE;
  textoUsuarioButton = TEXT_USER_BUTTON;
  msgParamComiteEntity = {};
  msgParamTipoMemoriaEntity = {};
  msgParamOrginalEntity = {};
  msgParamCodigoOrganoCompenteteEntity = {};

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly logger: NGXLogger,
    private readonly comiteService: ComiteService,
    private readonly snackBarService: SnackBarService,
    private readonly tipoMemoriaService: TipoMemoriaService,
    private actionService: MemoriaActionService,
    private readonly translate: TranslateService
  ) {
    super(actionService.FRAGMENT.DATOS_GENERALES, actionService);
    this.datosGeneralesFragment = this.fragment as MemoriaDatosGeneralesFragment;

    this.fxFlexProperties = new FxFlexProperties();
    this.fxFlexProperties.sm = '0 1 calc(100%-10px)';
    this.fxFlexProperties.md = '0 1 calc(50%-10px)';
    this.fxFlexProperties.gtMd = '0 1 calc(22%-10px)';
    this.fxFlexProperties.order = '1';

    this.fxLayoutProperties = new FxLayoutProperties();
    this.fxLayoutProperties.gap = '20px';
    this.fxLayoutProperties.layout = 'row wrap';
    this.fxLayoutProperties.xs = 'column';
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.setupI18N();
    this.loadComites();
  }

  private setupI18N(): void {
    this.translate.get(
      MEMORIA_COMITE_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamComiteEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE });

    this.translate.get(
      MEMORIA_TIPO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamTipoMemoriaEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE });

    this.translate.get(
      MEMORIA_ORIGINAL_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamOrginalEntity = { entity: value, ...MSG_PARAMS.GENDER.FEMALE });

    this.translate.get(
      MEMORIA_CODIGO_ORGANO_COMPETENTE,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).subscribe((value) => this.msgParamCodigoOrganoCompenteteEntity = { entity: value, ...MSG_PARAMS.GENDER.MALE });
  }

  loadComites() {
    this.subscriptions.push(this.comiteService.findAll().subscribe(
      (res) => {
        this.comites = res.items;
        this.filteredComites = this.formGroup.controls.comite.valueChanges
          .pipe(
            startWith(''),
            tap((value) => {
              if (typeof value !== 'string') {
                this.actionService.setComite(value);
              }
            }),
            map(value => {
              return this.filterComite(value);
            })
          );
      },
      (error) => {
        this.logger.error(error);
        this.snackBarService.showError(MSG_ERROR_INIT_);
      }
    ));
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


  private filterTipoMemorias(value: string | TipoEstadoMemoria): TipoEstadoMemoria[] {
    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.nombre.toLowerCase();
    }

    return this.tiposMemoria.filter
      (tipoMemoria => tipoMemoria.nombre.toLowerCase().includes(filterValue));
  }


  private filterMemorias(value: string | IMemoria): IMemoria[] {
    let filterValue: string;
    if (typeof value === 'string') {
      filterValue = value.toLowerCase();
    } else {
      filterValue = value.numReferencia.toLowerCase();
    }

    return this.memorias.filter
      (memoria => memoria.numReferencia.toLowerCase().includes(filterValue));
  }

  /**
   * Devuelve el nombre de un comité.
   * @param comite comités
   * returns nombre comité
   */
  getComite(comite: IComite): string {
    return comite?.comite;
  }

  getTipoMemoria(tipoMemoria: TipoMemoria): string {
    return tipoMemoria?.nombre;
  }

  getTitulo(titulo: string): string {
    return titulo;
  }

  getMemoria(memoria: IMemoria): string {
    return memoria?.numReferencia;
  }

  getPersonaResponsable(persona: IPersona): string {
    if (persona) {
      return persona?.nombre + ' ' + persona?.apellidos + ' (' + persona?.numeroDocumento + ')';
    }
  }

  /**
   * Recupera los tipos de memoria según el comité seleccionado.
   * @param comite Comité seleccionado.
   */
  selectComite(comite: IComite): void {
    this.datosGeneralesFragment.showCodOrganoCompetente = comite.comite === 'CEEA' ? true : false;
    this.datosGeneralesFragment.showTitulo = comite.comite === 'CEEA' ? true : false;

    this.formGroup.controls.tipoMemoria.reset();
    this.formGroup.controls.memoria?.reset();
    this.formGroup.controls.codOrganoCompetente?.reset();

    this.comiteService.findTipoMemoria(comite.id).subscribe(
      (res) => {
        this.tiposMemoria = res.items;

        this.filteredTipoMemorias = this.formGroup.controls.tipoMemoria.valueChanges
          .pipe(
            startWith(''),
            map(value => {
              return this.filterTipoMemorias(value);
            })
          );
      },
      (error) => {
        this.logger.error(error);
        this.snackBarService.showError(MSG_ERROR_INIT_);
      }
    );
  }


  /**
   * En caso de que la opción seleccionada sea "Modificada"
   * se recuperará el listado de memorias del comité previamente seleccionado.
   * @param comite Comité seleccionado.
   */
  selectTipoMemoria(tipoMemoria: TipoMemoria): void {
    this.datosGeneralesFragment.showMemoriaOriginal = tipoMemoria.id === 2 ? true : false;
    if (tipoMemoria.id === 2) {
      this.formGroup.controls.memoriaOriginal.setValidators(new NullIdValidador().isValid());
      this.formGroup.controls.memoriaOriginal.updateValueAndValidity();

      this.comiteService.findMemorias(this.formGroup.controls.comite.value.id).subscribe(
        (res) => {
          this.memorias = res.items;

          this.filteredMemorias = this.formGroup.controls.memoriaOriginal.valueChanges
            .pipe(
              startWith(''),
              map(value => {
                return this.filterMemorias(value);
              })
            );
        },
        (error) => {
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR_INIT_);
        }
      );
    } else {
      this.formGroup.controls.memoriaOriginal.clearValidators();
      this.formGroup.controls.memoriaOriginal.updateValueAndValidity();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
