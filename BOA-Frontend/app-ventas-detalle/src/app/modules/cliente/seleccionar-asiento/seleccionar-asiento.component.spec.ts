import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionarAsientoComponent } from './seleccionar-asiento.component';

describe('SeleccionarAsientoComponent', () => {
  let component: SeleccionarAsientoComponent;
  let fixture: ComponentFixture<SeleccionarAsientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionarAsientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionarAsientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
