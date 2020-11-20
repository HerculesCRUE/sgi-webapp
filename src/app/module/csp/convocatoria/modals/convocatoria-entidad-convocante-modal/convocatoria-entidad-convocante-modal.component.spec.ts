import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IConvocatoriaEntidadConvocante } from '@core/models/csp/convocatoria-entidad-convocante';
import { IEmpresaEconomica, TipoEmpresaEconomica } from '@core/models/sgp/empresa-economica';
import { SnackBarService } from '@core/services/snack-bar.service';
import { StatusWrapper } from '@core/utils/status-wrapper';
import TestUtils from '@core/utils/test-utils';
import { MaterialDesignModule } from '@material/material-design.module';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { ConvocatoriaEntidadConvocanteModalComponent, ConvocatoriaEntidadConvocanteModalData } from './convocatoria-entidad-convocante-modal.component';

describe('ConvocatoriaEntidadConvocanteModalComponent', () => {
  let component: ConvocatoriaEntidadConvocanteModalComponent;
  let fixture: ComponentFixture<ConvocatoriaEntidadConvocanteModalComponent>;

  const data: IConvocatoriaEntidadConvocante = {
    convocatoria: undefined,
    entidadRef: '',
    id: 1,
    programa: undefined
  };

  const empresaEconomica: IEmpresaEconomica = {
    direccion: '',
    numeroDocumento: '',
    personaRef: '',
    personaRefPadre: '',
    razonSocial: '',
    tipo: TipoEmpresaEconomica.ENTIDAD,
    tipoDocumento: '',
    tipoEmpresa: ''
  };

  const modalData: ConvocatoriaEntidadConvocanteModalData = {
    entidadConvocanteData: {
      empresaEconomica,
      entidadConvocante: new StatusWrapper<IConvocatoriaEntidadConvocante>(data),
      plan: undefined,
      programa: undefined,
      modalidad: undefined,
    },
    selectedEmpresas: []
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ConvocatoriaEntidadConvocanteModalComponent
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
        { provide: MatDialogRef, useValue: modalData },
        { provide: MAT_DIALOG_DATA, useValue: modalData },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvocatoriaEntidadConvocanteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
