import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewsubmissionsComponent } from './viewsubmissions.component';

describe('ViewsubmissionsComponent', () => {
  let component: ViewsubmissionsComponent;
  let fixture: ComponentFixture<ViewsubmissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewsubmissionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewsubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
