import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewattendanceimageComponent } from './viewattendanceimage.component';

describe('ViewattendanceimageComponent', () => {
  let component: ViewattendanceimageComponent;
  let fixture: ComponentFixture<ViewattendanceimageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewattendanceimageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewattendanceimageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
