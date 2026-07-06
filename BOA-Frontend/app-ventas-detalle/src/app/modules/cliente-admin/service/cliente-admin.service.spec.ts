import { TestBed } from '@angular/core/testing';

import { ClienteAdminService } from './cliente-admin.service';

describe('ClienteAdminService', () => {
  let service: ClienteAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClienteAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
