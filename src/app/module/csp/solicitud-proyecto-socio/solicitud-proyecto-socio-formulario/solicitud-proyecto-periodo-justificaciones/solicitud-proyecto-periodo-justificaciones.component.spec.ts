import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SolicitudProyectoPeriodoJustificacionesComponent } from './solicitud-proyecto-periodo-justificaciones.component';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { SolicitudProyectoSocioActionService } from '../../solicitud-proyecto-socio.action.service';
import { ISolicitudProyectoSocio } from '@core/models/csp/solicitud-proyecto-socio';
import { ISolicitudProyectoSocioState } from '../../../solicitud/solicitud-formulario/solicitud-socios-colaboradores/solicitud-socios-colaboradores.component';

describe('SolicitudProyectoPeriodoJustificacionesComponent', () => {
  let component: SolicitudProyectoPeriodoJustificacionesComponent;
  let fixture: ComponentFixture<SolicitudProyectoPeriodoJustificacionesComponent>;

  const state: ISolicitudProyectoSocioState = {
    solicitudId: 1,
    coordinadorExterno: false,
    solicitudProyectoSocio: {} as ISolicitudProyectoSocio,
    selectedSolicitudProyectoSocios: [],
    readonly: false
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        SolicitudProyectoPeriodoJustificacionesComponent
      ],
      imports: [
        TestUtils.getIdiomas(),
        MaterialDesignModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
        LoggerTestingModule,
        FlexModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        SharedModule
      ],
      providers: [
        SolicitudProyectoSocioActionService,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    spyOnProperty(history, 'state', 'get').and.returnValue(state);

    fixture = TestBed.createComponent(SolicitudProyectoPeriodoJustificacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});