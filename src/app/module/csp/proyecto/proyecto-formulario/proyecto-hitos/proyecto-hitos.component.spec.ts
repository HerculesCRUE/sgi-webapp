import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProyectoHitosComponent } from './proyecto-hitos.component';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { SnackBarService } from '@core/services/snack-bar.service';
import { ProyectoActionService } from '../../proyecto.action.service';
import { SgiAuthService } from '@sgi/framework/auth';
import { ActivatedRoute } from '@angular/router';

describe('ProyectoHitosComponent', () => {
  let component: ProyectoHitosComponent;
  let fixture: ComponentFixture<ProyectoHitosComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProyectoHitosComponent],
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

    fixture = TestBed.createComponent(ProyectoHitosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
