import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmberAssetsComponent } from './amber-assets.component';

describe('AmberAssetsComponent', () => {
  let component: AmberAssetsComponent;
  let fixture: ComponentFixture<AmberAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AmberAssetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmberAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
