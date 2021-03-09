import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { ActionFooterComponent } from '@shared/action-footer/action-footer.component';
import { FlexModule, FlexLayoutModule } from '@angular/flex-layout';

import { SharedModule } from '@shared/shared.module';
import { ProyectoCrearComponent } from './proyecto-crear.component';
import { ProyectoActionService } from '../proyecto.action.service';
import { SgiAuthService } from '@sgi/framework/auth';

describe('ProyectoCrearComponent', () => {
  let component: ProyectoCrearComponent;
  let fixture: ComponentFixture<ProyectoCrearComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProyectoCrearComponent,
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
        ProyectoActionService,
        SgiAuthService
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProyectoCrearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
