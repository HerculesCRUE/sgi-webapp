import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NGXLogger } from 'ngx-logger';

import { ModeloUnidadService } from './modelo-unidad.service';
import { LoggerTestingModule } from 'ngx-logger/testing';

describe('ModeloUnidadService', () => {
  let service: ModeloUnidadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        BrowserAnimationsModule,
        LoggerTestingModule
      ]
    });
    service = TestBed.inject(ModeloUnidadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
