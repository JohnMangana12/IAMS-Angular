import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GreenAssetsComponent } from './green-assets.component';

describe('GreenAssetsComponent', () => {
  let component: GreenAssetsComponent;
  let fixture: ComponentFixture<GreenAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GreenAssetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GreenAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
