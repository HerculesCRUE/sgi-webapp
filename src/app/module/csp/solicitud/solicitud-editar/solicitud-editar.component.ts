import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { FormularioSolicitud } from '@core/enums/formulario-solicitud';
import { MSG_PARAMS } from '@core/i18n';
import { Estado } from '@core/models/csp/estado-solicitud';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { GLOBAL_CONSTANTS } from '@core/utils/global-constants';
import { TranslateService } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';
import { switchMap } from 'rxjs/operators';
import { CambioEstadoModalComponent, SolicitudCambioEstadoModalComponentData } from '../modals/cambio-estado-modal/cambio-estado-modal.component';
import { SOLICITUD_ROUTE_NAMES } from '../solicitud-route-names';
import { SolicitudActionService } from '../solicitud.action.service';

const MSG_BUTTON_EDIT = marker('btn.save.entity');
const MSG_SUCCESS = marker('msg.update.entity.success');
const MSG_ERROR = marker('error.update.entity');
const SOLICITUD_KEY = marker('csp.solicitud');
// CAMBIO DE ESTADO
const MSG_CAMBIO_ESTADO_SUCCESS = marker('msg.csp.cambio-estado.success');
const MSG_CAMBIO_ESTADO_ERROR = marker('error.csp.cambio-estado');
const MSG_BUTTON_ADMITIR_DEFINITIVAMENTE = marker('csp.solicitud.admitir-definitivamente');
const MSG_BUTTON_ADMITIR_PROVISIONALMENTE = marker('csp.solicitud.admitir-provisionalmente');
const MSG_BUTTON_ALEGAR_ADMISION = marker('csp.solicitud.alegar-admision');
const MSG_BUTTON_ALEGAR_CONCESION = marker('csp.solicitud.alegar-concesion');
const MSG_BUTTON_CONCEDER = marker('csp.solicitud.conceder');
const MSG_BUTTON_CONCEDER_PROVISIONALMENTE = marker('csp.solicitud.conceder-provisionalmente');
const MSG_BUTTON_DENEGAR = marker('csp.solicitud.denegar');
const MSG_BUTTON_DENEGAR_PROVISIONALMENTE = marker('csp.solicitud.denegar-provisionalmente');
const MSG_BUTTON_DESISTIR = marker('csp.solicitud.desistir');
const MSG_BUTTON_EXCLUIR = marker('csp.solicitud.excluir');
const MSG_BUTTON_EXCLUIR_PROVISIONALMENTE = marker('csp.solicitud.excluir-provisionalmente');
const MSG_BUTTON_PRESENTAR = marker('csp.solicitud.presentar');

@Component({
  selector: 'sgi-solicitud-editar',
  templateUrl: './solicitud-editar.component.html',
  styleUrls: ['./solicitud-editar.component.scss'],
  viewProviders: [
    SolicitudActionService
  ]
})
export class SolicitudEditarComponent extends ActionComponent implements OnInit {
  SOLICITUD_ROUTE_NAMES = SOLICITUD_ROUTE_NAMES;

  textoCrear: string;
  textoEditarSuccess: string;
  textoEditarError: string;

  textoAdmitirDefinitivamente = MSG_BUTTON_ADMITIR_DEFINITIVAMENTE;
  textoAdmitirProvisionalmente = MSG_BUTTON_ADMITIR_PROVISIONALMENTE;
  textoAlegarAdmision = MSG_BUTTON_ALEGAR_ADMISION;
  textoAlegarConcesion = MSG_BUTTON_ALEGAR_CONCESION;
  textoConceder = MSG_BUTTON_CONCEDER;
  textoConcederProvisionalmente = MSG_BUTTON_CONCEDER_PROVISIONALMENTE;
  textoDenegar = MSG_BUTTON_DENEGAR;
  textoDenegarProvisionalmente = MSG_BUTTON_DENEGAR_PROVISIONALMENTE;
  textoDesistir = MSG_BUTTON_DESISTIR;
  textoExcluir = MSG_BUTTON_EXCLUIR;
  textoExcluirProvisionalmente = MSG_BUTTON_EXCLUIR_PROVISIONALMENTE;
  textoPresentar = MSG_BUTTON_PRESENTAR;

  disableCambioEstado = false;
  isPresentable = false;

  get Estado() {
    return Estado;
  }

  get FormularioSolicitud() {
    return FormularioSolicitud;
  }

  get MSG_PARAMS() {
    return MSG_PARAMS;
  }

  constructor(
    private readonly logger: NGXLogger,
    protected snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public actionService: SolicitudActionService,
    dialogService: DialogService,
    private matDialog: MatDialog,
    private readonly translate: TranslateService
  ) {
    super(router, route, actionService, dialogService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.setupI18N();

    this.subscriptions.push(this.actionService.isPresentable$.subscribe(
      isPresentable => {
        this.isPresentable = isPresentable;
      }
    ));

    this.subscriptions.push(this.actionService.status$.subscribe(
      status => {
        this.disableCambioEstado = status.changes || status.errors;
      }
    ));
  }

  private setupI18N(): void {
    this.translate.get(
      SOLICITUD_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).pipe(
      switchMap((value) => {
        return this.translate.get(
          MSG_BUTTON_EDIT,
          { entity: value, ...MSG_PARAMS.GENDER.FEMALE }
        );
      })
    ).subscribe((value) => this.textoCrear = value);

    this.translate.get(
      SOLICITUD_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).pipe(
      switchMap((value) => {
        return this.translate.get(
          MSG_SUCCESS,
          { entity: value, ...MSG_PARAMS.GENDER.FEMALE }
        );
      })
    ).subscribe((value) => this.textoEditarSuccess = value);

    this.translate.get(
      SOLICITUD_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).pipe(
      switchMap((value) => {
        return this.translate.get(
          MSG_ERROR,
          { entity: value, ...MSG_PARAMS.GENDER.FEMALE }
        );
      })
    ).subscribe((value) => this.textoEditarError = value);
  }

  saveOrUpdate(): void {
    this.actionService.saveOrUpdate().subscribe(
      () => { },
      (error) => {
        this.logger.error(error);
        this.snackBarService.showError(this.textoEditarError);
      },
      () => {
        this.snackBarService.showSuccess(this.textoEditarSuccess);
        this.router.navigate(['../'], { relativeTo: this.activatedRoute });
      }
    );
  }

  hasEstadoCambio(...estadosSolicitud: Estado[]): boolean {
    let estadoCorrecto = false;
    estadosSolicitud.forEach((estadoSolicitud) => {
      if (this.actionService.estado === estadoSolicitud) {
        estadoCorrecto = true;
        return;
      }
    });

    return estadoCorrecto;
  }

  cambioEstado(accion: string) {
    switch (accion) {
      case MSG_BUTTON_PRESENTAR: {
        this.actionService.presentar().subscribe(
          () => { },
          (error) => {
            this.logger.error(error);
            this.snackBarService.showError(MSG_CAMBIO_ESTADO_ERROR);
          },
          () => {
            this.snackBarService.showSuccess(MSG_CAMBIO_ESTADO_SUCCESS);
            this.router.navigate(['../'], { relativeTo: this.activatedRoute });
          }
        );
        break;
      }
      case MSG_BUTTON_ADMITIR_PROVISIONALMENTE: {
        this.actionService.admitirProvisionalmente().subscribe(
          () => { },
          (error) => {
            this.logger.error(error);
            this.snackBarService.showError(MSG_CAMBIO_ESTADO_ERROR);
          },
          () => {
            this.snackBarService.showSuccess(MSG_CAMBIO_ESTADO_SUCCESS);
            this.router.navigate(['../'], { relativeTo: this.activatedRoute });
          }
        );
        break;
      }
      case MSG_BUTTON_ADMITIR_DEFINITIVAMENTE: {
        this.actionService.admitirDefinitivamente().subscribe(
          () => { },
          (error) => {
            this.logger.error(error);
            this.snackBarService.showError(MSG_CAMBIO_ESTADO_ERROR);
          },
          () => {
            this.snackBarService.showSuccess(MSG_CAMBIO_ESTADO_SUCCESS);
            this.router.navigate(['../'], { relativeTo: this.activatedRoute });
          }
        );
        break;
      }
      case MSG_BUTTON_CONCEDER_PROVISIONALMENTE:
        {
          this.actionService.concederProvisionalmente().subscribe(
            () => { },
            (error) => {
              this.logger.error(error);
              this.snackBarService.showError(MSG_CAMBIO_ESTADO_ERROR);
            },
            () => {
              this.snackBarService.showSuccess(MSG_CAMBIO_ESTADO_SUCCESS);
              this.router.navigate(['../'], { relativeTo: this.activatedRoute });
            }
          );
          break;
        }
      case MSG_BUTTON_CONCEDER: {
        this.actionService.conceder().subscribe(
          () => { },
          (error) => {
            this.logger.error(error);
            this.snackBarService.showError(MSG_CAMBIO_ESTADO_ERROR);
          },
          () => {
            this.snackBarService.showSuccess(MSG_CAMBIO_ESTADO_SUCCESS);
            this.router.navigate(['../'], { relativeTo: this.activatedRoute });
          }
        );
        break;
      }
      case MSG_BUTTON_EXCLUIR_PROVISIONALMENTE: {
        this.openModal(Estado.EXCLUIDA_PROVISIONAL);
        break;
      }
      case MSG_BUTTON_ALEGAR_ADMISION: {
        this.openModal(Estado.ALEGADA_ADMISION);
        break;
      }
      case MSG_BUTTON_EXCLUIR: {
        this.openModal(Estado.EXCLUIDA);
        break;
      }
      case MSG_BUTTON_DENEGAR_PROVISIONALMENTE: {
        this.openModal(Estado.DENEGADA_PROVISIONAL);
        break;
      }
      case MSG_BUTTON_ALEGAR_CONCESION: {
        this.openModal(Estado.ALEGADA_CONCESION);
        break;
      }
      case MSG_BUTTON_DENEGAR: {
        this.openModal(Estado.DENEGADA);
        break;
      }
      case MSG_BUTTON_DESISTIR: {
        this.openModal(Estado.DESISTIDA);
        break;
      }
      default: {
        this.logger.error('Cambio de estado de solicitud no soportado.');
        break;
      }
    }
  }

  /**
   * Apertura de modal cambio de estado para insertar comentario
   */
  openModal(estadoNuevo: Estado): void {
    const data: SolicitudCambioEstadoModalComponentData = {
      estadoActual: this.actionService.estado,
      estadoNuevo,
      comentario: null,
    };
    const config = {
      panelClass: 'sgi-dialog-container',
      data
    };
    const dialogRef = this.matDialog.open(CambioEstadoModalComponent, config);
    dialogRef.afterClosed().subscribe(
      (modalData: SolicitudCambioEstadoModalComponentData) => {
        if (modalData && modalData.comentario) {
          this.cambioEstadoComentario(modalData.comentario, modalData.estadoNuevo);
        }

      }
    );
  }

  /**
   * Invoca los cambios de estado que requieren comentario.
   * @param comentario  comentario de cambio de estado.
   * @param estadoNuevo Nuevo estado de la solicitud.
   */
  cambioEstadoComentario(comentario: string, estadoNuevo: Estado) {
    switch (estadoNuevo) {
      case Estado.EXCLUIDA_PROVISIONAL: {
        this.actionService.excluirProvisionalmente(comentario).subscribe(
          () => { },
          (error) => {
            this.logger.error(error);
            this.snackBarService.showError(MSG_CAMBIO_ESTADO_ERROR);
          },
          () => {
            this.snackBarService.showSuccess(MSG_CAMBIO_ESTADO_SUCCESS);
            this.router.navigate(['../'], { relativeTo: this.activatedRoute });
          }
        );
        break;
      }
      case Estado.ALEGADA_ADMISION: {
        this.actionService.alegarAdmision(comentario).subscribe(
          () => { },
          (error) => {
            this.logger.error(error);
            this.snackBarService.showError(MSG_CAMBIO_ESTADO_ERROR);
          },
          () => {
            this.snackBarService.showSuccess(MSG_CAMBIO_ESTADO_SUCCESS);
            this.router.navigate(['../'], { relativeTo: this.activatedRoute });
          }
        );
        break;
      }
      case Estado.EXCLUIDA: {
        this.actionService.excluir(comentario).subscribe(
          () => { },
          (error) => {
            this.logger.error(error);
            this.snackBarService.showError(MSG_CAMBIO_ESTADO_ERROR);
          },
          () => {
            this.snackBarService.showSuccess(MSG_CAMBIO_ESTADO_SUCCESS);
            this.router.navigate(['../'], { relativeTo: this.activatedRoute });
          }
        );
        break;
      }
      case Estado.DENEGADA_PROVISIONAL: {
        this.actionService.denegarProvisionalmente(comentario).subscribe(
          () => { },
          (error) => {
            this.logger.error(error);
            this.snackBarService.showError(MSG_CAMBIO_ESTADO_ERROR);
          },
          () => {
            this.snackBarService.showSuccess(MSG_CAMBIO_ESTADO_SUCCESS);
            this.router.navigate(['../'], { relativeTo: this.activatedRoute });
          }
        );
        break;
      }
      case Estado.ALEGADA_CONCESION: {
        this.actionService.alegarConcesion(comentario).subscribe(
          () => { },
          (error) => {
            this.logger.error(error);
            this.snackBarService.showError(MSG_CAMBIO_ESTADO_ERROR);
          },
          () => {
            this.snackBarService.showSuccess(MSG_CAMBIO_ESTADO_SUCCESS);
            this.router.navigate(['../'], { relativeTo: this.activatedRoute });
          }
        );
        break;
      }
      case Estado.DENEGADA: {
        this.actionService.denegar(comentario).subscribe(
          () => { },
          (error) => {
            this.logger.error(error);
            this.snackBarService.showError(MSG_CAMBIO_ESTADO_ERROR);
          },
          () => {
            this.snackBarService.showSuccess(MSG_CAMBIO_ESTADO_SUCCESS);
            this.router.navigate(['../'], { relativeTo: this.activatedRoute });
          }
        );
        break;
      }

      case Estado.DESISTIDA: {
        this.actionService.desistir(comentario).subscribe(
          () => { },
          (error) => {
            this.logger.error(error);
            this.snackBarService.showError(MSG_CAMBIO_ESTADO_ERROR);
          },
          () => {
            this.snackBarService.showSuccess(MSG_CAMBIO_ESTADO_SUCCESS);
            this.router.navigate(['../'], { relativeTo: this.activatedRoute });
          }
        );
        break;
      }

      default: {
        this.logger.error('Cambio de estado de solicitud no soportado.');
        break;
      }
    }

  }

}
