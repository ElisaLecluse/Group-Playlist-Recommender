import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FairnessComponent } from './fairness.component';

describe('FairnessComponent', () => {
  let component: FairnessComponent;
  let fixture: ComponentFixture<FairnessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FairnessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FairnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
