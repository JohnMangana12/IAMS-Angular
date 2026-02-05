import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopThreeProductsComponent } from './dashboard-warranty.component';

describe('TopThreeProductsComponent', () => {
  let component: TopThreeProductsComponent;
  let fixture: ComponentFixture<TopThreeProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TopThreeProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopThreeProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
