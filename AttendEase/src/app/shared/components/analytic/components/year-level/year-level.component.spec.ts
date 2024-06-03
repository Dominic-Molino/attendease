import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearLevelComponent } from './year-level.component';

describe('YearLevelComponent', () => {
  let component: YearLevelComponent;
  let fixture: ComponentFixture<YearLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YearLevelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(YearLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
