import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IEmpresaEconomica, TipoEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { environment } from '@env';
import { SgiBaseConverter } from '@sgi/framework/core';
import { SgiMutableRestService } from '@sgi/framework/http';

interface IEmpresaEconomicaService {

  /** ID */
  personaRef: string;

  /** PersonaRef padre */
  personaRefPadre: string;

  /** Razon social */
  razonSocial: string;

  /** Tipo documento */
  tipoDocumento: string;

  /** Numero documento */
  numeroDocumento: string;

  /** Direccion */
  direccion: string;

  /** Tipo empresa */
  tipoEmpresa: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmpresaEconomicaService extends SgiMutableRestService<string, IEmpresaEconomicaService, IEmpresaEconomica> {
  private static readonly MAPPING = '/empresaeconomicas';

  private static readonly CONVERTER = new class extends SgiBaseConverter<IEmpresaEconomicaService, IEmpresaEconomica> {
    toTarget(value: IEmpresaEconomicaService): IEmpresaEconomica {
      return {
        personaRef: value.personaRef,
        personaRefPadre: value.personaRefPadre,
        razonSocial: value.razonSocial,
        tipoDocumento: value.tipoDocumento,
        numeroDocumento: value.numeroDocumento,
        direccion: value.direccion,
        tipoEmpresa: value.tipoEmpresa,
        tipo: value.personaRefPadre ? TipoEmpresaEconomica.SUBENTIDAD : TipoEmpresaEconomica.ENTIDAD
      };
    }

    fromTarget(value: IEmpresaEconomica): IEmpresaEconomicaService {
      return {
        personaRef: value.personaRef,
        personaRefPadre: value.personaRefPadre,
        razonSocial: value.razonSocial,
        tipoDocumento: value.tipoDocumento,
        numeroDocumento: value.numeroDocumento,
        direccion: value.direccion,
        tipoEmpresa: value.tipoEmpresa
      };
    }
  }();

  constructor(protected http: HttpClient) {
    super(EmpresaEconomicaService.name,
      `${environment.serviceServers.sgp}${EmpresaEconomicaService.MAPPING}`, http, EmpresaEconomicaService.CONVERTER);
  }
}
