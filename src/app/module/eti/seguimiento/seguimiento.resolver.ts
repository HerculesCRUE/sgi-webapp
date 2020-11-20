import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiResolverResolver } from '@core/resolver/sgi-resolver';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { EvaluacionService } from '@core/services/eti/evaluacion.service';

const MSG_NOT_FOUND = marker('eti.seguimiento.evaluar.error');

@Injectable()
export class SeguimientoResolver extends SgiResolverResolver<IEvaluacion> {

  constructor(
    router: Router,
    snackBar: SnackBarService,
    private service: EvaluacionService
  ) {
    super(router, snackBar, MSG_NOT_FOUND);
  }

  protected resolveEntity(route: ActivatedRouteSnapshot): Observable<IEvaluacion> {
    return this.service.findById(Number(route.paramMap.get('id')));
  }
}
