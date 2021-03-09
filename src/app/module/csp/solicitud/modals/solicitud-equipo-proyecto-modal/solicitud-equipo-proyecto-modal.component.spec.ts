import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { DialogComponent } from '@block/dialog/dialog.component';
import { HeaderComponent } from '@block/header/header.component';
import { ISolicitudProyectoEquipo } from '@core/models/csp/solicitud-proyecto-equipo';
import { SnackBarService } from '@core/services/snack-bar.service';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { EquipoProyectoModalData, SolicitudEquipoProyectoModalComponent } from './solicitud-equipo-proyecto-modal.component';
import { IPersona } from '@core/models/sgp/persona';
import { SharedModule } from '@shared/shared.module';

describe('SolicitudEquipoProyectoModalComponent', () => {
  let component: SolicitudEquipoProyectoModalComponent;
  let fixture: ComponentFixture<SolicitudEquipoProyectoModalComponent>;

  const persona: IPersona = {
    identificadorLetra: '',
    identificadorNumero: '',
    nivelAcademico: '',
    nombre: '',
    personaRef: '',
    primerApellido: '',
    segundoApellido: '',
    vinculacion: '',
  };

  const solicitudProyectoEquipo: ISolicitudProyectoEquipo = {
    id: 1,
    mesFin: undefined,
    mesInicio: undefined,
    persona,
    rolProyecto: undefined,
    solicitudProyectoDatos: undefined
  };

  const data: EquipoProyectoModalData = {
    selectedProyectoEquipos: [],
    solicitudProyectoEquipo,
    isEdit: true,
    readonly: true
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        SolicitudEquipoProyectoModalComponent,
        DialogComponent,
        HeaderComponent
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
        { provide: MatDialogRef, useValue: data },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitudEquipoProyectoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
