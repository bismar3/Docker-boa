import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RutaTramosComponent } from './ruta-tramos.component';

describe('RutaTramosComponent', () => {
  let component: RutaTramosComponent;
  let fixture: ComponentFixture<RutaTramosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RutaTramosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RutaTramosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
