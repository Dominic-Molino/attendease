import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitylogsComponent } from './activitylogs.component';

describe('ActivitylogsComponent', () => {
  let component: ActivitylogsComponent;
  let fixture: ComponentFixture<ActivitylogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivitylogsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActivitylogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
