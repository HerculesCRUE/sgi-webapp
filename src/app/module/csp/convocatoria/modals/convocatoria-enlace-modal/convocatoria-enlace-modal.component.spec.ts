import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ClasificacionCVN } from '@core/enums/clasificacion-cvn';
import { Destinatarios, Estado, IConvocatoria } from '@core/models/csp/convocatoria';
import { IConvocatoriaEnlace } from '@core/models/csp/convocatoria-enlace';
import { SnackBarService } from '@core/services/snack-bar.service';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { ConvocatoriaEnlaceModalComponent, ConvocatoriaEnlaceModalComponentData } from './convocatoria-enlace-modal.component';

describe('ConvocatoriaEnlaceModalComponent', () => {
  let component: ConvocatoriaEnlaceModalComponent;
  let fixture: ComponentFixture<ConvocatoriaEnlaceModalComponent>;

  const convocatoria: IConvocatoria = {
    activo: true,
    ambitoGeografico: undefined,
    anio: 2020,
    clasificacionCVN: ClasificacionCVN.AYUDAS,
    codigo: '',
    colaborativos: true,
    destinatarios: Destinatarios.EQUIPO_PROYECTO,
    duracion: 1,
    estado: Estado.BORRADOR,
    finalidad: undefined,
    id: 1,
    modeloEjecucion: undefined,
    objeto: '',
    observaciones: '',
    regimenConcurrencia: undefined,
    titulo: '',
    unidadGestionRef: '',
    abiertoPlazoPresentacionSolicitud: undefined
  };

  const convocatoriaEnlace: IConvocatoriaEnlace = {
    activo: true,
    convocatoria,
    descripcion: '',
    id: 1,
    tipoEnlace: undefined,
    url: ''
  };

  const data: ConvocatoriaEnlaceModalComponentData = {
    enlace: convocatoriaEnlace,
    idModeloEjecucion: 1,
    selectedUrls: [],
    readonly: false
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ConvocatoriaEnlaceModalComponent
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
    fixture = TestBed.createComponent(ConvocatoriaEnlaceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
