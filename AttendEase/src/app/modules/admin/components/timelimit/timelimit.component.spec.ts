import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelimitComponent } from './timelimit.component';

describe('TimelimitComponent', () => {
  let component: TimelimitComponent;
  let fixture: ComponentFixture<TimelimitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelimitComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimelimitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
