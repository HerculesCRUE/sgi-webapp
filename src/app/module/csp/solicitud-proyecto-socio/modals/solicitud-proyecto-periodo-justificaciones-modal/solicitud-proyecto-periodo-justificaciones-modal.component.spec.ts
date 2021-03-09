import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SolicitudProyectoPeriodoJustificacionesModalComponent, SolicitudProyectoPeriodoJustificacionesModalData } from './solicitud-proyecto-periodo-justificaciones-modal.component';
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
import { ISolicitudProyectoPeriodoJustificacion } from '@core/models/csp/solicitud-proyecto-periodo-justificacion';

describe('SolicitudProyectoPeriodoJustificacionesModalComponent', () => {
  let component: SolicitudProyectoPeriodoJustificacionesModalComponent;
  let fixture: ComponentFixture<SolicitudProyectoPeriodoJustificacionesModalComponent>;
  const periodoJustificacion: ISolicitudProyectoPeriodoJustificacion = {
    fechaFin: undefined,
    fechaInicio: undefined,
    id: undefined,
    mesFinal: undefined,
    mesInicial: undefined,
    numPeriodo: undefined,
    observaciones: undefined,
    solicitudProyectoSocio: undefined
  };

  const newData: SolicitudProyectoPeriodoJustificacionesModalData = {
    isEdit: false,
    periodoJustificacion,
    selectedPeriodoJustificaciones: [],
    mesFinSolicitudProyectoSocio: 2,
    mesInicioSolicitudProyectoSocio: 1,
    readonly: false
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        SolicitudProyectoPeriodoJustificacionesModalComponent
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
    fixture = TestBed.createComponent(SolicitudProyectoPeriodoJustificacionesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
