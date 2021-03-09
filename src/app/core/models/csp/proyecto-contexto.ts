import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { ContextoProyectoService } from '@core/services/csp/contexto-proyecto.service';
import { IAreaTematica } from "./area-tematica";
import { IProyecto } from "./proyecto";

export interface IProyectoContexto {
  id: number;
  proyecto: IProyecto;
  objetivos: string;
  intereses: string;
  resultadosPrevistos: string;
  propiedadResultados: PropiedadResultados;
  areaTematica: IAreaTematica;
  areaTematicaConvocatoria: IAreaTematica;
}


export enum PropiedadResultados {
  SIN_RESULTADOS = 'SIN_RESULTADOS',
  UNIVERSIDAD = 'UNIVERSIDAD',
  ENTIDAD_FINANCIADORA = 'ENTIDAD_FINANCIADORA',
  COMPARTIDA = 'COMPARTIDA'
}



export const PROPIEDAD_RESULTADOS_MAP: Map<PropiedadResultados, string> = new Map([
  [PropiedadResultados.SIN_RESULTADOS, marker('csp.proyecto-contexto.propiedad-resultados.SIN_RESULTADOS')],
  [PropiedadResultados.UNIVERSIDAD, marker('csp.proyecto-contexto.propiedad-resultados.UNIVERSIDAD')],
  [PropiedadResultados.ENTIDAD_FINANCIADORA, marker('csp.proyecto-contexto.propiedad-resultados.ENTIDAD_FINANCIADORA')],
  [PropiedadResultados.COMPARTIDA, marker('csp.proyecto-contexto.propiedad-resultados.COMPARTIDA')],
]);
