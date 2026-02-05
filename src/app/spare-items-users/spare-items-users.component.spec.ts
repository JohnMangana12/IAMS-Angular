import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpareItemsUsersComponent } from './spare-items-users.component';

describe('SpareItemsUsersComponent', () => {
  let component: SpareItemsUsersComponent;
  let fixture: ComponentFixture<SpareItemsUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpareItemsUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpareItemsUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
