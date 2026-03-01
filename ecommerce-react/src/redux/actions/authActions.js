import * as type from '@/constants/constants';

export const signIn = (email, password) => ({
  type: type.SIGNIN,
  payload: {
    email,
    password
  }
});

export const signUp = (user) => ({
  type: type.SIGNUP,
  payload: user
});

export const signInSuccess = (auth) => ({
  type: type.SIGNIN_SUCCESS,
  payload: auth
});

export const signOut = () => ({
  type: type.SIGNOUT
});

export const signOutSuccess = () => ({
  type: type.SIGNOUT_SUCCESS
});

export const resetPassword = (email) => ({
  type: type.RESET_PASSWORD,
  payload: email
});
