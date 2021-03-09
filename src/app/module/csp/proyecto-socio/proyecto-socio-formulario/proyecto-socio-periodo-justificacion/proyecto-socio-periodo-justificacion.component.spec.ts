import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProyectoSocioPeriodoJustificacionComponent } from './proyecto-socio-periodo-justificacion.component';
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

describe('ProyectoSocioPeriodoJustificacionComponent', () => {
  let component: ProyectoSocioPeriodoJustificacionComponent;
  let fixture: ComponentFixture<ProyectoSocioPeriodoJustificacionComponent>;

  const state: IProyectoSocioState = {
    proyectoId: 1,
    coordinadorExterno: false,
    proyectoSocio: { id: 1 } as IProyectoSocio,
    selectedProyectoSocios: [],
    urlProyecto: ''
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProyectoSocioPeriodoJustificacionComponent],
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

    fixture = TestBed.createComponent(ProyectoSocioPeriodoJustificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
