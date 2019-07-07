import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelDialogQuestFeedbackComponent } from './model-dialog-quest-feedback.component';

describe('ModelDialogQuestFeedbackComponent', () => {
  let component: ModelDialogQuestFeedbackComponent;
  let fixture: ComponentFixture<ModelDialogQuestFeedbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelDialogQuestFeedbackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelDialogQuestFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
