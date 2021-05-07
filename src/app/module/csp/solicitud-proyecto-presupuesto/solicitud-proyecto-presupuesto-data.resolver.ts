import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IEntidadFinanciadora } from '@core/models/csp/entidad-financiadora';
import { SgiResolverResolver } from '@core/resolver/sgi-resolver';
import { ConvocatoriaService } from '@core/services/csp/convocatoria.service';
import { SolicitudService } from '@core/services/csp/solicitud.service';
import { EmpresaService } from '@core/services/sgemp/empresa.service';
import { SnackBarService } from '@core/services/snack-bar.service';
import { RSQLSgiRestFilter, SgiRestFilterOperator, SgiRestFindOptions } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SOLICITUD_DATA_KEY } from '../solicitud/solicitud-data.resolver';
import { ISolicitudData } from '../solicitud/solicitud.action.service';
import { SOLICITUD_PROYECTO_PRESUPUESTO_ROUTE_PARAMS } from './solicitud-proyecto-presupuesto-route-params';
import { ISolicitudProyectoPresupuestoData } from './solicitud-proyecto-presupuesto.action.service';

const MSG_NOT_FOUND = marker('error.load');

export const SOLICITUD_PROYECTO_PRESUPUESTO_DATA_KEY = 'solicitudProyectoPresupuestoData';
export const SOLICITUD_PROYECTO_PRESUPUESTO_AJENA_KEY = 'ajena';

@Injectable()
export class SolicitudProyectoPresupuestoDataResolver extends SgiResolverResolver<ISolicitudProyectoPresupuestoData> {

  constructor(
    logger: NGXLogger,
    router: Router,
    snackBar: SnackBarService,
    private solicitudService: SolicitudService,
    private convocatoriaService: ConvocatoriaService,
    private empresaService: EmpresaService
  ) {
    super(logger, router, snackBar, MSG_NOT_FOUND);
  }

  protected resolveEntity(route: ActivatedRouteSnapshot): Observable<ISolicitudProyectoPresupuestoData> {
    const solicitudData: ISolicitudData = route.parent.data[SOLICITUD_DATA_KEY];
    const empresaRef = route.paramMap.get(SOLICITUD_PROYECTO_PRESUPUESTO_ROUTE_PARAMS.EMPRESA_REF);
    const ajena = route.parent.routeConfig.data[SOLICITUD_PROYECTO_PRESUPUESTO_AJENA_KEY];
    const loadEntidadFinanciadora$ = ajena
      ? this.getEntidadFinanciadoraSolicitud(solicitudData.solicitud.id, empresaRef)
      : this.getEntidadFinanciadoraConvocatoria(solicitudData.solicitud.convocatoriaId, empresaRef);
    return loadEntidadFinanciadora$.pipe(
      map(entidadFinanciadora => {
        return {
          entidadFinanciadora,
          ajena,
          readonly: solicitudData.readonly
        };
      }),
      switchMap(data => {
        return this.empresaService.findById(data.entidadFinanciadora.empresa.id).pipe(
          map(empresa => {
            data.entidadFinanciadora.empresa = empresa;
            return data;
          })
        );
      })
    );
  }

  private getEntidadFinanciadoraConvocatoria(convocatoriaId: number, empresaRef: string): Observable<IEntidadFinanciadora> {
    const options: SgiRestFindOptions = {
      filter: new RSQLSgiRestFilter('entidadRef', SgiRestFilterOperator.EQUALS, empresaRef)
    };

    return this.convocatoriaService.findEntidadesFinanciadoras(convocatoriaId, options).pipe(
      map(response => {
        if (response.items.length > 0) {
          return response.items[0];
        }
        return null;
      }),
      switchMap(entidadFinanciadora => {
        if (!entidadFinanciadora) {
          return throwError('NOT_FOUND');
        }
        return of(entidadFinanciadora);
      })
    );
  }

  private getEntidadFinanciadoraSolicitud(solicitudId: number, empresaRef: string): Observable<IEntidadFinanciadora> {
    const options: SgiRestFindOptions = {
      filter: new RSQLSgiRestFilter('entidadRef', SgiRestFilterOperator.EQUALS, empresaRef)
    };
    return this.solicitudService.findAllSolicitudProyectoEntidadFinanciadora(solicitudId, options).pipe(
      map(response => {
        if (response.items.length > 0) {
          return response.items[0];
        }
        return null;
      }),
      switchMap(entidadFinanciadora => {
        if (!entidadFinanciadora) {
          return throwError('NOT_FOUND');
        }
        return of(entidadFinanciadora);
      })
    );
  }

}
