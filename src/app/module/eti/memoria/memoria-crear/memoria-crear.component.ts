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
import { MEMORIA_ROUTE_NAMES } from '../memoria-route-names';
import { MemoriaActionService } from '../memoria.action.service';

const MSG_BUTTON_SAVE = marker('btn.save');
const MSG_SUCCESS = marker('msg.save.entity.success');
const MSG_ERROR = marker('error.save.entity');
const MEMORIA_KEY = marker('eti.memoria');

@Component({
  selector: 'sgi-memoria-crear',
  templateUrl: './memoria-crear.component.html',
  styleUrls: ['./memoria-crear.component.scss'],
  viewProviders: [
    MemoriaActionService
  ]
})
export class MemoriaCrearComponent extends ActionComponent implements OnInit {
  MEMORIA_ROUTE_NAMES = MEMORIA_ROUTE_NAMES;
  textoActualizar = MSG_BUTTON_SAVE;
  textoActualizarSuccess: string;
  textoActualizarError: string;
  private from: string;

  constructor(
    private readonly logger: NGXLogger,
    protected readonly snackBarService: SnackBarService,
    router: Router,
    route: ActivatedRoute,
    public actionService: MemoriaActionService,
    dialogService: DialogService,
    private readonly translate: TranslateService
  ) {
    super(router, route, actionService, dialogService);
    this.from = history.state.from;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.setupI18N();
  }

  private setupI18N(): void {

    this.translate.get(
      MEMORIA_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).pipe(
      switchMap((value) => {
        return this.translate.get(
          MSG_SUCCESS,
          { entity: value, ...MSG_PARAMS.GENDER.FEMALE }
        );
      })
    ).subscribe((value) => this.textoActualizarSuccess = value);

    this.translate.get(
      MEMORIA_KEY,
      MSG_PARAMS.CARDINALIRY.SINGULAR
    ).pipe(
      switchMap((value) => {
        return this.translate.get(
          MSG_ERROR,
          { entity: value, ...MSG_PARAMS.GENDER.FEMALE }
        );
      })
    ).subscribe((value) => this.textoActualizarError = value);
  }

  saveOrUpdate(): void {
    this.actionService.saveOrUpdate().subscribe(
      () => { },
      (error) => {
        this.logger.error(error);
        this.snackBarService.showError(this.textoActualizarError);
      },
      () => {
        this.snackBarService.showSuccess(this.textoActualizarSuccess);
        this.router.navigateByUrl(this.from);
      }
    );
  }

  cancel(): void {
    this.router.navigateByUrl(this.from);
  }
}
