import { TestBed } from '@angular/core/testing';

import { SolicitudProyectoPeriodoPagoService } from './solicitud-proyecto-periodo-pago.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoggerTestingModule } from 'ngx-logger/testing';

describe('SolicitudProyectoPeriodoPagoService', () => {
  let service: SolicitudProyectoPeriodoPagoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        BrowserAnimationsModule,
        LoggerTestingModule
      ]
    });
    service = TestBed.inject(SolicitudProyectoPeriodoPagoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
