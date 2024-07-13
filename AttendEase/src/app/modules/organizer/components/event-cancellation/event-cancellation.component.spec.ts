import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCancellationComponent } from './event-cancellation.component';

describe('EventCancellationComponent', () => {
  let component: EventCancellationComponent;
  let fixture: ComponentFixture<EventCancellationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCancellationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EventCancellationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
