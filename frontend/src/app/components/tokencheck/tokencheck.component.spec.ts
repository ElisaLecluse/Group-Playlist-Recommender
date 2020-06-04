import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TokencheckComponent } from './tokencheck.component';

describe('TokencheckComponent', () => {
  let component: TokencheckComponent;
  let fixture: ComponentFixture<TokencheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TokencheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokencheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
