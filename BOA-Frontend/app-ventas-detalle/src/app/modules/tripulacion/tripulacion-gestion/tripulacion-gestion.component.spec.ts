import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripulacionGestionComponent } from './tripulacion-gestion.component';

describe('TripulacionGestionComponent', () => {
  let component: TripulacionGestionComponent;
  let fixture: ComponentFixture<TripulacionGestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripulacionGestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripulacionGestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
