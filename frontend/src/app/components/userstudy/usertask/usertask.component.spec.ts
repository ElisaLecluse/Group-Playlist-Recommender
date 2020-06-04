import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsertaskComponent } from './usertask.component';

describe('UsertaskComponent', () => {
  let component: UsertaskComponent;
  let fixture: ComponentFixture<UsertaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsertaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsertaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
