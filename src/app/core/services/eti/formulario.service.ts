import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IBloque } from '@core/models/eti/bloque';
import { IFormulario } from '@core/models/eti/formulario';
import { environment } from '@env';
import { SgiRestFindOptions, SgiRestListResult, SgiReadOnlyRestService } from '@sgi/framework/http';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FormularioService extends SgiReadOnlyRestService<number, IFormulario>{

  private static readonly MAPPING = '/formularios';

  constructor(logger: NGXLogger, protected http: HttpClient) {
    super(FormularioService.name, logger, `${environment.serviceServers.eti}${FormularioService.MAPPING}`, http);
  }

  getBloques(id: number, options?: SgiRestFindOptions): Observable<SgiRestListResult<IBloque>> {
    this.logger.debug(FormularioService.name, `getBloques(${id}, ${options ? JSON.stringify(options) : options}`, '-', 'start');
    return this.find<IBloque, IBloque>(`${this.endpointUrl}/${id}/bloques`, options).pipe(
      tap(() => this.logger.debug(FormularioService.name, `getBloques(${id}, ${options ? JSON.stringify(options) : options}`, '-', 'end'))
    );
  }
}
