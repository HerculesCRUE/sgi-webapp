import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConvocatoriaConceptoGastoComponent } from './convocatoria-concepto-gasto.component';
import { MaterialDesignModule } from '@material/material-design.module';
import TestUtils from '@core/utils/test-utils';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SnackBarService } from '@core/services/snack-bar.service';
import { ConvocatoriaActionService } from '../../convocatoria.action.service';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { SgiAuthService } from '@sgi/framework/auth';

describe('ConvocatoriaConceptoGastoComponent', () => {
  let component: ConvocatoriaConceptoGastoComponent;
  let fixture: ComponentFixture<ConvocatoriaConceptoGastoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ConvocatoriaConceptoGastoComponent],
      imports: [
        TestUtils.getIdiomas(),
        MaterialDesignModule,
        BrowserAnimationsModule,
        HttpClientTestingModule,
        FlexModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        LoggerTestingModule,
      ],
      providers: [
        { provide: SnackBarService, useValue: TestUtils.getSnackBarServiceSpy() },
        ConvocatoriaActionService,
        SgiAuthService
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvocatoriaConceptoGastoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
