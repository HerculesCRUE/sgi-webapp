import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { DialogComponent } from '@block/dialog/dialog.component';
import { HeaderComponent } from '@block/header/header.component';
import { IProyectoEquipo } from '@core/models/csp/proyecto-equipo';
import { SnackBarService } from '@core/services/snack-bar.service';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { SgiAuthModule, SgiAuthService } from '@sgi/framework/auth';
import { SharedModule } from '@shared/shared.module';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { ProyectoEquipoModalComponent, ProyectoEquiposModalComponentData } from './proyecto-equipo-modal.component';

describe('ProyectoEquipoModalComponent', () => {
  let component: ProyectoEquipoModalComponent;
  let fixture: ComponentFixture<ProyectoEquipoModalComponent>;

  const proyectoSocioEquipo: IProyectoEquipo = {
    fechaFin: undefined,
    fechaInicio: undefined,
    id: undefined,
    persona: undefined,
    rolProyecto: undefined,
    horasDedicacion: undefined,
    proyecto: undefined
  };

  const newData: ProyectoEquiposModalComponentData = {
    isEdit: false,
    equipos: [],
    equipo: undefined,
    fechaFinProyecto: undefined,
    fechaInicioProyecto: undefined
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProyectoEquipoModalComponent
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
    fixture = TestBed.createComponent(ProyectoEquipoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
