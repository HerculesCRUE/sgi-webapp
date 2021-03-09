import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { FragmentComponent } from '@core/component/fragment.component';
import { IMemoria } from '@core/models/eti/memoria';
import { IMemoriaPeticionEvaluacion } from '@core/models/eti/memoriaPeticionEvaluacion';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { DialogService } from '@core/services/dialog.service';
import { MemoriaService } from '@core/services/eti/memoria.service';
import { PeticionEvaluacionService } from '@core/services/eti/peticion-evaluacion.service';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { NGXLogger } from 'ngx-logger';
import { of, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MEMORIAS_ROUTE } from '../../../memoria/memoria-route-names';
import { PeticionEvaluacionActionService } from '../../peticion-evaluacion.action.service';
import { MemoriasListadoFragment } from './memorias-listado.fragment';

const MSG_CONFIRM_DELETE = marker('eti.peticionEvaluacion.formulario.memorias.listado.eliminar');
const MSG_ESTADO_ANTERIOR_OK = marker('eti.memoria.listado.volverEstadoAnterior.ok');
const MSG_ESTADO_ANTERIOR_ERROR = marker('eti.memoria.listado.volverEstadoAnterior.error');
const MSG_RECUPERAR_ESTADO = marker('eti.memoria.listado.volverEstadoAnterior.confirmacion');

const MSG_SUCCESS_ENVIAR_SECRETARIA = marker('eti.peticionEvaluacion.formulario.memorias.listado.enviarSecretaria.correcto');
const MSG_ERROR_ENVIAR_SECRETARIA = marker('eti.peticionEvaluacion.formulario.memorias.listado.enviarSecretaria.error');
const MSG_CONFIRM_ENVIAR_SECRETARIA = marker('eti.peticionEvaluacion.formulario.memorias.listado.enviarSecretaria.confirmar');
const MSG_SUCCESS_ENVIAR_SECRETARIA_RETROSPECTIVA = marker('eti.peticionEvaluacion.formulario.memorias.listado.enviarSecretariaRetrospectiva.correcto');
const MSG_ERROR_ENVIAR_SECRETARIA_RETROSPECTIVA = marker('eti.peticionEvaluacion.formulario.memorias.listado.enviarSecretariaRetrospectiva.error');
const MSG_CONFIRM_ENVIAR_SECRETARIA_RETROSPECTIVA = marker('eti.peticionEvaluacion.formulario.memorias.listado.enviarSecretariaRetrospectiva.confirmar');

@Component({
  selector: 'sgi-memorias-listado',
  templateUrl: './memorias-listado.component.html',
  styleUrls: ['./memorias-listado.component.scss']
})
export class MemoriasListadoComponent extends FragmentComponent implements OnInit, OnDestroy {
  MEMORIAS_ROUTE = MEMORIAS_ROUTE;

  fxFlexProperties: FxFlexProperties;
  fxLayoutProperties: FxLayoutProperties;

  elementosPagina: number[] = [5, 10, 25, 100];
  displayedColumns: string[] = ['numReferencia', 'comite', 'estadoActual', 'fechaEvaluacion', 'fechaLimite', 'acciones'];
  disableEnviarSecretaria = true;

  datasource: MatTableDataSource<StatusWrapper<IMemoria>> = new MatTableDataSource<StatusWrapper<IMemoria>>();

  private subscriptions: Subscription[] = [];
  private listadoFragment: MemoriasListadoFragment;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private readonly logger: NGXLogger,
    protected readonly dialogService: DialogService,
    protected readonly memoriaService: MemoriaService,
    protected readonly personaFisicaService: PersonaFisicaService,
    protected readonly peticionEvaluacionService: PeticionEvaluacionService,
    protected readonly snackBarService: SnackBarService,
    private actionService: PeticionEvaluacionActionService
  ) {
    super(actionService.FRAGMENT.MEMORIAS, actionService);
    this.listadoFragment = this.fragment as MemoriasListadoFragment;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
    this.subscriptions.push(this.listadoFragment.memorias$.subscribe((memorias) => {
      this.datasource.data = memorias;
    }));

    this.subscriptions.push(this.actionService.status$.subscribe((status) => {
      this.disableEnviarSecretaria = status.changes;
    }
    ));

    this.datasource.sortingDataAccessor =
      (wrapper: StatusWrapper<IMemoria>, property: string) => {
        switch (property) {
          case 'comite':
            return wrapper.value.comite?.comite;
          case 'estadoActual':
            return wrapper.value.estadoActual?.nombre;
          default:
            return wrapper.value[property];
        }
      };
  }

  /**
   * Elimina la memoria.
   *
   * @param wrappedMemoria la memoria a eliminar.
   */
  delete(wrappedMemoria: StatusWrapper<IMemoriaPeticionEvaluacion>): void {
    this.subscriptions.push(this.dialogService.showConfirmation(
      MSG_CONFIRM_DELETE
    ).subscribe((aceptado) => {
      if (aceptado) {
        this.listadoFragment.deleteMemoria(wrappedMemoria);
      }
    }));
  }

  /**
   * Se recupera el estado anterior de la memoria
   * @param memoria la memoria a reestablecer el estado
   */
  private recuperarEstadoAnteriorMemoria(memoria: IMemoriaPeticionEvaluacion) {
    const recuperarEstadoMemoria = this.memoriaService.recuperarEstadoAnterior(memoria.id).pipe(
      map((response: IMemoria) => {
        if (response) {
          // Si todo ha salido bien se recarga la tabla con el cambio de estado actualizado y el aviso correspondiente
          this.snackBarService.showSuccess(MSG_ESTADO_ANTERIOR_OK);
          this.listadoFragment.loadMemorias(this.listadoFragment.getKey() as number);
        } else {
          // Si no se puede cambiar de estado se muestra el aviso
          this.snackBarService.showError(MSG_ESTADO_ANTERIOR_ERROR);
        }
      })
    ).subscribe();

    this.subscriptions.push(recuperarEstadoMemoria);
  }

  /**
   * Confirmación para recuperar el estado de la memoria
   * @param memoria la memoria a reestablecer el estado
   */
  public recuperarEstadoAnterior(memoria: IMemoriaPeticionEvaluacion) {
    this.dialogService.showConfirmation(MSG_RECUPERAR_ESTADO).pipe(
      map((aceptado: boolean) => {
        if (aceptado) {
          this.recuperarEstadoAnteriorMemoria(memoria);
        }
      })
    );
  }

  hasPermisoEnviarSecretaria(estadoMemoriaId: number): boolean {

    // Si el estado es 'Completada', 'Favorable pendiente de modificaciones mínima',
    // 'Pendiente de correcciones', 'No procede evaluar', 'Completada seguimiento anual',
    // 'Completada seguimiento final' o 'En aclaracion seguimiento final' se muestra el botón de enviar.
    if (estadoMemoriaId === 2 || estadoMemoriaId === 6 || estadoMemoriaId === 7
      || estadoMemoriaId === 8 || estadoMemoriaId === 11 || estadoMemoriaId === 16
      || estadoMemoriaId === 21) {
      return true;
    } else {
      return false;
    }

  }

  enviarSecretaria(memoria: IMemoriaPeticionEvaluacion) {
    this.dialogService.showConfirmation(MSG_CONFIRM_ENVIAR_SECRETARIA)
      .pipe(switchMap((aceptado) => {
        if (aceptado) {
          return this.memoriaService.enviarSecretaria(memoria.id);
        }
        return of();
      })).subscribe(
        () => {
          this.listadoFragment.loadMemorias(this.listadoFragment.getKey() as number);
          this.snackBarService.showSuccess(MSG_SUCCESS_ENVIAR_SECRETARIA);
        },
        (error) => {
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR_ENVIAR_SECRETARIA);
        }
      );
  }

  hasPermisoEnviarSecretariaRetrospectiva(memoria: IMemoria): boolean {
    // Si el estado es 'Completada', es de tipo CEEA y requiere retrospectiva se muestra el botón de enviar.
    // Si la retrospectiva ya está 'En secretaría' no se muestra el botón.
    if (memoria.estadoActual.id === 2 && memoria.comite.comite === 'CEEA' && memoria.requiereRetrospectiva
      && memoria.retrospectiva.estadoRetrospectiva.id !== 3) {
      return true;
    } else {
      return false;
    }
  }

  enviarSecretariaRetrospectiva(memoria: IMemoriaPeticionEvaluacion) {
    this.dialogService.showConfirmation(MSG_CONFIRM_ENVIAR_SECRETARIA_RETROSPECTIVA)
      .pipe(switchMap((aceptado) => {
        if (aceptado) {
          return this.memoriaService.enviarSecretariaRetrospectiva(memoria.id);
        }
        return of();
      })).subscribe(
        () => {
          this.listadoFragment.loadMemorias(this.listadoFragment.getKey() as number);
          this.snackBarService.showSuccess(MSG_SUCCESS_ENVIAR_SECRETARIA_RETROSPECTIVA);
        },
        (error) => {
          this.logger.error(error);
          this.snackBarService.showError(MSG_ERROR_ENVIAR_SECRETARIA_RETROSPECTIVA);
        }
      );
  }


  hasPermisoEliminar(estadoMemoriaId: number): boolean {
    // Si el estado es 'En elaboración' o 'Completada'.
    return (estadoMemoriaId === 1 || estadoMemoriaId === 2);
  }

  ngOnDestroy(): void {
    this.subscriptions?.forEach(x => x.unsubscribe());
  }

}
