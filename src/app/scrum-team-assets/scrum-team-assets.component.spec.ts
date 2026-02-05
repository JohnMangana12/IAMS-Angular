import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrumTeamAssetsComponent } from './scrum-team-assets.component';

describe('ScrumTeamAssetsComponent', () => {
  let component: ScrumTeamAssetsComponent;
  let fixture: ComponentFixture<ScrumTeamAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScrumTeamAssetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScrumTeamAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
