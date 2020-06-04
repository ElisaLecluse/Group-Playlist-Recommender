import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YourRecommendationsComponent } from './your-recommendations.component';

describe('YourRecommendationsComponent', () => {
  let component: YourRecommendationsComponent;
  let fixture: ComponentFixture<YourRecommendationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YourRecommendationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YourRecommendationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
