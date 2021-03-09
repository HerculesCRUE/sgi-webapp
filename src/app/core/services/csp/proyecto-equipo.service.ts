import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IProyecto } from '@core/models/csp/proyecto';
import { IProyectoEquipo } from '@core/models/csp/proyecto-equipo';
import { IRolProyecto } from '@core/models/csp/rol-proyecto';
import { IPersona } from '@core/models/sgp/persona';
import { environment } from '@env';
import { SgiBaseConverter } from '@sgi/framework/core';
import { SgiMutableRestService } from '@sgi/framework/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface IProyectoEquipoBackend {
  id: number;
  proyecto: IProyecto;
  rolProyecto: IRolProyecto;
  personaRef: string;
  horasDedicacion: number;
  fechaInicio: Date;
  fechaFin: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProyectoEquipoService extends
  SgiMutableRestService<number, IProyectoEquipoBackend, IProyectoEquipo> {
  private static readonly MAPPING = '/proyectoequipos';

  static CONVERTER = new class extends SgiBaseConverter<IProyectoEquipoBackend, IProyectoEquipo> {
    toTarget(value: IProyectoEquipoBackend): IProyectoEquipo {
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
      const result: IProyectoEquipo = {
        id: value.id,
        fechaFin: typeof value.fechaFin === 'string' ? new Date(value.fechaFin) : value.fechaFin,
        fechaInicio: typeof value.fechaInicio === 'string' ? new Date(value.fechaInicio) : value.fechaInicio,
        persona,
        rolProyecto: value.rolProyecto,
        proyecto: value.proyecto,
        horasDedicacion: value.horasDedicacion
      };
      return result;
    }

    fromTarget(value: IProyectoEquipo): IProyectoEquipoBackend {
      const result: IProyectoEquipoBackend = {
        id: value.id,
        fechaFin: value.fechaFin,
        fechaInicio: value.fechaInicio,
        personaRef: value.persona.personaRef,
        rolProyecto: value.rolProyecto,
        proyecto: value.proyecto,
        horasDedicacion: value.horasDedicacion
      };
      return result;
    }
  }();

  constructor(protected http: HttpClient) {
    super(
      ProyectoEquipoService.name,
      `${environment.serviceServers.csp}${ProyectoEquipoService.MAPPING}`,
      http,
      ProyectoEquipoService.CONVERTER
    );
  }

  /**
   * Actualiza el listado de IDProyectoEquipo asociados a un IProyectoEquipo
   *
   * @param id Id del IProyectoEquipo
   * @param entities Listado de IProyectoEquipo
   */
  updateList(id: number, entities: IProyectoEquipo[]): Observable<IProyectoEquipo[]> {
    const entitiesBack = entities.map(entity => this.converter.fromTarget(entity));
    return this.http.patch<IProyectoEquipoBackend[]>(`${this.endpointUrl}/${id}`, entitiesBack).pipe(
      map(resultList => resultList.map(entity => this.converter.toTarget(entity)))
    );
  }

}
