import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiResolverResolver } from '@core/resolver/sgi-resolver';
import { IPrograma } from '@core/models/csp/programa';
import { ProgramaService } from '@core/services/csp/programa.service';

const MSG_NOT_FOUND = marker('csp.plan.investigacion.editar.no-encontrado');

@Injectable()
export class PlanInvestigacionResolver extends SgiResolverResolver<IPrograma> {

  constructor(
    router: Router,
    snackBar: SnackBarService,
    private service: ProgramaService
  ) {
    super(router, snackBar, MSG_NOT_FOUND);
  }

  protected resolveEntity(route: ActivatedRouteSnapshot): Observable<IPrograma> {
    return this.service.findById(Number(route.paramMap.get('id')));
  }
}
