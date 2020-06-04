import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelecttopComponent } from './selecttop.component';

describe('SelecttopComponent', () => {
  let component: SelecttopComponent;
  let fixture: ComponentFixture<SelecttopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelecttopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelecttopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
