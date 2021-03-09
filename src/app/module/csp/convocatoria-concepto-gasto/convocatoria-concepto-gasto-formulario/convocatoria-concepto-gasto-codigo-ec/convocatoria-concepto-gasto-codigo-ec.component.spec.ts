import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvocatoriaConceptoGastoCodigoEcComponent } from './convocatoria-concepto-gasto-codigo-ec.component';
import { MaterialDesignModule } from '@material/material-design.module';
import TestUtils from '@core/utils/test-utils';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SnackBarService } from '@core/services/snack-bar.service';
import { ConvocatoriaConceptoGastoActionService } from '../../convocatoria-concepto-gasto.action.service';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { SgiAuthService } from '@sgi/framework/auth';
import { IConvocatoriaConceptoGasto } from '@core/models/csp/convocatoria-concepto-gasto';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('ConvocatoriaConceptoGastoCodigoEcComponent', () => {
  let component: ConvocatoriaConceptoGastoCodigoEcComponent;
  let fixture: ComponentFixture<ConvocatoriaConceptoGastoCodigoEcComponent>;

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
      declarations: [ConvocatoriaConceptoGastoCodigoEcComponent],
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
        { provide: MatDialogRef, useValue: data },
        { provide: MAT_DIALOG_DATA, useValue: data },
        ConvocatoriaConceptoGastoActionService,
        SgiAuthService
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    history.pushState(data.convocatoriaConceptoGasto, 'convocatoriaConceptoGasto');
    history.pushState(data.convocatoriaConceptoGastosTabla, 'convocatoriaConceptoGastosTabla');
    history.pushState(true, 'permitido');
    history.pushState(false, 'readonly');
    fixture = TestBed.createComponent(ConvocatoriaConceptoGastoCodigoEcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
