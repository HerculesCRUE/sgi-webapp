import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SolicitudProyectoSocioPeriodoPagoModalData, SolicitudProyectoSocioPeriodoPagoModalComponent } from './solicitud-proyecto-socio-periodo-pago-modal.component';
import { SharedModule } from '@shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialDesignModule } from '@material/material-design.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import TestUtils from '@core/utils/test-utils';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SnackBarService } from '@core/services/snack-bar.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ISolicitudProyectoPeriodoPago } from '@core/models/csp/solicitud-proyecto-periodo-pago';
import { ISolicitudProyectoSocio } from '@core/models/csp/solicitud-proyecto-socio';

describe('SolicitudProyectoPeriodoPagoModalComponent', () => {
  let component: SolicitudProyectoSocioPeriodoPagoModalComponent;
  let fixture: ComponentFixture<SolicitudProyectoSocioPeriodoPagoModalComponent>;

  const solicitudProyectoSocio: ISolicitudProyectoSocio = {
    empresa: undefined,
    id: undefined,
    importeSolicitado: undefined,
    mesFin: undefined,
    mesInicio: undefined,
    numInvestigadores: undefined,
    rolSocio: undefined,
    solicitudProyectoDatos: undefined
  };

  const solicitudProyectoPeriodoPago: ISolicitudProyectoPeriodoPago = {
    id: 1,
    importe: undefined,
    mes: undefined,
    numPeriodo: undefined,
    solicitudProyectoSocio
  };

  const newData: SolicitudProyectoSocioPeriodoPagoModalData = {
    isEdit: false,
    selectedMeses: [],
    solicitudProyectoPeriodoPago,
    mesInicioSolicitudProyectoSocio: 1,
    mesFinSolicitudProyectoSocio: 2,
    readonly: false
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        SolicitudProyectoSocioPeriodoPagoModalComponent
      ],
      imports: [
        SharedModule,
        BrowserAnimationsModule,
        MaterialDesignModule,
        HttpClientTestingModule,
        LoggerTestingModule,
        TestUtils.getIdiomas(),
        RouterTestingModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: SnackBarService, useValue: TestUtils.getSnackBarServiceSpy() },
        { provide: MatDialogRef, useValue: newData },
        { provide: MAT_DIALOG_DATA, useValue: newData },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitudProyectoSocioPeriodoPagoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
