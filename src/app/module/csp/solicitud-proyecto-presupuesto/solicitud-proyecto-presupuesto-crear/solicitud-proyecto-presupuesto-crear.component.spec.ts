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
import { SolicitudProyectoPresupuestoCrearComponent } from './solicitud-proyecto-presupuesto-crear.component';
import { SolicitudProyectoPresupuestoActionService } from '../solicitud-proyecto-presupuesto.action.service';
import { ISolicitudProyectoPresupuestoState } from '../../solicitud/solicitud-formulario/solicitud-proyecto-presupuesto-entidades/solicitud-proyecto-presupuesto-entidades.component';
import { IEntidadFinanciadora } from '@core/models/csp/entidad-financiadora';

describe('SolicitudProyectoPresupuestoCrearComponent', () => {
  let component: SolicitudProyectoPresupuestoCrearComponent;
  let fixture: ComponentFixture<SolicitudProyectoPresupuestoCrearComponent>;

  const state: ISolicitudProyectoPresupuestoState = {
    solicitudId: 1,
    convocatoriaId: 1,
    entidadFinanciadora: {} as IEntidadFinanciadora,
    isEntidadFinanciadoraConvocatoria: true
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        SolicitudProyectoPresupuestoCrearComponent,
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
        SolicitudProyectoPresupuestoActionService,
        SgiAuthService
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    spyOnProperty(history, 'state', 'get').and.returnValue(state);

    fixture = TestBed.createComponent(SolicitudProyectoPresupuestoCrearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
