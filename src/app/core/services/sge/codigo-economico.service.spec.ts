import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';

import { CodigoEconomicoService } from './codigo-economico.service';

describe('CodigoEconomicoService', () => {
  let service: CodigoEconomicoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        LoggerTestingModule
      ]
    });
    service = TestBed.inject(CodigoEconomicoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
