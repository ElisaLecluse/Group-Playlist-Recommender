import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalplaylistComponent } from './finalplaylist.component';

describe('FinalplaylistComponent', () => {
  let component: FinalplaylistComponent;
  let fixture: ComponentFixture<FinalplaylistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinalplaylistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalplaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
