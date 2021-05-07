import { IModeloUnidadBackend } from '@core/models/csp/backend/modelo-unidad-backend';
import { IModeloUnidad } from '@core/models/csp/modelo-unidad';
import { IUnidadGestion } from '@core/models/usr/unidad-gestion';
import { SgiBaseConverter } from '@sgi/framework/core';

class ModeloUnidadConverter extends SgiBaseConverter<IModeloUnidadBackend, IModeloUnidad> {

  toTarget(value: IModeloUnidadBackend): IModeloUnidad {
    if (!value) {
      return value as unknown as IModeloUnidad;
    }
    return {
      id: value.id,
      unidadGestion: {
        id: null,
        nombre: null,
        acronimo: value.unidadGestionRef,
        descripcion: null,
        activo: null
      } as IUnidadGestion,
      modeloEjecucion: value.modeloEjecucion,
      activo: value.activo,

    };
  }

  fromTarget(value: IModeloUnidad): IModeloUnidadBackend {
    if (!value) {
      return value as unknown as IModeloUnidadBackend;
    }
    return {
      id: value.id,
      unidadGestionRef: value.unidadGestion.acronimo,
      modeloEjecucion: value.modeloEjecucion,
      activo: value.activo,
    };
  }
}

export const MODELO_UNIDAD_CONVERTER = new ModeloUnidadConverter();
