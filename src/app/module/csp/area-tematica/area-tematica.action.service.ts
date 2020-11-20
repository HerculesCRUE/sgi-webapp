import { Injectable } from '@angular/core';

import { ActionService } from '@core/services/action-service';
import { ActivatedRoute } from '@angular/router';

import { NGXLogger } from 'ngx-logger';
import { IAreaTematica } from '@core/models/csp/area-tematica';
import { AreaTematicaService } from '@core/services/csp/area-tematica.service';
import { AreaTematicaDatosGeneralesFragment } from './area-tematica-formulario/area-tematica-datos-generales/area-tematica-datos-generales.fragment';
import { AreaTematicaArbolFragment } from './area-tematica-formulario/area-tematica-arbol/area-tematica-arbol.fragment';

@Injectable()
export class AreaTematicaActionService extends ActionService {
  public readonly FRAGMENT = {
    DATOS_GENERALES: 'datos-generales',
    AREAS_ARBOL: 'arbol-areas'
  };

  private area: IAreaTematica;
  private datosGenerales: AreaTematicaDatosGeneralesFragment;
  private areaTematicaArbol: AreaTematicaArbolFragment;

  constructor(
    private readonly logger: NGXLogger,
    route: ActivatedRoute,
    areaTematicaService: AreaTematicaService
  ) {
    super();
    this.logger.debug(AreaTematicaActionService.name, 'constructor()', 'start');
    this.area = {} as IAreaTematica;
    if (route.snapshot.data.area) {
      this.area = route.snapshot.data.area;
      this.enableEdit();
    }

    this.datosGenerales = new AreaTematicaDatosGeneralesFragment(logger, this.area?.id,
      areaTematicaService);

    this.areaTematicaArbol = new AreaTematicaArbolFragment(logger, this.area?.id,
      areaTematicaService);

    this.addFragment(this.FRAGMENT.DATOS_GENERALES, this.datosGenerales);
    this.addFragment(this.FRAGMENT.AREAS_ARBOL, this.areaTematicaArbol);

    this.logger.debug(AreaTematicaActionService.name, 'constructor()', 'start');
    this.logger.debug(AreaTematicaActionService.name, 'constructor()', 'end');
  }

  getArea(): IAreaTematica {
    return this.area;
  }

}
