import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FlexModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { SgiAuthService } from '@sgi/framework/auth';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { ProyectoActionService } from '../../proyecto.action.service';

import { ProyectoEntidadesFinanciadorasComponent } from './proyecto-entidades-financiadoras.component';

const activatedRoute = {
  snapshot: {
    data: {
      proyecto: {}
    }
  }
};

describe('PoryectoEntidadesFinanciadorasComponent', () => {
  let component: ProyectoEntidadesFinanciadorasComponent;
  let fixture: ComponentFixture<ProyectoEntidadesFinanciadorasComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProyectoEntidadesFinanciadorasComponent
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
        ProyectoActionService,
        SgiAuthService,
        {
          provide: ActivatedRoute,
          useValue: activatedRoute
        }
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProyectoEntidadesFinanciadorasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
