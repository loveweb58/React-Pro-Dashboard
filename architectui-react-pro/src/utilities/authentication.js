/* tslint:disable */
import axios from 'axios';

import { REQUEST, SUCCESS, FAILURE } from '../reducers/action-type.util';
import Storage from './storage-util';
import { API_ROOT } from './api-config';

export const ACTION_TYPES = {
  LOGIN: 'authentication/LOGIN',
  GET_SESSION: 'authentication/GET_SESSION',
  LOGOUT: 'authentication/LOGOUT',
  CLEAR_AUTH: 'authentication/CLEAR_AUTH',
  ERROR_MESSAGE: 'authentication/ERROR_MESSAGE'
};

const initialState = {
  loading: false,
  isAuthenticated: false,
  loginSuccess: false,
  account: {},
  errorMessage: null, // Errors returned from server side
  loginError: false, // Errors returned from server side
  redirectMessage: null,
  showModalLogin: false,
  login: null,
  firstName: null,
  lastName: null
};

// Reducer

export default (state = initialState, action) => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.LOGIN):
    case REQUEST(ACTION_TYPES.LOGOUT):
    case REQUEST(ACTION_TYPES.GET_SESSION):
      return {
        ...state,
        loading: true
      };
    case FAILURE(ACTION_TYPES.LOGIN):
      return {
        ...initialState,
        errorMessage: action.payload
      };
    case FAILURE(ACTION_TYPES.GET_SESSION):
    case FAILURE(ACTION_TYPES.LOGOUT):
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.LOGIN):
      return {
        ...state,
        loading: false,
        loginError: false,
        loginSuccess: true
      };
    case SUCCESS(ACTION_TYPES.LOGOUT):
      return {
        ...initialState
      };
    case SUCCESS(ACTION_TYPES.GET_SESSION): {
      const isAuthenticated =
        action.payload && action.payload.data && action.payload.data.activated;

      let login = null;
      let firstName = null;
      let lastName = null;

      if (isAuthenticated) {
        login = action.payload.data.login;
        firstName = action.payload.data.firstName;
        lastName = action.payload.data.lastName;
      }

      return {
        ...state,
        isAuthenticated,
        login,
        firstName,
        lastName,
        loading: false,
        account: action.payload.data
      };
    }
    case ACTION_TYPES.ERROR_MESSAGE:
      return {
        ...initialState,
        redirectMessage: action.message
      };
    case ACTION_TYPES.CLEAR_AUTH:
      return {
        ...state,
        loading: false,
        isAuthenticated: false
      };
    default:
      return state;
  }
};

export const displayAuthError = message => ({
  type: ACTION_TYPES.ERROR_MESSAGE,
  message
});

export const getSession = () => dispatch =>
  dispatch({
    type: ACTION_TYPES.GET_SESSION,
    payload: axios.get(`${API_ROOT}/api/account`)
  });

export const clearAuthToken = () => {
  if (Storage.local.get('jhi-authenticationToken')) {
    Storage.local.remove('jhi-authenticationToken');
  }
  if (Storage.session.get('jhi-authenticationToken')) {
    Storage.session.remove('jhi-authenticationToken');
  }
};

export const login = (username, password, rememberMe = false) => async (
  dispatch,
  getState
) => {
  const result = await dispatch({
    type: ACTION_TYPES.LOGIN,
    payload: axios.post(`${API_ROOT}/api/authenticate`, {
      username,
      password,
      rememberMe
    })
  });
  const bearerToken = result.value.headers.authorization;
  if (bearerToken && bearerToken.slice(0, 7) === 'Bearer ') {
    const jwt = bearerToken.slice(7, bearerToken.length);
    if (rememberMe) {
      Storage.local.set('jhi-authenticationToken', jwt);
    } else {
      Storage.session.set('jhi-authenticationToken', jwt);
    }
  }
  dispatch(getSession());
};

export const logout = () => async dispatch => {
  await dispatch({
    type: ACTION_TYPES.LOGOUT,
    payload: axios.get(`${API_ROOT}/api/account`)
  });
  clearAuthToken();
};

export const clearAuthentication = messageKey => (dispatch, getState) => {
  dispatch(displayAuthError(messageKey));
  dispatch({
    type: ACTION_TYPES.CLEAR_AUTH
  });
};
