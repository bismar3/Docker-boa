import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RutaEditComponent } from './ruta-edit.component';

describe('RutaEditComponent', () => {
  let component: RutaEditComponent;
  let fixture: ComponentFixture<RutaEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RutaEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RutaEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
