import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IEvaluador } from '@core/models/eti/evaluador';
import { EvaluadorService } from '@core/services/eti/evaluador.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiResolverResolver } from '@core/resolver/sgi-resolver';

const MSG_NOT_FOUND = marker('eti.evaluador.editar.no-encontrado');

@Injectable()
export class EvaluadorResolver extends SgiResolverResolver<IEvaluador> {

  constructor(router: Router, snackBar: SnackBarService, private service: EvaluadorService) {
    super(router, snackBar, MSG_NOT_FOUND);
  }

  protected resolveEntity(route: ActivatedRouteSnapshot): Observable<IEvaluador> {
    return this.service.findById(Number(route.paramMap.get('id')));
  }
}
