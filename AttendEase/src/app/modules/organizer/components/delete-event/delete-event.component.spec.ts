import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteEventComponent } from './delete-event.component';

describe('DeleteEventComponent', () => {
  let component: DeleteEventComponent;
  let fixture: ComponentFixture<DeleteEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteEventComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeleteEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
