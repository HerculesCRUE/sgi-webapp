import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IComentario } from '@core/models/eti/comentario';
import { TipoComentario } from '@core/models/eti/tipo-comentario';
import { DialogService } from '@core/services/dialog.service';
import { TipoComentarioService } from '@core/services/eti/tipo-comentario.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { StatusWrapper } from '@core/utils/status-wrapper';
import { Subscription, Observable } from 'rxjs';
import { EvaluacionComentarioFragment } from './evaluacion-comentarios.fragment';

import { ComentarioModalComponent, ComentarioModalData } from '../../comentario/comentario-modal/comentario-modal.component';
import { EvaluacionFormularioActionService, Gestion } from '../evaluacion-formulario.action.service';
import { FragmentComponent } from '@core/component/fragment.component';

const MSG_DELETE = marker('eti.comentario.listado.borrar.titulo');

@Component({
  selector: 'sgi-evaluacion-comentarios',
  templateUrl: './evaluacion-comentarios.component.html',
  styleUrls: ['./evaluacion-comentarios.component.scss']
})
export class EvaluacionComentariosComponent extends FragmentComponent implements OnInit, OnDestroy {

  private formPart: EvaluacionComentarioFragment;
  private subscriptions: Subscription[] = [];

  columnas: string[];
  elementosPagina: number[];
  tipoComentario$: Observable<TipoComentario>;

  dataSource: MatTableDataSource<StatusWrapper<IComentario>> = new MatTableDataSource<StatusWrapper<IComentario>>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;


  constructor(
    private readonly dialogService: DialogService,
    private tipoComentarioService: TipoComentarioService,
    private matDialog: MatDialog,
    private actionService: EvaluacionFormularioActionService

  ) {
    super(actionService.FRAGMENT.COMENTARIOS, actionService);
    this.formPart = this.fragment as EvaluacionComentarioFragment;
    this.elementosPagina = [5, 10, 25, 100];
    this.columnas = ['apartado.bloque', 'apartado.padre',
      'apartado', 'texto', 'acciones'];
  }

  ngOnInit() {
    super.ngOnInit();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.subscriptions.push(this.formPart.comentarios$.subscribe(elements => {
      this.dataSource.data = elements;
    }));

    this.dataSource.sortingDataAccessor =
      (wrapper: StatusWrapper<IComentario>, property: string) => {
        switch (property) {
          case 'apartado.bloque':
            return wrapper.value.apartado?.bloque.nombre;
          case 'apartado.padre':
            return this.getApartadoNombre(wrapper.value);
          case 'apartado':
            return this.getSubApartadoNombre(wrapper.value);
          default:
            return wrapper.value[property];
        }
      };
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getApartadoNombre(comentario: IComentario): string {
    const nombre = comentario.apartado?.padre ?
      comentario.apartado?.padre?.nombre : comentario.apartado?.nombre;
    return nombre;
  }

  getSubApartadoNombre(comentario: IComentario): string {
    const nombre = comentario.apartado?.padre ? comentario.apartado?.nombre : '';
    return nombre;
  }

  /**
   * Abre la ventana modal para añadir un comentario
   */
  openCreateModal(): void {
    const evaluacionData: ComentarioModalData = {
      evaluacion: this.actionService.getEvaluacion(),
      comentario: undefined
    };

    const config = {
      width: GLOBAL_CONSTANTS.maxWidthModal,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: evaluacionData,
      autoFocus: false
    };
    const dialogRef = this.matDialog.open(ComentarioModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (comentario: IComentario) => {
        if (comentario) {
          this.formPart.addComentario(comentario);
        }
      }
    );
  }

  /**
   * Abre la ventana modal para modificar un comentario
   *
   * @param comentario Comentario a modificar
   */
  openEditModal(comentario: StatusWrapper<IComentario>): void {
    const wrapperRef = comentario;

    const evaluacionData: ComentarioModalData = {
      evaluacion: this.actionService.getEvaluacion(),
      comentario: wrapperRef.value
    };

    const config = {
      width: GLOBAL_CONSTANTS.maxWidthModal,
      maxHeight: GLOBAL_CONSTANTS.maxHeightModal,
      data: evaluacionData,
      autoFocus: false
    };
    const dialogRef = this.matDialog.open(ComentarioModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (resultado: IComentario) => {
        if (resultado) {
          this.subscriptions.push(this.getTipoComentario().subscribe(
            (tipoComentario) => {
              resultado.tipoComentario = tipoComentario;
            }
          ));
          if (!wrapperRef.created) {
            wrapperRef.setEdited();
          }
          this.formPart.setChanges(true);
        }
      }
    );
  }

  /**
   * Elimina un comentario del listado
   *
   * @param comentario Comentario a eliminar
   */
  deleteComentario(comentario: StatusWrapper<IComentario>) {
    this.subscriptions.push(
      this.dialogService.showConfirmation(MSG_DELETE).subscribe(
        (aceptado: boolean) => {
          if (aceptado) {
            this.formPart.deleteComentario(comentario);
          }
        }
      )
    );
  }

  getTipoComentario(): Observable<TipoComentario> {
    if (this.actionService.getGestion() === Gestion.GESTOR) {
      this.tipoComentario$ = this.tipoComentarioService.findById(1);
    } else {
      this.tipoComentario$ = this.tipoComentarioService.findById(2);
    }
    return this.tipoComentario$;
  }
}
