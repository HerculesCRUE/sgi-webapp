import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SolicitudListadoComponent } from './solicitud-listado.component';
import { FooterCrearComponent } from '@shared/footers/footer-crear/footer-crear.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialDesignModule } from '@material/material-design.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import TestUtils from '@core/utils/test-utils';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SolicitudActionService } from '../solicitud.action.service';

describe('SolicitudListadoComponent', () => {
  let component: SolicitudListadoComponent;
  let fixture: ComponentFixture<SolicitudListadoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        SolicitudListadoComponent,
        FooterCrearComponent
      ],
      imports: [
        RouterTestingModule,
        MaterialDesignModule,
        HttpClientTestingModule,
        LoggerTestingModule,
        BrowserAnimationsModule,
        TestUtils.getIdiomas(),
        FlexLayoutModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: SnackBarService, useValue: TestUtils.getSnackBarServiceSpy() },
        SolicitudActionService
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitudListadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
