import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OngoingreportComponent } from './ongoingreport.component';

describe('OngoingreportComponent', () => {
  let component: OngoingreportComponent;
  let fixture: ComponentFixture<OngoingreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OngoingreportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OngoingreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
