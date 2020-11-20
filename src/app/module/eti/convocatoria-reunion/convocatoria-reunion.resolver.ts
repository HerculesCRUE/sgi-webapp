import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IConvocatoriaReunion } from '@core/models/eti/convocatoria-reunion';
import { SgiResolverResolver } from '@core/resolver/sgi-resolver';
import { ConvocatoriaReunionService } from '@core/services/eti/convocatoria-reunion.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { Observable } from 'rxjs';

const MSG_NOT_FOUND = marker('eti.convocatoriaReunion.editar.no-encontrado');

@Injectable()
export class ConvocatoriaReunionResolver extends SgiResolverResolver<IConvocatoriaReunion>{

  constructor(router: Router, snackBar: SnackBarService, private service: ConvocatoriaReunionService) {
    super(router, snackBar, MSG_NOT_FOUND);
  }

  protected resolveEntity(route: ActivatedRouteSnapshot): Observable<IConvocatoriaReunion> {
    return this.service.findById(Number(route.paramMap.get('id')));
  }

}
