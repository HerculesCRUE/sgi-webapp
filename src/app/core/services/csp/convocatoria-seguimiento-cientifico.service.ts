import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConvocatoriaSeguimientoCientifico } from '@core/models/csp/convocatoria-seguimiento-cientifico';
import { environment } from '@env';
import { SgiRestService } from '@sgi/framework/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ConvocatoriaSeguimientoCientificoService extends SgiRestService<number, IConvocatoriaSeguimientoCientifico> {
  private static readonly MAPPING = '/convocatoriaperiodoseguimientocientificos';

  constructor(protected http: HttpClient) {
    super(
      ConvocatoriaSeguimientoCientificoService.name,
      `${environment.serviceServers.csp}${ConvocatoriaSeguimientoCientificoService.MAPPING}`,
      http
    );
  }

  /**
   * Actualiza la lista IConvocatoriaSeguimientoCientifico de la convocatoria con los periodos de seguimiento cientifico
   * creando los nuevos, actualizando los existentes y eliminando los existentes que no esten en la lista.
   *
   * @param convocatoriaId Id de la convocatoria
   * @param periodosJustificacion Lista de IConvocatoriaSeguimientoCientifico
   * @returns Lista de IConvocatoriaSeguimientoCientifico actualizada
   */
  updateConvocatoriaSeguimientoCientificoConvocatoria(convocatoriaId: number, periodosJustificacion: IConvocatoriaSeguimientoCientifico[]):
    Observable<IConvocatoriaSeguimientoCientifico[]> {
    return this.http.patch<IConvocatoriaSeguimientoCientifico[]>(`${this.endpointUrl}/${convocatoriaId}`, periodosJustificacion);
  }

}