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
import { SolicitudProyectoPresupuestoEditarComponent } from './solicitud-proyecto-presupuesto-editar.component';
import { SolicitudProyectoPresupuestoActionService } from '../solicitud-proyecto-presupuesto.action.service';
import { IEntidadFinanciadora } from '@core/models/csp/entidad-financiadora';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { ISolicitudProyectoPresupuestoState } from '../../solicitud/solicitud-formulario/solicitud-proyecto-presupuesto-entidades/solicitud-proyecto-presupuesto-entidades.component';

describe('SolicitudProyectoPresupuestoEditarComponent', () => {
  let component: SolicitudProyectoPresupuestoEditarComponent;
  let fixture: ComponentFixture<SolicitudProyectoPresupuestoEditarComponent>;

  const state: ISolicitudProyectoPresupuestoState = {
    solicitudId: 1,
    convocatoriaId: 1,
    entidadFinanciadora: {} as IEntidadFinanciadora,
    isEntidadFinanciadoraConvocatoria: true
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        SolicitudProyectoPresupuestoEditarComponent,
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

    fixture = TestBed.createComponent(SolicitudProyectoPresupuestoEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
