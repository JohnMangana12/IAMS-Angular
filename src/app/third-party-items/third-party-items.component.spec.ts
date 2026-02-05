import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThirdPartyItemsComponent } from './third-party-items.component';

describe('ThirdPartyItemsComponent', () => {
  let component: ThirdPartyItemsComponent;
  let fixture: ComponentFixture<ThirdPartyItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ThirdPartyItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThirdPartyItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
