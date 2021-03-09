import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProyectoSocioPeriodoPagoComponent } from './proyecto-socio-periodo-pago.component';
import { IProyectoSocio } from '@core/models/csp/proyecto-socio';
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
import { IProyectoSocioState } from '../../../proyecto/proyecto-formulario/proyecto-socios/proyecto-socios.component';

describe('ProyectoSocioPeriodoPagoComponent', () => {
  let component: ProyectoSocioPeriodoPagoComponent;
  let fixture: ComponentFixture<ProyectoSocioPeriodoPagoComponent>;

  const proyectoSocio: IProyectoSocio = {
    empresa: undefined,
    fechaFin: undefined,
    fechaInicio: undefined,
    id: undefined,
    importeConcedido: undefined,
    numInvestigadores: undefined,
    proyecto: undefined,
    rolSocio: undefined
  };

  const state: IProyectoSocioState = {
    proyectoId: 1,
    proyectoSocio,
    coordinadorExterno: false,
    selectedProyectoSocios: [],
    urlProyecto: ''
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProyectoSocioPeriodoPagoComponent
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
    fixture = TestBed.createComponent(ProyectoSocioPeriodoPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
