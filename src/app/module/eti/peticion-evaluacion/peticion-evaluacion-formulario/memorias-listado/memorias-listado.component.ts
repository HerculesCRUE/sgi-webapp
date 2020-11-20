import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FxFlexProperties } from '@core/models/shared/flexLayout/fx-flex-properties';
import { FxLayoutProperties } from '@core/models/shared/flexLayout/fx-layout-properties';
import { NGXLogger } from 'ngx-logger';
import { PersonaFisicaService } from '@core/services/sgp/persona-fisica.service';
import { PeticionEvaluacionService } from '@core/services/eti/peticion-evaluacion.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { IMemoria } from '@core/models/eti/memoria';
import { Subscription, Observable, of, BehaviorSubject } from 'rxjs';
import { MemoriaService } from '@core/services/eti/memoria.service';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { DialogService } from '@core/services/dialog.service';
import { MemoriasListadoFragment } from './memorias-listado.fragment';
import { MatTableDataSource } from '@angular/material/table';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { FragmentComponent } from '@core/component/fragment.component';
import { PeticionEvaluacionActionService } from '../../peticion-evaluacion.action.service';
import { IMemoriaPeticionEvaluacion } from '@core/models/eti/memoriaPeticionEvaluacion';
import { MEMORIAS_ROUTE } from '../../../memoria/memoria-route-names';
import { map } from 'rxjs/operators';
import { switchMap } from 'rxjs/operators';

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

  displayedColumns: string[] = ['numReferencia', 'comite.id', 'estadoActual.id', 'fechaEvaluacion', 'fechaLimite', 'acciones'];
  disableEnviarSecretaria = true;

  datasource: MatTableDataSource<StatusWrapper<IMemoria>> = new MatTableDataSource<StatusWrapper<IMemoria>>();

  private subscriptions: Subscription[] = [];
  private listadoFragment: MemoriasListadoFragment;

  constructor(
    protected readonly dialogService: DialogService,
    protected readonly logger: NGXLogger,
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
    this.subscriptions.push(this.listadoFragment.memorias$.subscribe((memorias) => {
      this.datasource.data = memorias;
    }));

    this.subscriptions.push(this.actionService.status$.subscribe((status) => {
      this.disableEnviarSecretaria = status.changes;
    }
    ));
  }

  /**
   * Elimina la memoria.
   *
   * @param wrappedMemoria la memoria a eliminar.
   */
  delete(wrappedMemoria: StatusWrapper<IMemoriaPeticionEvaluacion>): void {
    this.logger.debug(MemoriasListadoComponent.name, 'delete(memoria: StatusWrapper<IMemoria>) - start');

    this.subscriptions.push(this.dialogService.showConfirmation(
      MSG_CONFIRM_DELETE
    ).subscribe((aceptado) => {
      if (aceptado) {
        this.listadoFragment.deleteMemoria(wrappedMemoria);
      }
    }));

    this.logger.debug(MemoriasListadoComponent.name, 'delete(memoria: StatusWrapper<IMemoria>) - end');
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
        this.logger.debug(MemoriasListadoComponent.name,
          `${this.recuperarEstadoAnterior.name}(${memoria})`, 'end');
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
    this.logger.debug(MemoriasListadoComponent.name, 'enviarSecretaria(memoria: IMemoriaPeticionEvaluacion) - start');

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
        () => {
          this.snackBarService.showError(MSG_ERROR_ENVIAR_SECRETARIA);
        }
      );

    this.logger.debug(MemoriasListadoComponent.name, 'enviarSecretaria(memoria: IMemoriaPeticionEvaluacion) - end');
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
    this.logger.debug(MemoriasListadoComponent.name, 'enviarSecretariaRetrospectiva(memoria: IMemoriaPeticionEvaluacion) - start');

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
        () => {
          this.snackBarService.showError(MSG_ERROR_ENVIAR_SECRETARIA_RETROSPECTIVA);
        }
      );

    this.logger.debug(MemoriasListadoComponent.name, 'enviarSecretariaRetrospectiva(memoria: IMemoriaPeticionEvaluacion) - end');
  }

  ngOnDestroy(): void {
    this.logger.debug(MemoriasListadoComponent.name, 'ngOnDestroy()', 'start');
    this.subscriptions?.forEach(x => x.unsubscribe());
    this.logger.debug(MemoriasListadoComponent.name, 'ngOnDestroy()', 'end');
  }

}
