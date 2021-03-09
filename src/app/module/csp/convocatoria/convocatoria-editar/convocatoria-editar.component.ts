import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { CONVOCATORIA_ROUTE_NAMES } from '../convocatoria-route-names';
import { ConvocatoriaActionService } from '../convocatoria.action.service';

const MSG_BUTTON_EDIT = marker('botones.guardar');
const MSG_BUTTON_REGISTRAR = marker('csp.convocatoria.registrar');
const MSG_SUCCESS = marker('csp.convocatoria.editar.correcto');
const MSG_ERROR = marker('csp.convocatoria.editar.error');
const MSG_SUCCESS_REGISTRAR = marker('csp.convocatoria.registrar.correcto');
const MSG_ERROR_REGISTRAR = marker('csp.convocatoria.registrar.error');

@Component({
  selector: 'sgi-convocatoria-editar',
  templateUrl: './convocatoria-editar.component.html',
  styleUrls: ['./convocatoria-editar.component.scss'],
  providers: [
    ConvocatoriaActionService
  ]
})
export class ConvocatoriaEditarComponent extends ActionComponent implements OnInit {
  CONVOCATORIA_ROUTE_NAMES = CONVOCATORIA_ROUTE_NAMES;

  textoCrear = MSG_BUTTON_EDIT;
  textoRegistrar = MSG_BUTTON_REGISTRAR;

  disableRegistrar = true;
  disable = true;

  constructor(
    private readonly logger: NGXLogger,
    protected snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public actionService: ConvocatoriaActionService,
    dialogService: DialogService,
    private convocatoriaService: ConvocatoriaService
  ) {

    super(router, route, actionService, dialogService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.isDisableRegistrar();
    this.subscriptions.push(this.actionService.status$.subscribe(
      status => {
        this.disableRegistrar = status.changes || status.errors;
      }
    ));
  }

  saveOrUpdate(): void {
    this.actionService.saveOrUpdate().subscribe(
      () => { },
      (error) => {
        this.logger.error(error);
        this.snackBarService.showError(MSG_ERROR);
      },
      () => {
        this.snackBarService.showSuccess(MSG_SUCCESS);
        this.router.navigate(['../'], { relativeTo: this.activatedRoute });
      }
    );
  }


  registrar(): void {
    this.actionService.registrar().subscribe(
      () => { },
      (error) => {
        this.logger.error(error);
        this.snackBarService.showError(MSG_ERROR_REGISTRAR);
      },
      () => {
        this.snackBarService.showSuccess(MSG_SUCCESS_REGISTRAR);
        this.router.navigate(['../'], { relativeTo: this.activatedRoute });
      }
    );
  }

  /**
   * Permite habilitar o deshabilitar el botón de registro en función de los datos de convocatoria
   */
  private isDisableRegistrar(): void {
    this.subscriptions.push(
      this.convocatoriaService.registrable(this.actionService.convocatoriaId).subscribe(
        res => this.disable = !res,
        (error) => {
          this.logger.error(error);
          this.disable = true;
        }
      )
    );
  }

}
