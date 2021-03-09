import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConvocatoriaRequisitosIPComponent } from './convocatoria-requisitos-ip.component';
import { MaterialDesignModule } from '@material/material-design.module';
import TestUtils from '@core/utils/test-utils';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { SnackBarService } from '@core/services/snack-bar.service';
import { ConvocatoriaActionService } from '../../convocatoria.action.service';
import { SgiAuthService } from '@sgi/framework/auth';

describe('ConvocatoriaRequisitosIPComponent', () => {
  let component: ConvocatoriaRequisitosIPComponent;
  let fixture: ComponentFixture<ConvocatoriaRequisitosIPComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ConvocatoriaRequisitosIPComponent],
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
        ConvocatoriaActionService,
        SgiAuthService
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvocatoriaRequisitosIPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
