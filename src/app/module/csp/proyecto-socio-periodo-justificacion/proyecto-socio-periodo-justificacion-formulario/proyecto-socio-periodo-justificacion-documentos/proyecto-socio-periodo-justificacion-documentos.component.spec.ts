import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProyectoSocioPeriodoJustificacionDocumentosComponent } from './proyecto-socio-periodo-justificacion-documentos.component';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { ProyectoSocioPeriodoJustificacionActionService } from '../../proyecto-socio-periodo-justificacion.action.service';
import { IProyectoSocioPeriodoJustificacionState } from '../../../proyecto-socio/proyecto-socio-formulario/proyecto-socio-periodo-justificacion/proyecto-socio-periodo-justificacion.component';
import { IProyectoSocioPeriodoJustificacion } from '@core/models/csp/proyecto-socio-periodo-justificacion';
import { IProyectoSocio } from '@core/models/csp/proyecto-socio';

describe('ProyectoSocioPeriodoJustificacionDocumentosComponent', () => {
  let component: ProyectoSocioPeriodoJustificacionDocumentosComponent;
  let fixture: ComponentFixture<ProyectoSocioPeriodoJustificacionDocumentosComponent>;

  const state: IProyectoSocioPeriodoJustificacionState = {
    periodoJustificacion: {} as IProyectoSocioPeriodoJustificacion,
    selectedPeriodosJustificacion: [],
    proyectoId: 1,
    proyectoSocio: {} as IProyectoSocio,
    urlProyecto: '',
    urlProyectoSocio: ''
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProyectoSocioPeriodoJustificacionDocumentosComponent],
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
        ProyectoSocioPeriodoJustificacionActionService,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    spyOnProperty(history, 'state', 'get').and.returnValue(state);
    fixture = TestBed.createComponent(ProyectoSocioPeriodoJustificacionDocumentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
