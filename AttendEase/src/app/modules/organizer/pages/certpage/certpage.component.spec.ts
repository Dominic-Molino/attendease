import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertpageComponent } from './certpage.component';

describe('CertpageComponent', () => {
  let component: CertpageComponent;
  let fixture: ComponentFixture<CertpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertpageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CertpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
