import { TestBed } from '@angular/core/testing';

import { RutaTramoService } from './ruta-tramo.service';

describe('RutaTramoService', () => {
  let service: RutaTramoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RutaTramoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
