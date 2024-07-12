import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventReportPageComponent } from './event-report-page.component';

describe('EventReportPageComponent', () => {
  let component: EventReportPageComponent;
  let fixture: ComponentFixture<EventReportPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventReportPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EventReportPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
