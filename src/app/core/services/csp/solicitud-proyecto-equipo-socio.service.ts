import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IRolProyecto } from '@core/models/csp/rol-proyecto';
import { ISolicitudProyectoEquipoSocio } from '@core/models/csp/solicitud-proyecto-equipo-socio';
import { ISolicitudProyectoSocio } from '@core/models/csp/solicitud-proyecto-socio';
import { IPersona } from '@core/models/sgp/persona';
import { environment } from '@env';
import { SgiBaseConverter } from '@sgi/framework/core';
import { SgiMutableRestService } from '@sgi/framework/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ISolicitudProyectoEquipoSocioBackend {
  id: number;
  solicitudProyectoSocio: ISolicitudProyectoSocio;
  personaRef: string;
  rolProyecto: IRolProyecto;
  mesInicio: number;
  mesFin: number;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitudProyectoEquipoSocioService extends
  SgiMutableRestService<number, ISolicitudProyectoEquipoSocioBackend, ISolicitudProyectoEquipoSocio> {
  private static readonly MAPPING = '/solicitudproyectoequiposocio';

  static CONVERTER = new class extends SgiBaseConverter<ISolicitudProyectoEquipoSocioBackend, ISolicitudProyectoEquipoSocio> {
    toTarget(value: ISolicitudProyectoEquipoSocioBackend): ISolicitudProyectoEquipoSocio {
      const persona: IPersona = {
        identificadorLetra: undefined,
        identificadorNumero: undefined,
        nivelAcademico: undefined,
        nombre: undefined,
        personaRef: value.personaRef,
        primerApellido: undefined,
        segundoApellido: undefined,
        vinculacion: undefined
      };
      const result: ISolicitudProyectoEquipoSocio = {
        id: value.id,
        mesFin: value.mesFin,
        mesInicio: value.mesInicio,
        persona,
        rolProyecto: value.rolProyecto,
        solicitudProyectoSocio: value.solicitudProyectoSocio
      };
      return result;
    }

    fromTarget(value: ISolicitudProyectoEquipoSocio): ISolicitudProyectoEquipoSocioBackend {
      const result: ISolicitudProyectoEquipoSocioBackend = {
        id: value.id,
        mesFin: value.mesFin,
        mesInicio: value.mesInicio,
        personaRef: value.persona.personaRef,
        rolProyecto: value.rolProyecto,
        solicitudProyectoSocio: value.solicitudProyectoSocio
      };
      return result;
    }
  }();

  constructor(
    protected http: HttpClient
  ) {
    super(
      SolicitudProyectoEquipoSocioService.name,
      `${environment.serviceServers.csp}${SolicitudProyectoEquipoSocioService.MAPPING}`,
      http,
      SolicitudProyectoEquipoSocioService.CONVERTER
    );
  }

  updateList(proyectoSolictudSocioId: number, entities: ISolicitudProyectoEquipoSocio[])
    : Observable<ISolicitudProyectoEquipoSocio[]> {
    const entitiesBack = entities.map(entity => this.converter.fromTarget(entity));
    return this.http.patch<ISolicitudProyectoEquipoSocioBackend[]>(
      `${this.endpointUrl}/${proyectoSolictudSocioId}`, entitiesBack).pipe(
        map(resultList => resultList.map(entity => this.converter.toTarget(entity)))
      );
  }
}
