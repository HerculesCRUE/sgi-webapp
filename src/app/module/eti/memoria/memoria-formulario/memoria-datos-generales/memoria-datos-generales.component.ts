import { Component, OnDestroy, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { ComiteService } from '@core/services/eti/comite.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { FormFragmentComponent } from '@core/component/fragment.component';
import { IMemoria } from '@core/models/eti/memoria';
import { IComite } from '@core/models/eti/comite';
import { startWith, map, tap } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { MemoriaDatosGeneralesFragment } from './memoria-datos-generales.fragment';
import { MemoriaActionService } from '../../memoria.action.service';
import { TipoMemoria } from '@core/models/eti/tipo-memoria';
import { TipoEstadoMemoria } from '@core/models/eti/tipo-estado-memoria';
import { IPersona } from '@core/models/sgp/persona';
import { TipoMemoriaService } from '@core/services/eti/tipo-memoria.service';
import { FormControl } from '@angular/forms';
import { NullIdValidador } from '@core/validators/null-id-validador';

const MSG_ERROR_INIT_ = marker('eti.memoria.datosGenerales.error.init');
const TEXT_USER_TITLE = marker('eti.memoria.datosGenerales.buscador.solicitante');
const TEXT_USER_BUTTON = marker('eti.memoria.datosGenerales.buscador.buscar.solicitante');

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

  private subscriptions: Subscription[] = [];

  constructor(
    protected readonly logger: NGXLogger,
    private readonly comiteService: ComiteService,
    private readonly snackBarService: SnackBarService,
    private readonly tipoMemoriaService: TipoMemoriaService,
    private actionService: MemoriaActionService
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
    this.logger.debug(MemoriaDatosGeneralesComponent.name, 'ngOnInit()', 'start');
    this.loadComites();
    this.logger.debug(MemoriaDatosGeneralesComponent.name, 'ngOnInit()', 'end');
  }

  loadComites() {
    this.subscriptions.push(this.comiteService.findAll().subscribe(
      (res) => {
        this.comites = res.items;
        this.logger.debug(MemoriaDatosGeneralesComponent.name, 'loadComites()', 'start');
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
      () => {
        this.snackBarService.showError(MSG_ERROR_INIT_);
        this.logger.debug(MemoriaDatosGeneralesComponent.name, 'loadComites()', 'end');
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
      return persona?.nombre + ' ' + persona?.primerApellido + ' ' +
        persona?.segundoApellido + '(' + persona?.identificadorNumero + persona?.identificadorLetra + ')';
    }
  }

  getPersonaRef(persona: IPersona): string {
    return persona.personaRef;
  }

  /**
   * Recupera los tipos de memoria según el comité seleccionado.
   * @param comite Comité seleccionado.
   */
  selectComite(comite: IComite): void {

    this.logger.debug(MemoriaDatosGeneralesComponent.name, 'selectComite()', 'start');
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
      () => {
        this.snackBarService.showError(MSG_ERROR_INIT_);
        this.logger.debug(MemoriaDatosGeneralesComponent.name, 'selectComite()', 'end');
      }
    );
  }


  /**
   * En caso de que la opción seleccionada sea "Modificada"
   * se recuperará el listado de memorias del comité previamente seleccionado.
   * @param comite Comité seleccionado.
   */
  selectTipoMemoria(tipoMemoria: TipoMemoria): void {
    this.logger.debug(MemoriaDatosGeneralesComponent.name, 'selectTipoMemoria()', 'start');

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
        () => {
          this.snackBarService.showError(MSG_ERROR_INIT_);
          this.logger.debug(MemoriaDatosGeneralesComponent.name, 'selectTipoMemoria()', 'end');
        }
      );
    } else {
      this.formGroup.controls.memoriaOriginal.clearValidators();
      this.formGroup.controls.memoriaOriginal.updateValueAndValidity();
    }
  }

  ngOnDestroy(): void {
    this.logger.debug(MemoriaDatosGeneralesComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.logger.debug(MemoriaDatosGeneralesComponent.name, 'ngOnDestroy()', 'end');
  }
}
