import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { EmpresaEconomicaService } from './empresa-economica.service';

describe('EmpresaEconomicaService', () => {
  let service: EmpresaEconomicaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        LoggerTestingModule
      ]
    });
    service = TestBed.inject(EmpresaEconomicaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
