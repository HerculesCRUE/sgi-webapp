import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { ActionFooterComponent } from '@shared/action-footer/action-footer.component';
import { FlexModule, FlexLayoutModule } from '@angular/flex-layout';

import { SharedModule } from '@shared/shared.module';
import { SgiAuthService } from '@sgi/framework/auth';
import { ProyectoPeriodoSeguimientoEditarComponent } from './proyecto-periodo-seguimiento-editar.component';
import { ProyectoPeriodoSeguimientoActionService } from '../proyecto-periodo-seguimiento.action.service';
import { IProyectoPeriodoSeguimiento } from '@core/models/csp/proyecto-periodo-seguimiento';
import { IProyecto } from '@core/models/csp/proyecto';
import { IProyectoPeriodoSeguimientoState } from '../../proyecto/proyecto-formulario/proyecto-periodo-seguimientos/proyecto-periodo-seguimientos.component';

describe('ProyectoPeriodoSeguimientoEditarComponent', () => {
  let component: ProyectoPeriodoSeguimientoEditarComponent;
  let fixture: ComponentFixture<ProyectoPeriodoSeguimientoEditarComponent>;

  const state: IProyectoPeriodoSeguimientoState = {
    proyecto: {} as IProyecto,
    proyectoPeriodoSeguimiento: {} as IProyectoPeriodoSeguimiento,
    selectedProyectoPeriodoSeguimientos: [],
    readonly: false
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProyectoPeriodoSeguimientoEditarComponent,
        ActionFooterComponent
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
        FlexLayoutModule,
        SharedModule
      ],
      providers: [
        ProyectoPeriodoSeguimientoActionService,
        SgiAuthService
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    spyOnProperty(history, 'state', 'get').and.returnValue(state);

    fixture = TestBed.createComponent(ProyectoPeriodoSeguimientoEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
