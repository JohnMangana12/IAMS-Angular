import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseDetailsModalComponent } from './license-details-modal.component';

describe('LicenseDetailsModalComponent', () => {
  let component: LicenseDetailsModalComponent;
  let fixture: ComponentFixture<LicenseDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LicenseDetailsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LicenseDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
