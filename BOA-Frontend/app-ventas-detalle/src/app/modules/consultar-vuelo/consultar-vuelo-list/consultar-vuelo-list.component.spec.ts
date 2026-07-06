import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarVueloListComponent } from './consultar-vuelo-list.component';

describe('ConsultarVueloListComponent', () => {
  let component: ConsultarVueloListComponent;
  let fixture: ComponentFixture<ConsultarVueloListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultarVueloListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultarVueloListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
