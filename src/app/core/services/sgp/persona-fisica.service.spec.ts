import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { SgiAuthModule, SgiAuthService } from '@sgi/framework/auth';


import { PersonaFisicaService } from './persona-fisica.service';

describe('PersonaFisicaService', () => {
  let service: PersonaFisicaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        LoggerTestingModule,
        SgiAuthModule
      ],
      providers: [
        SgiAuthService
      ],
    });
    service = TestBed.inject(PersonaFisicaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
