import useSWR from 'swr';
import axios from '@/app/lib/axios';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export const useAuth = ({
  middleware,
  redirectIfAuthenticated,
}: {
  middleware?: string;
  redirectIfAuthenticated?: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoading, setIsLoading] = useState(true);
  const {
    data: user,
    error,
    mutate,
  } = useSWR('/api/user', () =>
    axios
      .get('/api/user')
      .then((res) => res.data)
      .catch((error) => {
        // if (error.response.status !== 409) {
        //   // throw error
        // }
        if (pathname === '/signup' || pathname === '/forgotpassword' || pathname === '/inquiry') {
        } else {
          router.push('/login');
        }
      }),
  );

  const csrf = () => axios.get('/sanctum/csrf-cookie');

  const login = async (data: { email: string; password: string }) => {
    try {
      await csrf();
      await axios.post('/login', data);
      mutate();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    console.log('uuuuuuuuuu');
    console.log(error);
    if (!error) {
      if (pathname === '/signup' || pathname === '/forgotpassword') {
      } else {
        try {
          await axios.post('/logout').then(() => {
            mutate();
            window.history.replaceState(null, '', '/login');
          });
        } catch (error) {
          router.push('/login');
        }
      }
    }
    if (pathname === '/signup' || pathname === '/forgotpassword') {
    } else {
      window.history.replaceState(null, '', '/login');
      window.location.pathname = '/login';
    }
  };

  useEffect(() => {
    if (user || error) {
      setIsLoading(false);
    }

    if (user?.temp_password_flag) {
      router.push('/passwordchange');
    }

    if (middleware === 'guest' && redirectIfAuthenticated && user) {
      if (user?.temp_password_flag) {
        router.push('/passwordchange');
      } else {
        router.push(redirectIfAuthenticated);
      }
    }

    if (middleware === 'auth' && error) {
      if (pathname === '/signup' || pathname === '/forgotpassword' || pathname === '/inquiry') {
      } else {
        logout();
      }
    }
  }, [user, error, middleware, redirectIfAuthenticated]);

  return {
    user,
    login,
    logout,
    isLoading,
  };
};
