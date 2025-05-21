import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useRouter } from 'next/router';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const HANDLERS = {
  INITIALIZE: 'INITIALIZE',
  SIGN_IN: 'SIGN_IN',
  SIGN_OUT: 'SIGN_OUT'
};

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null
};

const handlers = {
  [HANDLERS.INITIALIZE]: (state, action) => {
    const user = action.payload;

    return {
      ...state,
      ...(
        user
          ? ({
            isAuthenticated: true,
            isLoading: false,
            user
          })
          : ({
            isLoading: false
          })
      )
    };
  },
  [HANDLERS.SIGN_IN]: (state, action) => {
    const user = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user
    };
  },
  [HANDLERS.SIGN_OUT]: (state) => {
    return {
      ...state,
      isAuthenticated: false,
      user: null
    };
  }
};

const reducer = (state, action) => (
  handlers[action.type] ? handlers[action.type](state, action) : state
);

export const AuthContext = createContext({ undefined });

export const AuthProvider = (props) => {
  const router = useRouter();
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);
  const initialized = useRef(false);

  const initialize = async () => {

    // Prevent from calling twice in development mode with React.StrictMode enabled
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    try {
      const token = window.localStorage.getItem('token');

      if (token) {
        const response = await axios.get(API_BASE_URL + '/api/admin/auth',
          {
            headers: {
              'Content-Type': 'application/json',
              'x-access-token': token
            }
          }
        );

        // delete response.data.data.token;

        dispatch({
          type: HANDLERS.INITIALIZE,
          payload: response.data.data
        });
      } else {
        dispatch({
          type: HANDLERS.INITIALIZE
        });
      }
    } catch (err) {
      dispatch({
        type: HANDLERS.INITIALIZE
      });
      console.log(err.response.data.msg);
    }

  };

  useEffect(
    () => {
      initialize();
    },
    []
  );

  const signIn = async ({ email, password }) => {

    try {
      const response = await axios.post(API_BASE_URL + '/api/admin/login',
        {
          email,
          password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      localStorage.setItem('token', response.data.data.token);

      dispatch({
        type: HANDLERS.SIGN_IN,
        payload: response.data.data
      });
    } catch (error) {
      console.log(error);
      throw new Error(error.response.data.msg);
    }
  };

  // const signUp = async ({ email, name, password }) => {
  //
  //   try {
  //
  //     const response = await axios.post(API_BASE_URL + '/api/user/register',
  //       {
  //         name,
  //         email,
  //         password
  //       },
  //       {
  //         headers: {
  //           'Content-Type': 'application/json'
  //         }
  //       }
  //     );
  //
  //     // localStorage.setItem('token', response.data.data.token);
  //
  //     // delete response.data.data.token
  //     dispatch({
  //       type: HANDLERS.SIGN_UP,
  //       payload: response.data.data.token
  //     });
  //   } catch (error) {
  //     throw new Error(error.response.data.msg);
  //   }
  //
  // };

  const signOut = () => {
    localStorage.removeItem('token');
    dispatch({
      type: HANDLERS.SIGN_OUT
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        // signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node
};

export const AuthConsumer = AuthContext.Consumer;

export const useAuthContext = () => useContext(AuthContext);
