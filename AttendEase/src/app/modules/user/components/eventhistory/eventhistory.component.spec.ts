import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventhistoryComponent } from './eventhistory.component';

describe('EventhistoryComponent', () => {
  let component: EventhistoryComponent;
  let fixture: ComponentFixture<EventhistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventhistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EventhistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
