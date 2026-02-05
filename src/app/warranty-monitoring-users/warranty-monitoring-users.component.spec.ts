import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarrantyMonitoringUsersComponent } from './warranty-monitoring-users.component';

describe('WarrantyMonitoringUsersComponent', () => {
  let component: WarrantyMonitoringUsersComponent;
  let fixture: ComponentFixture<WarrantyMonitoringUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WarrantyMonitoringUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarrantyMonitoringUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
