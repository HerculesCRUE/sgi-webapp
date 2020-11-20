import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiResolverResolver } from '@core/resolver/sgi-resolver';
import { IAreaTematica } from '@core/models/csp/area-tematica';
import { AreaTematicaService } from '@core/services/csp/area-tematica.service';

const MSG_NOT_FOUND = marker('csp.plan.investigacion.editar.no-encontrado');

@Injectable()
export class AreaTematicaResolver extends SgiResolverResolver<IAreaTematica> {

  constructor(router: Router, snackBar: SnackBarService, private service: AreaTematicaService) {
    super(router, snackBar, MSG_NOT_FOUND);
  }

  protected resolveEntity(route: ActivatedRouteSnapshot): Observable<IAreaTematica> {
    return this.service.findById(Number(route.paramMap.get('id')));
  }
}
