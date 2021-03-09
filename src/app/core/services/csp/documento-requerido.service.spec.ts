import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { DocumentoRequeridoService } from './documento-requerido.service';

describe('DocumentoRequeridoService', () => {
  let service: DocumentoRequeridoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        LoggerTestingModule
      ]
    });
    service = TestBed.inject(DocumentoRequeridoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
