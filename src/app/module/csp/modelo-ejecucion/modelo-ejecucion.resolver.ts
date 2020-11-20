import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiResolverResolver } from '@core/resolver/sgi-resolver';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { IModeloEjecucion } from '@core/models/csp/tipos-configuracion';

const MSG_NOT_FOUND = marker('csp.modelo.ejecucion.editar.no-encontrado');

@Injectable()
export class ModeloEjecucionResolver extends SgiResolverResolver<IModeloEjecucion> {

  constructor(router: Router, snackBar: SnackBarService, private service: ModeloEjecucionService) {
    super(router, snackBar, MSG_NOT_FOUND);
  }

  protected resolveEntity(route: ActivatedRouteSnapshot): Observable<IModeloEjecucion> {
    return this.service.findById(Number(route.paramMap.get('id')));
  }
}