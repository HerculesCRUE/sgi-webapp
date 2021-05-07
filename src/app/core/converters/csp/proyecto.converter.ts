import { IProyectoBackend } from '@core/models/csp/backend/proyecto-backend';
import { IProyecto } from '@core/models/csp/proyecto';
import { IUnidadGestion } from '@core/models/usr/unidad-gestion';
import { LuxonUtils } from '@core/utils/luxon-utils';
import { SgiBaseConverter } from '@sgi/framework/core';
import { ESTADO_PROYECTO_CONVERTER } from './estado-proyecto.converter';

class ProyectoConverter extends SgiBaseConverter<IProyectoBackend, IProyecto> {

  toTarget(value: IProyectoBackend): IProyecto {
    if (!value) {
      return value as unknown as IProyecto;
    }
    return {
      id: value.id,
      estado: ESTADO_PROYECTO_CONVERTER.toTarget(value.estado),
      activo: value.activo,
      titulo: value.titulo,
      acronimo: value.acronimo,
      codigoExterno: value.codigoExterno,
      fechaInicio: LuxonUtils.fromBackend(value.fechaInicio),
      fechaFin: LuxonUtils.fromBackend(value.fechaFin),
      modeloEjecucion: value.modeloEjecucion,
      finalidad: value.finalidad,
      convocatoriaId: value.convocatoriaId,
      convocatoriaExterna: value.convocatoriaExterna,
      solicitudId: value.solicitudId,
      ambitoGeografico: value.ambitoGeografico,
      confidencial: value.confidencial,
      clasificacionCVN: value.clasificacionCVN,
      colaborativo: value.colaborativo,
      coordinadorExterno: value.coordinadorExterno,
      timesheet: value.timesheet,
      permitePaquetesTrabajo: value.permitePaquetesTrabajo,
      costeHora: value.costeHora,
      tipoHorasAnuales: value.tipoHorasAnuales,
      contratos: value.contratos,
      facturacion: value.facturacion,
      iva: value.iva,
      finalista: value.finalista,
      limitativo: value.limitativo,
      anualidades: value.anualidades,
      unidadGestion: { acronimo: value.unidadGestionRef } as IUnidadGestion,
      observaciones: value.observaciones,
      comentario: value.estado.comentario
    };
  }

  fromTarget(value: IProyecto): IProyectoBackend {
    if (!value) {
      return value as unknown as IProyectoBackend;
    }
    return {
      id: value.id,
      estado: ESTADO_PROYECTO_CONVERTER.fromTarget(value.estado),
      titulo: value.titulo,
      acronimo: value.acronimo,
      codigoExterno: value.codigoExterno,
      fechaInicio: LuxonUtils.toBackend(value.fechaInicio),
      fechaFin: LuxonUtils.toBackend(value.fechaFin),
      unidadGestionRef: value.unidadGestion?.acronimo,
      modeloEjecucion: value.modeloEjecucion,
      finalidad: value.finalidad,
      convocatoriaId: value.convocatoriaId,
      convocatoriaExterna: value.convocatoriaExterna,
      solicitudId: value.solicitudId,
      ambitoGeografico: value.ambitoGeografico,
      confidencial: value.confidencial,
      clasificacionCVN: value.clasificacionCVN,
      colaborativo: value.colaborativo,
      coordinadorExterno: value.coordinadorExterno,
      timesheet: value.timesheet,
      permitePaquetesTrabajo: value.permitePaquetesTrabajo,
      costeHora: value.costeHora,
      tipoHorasAnuales: value.tipoHorasAnuales,
      contratos: value.contratos,
      facturacion: value.facturacion,
      iva: value.iva,
      observaciones: value.observaciones,
      finalista: value.finalista,
      limitativo: value.limitativo,
      anualidades: value.anualidades,
      activo: value.activo
    };
  }
}

export const PROYECTO_CONVERTER = new ProyectoConverter();
