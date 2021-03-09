import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaEntidadFinanciadora } from '@core/models/csp/convocatoria-entidad-financiadora';
import { IFuenteFinanciacion } from '@core/models/csp/fuente-financiacion';
import { ITipoFinanciacion } from '@core/models/csp/tipos-configuracion';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { environment } from '@env';
import { SgiBaseConverter } from '@sgi/framework/core';
import { SgiMutableRestService } from '@sgi/framework/http';

export interface IConvocatoriaEntidadFinanciadoraBackend {
  id: number;
  entidadRef: string;
  convocatoria: IConvocatoria;
  fuenteFinanciacion: IFuenteFinanciacion;
  tipoFinanciacion: ITipoFinanciacion;
  porcentajeFinanciacion: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaEntidadFinanciadoraService extends
  SgiMutableRestService<number, IConvocatoriaEntidadFinanciadoraBackend, IConvocatoriaEntidadFinanciadora> {
  private static readonly MAPPING = '/convocatoriaentidadfinanciadoras';

  public static readonly CONVERTER = new class extends
    SgiBaseConverter<IConvocatoriaEntidadFinanciadoraBackend, IConvocatoriaEntidadFinanciadora> {
    toTarget(value: IConvocatoriaEntidadFinanciadoraBackend): IConvocatoriaEntidadFinanciadora {
      return {
        id: value.id,
        empresa: { personaRef: value.entidadRef } as IEmpresaEconomica,
        convocatoria: value?.convocatoria,
        fuenteFinanciacion: value.fuenteFinanciacion,
        tipoFinanciacion: value.tipoFinanciacion,
        porcentajeFinanciacion: value.porcentajeFinanciacion
      };
    }

    fromTarget(value: IConvocatoriaEntidadFinanciadora): IConvocatoriaEntidadFinanciadoraBackend {
      return {
        id: value.id,
        entidadRef: value.empresa?.personaRef,
        convocatoria: value?.convocatoria,
        fuenteFinanciacion: value.fuenteFinanciacion,
        tipoFinanciacion: value.tipoFinanciacion,
        porcentajeFinanciacion: value.porcentajeFinanciacion
      };
    }
  }();

  constructor(protected http: HttpClient) {
    super(
      ConvocatoriaEntidadFinanciadoraService.name,
      `${environment.serviceServers.csp}${ConvocatoriaEntidadFinanciadoraService.MAPPING}`,
      http,
      ConvocatoriaEntidadFinanciadoraService.CONVERTER
    );
  }
}
