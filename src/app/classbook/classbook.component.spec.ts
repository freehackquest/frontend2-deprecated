import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassbookComponent } from './classbook.component';

describe('ClassbookComponent', () => {
  let component: ClassbookComponent;
  let fixture: ComponentFixture<ClassbookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassbookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
