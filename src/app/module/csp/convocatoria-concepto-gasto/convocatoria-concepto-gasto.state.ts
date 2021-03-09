import { IConvocatoria } from "@core/models/csp/convocatoria";
import { IConvocatoriaConceptoGasto } from "@core/models/csp/convocatoria-concepto-gasto";

export interface IConvocatoriaConceptoGastoState {
  convocatoria: IConvocatoria;
  convocatoriaConceptoGasto: IConvocatoriaConceptoGasto;
  selectedConvocatoriaConceptoGastos: IConvocatoriaConceptoGasto[];
  permitido: boolean;
  readonly: boolean;
}
