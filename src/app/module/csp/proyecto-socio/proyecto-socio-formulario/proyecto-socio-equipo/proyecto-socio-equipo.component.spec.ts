import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProyectoSocioEquipoComponent } from './proyecto-socio-equipo.component';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { ProyectoSocioActionService } from '../../proyecto-socio.action.service';
import { ISolicitudProyectoSocio } from '@core/models/csp/solicitud-proyecto-socio';
import { IProyectoSocio } from '@core/models/csp/proyecto-socio';
import { IProyectoSocioState } from '../../../proyecto/proyecto-formulario/proyecto-socios/proyecto-socios.component';

describe('ProyectoSocioEquipoComponent', () => {
  let component: ProyectoSocioEquipoComponent;
  let fixture: ComponentFixture<ProyectoSocioEquipoComponent>;

  const proyectoSocio: IProyectoSocio = {
    empresa: undefined,
    id: undefined,
    fechaFin: undefined,
    fechaInicio: undefined,
    importeConcedido: undefined,
    numInvestigadores: undefined,
    proyecto: undefined,
    rolSocio: undefined
  };

  const state: IProyectoSocioState = {
    proyectoId: 1,
    coordinadorExterno: false,
    proyectoSocio,
    selectedProyectoSocios: [],
    urlProyecto: ''
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProyectoSocioEquipoComponent
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
        ProyectoSocioActionService,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    spyOnProperty(history, 'state', 'get').and.returnValue(state);

    fixture = TestBed.createComponent(ProyectoSocioEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
