import { TestBed } from '@angular/core/testing';

import { SolicitudProyectoPeriodoJustificacionService } from './solicitud-proyecto-periodo-justificacion.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';

describe('SolicitudProyectoPeriodoJustificacionService', () => {
  let service: SolicitudProyectoPeriodoJustificacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        LoggerTestingModule
      ]
    });
    service = TestBed.inject(SolicitudProyectoPeriodoJustificacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
