import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IConvocatoriaConceptoGasto } from '@core/models/csp/convocatoria-concepto-gasto';
import { SnackBarService } from '@core/services/snack-bar.service';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { SgiAuthService } from '@sgi/framework/auth';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { ConvocatoriaConceptoGastoActionService } from '../../convocatoria-concepto-gasto.action.service';

import { ConvocatoriaConceptoGastoComponent } from './convocatoria-concepto-gasto.component';

describe('ConvocatoriaConceptoGastoComponent', () => {
  let component: ConvocatoriaConceptoGastoComponent;
  let fixture: ComponentFixture<ConvocatoriaConceptoGastoComponent>;

  const data = {
    convocatoriaConceptoGasto: {
      id: 1,
      permitido: true
    } as IConvocatoriaConceptoGasto,
    convocatoriaConceptoGastosTabla:
      [
        {
          id: 1,
          permitido: true
        },
        {
          id: 2,
          permitido: true
        }
      ] as IConvocatoriaConceptoGasto[]
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ConvocatoriaConceptoGastoComponent
      ],
      imports: [
        BrowserAnimationsModule,
        MaterialDesignModule,
        HttpClientTestingModule,
        LoggerTestingModule,
        TestUtils.getIdiomas(),
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: SnackBarService, useValue: TestUtils.getSnackBarServiceSpy() },
        { provide: MatDialogRef, useValue: data },
        { provide: MAT_DIALOG_DATA, useValue: data },
        ConvocatoriaConceptoGastoActionService,
        SgiAuthService
      ]
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