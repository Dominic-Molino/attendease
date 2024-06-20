import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUserFeedbackComponent } from './view-user-feedback.component';

describe('ViewUserFeedbackComponent', () => {
  let component: ViewUserFeedbackComponent;
  let fixture: ComponentFixture<ViewUserFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewUserFeedbackComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewUserFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
