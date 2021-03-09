import { TestBed } from '@angular/core/testing';

import { SocioPeriodoJustificacionDocumentoService } from './socio-periodo-justificacion-documento.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoggerTestingModule } from 'ngx-logger/testing';

describe('SocioPeriodoJustificacionDocumentoService', () => {
  let service: SocioPeriodoJustificacionDocumentoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        BrowserAnimationsModule,
        LoggerTestingModule
      ]
    });
    service = TestBed.inject(SocioPeriodoJustificacionDocumentoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
