import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideNavUsersComponent } from './side-nav-users.component';

describe('SideNavUsersComponent', () => {
  let component: SideNavUsersComponent;
  let fixture: ComponentFixture<SideNavUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SideNavUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideNavUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
