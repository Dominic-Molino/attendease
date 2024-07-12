import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparingEventsComponent } from './comparing-events.component';

describe('ComparingEventsComponent', () => {
  let component: ComparingEventsComponent;
  let fixture: ComponentFixture<ComparingEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparingEventsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ComparingEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
