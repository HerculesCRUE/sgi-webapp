import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EvaluacionEvaluacionComponent } from './evaluacion-evaluacion.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialDesignModule } from '@material/material-design.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import TestUtils from '@core/utils/test-utils';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { SnackBarService } from '@core/services/snack-bar.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EvaluacionListadoAnteriorMemoriaComponent } from '../evaluacion-listado-anterior-memoria/evaluacion-listado-anterior-memoria.component';
import { EvaluacionFormularioActionService } from '../evaluacion-formulario.action.service';
import { SgiAuthModule, SgiAuthService } from '@sgi/framework/auth';
import { FlexModule } from '@angular/flex-layout';
import { EvaluacionActionService } from '../../evaluacion/evaluacion.action.service';

describe('EvaluacionEvaluacionComponent', () => {
  let component: EvaluacionEvaluacionComponent;
  let fixture: ComponentFixture<EvaluacionEvaluacionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        EvaluacionEvaluacionComponent,
        EvaluacionListadoAnteriorMemoriaComponent
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
        SgiAuthModule
      ],
      providers: [
        { provide: SnackBarService, useValue: TestUtils.getSnackBarServiceSpy() },
        { provide: EvaluacionFormularioActionService, useClass: EvaluacionActionService },
        SgiAuthService
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluacionEvaluacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
