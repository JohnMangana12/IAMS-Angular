import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpareItemsComponent } from './spare-items.component';

describe('SpareItemsComponent', () => {
  let component: SpareItemsComponent;
  let fixture: ComponentFixture<SpareItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpareItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpareItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
