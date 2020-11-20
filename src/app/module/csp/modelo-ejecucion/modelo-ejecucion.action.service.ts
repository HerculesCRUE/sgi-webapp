import { Injectable } from '@angular/core';

import { ActionService, IFragment } from '@core/services/action-service';
import { ActivatedRoute } from '@angular/router';

import { NGXLogger } from 'ngx-logger';
import { ModeloEjecucionService } from '@core/services/csp/modelo-ejecucion.service';
import { ModeloEjecucionDatosGeneralesFragment } from './modelo-ejecucion-formulario/modelo-ejecucion-datos-generales/modelo-ejecucion-datos-generales.fragment';
import { IModeloEjecucion, ITipoFase } from '@core/models/csp/tipos-configuracion';
import { ModeloEjecucionTipoEnlaceFragment } from './modelo-ejecucion-formulario/modelo-ejecucion-tipo-enlace/modelo-ejecucion-tipo-enlace.fragment';
import { ModeloTipoEnlaceService } from '@core/services/csp/modelo-tipo-enlace.service';
import { ModeloEjecucionTipoFinalidadFragment } from './modelo-ejecucion-formulario/modelo-ejecucion-tipo-finalidad/modelo-ejecucion-tipo-finalidad.fragment';
import { ModeloTipoFinalidadService } from '@core/services/csp/modelo-tipo-finalidad.service';
import { ModeloEjecucionTipoFaseFragment } from './modelo-ejecucion-formulario/modelo-ejecucion-tipo-fase/modelo-ejecucion-tipo-fase.fragment';
import { ModeloTipoFaseService } from '@core/services/csp/modelo-tipo-fase.service';
import { ModeloEjecucionTipoDocumentoFragment } from './modelo-ejecucion-formulario/modelo-ejecucion-tipo-documento/modelo-ejecucion-tipo-documento.fragment';
import { ModeloTipoDocumentoService } from '@core/services/csp/modelo-tipo-documento.service';
import { ModeloEjecucionTipoHitoFragment } from './modelo-ejecucion-formulario/modelo-ejecucion-tipo-hito/modelo-ejecucion-tipo-hito.fragment';
import { ModeloTipoHitoService } from '@core/services/csp/modelo-tipo-hito.service';
import { ModeloEjecucionTipoUnidadGestionFragment } from './modelo-ejecucion-formulario/modelo-ejecucion-tipo-unidad-gestion/modelo-ejecucion-tipo-unidad-gestion.fragment';
import { ModeloUnidadService } from '@core/services/csp/modelo-unidad.service';
import { UnidadGestionService } from '@core/services/csp/unidad-gestion.service';
import { IModeloTipoFase } from '@core/models/csp/modelo-tipo-fase';
import { from, Observable, of, throwError } from 'rxjs';
import { filter, mergeMap, switchMap, takeLast, tap } from 'rxjs/operators';

@Injectable()
export class ModeloEjecucionActionService extends ActionService {
  public readonly FRAGMENT = {
    DATOS_GENERALES: 'datos-generales',
    TIPO_ENLACES: 'tipo-enlaces',
    TIPO_FINALIDADES: 'tipo-finalidades',
    TIPO_FASES: 'tipo-fases',
    TIPO_DOCUMENTOS: 'tipo-documentos',
    TIPO_HITOS: 'tipo-hitos',
    UNIDAD_GESTION: 'unidades',
  };

  private modeloEjecucion: IModeloEjecucion;
  private datosGenerales: ModeloEjecucionDatosGeneralesFragment;
  private tipoEnlaces: ModeloEjecucionTipoEnlaceFragment;
  private tipoFinalidades: ModeloEjecucionTipoFinalidadFragment;
  private tipoFases: ModeloEjecucionTipoFaseFragment;
  private tipoDocumentos: ModeloEjecucionTipoDocumentoFragment;
  private tipoHitos: ModeloEjecucionTipoHitoFragment;
  private tipoUnidadGestion: ModeloEjecucionTipoUnidadGestionFragment;

  private fragmentos: Map<string, IFragment> = new Map();

  constructor(
    private logger: NGXLogger,
    route: ActivatedRoute,
    modeloEjecucionService: ModeloEjecucionService,
    modeloTipoEnlaceService: ModeloTipoEnlaceService,
    modeloTipoFinalidadService: ModeloTipoFinalidadService,
    modeloTipoFaseService: ModeloTipoFaseService,
    modeloTipoDocumentoService: ModeloTipoDocumentoService,
    modeloTipoHitoService: ModeloTipoHitoService,
    modeloUnidadService: ModeloUnidadService,
    unidadGestionService: UnidadGestionService) {
    super();
    this.logger.debug(ModeloEjecucionActionService.name, 'constructor()', 'start');
    this.modeloEjecucion = {} as IModeloEjecucion;
    if (route.snapshot.data.modeloEjecucion) {
      this.modeloEjecucion = route.snapshot.data.modeloEjecucion;
      this.enableEdit();
    }
    this.datosGenerales = new ModeloEjecucionDatosGeneralesFragment(logger, this.modeloEjecucion?.id, modeloEjecucionService);
    this.tipoEnlaces = new ModeloEjecucionTipoEnlaceFragment(logger, this.modeloEjecucion?.id,
      modeloEjecucionService, modeloTipoEnlaceService, this);
    this.tipoFinalidades = new ModeloEjecucionTipoFinalidadFragment(logger, this.modeloEjecucion?.id,
      modeloEjecucionService, modeloTipoFinalidadService, this);
    this.tipoFases = new ModeloEjecucionTipoFaseFragment(logger, this.modeloEjecucion?.id, modeloEjecucionService,
      modeloTipoFaseService);
    this.tipoDocumentos = new ModeloEjecucionTipoDocumentoFragment(logger, this.modeloEjecucion?.id, modeloEjecucionService,
      modeloTipoDocumentoService, this);
    this.tipoHitos = new ModeloEjecucionTipoHitoFragment(logger, this.modeloEjecucion?.id, modeloEjecucionService,
      modeloTipoHitoService, this);
    this.tipoUnidadGestion = new ModeloEjecucionTipoUnidadGestionFragment(logger, this.modeloEjecucion?.id, modeloEjecucionService,
      modeloUnidadService, unidadGestionService, this);

    this.addFragment(this.FRAGMENT.DATOS_GENERALES, this.datosGenerales);
    this.addFragment(this.FRAGMENT.TIPO_FASES, this.tipoFases);
    this.addFragment(this.FRAGMENT.TIPO_FINALIDADES, this.tipoFinalidades);
    this.addFragment(this.FRAGMENT.TIPO_ENLACES, this.tipoEnlaces);
    this.addFragment(this.FRAGMENT.TIPO_DOCUMENTOS, this.tipoDocumentos);
    this.addFragment(this.FRAGMENT.TIPO_HITOS, this.tipoHitos);
    this.addFragment(this.FRAGMENT.UNIDAD_GESTION, this.tipoUnidadGestion);

    this.fragmentos.set(this.FRAGMENT.DATOS_GENERALES, this.datosGenerales);
    this.fragmentos.set(this.FRAGMENT.TIPO_FASES, this.tipoFases);
    this.fragmentos.set(this.FRAGMENT.TIPO_FINALIDADES, this.tipoFinalidades);
    this.fragmentos.set(this.FRAGMENT.TIPO_ENLACES, this.tipoEnlaces);
    this.fragmentos.set(this.FRAGMENT.TIPO_DOCUMENTOS, this.tipoDocumentos);
    this.fragmentos.set(this.FRAGMENT.TIPO_HITOS, this.tipoHitos);
    this.fragmentos.set(this.FRAGMENT.UNIDAD_GESTION, this.tipoUnidadGestion);

    this.logger.debug(ModeloEjecucionActionService.name, 'constructor()', 'end');
  }

  getTipoFases(): ITipoFase[] {
    this.logger.debug(ModeloEjecucionActionService.name, 'getTipoFases()', 'start');
    const result = this.tipoFases.modeloTipoFase$.value.map(x => x.value.tipoFase);
    this.logger.debug(ModeloEjecucionActionService.name, 'getTipoFases()', 'end');
    return result;
  }

  getModeloTipoFases(): IModeloTipoFase[] {
    this.logger.debug(ModeloEjecucionActionService.name, 'getModeloTipoFases()', 'start');
    const result = this.tipoFases.modeloTipoFase$.value.map(x => x.value);
    this.logger.debug(ModeloEjecucionActionService.name, 'getModeloTipoFases()', 'end');
    return result;
  }

  saveOrUpdate(): Observable<void> {
    this.logger.debug(ModeloEjecucionActionService.name, 'saveOrUpdate()', 'start');
    this.performChecks(true);
    if (this.hasErrors()) {
      this.logger.error(ModeloEjecucionActionService.name, 'saveOrUpdate()', 'error');
      return throwError('Errores');
    }
    if (this.isEdit()) {
      return this.tipoFases.saveOrUpdate().pipe(
        switchMap(() => {
          this.tipoFases.refreshInitialState(true);
          return super.saveOrUpdate();
        }),
        tap(() => this.logger.debug(ModeloEjecucionActionService.name,
          'saveOrUpdate()', 'end'))
      );
    } else {
      return this.datosGenerales.saveOrUpdate().pipe(
        switchMap((key) => {
          this.datosGenerales.refreshInitialState(true);
          if (typeof key === 'string' || typeof key === 'number') {
            this.onKeyChange(key);
          }
          return this.tipoFases.saveOrUpdate();
        }),
        switchMap(() => {
          this.tipoFases.refreshInitialState(true);
          return super.saveOrUpdate();
        }),
        tap(() => this.logger.debug(ModeloEjecucionActionService.name,
          'saveOrUpdate()', 'end'))
      );
    }
  }
}
