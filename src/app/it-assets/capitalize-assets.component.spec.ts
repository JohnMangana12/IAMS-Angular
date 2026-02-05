import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapitalizeAssetsComponent } from './capitalize-assets.component';

describe('CapitalizeAssetsComponent', () => {
  let component: CapitalizeAssetsComponent;
  let fixture: ComponentFixture<CapitalizeAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CapitalizeAssetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CapitalizeAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
