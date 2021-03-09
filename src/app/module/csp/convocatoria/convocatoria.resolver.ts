import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiResolverResolver } from '@core/resolver/sgi-resolver';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { map } from 'rxjs/operators';

const MSG_NOT_FOUND = marker('csp.convocatoria.editar.no-encontrado');

@Injectable()
export class ConvocatoriaResolver extends SgiResolverResolver<number> {

  constructor(router: Router, snackBar: SnackBarService, private service: ConvocatoriaService) {
    super(router, snackBar, MSG_NOT_FOUND);
  }

  protected resolveEntity(route: ActivatedRouteSnapshot): Observable<number> {
    const id = Number(route.paramMap.get('id'));
    return this.service.exists(id).pipe(map(() => id));
  }
}
