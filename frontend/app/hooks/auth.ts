import axios from '@/app/lib/axios';
import { UserResponse } from '@/app/types';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useSWR from 'swr';

export const useAuth = ({
  middleware,
  redirectIfAuthenticated,
}: {
  middleware?: 'guest' | 'auth';
  redirectIfAuthenticated?: string;
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const { data, error, mutate } = useSWR('/api/user', () =>
    axios
      .get<{ result: UserResponse }>('/api/user')
      .then((res) => res.data)
      .catch((error) => {
        if (!['/signup', '/forgotpassword', '/inquiry'].includes(pathname)) {
          router.push('/login');
        }
        return undefined;
      }),
  );
  const user = data?.result;

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
  };
};
