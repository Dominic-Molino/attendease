import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobicalendarComponent } from './mobicalendar.component';

describe('MobicalendarComponent', () => {
  let component: MobicalendarComponent;
  let fixture: ComponentFixture<MobicalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobicalendarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MobicalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
