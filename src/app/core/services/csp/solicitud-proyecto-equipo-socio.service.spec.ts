import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { SolicitudProyectoEquipoSocioService } from './solicitud-proyecto-equipo-socio.service';

describe('SolicitudProyectoEquipoSocioService', () => {
  let service: SolicitudProyectoEquipoSocioService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        BrowserAnimationsModule,
        LoggerTestingModule
      ]
    });
    service = TestBed.inject(SolicitudProyectoEquipoSocioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
