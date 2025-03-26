import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { jwtDecode } from 'jwt-decode';
import { User } from '../../types';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      // Send the authorization code to the back end for token exchange
      axios
        .post('http://localhost:3000/api/auth/exchange', { code })
        .then((response) => {
          const token = response.data.access_token;
          // Optionally decode token to extract user information
          const decoded = jwtDecode(token) as User;
          // Save token and user info using Zustand (which stores in localStorage)
          login(token, decoded);
          navigate('/');
        })
        .catch((error) => {
          console.error('Token exchange failed:', error);
          navigate('/login');
        });
    } else {
      console.error('Authorization code not found');
      navigate('/login');
    }
  }, [searchParams, login, navigate]);

  return <div>Processing authentication...</div>;
};

export default AuthCallback;
