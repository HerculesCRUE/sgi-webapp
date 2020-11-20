import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IConvocatoriaEntidadFinanciadora } from '@core/models/csp/convocatoria-entidad-financiadora';
import { IEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { SnackBarService } from '@core/services/snack-bar.service';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { ConvocatoriaEntidadFinanciadoraData } from '../../convocatoria-formulario/convocatoria-entidades-financiadoras/convocatoria-entidades-financiadoras.component';

import { ConvocatoriaEntidadFinanciadoraModalComponent } from './convocatoria-entidad-financiadora-modal.component';

describe('ConvocatoriaEntidadFinanciadoraModalComponent', () => {
  let component: ConvocatoriaEntidadFinanciadoraModalComponent;
  let fixture: ComponentFixture<ConvocatoriaEntidadFinanciadoraModalComponent>;

  const data = {
    empresa: {} as IEmpresaEconomica,
    entidad: {} as IConvocatoriaEntidadFinanciadora
  } as ConvocatoriaEntidadFinanciadoraData;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ConvocatoriaEntidadFinanciadoraModalComponent
      ],
      imports: [
        BrowserAnimationsModule,
        MaterialDesignModule,
        HttpClientTestingModule,
        LoggerTestingModule,
        TestUtils.getIdiomas(),
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: SnackBarService, useValue: TestUtils.getSnackBarServiceSpy() },
        { provide: MatDialogRef, useValue: data },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvocatoriaEntidadFinanciadoraModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
