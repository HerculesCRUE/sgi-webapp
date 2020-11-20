import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IPeticionEvaluacion } from '@core/models/eti/peticion-evaluacion';
import { SgiResolverResolver } from '@core/resolver/sgi-resolver';
import { PeticionEvaluacionService } from '@core/services/eti/peticion-evaluacion.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { Observable } from 'rxjs';


const MSG_NOT_FOUND = marker('eti.peticionEvaluacion.editar.no-encontrado');

@Injectable()
export class PeticionEvaluacionResolver extends SgiResolverResolver<IPeticionEvaluacion> {

  constructor(router: Router, snackBar: SnackBarService, private service: PeticionEvaluacionService) {
    super(router, snackBar, MSG_NOT_FOUND);
  }

  protected resolveEntity(route: ActivatedRouteSnapshot): Observable<IPeticionEvaluacion> {
    return this.service.findById(Number(route.paramMap.get('id')));
  }
}
