import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoredEventComponent } from './monitored-event.component';

describe('MonitoredEventComponent', () => {
  let component: MonitoredEventComponent;
  let fixture: ComponentFixture<MonitoredEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitoredEventComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MonitoredEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
