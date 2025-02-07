import { createAction, props } from '@ngrx/store';

export const registerUser = createAction(
  '[Register Component] Register User',
  props<{ userData: any }>()
);

export const registerUserSuccess = createAction(
  '[Auth API] Register User Success'
);

export const registerUserFailure = createAction(
  '[Auth API] Register User Failure',
  props<{ error: any }>()
);
