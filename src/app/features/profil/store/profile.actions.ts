import { createAction, props } from '@ngrx/store';
import { User } from '../../../core/models/user.model';

export const updateProfile = createAction(
  '[Profile] Update Profile',
  props<{ user: Partial<User> }>()
);

export const updateProfileSuccess = createAction(
  '[Profile] Update Profile Success',
  props<{ user: User }>()
);

export const updateProfileFailure = createAction(
  '[Profile] Update Profile Failure',
  props<{ error: string }>()
);

export const updateUserImage = createAction(
  '[Profile] Update User Image',
  props<{ imageUrl: string }>()
);

export const updateUserImageSuccess = createAction(
  '[Profile] Update User Image Success',
  props<{ imageUrl: string }>()
);

export const deleteProfile = createAction('[Profile] Delete Profile');
export const deleteProfileSuccess = createAction('[Profile] Delete Profile Success');
export const deleteProfileFailure = createAction(
  '[Profile] Delete Profile Failure',
  props<{ error: string }>()
); 