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
import { ConvocatoriaConceptoGastoActionService } from '../convocatoria-concepto-gasto.action.service';
import { IConvocatoriaConceptoGasto } from '@core/models/csp/convocatoria-concepto-gasto';
import { ConvocatoriaConceptoGastoCrearComponent } from './convocatoria-concepto-gasto-crear.component';


describe('ConvocatoriaConceptoGastoCrearComponent', () => {
  let component: ConvocatoriaConceptoGastoCrearComponent;
  let fixture: ComponentFixture<ConvocatoriaConceptoGastoCrearComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ConvocatoriaConceptoGastoCrearComponent,
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
    const proyectoSocio = {} as IConvocatoriaConceptoGasto;
    history.pushState({ proyectoSocio }, 'proyectoSocio');

    fixture = TestBed.createComponent(ConvocatoriaConceptoGastoCrearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
