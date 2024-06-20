import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFeedbackRateComponent } from './user-feedback-rate.component';

describe('UserFeedbackRateComponent', () => {
  let component: UserFeedbackRateComponent;
  let fixture: ComponentFixture<UserFeedbackRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFeedbackRateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserFeedbackRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
