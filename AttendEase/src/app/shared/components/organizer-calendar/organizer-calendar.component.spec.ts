import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizerCalendarComponent } from './organizer-calendar.component';

describe('OrganizerCalendarComponent', () => {
  let component: OrganizerCalendarComponent;
  let fixture: ComponentFixture<OrganizerCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizerCalendarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrganizerCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
