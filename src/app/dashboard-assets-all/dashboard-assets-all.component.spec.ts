import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAssetsAllComponent } from './dashboard-assets-all.component';

describe('DashboardAssetsAllComponent', () => {
  let component: DashboardAssetsAllComponent;
  let fixture: ComponentFixture<DashboardAssetsAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardAssetsAllComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardAssetsAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
