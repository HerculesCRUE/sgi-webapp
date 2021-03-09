import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProyectoSocioPeriodoPagoModalComponent, ProyectoSocioPeriodoPagoModalData } from './proyecto-socio-periodo-pago-modal.component';
import { IProyectoSocioPeriodoPago } from '@core/models/csp/proyecto-socio-periodo-pago';
import { IProyectoSocio } from '@core/models/csp/proyecto-socio';
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

describe('ProyectoSocioPeriodoPagoModalComponent', () => {
  let component: ProyectoSocioPeriodoPagoModalComponent;
  let fixture: ComponentFixture<ProyectoSocioPeriodoPagoModalComponent>;

  const proyectoSocio: IProyectoSocio = {
    empresa: undefined,
    id: undefined,
    numInvestigadores: undefined,
    rolSocio: undefined,
    fechaFin: undefined,
    fechaInicio: undefined,
    importeConcedido: undefined,
    proyecto: undefined
  };

  const proyectoSocioPeriodoPago: IProyectoSocioPeriodoPago = {
    id: 1,
    importe: undefined,
    numPeriodo: undefined,
    fechaPago: undefined,
    fechaPrevistaPago: undefined,
    proyectoSocio
  };

  const newData: ProyectoSocioPeriodoPagoModalData = {
    isEdit: false,
    selectedFechaPrevistas: [],
    proyectoSocioPeriodoPago,
    fechaInicioProyectoSocio: new Date(),
    fechaFinProyectoSocio: new Date()
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProyectoSocioPeriodoPagoModalComponent
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
    fixture = TestBed.createComponent(ProyectoSocioPeriodoPagoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
