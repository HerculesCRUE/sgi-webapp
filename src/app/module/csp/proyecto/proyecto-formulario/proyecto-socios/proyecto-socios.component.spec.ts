import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SnackBarService } from '@core/services/snack-bar.service';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { SgiAuthService } from '@sgi/framework/auth';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { ProyectoActionService } from '../../proyecto.action.service';

import { ProyectoSociosComponent } from './proyecto-socios.component';

describe('ProyectoSociosComponent', () => {
  let component: ProyectoSociosComponent;
  let fixture: ComponentFixture<ProyectoSociosComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProyectoSociosComponent
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
      ],
      providers: [
        { provide: SnackBarService, useValue: TestUtils.getSnackBarServiceSpy() },
        ProyectoActionService,
        SgiAuthService
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                proyecto: { data: 1 }
              }
            }
          }
        }
      ]
    });

    fixture = TestBed.createComponent(ProyectoSociosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});