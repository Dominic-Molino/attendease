import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrglistSidebarComponent } from './orglist-sidebar.component';

describe('OrglistSidebarComponent', () => {
  let component: OrglistSidebarComponent;
  let fixture: ComponentFixture<OrglistSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrglistSidebarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrglistSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
