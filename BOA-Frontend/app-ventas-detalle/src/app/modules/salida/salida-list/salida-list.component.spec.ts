import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalidaListComponent } from './salida-list.component';

describe('SalidaListComponent', () => {
  let component: SalidaListComponent;
  let fixture: ComponentFixture<SalidaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalidaListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalidaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
