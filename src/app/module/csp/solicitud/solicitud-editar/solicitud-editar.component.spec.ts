import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SolicitudEditarComponent } from './solicitud-editar.component';
import { ActionFooterComponent } from '@shared/action-footer/action-footer.component';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { FlexModule, FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { SolicitudActionService } from '../solicitud.action.service';
import { SgiAuthService } from '@sgi/framework/auth';

describe('SolicitudEditarComponent', () => {
  let component: SolicitudEditarComponent;
  let fixture: ComponentFixture<SolicitudEditarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        SolicitudEditarComponent,
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
        SolicitudActionService,
        SgiAuthService
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitudEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
