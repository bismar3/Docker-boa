import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EgresoListComponent } from './egreso-list.component';

describe('EgresoListComponent', () => {
  let component: EgresoListComponent;
  let fixture: ComponentFixture<EgresoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EgresoListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EgresoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
