import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IEvaluacion } from '@core/models/eti/evaluacion';
import { SgiResolverResolver } from '@core/resolver/sgi-resolver';
import { EvaluacionService } from '@core/services/eti/evaluacion.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { Observable } from 'rxjs';

const MSG_NOT_FOUND = marker('eti.evaluacion.evaluar.error');

@Injectable()
export class EvaluacionResolver extends SgiResolverResolver<IEvaluacion> {

  constructor(router: Router, snackBar: SnackBarService, private service: EvaluacionService) {
    super(router, snackBar, MSG_NOT_FOUND);
  }

  protected resolveEntity(route: ActivatedRouteSnapshot): Observable<IEvaluacion> {
    return this.service.findById(Number(route.paramMap.get('id')));
  }
}