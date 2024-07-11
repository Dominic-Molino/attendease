import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OngoingReportComponent } from './ongoing-report.component';

describe('OngoingReportComponent', () => {
  let component: OngoingReportComponent;
  let fixture: ComponentFixture<OngoingReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OngoingReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OngoingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
