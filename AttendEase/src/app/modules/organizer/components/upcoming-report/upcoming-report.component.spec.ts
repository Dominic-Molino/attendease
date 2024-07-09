import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingReportComponent } from './upcoming-report.component';

describe('UpcomingReportComponent', () => {
  let component: UpcomingReportComponent;
  let fixture: ComponentFixture<UpcomingReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpcomingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
