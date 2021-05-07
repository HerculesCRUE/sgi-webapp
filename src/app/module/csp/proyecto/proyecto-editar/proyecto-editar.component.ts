import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ActionComponent } from '@core/component/action.component';
import { MSG_PARAMS } from '@core/i18n';
import { DialogService } from '@core/services/dialog.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { TranslateService } from '@ngx-translate/core';
import { NGXLogger } from 'ngx-logger';
import { switchMap } from 'rxjs/operators';
import { PROYECTO_ROUTE_NAMES } from '../proyecto-route-names';
import { ProyectoActionService } from '../proyecto.action.service';

const MSG_BUTTON_EDIT = marker('btn.save.entity');
const MSG_SUCCESS = marker('msg.update.entity.success');
const MSG_ERROR = marker('error.update.entity');
const PROYECTO_KEY = marker('csp.proyecto');

@Component({
  selector: 'sgi-proyecto-editar',
  templateUrl: './proyecto-editar.component.html',
  styleUrls: ['./proyecto-editar.component.scss'],
  viewProviders: [
    ProyectoActionService
  ]
})
export class ProyectoEditarComponent extends ActionComponent implements OnInit {
  PROYECTO_ROUTE_NAMES = PROYECTO_ROUTE_NAMES;

  textoCrear: string;
  textoEditarSuccess: string;
  textoEditarError: string;

  get MSG_PARAMS() {
    return MSG_PARAMS;
  }

  constructor(
    private readonly logger: NGXLogger,
    protected snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public actionService: ProyectoActionService,
    dialogService: DialogService,
    private readonly translate: TranslateService) {
    super(router, route, actionService, dialogService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.setupI18N();
  }

  private setupI18N(): void {
    this.translate.get(
      PROYECTO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).pipe(
      switchMap((value) => {
        return this.translate.get(
          MSG_BUTTON_EDIT,
          { entity: value, ...MSG_PARAMS.GENDER.MALE }
        );
      })
    ).subscribe((value) => this.textoCrear = value);

    this.translate.get(
      PROYECTO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).pipe(
      switchMap((value) => {
        return this.translate.get(
          MSG_SUCCESS,
          { entity: value, ...MSG_PARAMS.GENDER.MALE }
        );
      })
    ).subscribe((value) => this.textoEditarSuccess = value);

    this.translate.get(
      PROYECTO_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).pipe(
      switchMap((value) => {
        return this.translate.get(
          MSG_ERROR,
          { entity: value, ...MSG_PARAMS.GENDER.MALE }
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

}
