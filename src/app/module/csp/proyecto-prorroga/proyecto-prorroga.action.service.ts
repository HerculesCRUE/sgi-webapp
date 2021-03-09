import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { IProyectoProrroga, Tipo } from '@core/models/csp/proyecto-prorroga';
import { ActionService } from '@core/services/action-service';
import { ProyectoProrrogaDocumentoService } from '@core/services/csp/proyecto-prorroga-documento.service';
import { ProyectoProrrogaService } from '@core/services/csp/proyecto-prorroga.service';
import { DialogService } from '@core/services/dialog.service';
import { DocumentoService } from '@core/services/sgdoc/documento.service';
import { NGXLogger } from 'ngx-logger';
import { EMPTY, Observable, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ProyectoProrrogaDatosGeneralesFragment } from './proyecto-prorroga-formulario/proyecto-prorroga-datos-generales/proyecto-prorroga-datos-generales.fragment';
import { ProyectoProrrogaDocumentosFragment } from './proyecto-prorroga-formulario/proyecto-prorroga-documentos/proyecto-prorroga-documentos.fragment';

const MSG_IMPORTE = marker('csp.proyecto-prorroga.saveOrUpdate.importe.msg');

@Injectable()
export class ProyectoProrrogaActionService extends ActionService {

  public readonly FRAGMENT = {
    DATOS_GENERALES: 'datosGenerales',
    DOCUMENTOS: 'documentos'
  };

  private datosGenerales: ProyectoProrrogaDatosGeneralesFragment;
  private documentos: ProyectoProrrogaDocumentosFragment;

  dialogService: DialogService;

  constructor(
    private readonly logger: NGXLogger,
    route: ActivatedRoute,
    proyectoProrrogaService: ProyectoProrrogaService,
    periodoSeguimientoDocumentoService: ProyectoProrrogaDocumentoService,
    documentoService: DocumentoService,
    dialogService: DialogService
  ) {
    super();

    this.dialogService = dialogService;

    if (history.state?.proyectoProrroga?.id) {
      this.enableEdit();
    }

    this.datosGenerales = new ProyectoProrrogaDatosGeneralesFragment(history.state?.proyectoProrroga?.id,
      proyectoProrrogaService, history.state?.proyecto, history.state?.selectedProyectoProrrogas, history.state?.proyectoProrroga,
      history.state?.readonly);
    this.documentos = new ProyectoProrrogaDocumentosFragment(logger, history.state?.proyectoProrroga?.id, proyectoProrrogaService,
      periodoSeguimientoDocumentoService, documentoService, history.state?.proyecto, history.state?.readonly);

    this.addFragment(this.FRAGMENT.DATOS_GENERALES, this.datosGenerales);
    this.addFragment(this.FRAGMENT.DOCUMENTOS, this.documentos);
  }


  saveOrUpdate(): Observable<void> {
    if (this.mostrarAvisoImporte()) {
      return this.dialogService.showConfirmation(MSG_IMPORTE).pipe(
        switchMap(aceptado => {
          if (aceptado) {
            return super.saveOrUpdate();
          } else {
            return EMPTY;
          }
        })
      )
    } else {
      return super.saveOrUpdate();
    }
  }

  private mostrarAvisoImporte(): boolean {
    const proyectoProrroga = this.datosGenerales.isInitialized() ? this.datosGenerales.getValue() : {} as IProyectoProrroga;
    let mostrarAvisoImporte = false;
    if (proyectoProrroga.tipo === Tipo.IMPORTE || proyectoProrroga.tipo === Tipo.TIEMPO_IMPORTE) {
      if (history.state?.proyectoProrroga && history.state?.proyectoProrroga.id) {
        if (proyectoProrroga.importe !== history.state?.proyectoProrroga.importe) {
          mostrarAvisoImporte = true;
        }
      } else {
        if (proyectoProrroga.importe !== null) {
          mostrarAvisoImporte = true;
        }
      }
    }
    return mostrarAvisoImporte;
  }

}
