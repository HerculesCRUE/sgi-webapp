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
import { ProyectoSocioEditarComponent } from './proyecto-socio-editar.component';
import { ProyectoSocioActionService } from '../proyecto-socio.action.service';
import { IProyectoSocio } from '@core/models/csp/proyecto-socio';
import { IProyectoSocioState } from '../../proyecto/proyecto-formulario/proyecto-socios/proyecto-socios.component';

describe('ProyectoSocioEditarComponent', () => {
  let component: ProyectoSocioEditarComponent;
  let fixture: ComponentFixture<ProyectoSocioEditarComponent>;

  const state: IProyectoSocioState = {
    proyectoId: 1,
    coordinadorExterno: false,
    proyectoSocio: {} as IProyectoSocio,
    selectedProyectoSocios: [],
    urlProyecto: ''
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProyectoSocioEditarComponent,
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
        ProyectoSocioActionService,
        SgiAuthService
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    spyOnProperty(history, 'state', 'get').and.returnValue(state);

    fixture = TestBed.createComponent(ProyectoSocioEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
