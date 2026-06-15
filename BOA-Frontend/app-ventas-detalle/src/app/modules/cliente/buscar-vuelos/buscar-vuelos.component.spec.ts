import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarVuelosComponent } from './buscar-vuelos.component';

describe('BuscarVuelosComponent', () => {
  let component: BuscarVuelosComponent;
  let fixture: ComponentFixture<BuscarVuelosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscarVuelosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscarVuelosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
