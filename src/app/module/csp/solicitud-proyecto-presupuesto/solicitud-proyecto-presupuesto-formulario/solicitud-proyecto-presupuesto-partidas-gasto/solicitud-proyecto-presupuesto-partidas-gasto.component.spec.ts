import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IEntidadFinanciadora } from '@core/models/csp/entidad-financiadora';
import { SnackBarService } from '@core/services/snack-bar.service';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { SgiAuthService } from '@sgi/framework/auth';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { ISolicitudProyectoPresupuestoState } from '../../../solicitud/solicitud-formulario/solicitud-proyecto-presupuesto-entidades/solicitud-proyecto-presupuesto-entidades.component';
import { SolicitudProyectoPresupuestoActionService } from '../../solicitud-proyecto-presupuesto.action.service';

import { SolicitudProyectoPresupuestoPartidasGastoComponent } from './solicitud-proyecto-presupuesto-partidas-gasto.component';

describe('SolicitudProyectoPresupuestoPartidasGastoComponent', () => {
  let component: SolicitudProyectoPresupuestoPartidasGastoComponent;
  let fixture: ComponentFixture<SolicitudProyectoPresupuestoPartidasGastoComponent>;

  const state: ISolicitudProyectoPresupuestoState = {
    solicitudId: 1,
    convocatoriaId: 1,
    entidadFinanciadora: {} as IEntidadFinanciadora,
    isEntidadFinanciadoraConvocatoria: true
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SolicitudProyectoPresupuestoPartidasGastoComponent],
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
      ],
      providers: [
        { provide: SnackBarService, useValue: TestUtils.getSnackBarServiceSpy() },
        SolicitudProyectoPresupuestoActionService,
        SgiAuthService
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    spyOnProperty(history, 'state', 'get').and.returnValue(state);

    fixture = TestBed.createComponent(SolicitudProyectoPresupuestoPartidasGastoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
