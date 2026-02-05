import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsByMonthComponent } from './assets-by-month.component';

describe('AssetsByMonthComponent', () => {
  let component: AssetsByMonthComponent;
  let fixture: ComponentFixture<AssetsByMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssetsByMonthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetsByMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
