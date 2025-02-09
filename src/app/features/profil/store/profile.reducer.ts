import { createReducer, on } from '@ngrx/store';
import { User } from '../../../core/models/user.model';
import * as ProfileActions from './profile.actions';

export interface ProfileState {
  user: User | null;
  error: string | null;
  loading: boolean;
}

export const initialState: ProfileState = {
  user: null,
  error: null,
  loading: false
};

export const profileReducer = createReducer(
  initialState,
  on(ProfileActions.updateProfile, state => ({
    ...state,
    loading: true
  })),
  on(ProfileActions.updateProfileSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null
  })),
  on(ProfileActions.updateProfileFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  on(ProfileActions.updateUserImage, state => ({
    ...state,
    loading: true
  })),
  on(ProfileActions.updateUserImageSuccess, (state, { imageUrl }) => ({
    ...state,
    user: state.user ? { ...state.user, imageUrl } : null,
    loading: false
  }))
); 