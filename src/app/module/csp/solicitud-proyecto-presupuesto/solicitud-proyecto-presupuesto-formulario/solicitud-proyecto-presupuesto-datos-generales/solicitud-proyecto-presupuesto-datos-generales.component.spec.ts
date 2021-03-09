import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IEntidadFinanciadora } from '@core/models/csp/entidad-financiadora';
import { IFuenteFinanciacion } from '@core/models/csp/fuente-financiacion';
import { ITipoAmbitoGeografico } from '@core/models/csp/tipo-ambito-geografico';
import { ITipoFinanciacion } from '@core/models/csp/tipos-configuracion';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { SnackBarService } from '@core/services/snack-bar.service';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { SgiAuthService } from '@sgi/framework/auth';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { ISolicitudProyectoPresupuestoState } from '../../../solicitud/solicitud-formulario/solicitud-proyecto-presupuesto-entidades/solicitud-proyecto-presupuesto-entidades.component';
import { SolicitudProyectoPresupuestoActionService } from '../../solicitud-proyecto-presupuesto.action.service';

import { SolicitudProyectoPresupuestoDatosGeneralesComponent } from './solicitud-proyecto-presupuesto-datos-generales.component';

describe('SolicitudProyectoPresupuestoDatosGeneralesComponent', () => {
  let component: SolicitudProyectoPresupuestoDatosGeneralesComponent;
  let fixture: ComponentFixture<SolicitudProyectoPresupuestoDatosGeneralesComponent>;

  const state: ISolicitudProyectoPresupuestoState = {
    solicitudId: 1,
    convocatoriaId: 1,
    entidadFinanciadora: {
      empresa: {} as IEmpresaEconomica,
      fuenteFinanciacion: {
        tipoAmbitoGeografico: {} as ITipoAmbitoGeografico
      } as IFuenteFinanciacion,
      tipoFinanciacion: {} as ITipoFinanciacion
    } as IEntidadFinanciadora,
    isEntidadFinanciadoraConvocatoria: true
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SolicitudProyectoPresupuestoDatosGeneralesComponent],
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

    fixture = TestBed.createComponent(SolicitudProyectoPresupuestoDatosGeneralesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {

    expect(component).toBeTruthy();
  });
});
