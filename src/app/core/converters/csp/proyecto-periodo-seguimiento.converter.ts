import { IProyectoPeriodoSeguimientoBackend } from '@core/models/csp/backend/proyecto-periodo-seguimiento-backend';
import { IProyectoPeriodoSeguimiento } from '@core/models/csp/proyecto-periodo-seguimiento';
import { LuxonUtils } from '@core/utils/luxon-utils';
import { SgiBaseConverter } from '@sgi/framework/core';

class ProyectoPeriodoSeguimientoConverter extends SgiBaseConverter<IProyectoPeriodoSeguimientoBackend, IProyectoPeriodoSeguimiento> {

  toTarget(value: IProyectoPeriodoSeguimientoBackend): IProyectoPeriodoSeguimiento {
    if (!value) {
      return value as unknown as IProyectoPeriodoSeguimiento;
    }
    return {
      id: value.id,
      proyectoId: value.proyectoId,
      numPeriodo: value.numPeriodo,
      fechaInicio: LuxonUtils.fromBackend(value.fechaInicio),
      fechaFin: LuxonUtils.fromBackend(value.fechaFin),
      fechaInicioPresentacion: LuxonUtils.fromBackend(value.fechaInicioPresentacion),
      fechaFinPresentacion: LuxonUtils.fromBackend(value.fechaFinPresentacion),
      observaciones: value.observaciones
    };
  }

  fromTarget(value: IProyectoPeriodoSeguimiento): IProyectoPeriodoSeguimientoBackend {
    if (!value) {
      return value as unknown as IProyectoPeriodoSeguimientoBackend;
    }
    return {
      id: value.id,
      proyectoId: value.proyectoId,
      numPeriodo: value.numPeriodo,
      fechaInicio: LuxonUtils.toBackend(value.fechaInicio),
      fechaFin: LuxonUtils.toBackend(value.fechaFin),
      fechaInicioPresentacion: LuxonUtils.toBackend(value.fechaInicioPresentacion),
      fechaFinPresentacion: LuxonUtils.toBackend(value.fechaFinPresentacion),
      observaciones: value.observaciones
    };
  }
}

export const PROYECTO_PERIODO_SEGUIMIENTO_CONVERTER = new ProyectoPeriodoSeguimientoConverter();
