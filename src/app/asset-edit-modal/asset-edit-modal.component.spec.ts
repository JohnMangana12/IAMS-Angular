import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetEditModalComponent } from './asset-edit-modal.component';

describe('AssetEditModalComponent', () => {
  let component: AssetEditModalComponent;
  let fixture: ComponentFixture<AssetEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssetEditModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
