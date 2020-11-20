import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IModeloUnidad } from '@core/models/csp/modelo-unidad';
import { environment } from '@env';
import { SgiRestFindOptions, SgiRestListResult, SgiMutableRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IModeloEjecucion } from '@core/models/csp/tipos-configuracion';
import { IUnidadGestion } from '@core/models/usr/unidad-gestion';
import { SgiBaseConverter } from '@sgi/framework/core';


export interface IModeloUnidadBackend {
  id: number;
  unidadGestionRef: string;
  modeloEjecucion: IModeloEjecucion;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModeloUnidadService extends
  SgiMutableRestService<number, IModeloUnidadBackend, IModeloUnidad> {
  private static readonly MAPPING = '/modelounidades';


  public static readonly CONVERTER = new class extends SgiBaseConverter<IModeloUnidadBackend, IModeloUnidad> {
    toTarget(value: IModeloUnidadBackend): IModeloUnidad {
      return {
        id: value.id,
        unidadGestion: {
          id: null,
          nombre: null,
          acronimo: value.unidadGestionRef,
          descripcion: null,
          activo: null
        } as IUnidadGestion,
        modeloEjecucion: value.modeloEjecucion,
        activo: value.activo,

      };
    }

    fromTarget(value: IModeloUnidad): IModeloUnidadBackend {
      return {
        id: value.id,
        unidadGestionRef: value.unidadGestion.acronimo,
        modeloEjecucion: value.modeloEjecucion,
        activo: value.activo,
      };
    }
  }();

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(
      ModeloUnidadService.name,
      logger,
      `${environment.serviceServers.csp}${ModeloUnidadService.MAPPING}`,
      http, ModeloUnidadService.CONVERTER
    );
  }

  /**
   * Muestra activos y no activos
   * @param options opciones de búsqueda.
   */
  findTodos(options?: SgiRestFindOptions): Observable<SgiRestListResult<IModeloUnidad>> {
    this.logger.debug(ModeloUnidadService.name, `${this.findTodos.name}(`, '-', 'START');
    return this.find<IModeloUnidadBackend, IModeloUnidad>(`${this.endpointUrl}/todos`, options).pipe(
      tap(() => this.logger.debug(ModeloUnidadService.name, `${this.findTodos.name}()`, '-', 'END'))
    );
  }

}
