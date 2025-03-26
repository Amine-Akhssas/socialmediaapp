import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm: React.FC = () => {
  const { login } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();
  const password = watch('password');
  
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.register(data.username, data.email, data.password);
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-lg shadow-lg" style={{ 
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border
    }}>
      <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: theme.colors.foreground }}>
        Create an Account
      </h2>
      
      {error && (
        <div className="mb-4 p-3 rounded-md flex items-center" style={{ backgroundColor: `${theme.colors.error}20`, color: theme.colors.error }}>
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Username"
          type="text"
          fullWidth
          leftIcon={<User size={18} />}
          error={errors.username?.message}
          {...register('username', { 
            required: 'Username is required',
            minLength: {
              value: 3,
              message: 'Username must be at least 3 characters'
            }
          })}
        />
        
        <Input
          label="Email"
          type="email"
          fullWidth
          leftIcon={<Mail size={18} />}
          error={errors.email?.message}
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
        />
        
        <Input
          label="Password"
          type="password"
          fullWidth
          leftIcon={<Lock size={18} />}
          error={errors.password?.message}
          {...register('password', { 
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters'
            }
          })}
        />
        
        <Input
          label="Confirm Password"
          type="password"
          fullWidth
          leftIcon={<Lock size={18} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', { 
            required: 'Please confirm your password',
            validate: value => value === password || 'Passwords do not match'
          })}
        />
        
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
        >
          Sign Up
        </Button>
      </form>
      
      <div className="mt-6 text-center" style={{ color: theme.colors.muted }}>
        <p>
          Already have an account?{' '}
          <button 
            onClick={() => navigate('/login')}
            className="font-medium hover:underline"
            style={{ color: theme.colors.primary }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;