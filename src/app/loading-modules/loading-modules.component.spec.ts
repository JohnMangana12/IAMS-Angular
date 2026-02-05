import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingModulesComponent } from './loading-modules.component';

describe('LoadingModulesComponent', () => {
  let component: LoadingModulesComponent;
  let fixture: ComponentFixture<LoadingModulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoadingModulesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingModulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
