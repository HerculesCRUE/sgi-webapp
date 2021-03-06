import { ISolicitudProyectoBackend } from '@core/models/csp/backend/solicitud-proyecto-backend';
import { ISolicitudProyecto } from '@core/models/csp/solicitud-proyecto';
import { SgiBaseConverter } from '@sgi/framework/core';

class SolicitudProyectoConverter extends SgiBaseConverter<ISolicitudProyectoBackend, ISolicitudProyecto> {

  toTarget(value: ISolicitudProyectoBackend): ISolicitudProyecto {
    if (!value) {
      return value as unknown as ISolicitudProyecto;
    }
    return {
      id: value.id,
      titulo: value.titulo,
      acronimo: value.acronimo,
      codExterno: value.codExterno,
      duracion: value.duracion,
      colaborativo: value.colaborativo,
      coordinadorExterno: value.coordinadorExterno,
      objetivos: value.objetivos,
      intereses: value.intereses,
      resultadosPrevistos: value.resultadosPrevistos,
      areaTematica: value.areaTematica,
      checkListRef: value.checkListRef,
      envioEtica: value.envioEtica,
      presupuestoPorEntidades: value.presupuestoPorEntidades
    };
  }

  fromTarget(value: ISolicitudProyecto): ISolicitudProyectoBackend {
    if (!value) {
      return value as unknown as ISolicitudProyectoBackend;
    }
    return {
      id: value.id,
      titulo: value.titulo,
      acronimo: value.acronimo,
      codExterno: value.codExterno,
      duracion: value.duracion,
      colaborativo: value.colaborativo,
      coordinadorExterno: value.coordinadorExterno,
      objetivos: value.objetivos,
      intereses: value.intereses,
      resultadosPrevistos: value.resultadosPrevistos,
      areaTematica: value.areaTematica,
      checkListRef: value.checkListRef,
      envioEtica: value.envioEtica,
      presupuestoPorEntidades: value.presupuestoPorEntidades
    };
  }
}

export const SOLICITUD_PROYECTO_CONVERTER = new SolicitudProyectoConverter();
