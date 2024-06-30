import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterRouteComponent } from './register-route.component';

describe('RegisterRouteComponent', () => {
  let component: RegisterRouteComponent;
  let fixture: ComponentFixture<RegisterRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterRouteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
