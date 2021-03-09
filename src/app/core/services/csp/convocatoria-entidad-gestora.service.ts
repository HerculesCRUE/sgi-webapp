import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaEntidadGestora } from '@core/models/csp/convocatoria-entidad-gestora';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { environment } from '@env';
import { SgiBaseConverter } from '@sgi/framework/core';
import { SgiMutableRestService } from '@sgi/framework/http';

export interface IConvocatoriaEntidadGestoraBackend {
  id: number;
  convocatoria: IConvocatoria;
  entidadRef: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaEntidadGestoraService extends
  SgiMutableRestService<number, IConvocatoriaEntidadGestoraBackend, IConvocatoriaEntidadGestora> {
  private static readonly MAPPING = '/convocatoriaentidadgestoras';

  static readonly CONVERTER = new class extends SgiBaseConverter<IConvocatoriaEntidadGestoraBackend, IConvocatoriaEntidadGestora> {
    toTarget(value: IConvocatoriaEntidadGestoraBackend): IConvocatoriaEntidadGestora {
      return {
        id: value.id,
        convocatoria: value.convocatoria,
        empresaEconomica: { personaRef: value.entidadRef } as IEmpresaEconomica
      };
    }

    fromTarget(value: IConvocatoriaEntidadGestora): IConvocatoriaEntidadGestoraBackend {
      return {
        id: value.id,
        convocatoria: value.convocatoria,
        entidadRef: value.empresaEconomica?.personaRef
      };
    }
  }();

  constructor(protected http: HttpClient) {
    super(
      ConvocatoriaEntidadGestoraService.name,
      `${environment.serviceServers.csp}${ConvocatoriaEntidadGestoraService.MAPPING}`,
      http,
      ConvocatoriaEntidadGestoraService.CONVERTER
    );
  }
}
