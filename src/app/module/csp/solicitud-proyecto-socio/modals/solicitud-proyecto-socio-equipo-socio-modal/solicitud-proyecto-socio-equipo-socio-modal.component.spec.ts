import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SolicitudProyectoSocioEquipoSocioModalComponent, SolicitudProyectoEquipoSocioModalData } from './solicitud-proyecto-socio-equipo-socio-modal.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialDesignModule } from '@material/material-design.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import TestUtils from '@core/utils/test-utils';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SnackBarService } from '@core/services/snack-bar.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ISolicitudProyectoEquipoSocio } from '@core/models/csp/solicitud-proyecto-equipo-socio';
import { IRolProyecto } from '@core/models/csp/rol-proyecto';
import { IPersona } from '@core/models/sgp/persona';
import { SharedModule } from '@shared/shared.module';

describe('SolicitudProyectoSocioEquipoSocioModalComponent', () => {
  let component: SolicitudProyectoSocioEquipoSocioModalComponent;
  let fixture: ComponentFixture<SolicitudProyectoSocioEquipoSocioModalComponent>;

  const rolProyecto: IRolProyecto = {
    abreviatura: undefined,
    activo: undefined,
    colectivoRef: undefined,
    descripcion: undefined,
    equipo: undefined,
    id: undefined,
    nombre: undefined,
    responsableEconomico: undefined,
    rolPrincipal: undefined
  };

  const persona: IPersona = {
    identificadorLetra: undefined,
    identificadorNumero: undefined,
    nivelAcademico: undefined,
    nombre: undefined,
    personaRef: undefined,
    primerApellido: undefined,
    segundoApellido: undefined,
    vinculacion: undefined
  };

  const solicitudProyectoEquipoSocio: ISolicitudProyectoEquipoSocio = {
    id: 1,
    mesFin: 2,
    mesInicio: 1,
    persona,
    rolProyecto,
    solicitudProyectoSocio: undefined,
  };

  const newData: SolicitudProyectoEquipoSocioModalData = {
    isEdit: false,
    selectedProyectoEquipoSocios: [],
    solicitudProyectoEquipoSocio,
    mesInicioSolicitudProyectoSocio: 1,
    mesFinSolicitudProyectoSocio: 2,
    readonly: false
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        SolicitudProyectoSocioEquipoSocioModalComponent
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
    fixture = TestBed.createComponent(SolicitudProyectoSocioEquipoSocioModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
