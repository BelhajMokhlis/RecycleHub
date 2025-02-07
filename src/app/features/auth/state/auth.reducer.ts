import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';

export interface AuthState {
  registrationSuccess: boolean;
  error: any;
}

export const initialState: AuthState = {
  registrationSuccess: false,
  error: null
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.registerUserSuccess, state => ({
    ...state,
    registrationSuccess: true,
    error: null
  })),
  on(AuthActions.registerUserFailure, (state, { error }) => ({
    ...state,
    registrationSuccess: false,
    error
  }))
);
