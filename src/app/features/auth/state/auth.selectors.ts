import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectRegistrationSuccess = createSelector(
  selectAuthState,
  (state: AuthState) => state.registrationSuccess
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state: AuthState) => state.error
);
