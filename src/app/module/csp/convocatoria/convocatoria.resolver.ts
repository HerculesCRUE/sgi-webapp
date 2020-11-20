import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiResolverResolver } from '@core/resolver/sgi-resolver';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';

const MSG_NOT_FOUND = marker('eti.convocatoria.editar.no-encontrado');

@Injectable()
export class ConvocatoriaResolver extends SgiResolverResolver<IConvocatoria> {

  constructor(router: Router, snackBar: SnackBarService, private service: ConvocatoriaService) {
    super(router, snackBar, MSG_NOT_FOUND);
  }

  protected resolveEntity(route: ActivatedRouteSnapshot): Observable<IConvocatoria> {
    return this.service.findById(Number(route.paramMap.get('id')));
  }
}
