import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackChartComponent } from './feedback-chart.component';

describe('FeedbackChartComponent', () => {
  let component: FeedbackChartComponent;
  let fixture: ComponentFixture<FeedbackChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeedbackChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
