import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MemoriaListadoInvComponent } from './memoria-listado-inv.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialDesignModule } from '@material/material-design.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import TestUtils from '@core/utils/test-utils';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { SnackBarService } from '@core/services/snack-bar.service';
import { SgiAuthService, SgiAuthModule } from '@sgi/framework/auth';
import { BuscarPersonaComponent } from '@shared/buscar-persona/buscar-persona.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';

describe('MemoriaListadoInvComponent', () => {
  let component: MemoriaListadoInvComponent;
  let fixture: ComponentFixture<MemoriaListadoInvComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        MemoriaListadoInvComponent,
        BuscarPersonaComponent
      ],
      imports: [
        RouterTestingModule,
        MaterialDesignModule,
        HttpClientTestingModule,
        LoggerTestingModule,
        BrowserAnimationsModule,
        TestUtils.getIdiomas(),
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        SgiAuthModule
      ],
      providers: [
        { provide: SnackBarService, useValue: TestUtils.getSnackBarServiceSpy() },
        SgiAuthService
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemoriaListadoInvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});