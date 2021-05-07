import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { SgiResolverResolver } from '@core/resolver/sgi-resolver';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CONVOCATORIA_ROUTE_PARAMS } from './convocatoria-route-params';
import { IConvocatoriaData } from './convocatoria.action.service';

const MSG_NOT_FOUND = marker('error.load');

export const CONVOCATORIA_DATA_KEY = 'convocatoriaData';

@Injectable()
export class ConvocatoriaDataResolver extends SgiResolverResolver<IConvocatoriaData> {

  constructor(
    logger: NGXLogger,
    router: Router,
    snackBar: SnackBarService,
    private service: ConvocatoriaService
  ) {
    super(logger, router, snackBar, MSG_NOT_FOUND);
  }

  protected resolveEntity(route: ActivatedRouteSnapshot): Observable<IConvocatoriaData> {
    const convocatoriaId = Number(route.paramMap.get(CONVOCATORIA_ROUTE_PARAMS.ID));
    return this.service.exists(convocatoriaId).pipe(
      switchMap(exists => {
        if (!exists) {
          return throwError('NOT_FOUND');
        }
        return this.service.modificable(convocatoriaId).pipe(
          map(response => {
            return {
              readonly: !response
            };
          })
        );
      }),
    );
  }
}
