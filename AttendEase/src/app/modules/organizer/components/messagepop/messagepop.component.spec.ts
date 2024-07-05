import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagepopComponent } from './messagepop.component';

describe('MessagepopComponent', () => {
  let component: MessagepopComponent;
  let fixture: ComponentFixture<MessagepopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagepopComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MessagepopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
