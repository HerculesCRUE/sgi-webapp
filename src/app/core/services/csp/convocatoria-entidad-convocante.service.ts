import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaEntidadConvocante } from '@core/models/csp/convocatoria-entidad-convocante';
import { IPrograma } from '@core/models/csp/programa';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { environment } from '@env';
import { SgiBaseConverter } from '@sgi/framework/core';
import { SgiMutableRestService } from '@sgi/framework/http';


export interface IConvocatoriaEntidadConvocanteBackend {
  id: number;
  convocatoria: IConvocatoria;
  entidadRef: string;
  programa: IPrograma;
}

@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaEntidadConvocanteService
  extends SgiMutableRestService<number, IConvocatoriaEntidadConvocanteBackend, IConvocatoriaEntidadConvocante> {
  private static readonly MAPPING = '/convocatoriaentidadconvocantes';

  static readonly CONVERTER = new class extends SgiBaseConverter<IConvocatoriaEntidadConvocanteBackend, IConvocatoriaEntidadConvocante> {
    toTarget(value: IConvocatoriaEntidadConvocanteBackend): IConvocatoriaEntidadConvocante {
      return {
        id: value.id,
        convocatoria: value.convocatoria,
        entidad: { personaRef: value.entidadRef } as IEmpresaEconomica,
        programa: value.programa
      };
    }

    fromTarget(value: IConvocatoriaEntidadConvocante): IConvocatoriaEntidadConvocanteBackend {
      return {
        id: value.id,
        convocatoria: value.convocatoria,
        entidadRef: value.entidad?.personaRef,
        programa: value.programa
      };
    }
  }();

  constructor(protected http: HttpClient) {
    super(
      ConvocatoriaEntidadConvocanteService.name,
      `${environment.serviceServers.csp}${ConvocatoriaEntidadConvocanteService.MAPPING}`,
      http,
      ConvocatoriaEntidadConvocanteService.CONVERTER
    );
  }
}
