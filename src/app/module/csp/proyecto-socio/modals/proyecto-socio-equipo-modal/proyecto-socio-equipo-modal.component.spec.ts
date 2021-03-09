import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProyectoSocioEquipoModalComponent, ProyectoEquipoSocioModalData } from './proyecto-socio-equipo-modal.component';
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
import { IProyectoSocioEquipo } from '@core/models/csp/proyecto-socio-equipo';

describe('ProyectoSocioEquipoModalComponent', () => {
  let component: ProyectoSocioEquipoModalComponent;
  let fixture: ComponentFixture<ProyectoSocioEquipoModalComponent>;

  const proyectoSocioEquipo: IProyectoSocioEquipo = {
    fechaFin: undefined,
    fechaInicio: undefined,
    id: undefined,
    persona: undefined,
    proyectoSocio: undefined,
    rolProyecto: undefined
  };

  const newData: ProyectoEquipoSocioModalData = {
    isEdit: false,
    proyectoSocioEquipo,
    selectedProyectoSocioEquipos: [],
    fechaFinProyectoSocio: new Date(),
    fechaInicioProyectoSocio: new Date()
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProyectoSocioEquipoModalComponent
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
    fixture = TestBed.createComponent(ProyectoSocioEquipoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
