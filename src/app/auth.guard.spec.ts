import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CanActivateFn } from '@angular/router';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule], // Import RouterTestingModule for testing
      providers: [AuthGuard]
    });

    authGuard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(authGuard).toBeTruthy();
  });

  // Add more tests to verify the logic of your AuthGuard
  // For example:
  // it('should return true if user is authenticated', () => {
  //   // Mock the authentication state
  //   // ...
  //   expect(authGuard.canActivate()).toBeTrue();
  // });
});
