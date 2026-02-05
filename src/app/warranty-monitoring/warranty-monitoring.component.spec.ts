import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarrantyMonitoringComponent } from './warranty-monitoring.component';

describe('WarrantyMonitoringComponent', () => {
  let component: WarrantyMonitoringComponent;
  let fixture: ComponentFixture<WarrantyMonitoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WarrantyMonitoringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarrantyMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
