import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { SolicitudProyectoDatosService } from './solicitud-proyecto-datos.service';

describe('SolicitudProyectoDatosService', () => {
  let service: SolicitudProyectoDatosService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        BrowserAnimationsModule,
        LoggerTestingModule
      ]
    });
    service = TestBed.inject(SolicitudProyectoDatosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
