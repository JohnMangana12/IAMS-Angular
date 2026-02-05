import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsByCategoryComponent } from './assets-by-category.component';

describe('AssetsByCategoryComponent', () => {
  let component: AssetsByCategoryComponent;
  let fixture: ComponentFixture<AssetsByCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssetsByCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetsByCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
