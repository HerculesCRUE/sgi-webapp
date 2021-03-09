import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiResolverResolver } from '@core/resolver/sgi-resolver';
import { ISolicitud } from '@core/models/csp/solicitud';
import { SolicitudService } from '@core/services/csp/solicitud.service';

const MSG_NOT_FOUND = marker('csp.solicitud.editar.no-encontrado');

@Injectable()
export class SolicitudResolver extends SgiResolverResolver<ISolicitud> {

  constructor(router: Router, snackBar: SnackBarService, private service: SolicitudService) {
    super(router, snackBar, MSG_NOT_FOUND);
  }

  protected resolveEntity(route: ActivatedRouteSnapshot): Observable<ISolicitud> {
    return this.service.findById(Number(route.paramMap.get('id')));
  }
}
