import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkattendanceeComponent } from './markattendancee.component';

describe('MarkattendanceeComponent', () => {
  let component: MarkattendanceeComponent;
  let fixture: ComponentFixture<MarkattendanceeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkattendanceeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MarkattendanceeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
