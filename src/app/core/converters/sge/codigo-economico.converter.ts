import { ICodigoEconomicoBackend } from '@core/models/sge/backend/codigo-economico-backend';
import { ICodigoEconomico } from '@core/models/sge/codigo-economico';
import { LuxonUtils } from '@core/utils/luxon-utils';
import { SgiBaseConverter } from '@sgi/framework/core';

class CodigoEconomicoConverter extends SgiBaseConverter<ICodigoEconomicoBackend, ICodigoEconomico> {
  toTarget(value: ICodigoEconomicoBackend): ICodigoEconomico {
    if (!value) {
      return value as unknown as ICodigoEconomico;
    }
    return {
      codigoEconomicoRef: value.codigoEconomicoRef,
      codigo: value.codigo,
      fechaInicio: LuxonUtils.fromBackend(value.fechaInicio),
      fechaFin: LuxonUtils.fromBackend(value.fechaFin),
      tipo: value.tipo
    };
  }

  fromTarget(value: ICodigoEconomico): ICodigoEconomicoBackend {
    if (!value) {
      return value as unknown as ICodigoEconomicoBackend;
    }
    return {
      codigoEconomicoRef: value.codigoEconomicoRef,
      codigo: value.codigo,
      fechaInicio: LuxonUtils.toBackend(value.fechaInicio),
      fechaFin: LuxonUtils.toBackend(value.fechaFin),
      tipo: value.tipo
    };
  }
}

export const CODIGO_ECONOMICO_CONVERTER = new CodigoEconomicoConverter();
