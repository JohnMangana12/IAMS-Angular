import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseFormModalComponent } from './license-form-modal.component';

describe('LicenseFormModalComponent', () => {
  let component: LicenseFormModalComponent;
  let fixture: ComponentFixture<LicenseFormModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LicenseFormModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LicenseFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
