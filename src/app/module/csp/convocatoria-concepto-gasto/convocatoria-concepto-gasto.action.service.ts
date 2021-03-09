import { Injectable } from '@angular/core';
import { ActionService } from '@core/services/action-service';
import { NGXLogger } from 'ngx-logger';
import { ConvocatoriaConceptoGastoService } from '@core/services/csp/convocatoria-concepto-gasto.service';
import { IConvocatoriaConceptoGasto } from '@core/models/csp/convocatoria-concepto-gasto';
import { IConvocatoria } from '@core/models/csp/convocatoria';
import { ConvocatoriaConceptoGastoFragment } from './convocatoria-concepto-gasto-formulario/convocatoria-concepto-gasto/convocatoria-concepto-gasto.fragment';
import { ConvocatoriaConceptoGastoCodigoEcFragment } from './convocatoria-concepto-gasto-formulario/convocatoria-concepto-gasto-codigo-ec/convocatoria-concepto-gasto-codigo-ec.fragment';
import { ConvocatoriaConceptoGastoCodigoEcService } from '@core/services/csp/convocatoria-concepto-gasto-codigo-ec.service';

@Injectable()
export class ConvocatoriaConceptoGastoActionService extends ActionService {

  public readonly FRAGMENT = {
    CONCEPTO_GASTO: 'concepto-gasto',
    CODIGOS_ECONOMICOS: 'codigos-economicos'
  };

  private conceptoGasto: ConvocatoriaConceptoGastoFragment;
  private codigosEconomicos: ConvocatoriaConceptoGastoCodigoEcFragment;

  private convocatoria: IConvocatoria;
  private convocatoriaConceptoGasto: IConvocatoriaConceptoGasto;
  private selectedConvocatoriaConceptoGastos: IConvocatoriaConceptoGasto[];
  private permitido: boolean;
  private readonly: boolean;

  constructor(
    logger: NGXLogger,
    convocatoriaConceptoGastoService: ConvocatoriaConceptoGastoService,
    convocatoriaConceptoGastoCodigoEcService: ConvocatoriaConceptoGastoCodigoEcService
  ) {
    super();

    this.convocatoriaConceptoGasto = history?.state?.convocatoriaConceptoGasto;
    this.convocatoria = history?.state?.convocatoria;
    this.selectedConvocatoriaConceptoGastos = history?.state?.selectedConvocatoriaConceptoGastos;
    this.readonly = history?.state?.readonly;
    this.permitido = history?.state?.permitido;

    if (this.convocatoriaConceptoGasto?.id) {
      this.enableEdit();
    }

    this.conceptoGasto = new ConvocatoriaConceptoGastoFragment(this.convocatoriaConceptoGasto?.id, this.convocatoria,
      convocatoriaConceptoGastoService, this.convocatoriaConceptoGasto, this.selectedConvocatoriaConceptoGastos, this.permitido, this.readonly);

    this.codigosEconomicos = new ConvocatoriaConceptoGastoCodigoEcFragment(this.convocatoriaConceptoGasto?.id,
      convocatoriaConceptoGastoService, convocatoriaConceptoGastoCodigoEcService, this.convocatoriaConceptoGasto, this.readonly);

    this.addFragment(this.FRAGMENT.CONCEPTO_GASTO, this.conceptoGasto);
    this.addFragment(this.FRAGMENT.CODIGOS_ECONOMICOS, this.codigosEconomicos);
  }

  getSelectedConvocatoriaConceptoGastos(): IConvocatoriaConceptoGasto[] {
    return this.selectedConvocatoriaConceptoGastos;
  }

  getDatosConvocatoriaConceptoGastos(): IConvocatoriaConceptoGasto {
    return this.conceptoGasto.isInitialized() ? this.conceptoGasto.getValue() : null;
  }

}
