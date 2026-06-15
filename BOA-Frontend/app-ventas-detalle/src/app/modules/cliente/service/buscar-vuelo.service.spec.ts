import { TestBed } from '@angular/core/testing';

import { BuscarVueloService } from './buscar-vuelo.service';

describe('BuscarVueloService', () => {
  let service: BuscarVueloService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuscarVueloService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
