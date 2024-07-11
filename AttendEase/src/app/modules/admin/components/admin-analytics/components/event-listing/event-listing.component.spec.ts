import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventListingComponent } from './event-listing.component';

describe('EventListingComponent', () => {
  let component: EventListingComponent;
  let fixture: ComponentFixture<EventListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventListingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EventListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
