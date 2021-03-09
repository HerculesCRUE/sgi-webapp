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
import { ProyectoProrrogaCrearComponent } from './proyecto-prorroga-crear.component';
import { ProyectoProrrogaActionService } from '../proyecto-prorroga.action.service';
import { IProyectoProrroga, Tipo } from '@core/models/csp/proyecto-prorroga';
import { IProyecto } from '@core/models/csp/proyecto';
import { IProyectoProrrogaState } from '../../proyecto/proyecto-formulario/proyecto-prorrogas/proyecto-prorrogas.component';


describe('ProyectoProrrogaCrearComponent', () => {
  let component: ProyectoProrrogaCrearComponent;
  let fixture: ComponentFixture<ProyectoProrrogaCrearComponent>;

  const proyecto: IProyecto = {
    id: 1,
    fechaInicio: new Date(),
    fechaFin: new Date()
  } as IProyecto;

  const proyectoProrroga: IProyectoProrroga = {
    id: 1,
    proyecto,
    fechaConcesion: new Date(),
    tipo: Tipo.TIEMPO,
    fechaFin: new Date(),
    numProrroga: 1
  } as IProyectoProrroga;

  const selectedProyectoProrrogas: IProyectoProrroga[] = [
    proyectoProrroga as IProyectoProrroga]

  const state: IProyectoProrrogaState = {
    proyecto,
    proyectoProrroga,
    selectedProyectoProrrogas,
    readonly: true
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProyectoProrrogaCrearComponent,
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
        ProyectoProrrogaActionService,
        SgiAuthService
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    spyOnProperty(history, 'state', 'get').and.returnValue(state);

    fixture = TestBed.createComponent(ProyectoProrrogaCrearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
