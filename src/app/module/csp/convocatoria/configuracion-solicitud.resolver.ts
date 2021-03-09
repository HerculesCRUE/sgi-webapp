import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiResolverResolver } from '@core/resolver/sgi-resolver';
import { IConfiguracionSolicitud } from '@core/models/csp/configuracion-solicitud';
import { ConfiguracionSolicitudService } from '@core/services/csp/configuracion-solicitud.service';

const MSG_NOT_FOUND = marker('csp.convocatoria.editar.no-encontrado');

@Injectable()
export class ConfiguracionSolicitudResolver extends SgiResolverResolver<IConfiguracionSolicitud> {

  constructor(router: Router, snackBar: SnackBarService, private service: ConfiguracionSolicitudService) {
    super(router, snackBar, MSG_NOT_FOUND);
  }

  protected resolveEntity(route: ActivatedRouteSnapshot): Observable<IConfiguracionSolicitud> {
    return this.service.findById(Number(route.paramMap.get('id')));
  }
}
