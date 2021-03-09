import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiResolverResolver } from '@core/resolver/sgi-resolver';
import { IProyecto } from '@core/models/csp/proyecto';
import { ProyectoService } from '@core/services/csp/proyecto.service';

const MSG_NOT_FOUND = marker('csp.proyecto.editar.no-encontrado');

@Injectable()
export class ProyectoResolver extends SgiResolverResolver<IProyecto> {

  constructor(router: Router, snackBar: SnackBarService, private service: ProyectoService) {
    super(router, snackBar, MSG_NOT_FOUND);
  }

  protected resolveEntity(route: ActivatedRouteSnapshot): Observable<IProyecto> {
    return this.service.findById(Number(route.paramMap.get('id')));
  }
}
