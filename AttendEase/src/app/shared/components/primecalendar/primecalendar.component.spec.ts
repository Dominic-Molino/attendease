import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimecalendarComponent } from './primecalendar.component';

describe('PrimecalendarComponent', () => {
  let component: PrimecalendarComponent;
  let fixture: ComponentFixture<PrimecalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimecalendarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrimecalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
