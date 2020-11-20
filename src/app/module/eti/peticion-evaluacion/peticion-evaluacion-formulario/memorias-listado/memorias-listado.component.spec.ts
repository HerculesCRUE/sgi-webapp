import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { SgiAuthModule, SgiAuthService } from '@sgi/framework/auth';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { PeticionEvaluacionActionService } from '../../peticion-evaluacion.action.service';
import { MemoriasListadoComponent } from './memorias-listado.component';

describe('MemoriasListadoComponent', () => {
  let component: MemoriasListadoComponent;
  let fixture: ComponentFixture<MemoriasListadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MemoriasListadoComponent],
      imports: [
        MaterialDesignModule,
        HttpClientTestingModule,
        LoggerTestingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        SgiAuthModule,
        TestUtils.getIdiomas()
      ],
      providers: [
        PeticionEvaluacionActionService,
        SgiAuthService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemoriasListadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
