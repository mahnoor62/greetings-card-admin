import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/use-auth';

export const AuthGuard = (props) => {
  const { children } = props;
  const router = useRouter();
  const { isAuthenticated , user } = useAuth();
  const ignore = useRef(false);
  const [checked, setChecked] = useState(false);

  useEffect(
    () => {
      if (!router.isReady) {
        return;
      }

      // Prevent from calling twice in development mode with React.StrictMode enabled
      if (ignore.current) {
        return;
      }

      ignore.current = true;
4
      if (!isAuthenticated) {
        console.log('Not authenticated, redirecting');
        router.replace({
            pathname: '/login',
            query: router.asPath !== '/login' ? { continueUrl: router.asPath } : undefined
          })
          .catch(console.error);
      } else {
        setChecked(true);
      }
    },
    [router.isReady]
  );

  if (!checked) {
    return null;
  }

  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node
};


// import {useRouter} from "next/router";
// import {useEffect, useState} from "react";
// import PropTypes from "prop-types";
// import {useSelector} from "react-redux";
//
// export const AuthGuard = (props) => {
//   const {children} = props;
//   const auth = useSelector(state => state.auth);
//   const router = useRouter();
//   const [checked, setChecked] = useState(false);
//
//   useEffect(() => {
//     if (!router.isReady) {
//       return;
//     }
//
//     if (!auth.isAuthenticated) {
//       router.push({
//         pathname: '/login',
//         query: {returnUrl: router.asPath}
//       }).catch(console.error)
//     } else {
//       setChecked(true)
//     }
//   }, [router.isReady, auth.isAuthenticated]);
//
//   if (!checked) {
//     return null;
//   }
//
//   return <>{children}</>;
// }
//
// AuthGuard.prototypes = {
//   children: PropTypes.node
// }