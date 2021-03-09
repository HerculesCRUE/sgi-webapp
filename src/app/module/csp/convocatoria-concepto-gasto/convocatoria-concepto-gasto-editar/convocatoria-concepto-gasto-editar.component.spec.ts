import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
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
import { ConvocatoriaConceptoGastoEditarComponent } from './convocatoria-concepto-gasto-editar.component';
import { ConvocatoriaConceptoGastoActionService } from '../convocatoria-concepto-gasto.action.service';
import { IConvocatoriaConceptoGasto } from '@core/models/csp/convocatoria-concepto-gasto';

describe('ConvocatoriaConceptoGastoEditarComponent', () => {
  let component: ConvocatoriaConceptoGastoEditarComponent;
  let fixture: ComponentFixture<ConvocatoriaConceptoGastoEditarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ConvocatoriaConceptoGastoEditarComponent,
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
        ConvocatoriaConceptoGastoActionService,
        SgiAuthService
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    const proyectoSocio = { id: 1 } as IConvocatoriaConceptoGasto;
    history.pushState({ proyectoSocio }, 'proyectoSocio');

    fixture = TestBed.createComponent(ConvocatoriaConceptoGastoEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
