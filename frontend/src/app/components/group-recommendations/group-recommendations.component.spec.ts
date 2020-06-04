import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupRecommendationsComponent } from './group-recommendations.component';

describe('GroupRecommendationsComponent', () => {
  let component: GroupRecommendationsComponent;
  let fixture: ComponentFixture<GroupRecommendationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupRecommendationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupRecommendationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
