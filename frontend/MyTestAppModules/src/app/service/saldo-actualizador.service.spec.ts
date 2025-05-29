import { TestBed } from '@angular/core/testing';

import { SaldoActualizadorService } from './saldo-actualizador.service';

describe('SaldoActualizadorService', () => {
  let service: SaldoActualizadorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaldoActualizadorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
