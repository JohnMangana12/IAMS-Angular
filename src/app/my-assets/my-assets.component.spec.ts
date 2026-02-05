import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAssetsComponent } from './my-assets.component';

describe('MyAssetsComponent', () => {
  let component: MyAssetsComponent;
  let fixture: ComponentFixture<MyAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyAssetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
