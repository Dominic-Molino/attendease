import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventpreviewComponent } from './eventpreview.component';

describe('EventpreviewComponent', () => {
  let component: EventpreviewComponent;
  let fixture: ComponentFixture<EventpreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventpreviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EventpreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
