import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPersona } from '@core/models/sgp/persona';
import { environment } from '@env';
import { SgiRestFindOptions, SgiRestListResult, SgiRestService } from '@sgi/framework/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PersonaFisicaService extends SgiRestService<string, IPersona>{
  private static readonly MAPPING = '/personas/fisica';

  constructor(protected http: HttpClient) {
    super(PersonaFisicaService.name,
      `${environment.serviceServers.sgp}${PersonaFisicaService.MAPPING}`, http);
  }

  /**
   * Devuelve la persona con su información básica
   * @param personaRef referencia de la persona.
   */
  getInformacionBasica(personaRef: string): Observable<IPersona> {
    return this.http.get<IPersona>(`${this.endpointUrl}/persona/${personaRef}`);
  }

  /**
   * Devuelve todas las personas con su información básica
   * @param options sgiRestFindOptions.
   */
  findAllPersonas(options?: SgiRestFindOptions): Observable<SgiRestListResult<IPersona>> {
    return this.find<IPersona, IPersona>(`${this.endpointUrl}/persona`, options);
  }

  /**
   * Devuelve las personas de los personaRefs.
   *
   * @param personaRefs lista de personaRefs.
   * @param options opciones de busqueda.
   * @return las personas de los personaRefs
   */
  findByPersonasRefs(personaRefs: string[], options?: SgiRestFindOptions):
    Observable<SgiRestListResult<IPersona>> {
    const refsPersonaString = personaRefs.join('|');
    return this.find<IPersona, IPersona>(`${this.endpointUrl}/persona/bypersonarefs/${refsPersonaString}`, options);
  }

}
