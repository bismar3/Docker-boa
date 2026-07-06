import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarVueloDetalleComponent } from './consultar-vuelo-detalle.component';

describe('ConsultarVueloDetalleComponent', () => {
  let component: ConsultarVueloDetalleComponent;
  let fixture: ComponentFixture<ConsultarVueloDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarVueloDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultarVueloDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
