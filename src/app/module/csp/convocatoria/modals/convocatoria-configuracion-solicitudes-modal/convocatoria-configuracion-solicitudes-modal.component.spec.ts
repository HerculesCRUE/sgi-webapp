import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ClasificacionCVN } from '@core/enums/clasificacion-cvn';
import { FormularioSolicitud } from '@core/enums/formulario-solicitud';
import { IConfiguracionSolicitud } from '@core/models/csp/configuracion-solicitud';
import { Destinatarios, Estado, IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaFase } from '@core/models/csp/convocatoria-fase';
import { IDocumentoRequerido } from '@core/models/csp/documentos-requeridos-solicitud';
import { ITipoDocumento, ITipoFase, IModeloEjecucion } from '@core/models/csp/tipos-configuracion';
import { SnackBarService } from '@core/services/snack-bar.service';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { ConvocatoriaConfiguracionSolicitudesModalComponent, ConvocatoriaConfiguracionSolicitudesModalData } from './convocatoria-configuracion-solicitudes-modal.component';

describe('ConvocatoriaConfiguracionSolicitudesModalComponent', () => {
  let component: ConvocatoriaConfiguracionSolicitudesModalComponent;
  let fixture: ComponentFixture<ConvocatoriaConfiguracionSolicitudesModalComponent>;

  const convocatoria: IConvocatoria = {
    activo: true,
    ambitoGeografico: undefined,
    anio: new Date().getFullYear(),
    clasificacionCVN: ClasificacionCVN.AYUDAS,
    codigo: '',
    colaborativos: true,
    destinatarios: Destinatarios.EQUIPO_PROYECTO,
    duracion: 10,
    estado: Estado.BORRADOR,
    finalidad: undefined,
    id: 1,
    modeloEjecucion: {
      id: 1
    } as IModeloEjecucion,
    objeto: '',
    observaciones: '',
    regimenConcurrencia: undefined,
    titulo: '',
    unidadGestionRef: '',
    abiertoPlazoPresentacionSolicitud: true
  };

  const tipoFase: ITipoFase = {
    activo: true,
    descripcion: '',
    id: 1,
    nombre: ''
  };

  const fasePresentacionSolicitudes: IConvocatoriaFase = {
    convocatoria,
    fechaFin: new Date(),
    fechaInicio: new Date(),
    id: 1,
    observaciones: '',
    tipoFase
  };

  const tipoDocumento: ITipoDocumento = {
    activo: true,
    descripcion: '',
    id: 1,
    nombre: ''
  };

  const configuracionSolicitud: IConfiguracionSolicitud = {
    convocatoria,
    fasePresentacionSolicitudes,
    formularioSolicitud: FormularioSolicitud.ESTANDAR,
    id: 1,
    importeMaximoSolicitud: 1_000_000,
    tramitacionSGI: true
  };

  const documentoRequerido: IDocumentoRequerido = {
    configuracionSolicitud,
    id: 1,
    observaciones: '',
    tipoDocumento
  };

  const data: ConvocatoriaConfiguracionSolicitudesModalData = {
    documentoRequerido,
    modeloEjecucionId: convocatoria.modeloEjecucion.id,
    readonly: false
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ConvocatoriaConfiguracionSolicitudesModalComponent
      ],
      imports: [
        BrowserAnimationsModule,
        MaterialDesignModule,
        HttpClientTestingModule,
        LoggerTestingModule,
        TestUtils.getIdiomas(),
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: SnackBarService, useValue: TestUtils.getSnackBarServiceSpy() },
        { provide: MatDialogRef, useValue: data },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvocatoriaConfiguracionSolicitudesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
