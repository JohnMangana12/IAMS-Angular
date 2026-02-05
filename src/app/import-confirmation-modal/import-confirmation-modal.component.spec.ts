import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportConfirmationModalComponent } from './import-confirmation-modal.component';

describe('ImportConfirmationModalComponent', () => {
  let component: ImportConfirmationModalComponent;
  let fixture: ComponentFixture<ImportConfirmationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportConfirmationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportConfirmationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
