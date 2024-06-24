import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalPageComponent } from './approval-page.component';

describe('ApprovalPageComponent', () => {
  let component: ApprovalPageComponent;
  let fixture: ComponentFixture<ApprovalPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ApprovalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
