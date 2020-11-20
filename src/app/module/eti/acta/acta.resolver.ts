import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IActa } from '@core/models/eti/acta';
import { ActaService } from '@core/services/eti/acta.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiResolverResolver } from '@core/resolver/sgi-resolver';

const MSG_NOT_FOUND = marker('eti.acta.editar.no-encontrado');

@Injectable()
export class ActaResolver extends SgiResolverResolver<IActa> {

  constructor(router: Router, snackBar: SnackBarService, private service: ActaService) {
    super(router, snackBar, MSG_NOT_FOUND);
  }

  protected resolveEntity(route: ActivatedRouteSnapshot): Observable<IActa> {
    return this.service.findById(Number(route.paramMap.get('id')));
  }
}
